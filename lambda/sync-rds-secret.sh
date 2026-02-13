#!/bin/bash
# ============================================================================
# RDS Secret Sync Script
# ============================================================================
# Purpose: Keep Lambda's RDS secret in sync with AWS-managed RDS password
# Usage: ./sync-rds-secret.sh
# Schedule: Run weekly via cron or before deployments
# ============================================================================

set -e  # Exit on error

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Secret ARNs
AWS_MANAGED_SECRET="arn:aws:secretsmanager:us-east-1:271669412379:secret:rds!db-672e4afe-9d1d-4c2b-b211-8a96c0e8bbb4-WcgwQf"
LAMBDA_SECRET="meloyjudge/rds/credentials"

echo -e "${YELLOW}🔄 Starting RDS Secret Sync...${NC}\n"

# Step 1: Get real password from AWS-managed secret
echo "📥 Fetching password from AWS-managed RDS secret..."
REAL_PASSWORD=$(aws secretsmanager get-secret-value \
    --secret-id "$AWS_MANAGED_SECRET" \
    --query SecretString --output text | jq -r '.password')

if [ -z "$REAL_PASSWORD" ]; then
    echo -e "${RED}❌ Failed to retrieve password from AWS-managed secret${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Retrieved password successfully${NC}\n"

# Step 2: Get current password from Lambda secret
echo "📥 Fetching current Lambda secret password..."
CURRENT_LAMBDA_PASSWORD=$(aws secretsmanager get-secret-value \
    --secret-id "$LAMBDA_SECRET" \
    --query SecretString --output text | jq -r '.password')

# Step 3: Compare passwords
if [ "$REAL_PASSWORD" = "$CURRENT_LAMBDA_PASSWORD" ]; then
    echo -e "${GREEN}✅ Passwords are already in sync! No action needed.${NC}"
    exit 0
fi

echo -e "${YELLOW}⚠️  Passwords are out of sync. Updating Lambda secret...${NC}\n"

# Step 4: Update Lambda secret
aws secretsmanager update-secret \
    --secret-id "$LAMBDA_SECRET" \
    --secret-string "{\"host\":\"meloyjudgeportal-db.cwlcycaiaeos.us-east-1.rds.amazonaws.com\",\"port\":5432,\"username\":\"judgetoolmaster\",\"password\":\"$REAL_PASSWORD\",\"dbname\":\"judging_app\"}" \
    > /dev/null

echo -e "${GREEN}✅ Lambda secret updated successfully${NC}\n"

# Step 5: Force Lambda cold start
echo "🔄 Forcing Lambda to reload credentials..."
aws lambda update-function-configuration \
    --function-name meloy-judge-api \
    --description "Secret sync: $(date)" \
    > /dev/null

echo -e "${GREEN}✅ Lambda configuration updated${NC}\n"

# Step 6: Wait and test
echo "⏳ Waiting 15 seconds for Lambda to update..."
sleep 15

echo "🧪 Testing API endpoint..."
RESPONSE=$(curl -s https://o90rhtv5i4.execute-api.us-east-1.amazonaws.com/prod/health)

if echo "$RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✅ API is working correctly!${NC}\n"
    echo -e "${GREEN}🎉 RDS Secret sync completed successfully!${NC}"
else
    echo -e "${RED}❌ API test failed. Response: $RESPONSE${NC}"
    exit 1
fi
