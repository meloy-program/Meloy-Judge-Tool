#!/bin/bash
# ============================================================================
# Disable RDS Secret Rotation
# ============================================================================
# Purpose: Turn off automatic password rotation for RDS secret
# Usage: ./disable-rotation.sh
# ============================================================================

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Secret ARN
AWS_MANAGED_SECRET="arn:aws:secretsmanager:us-east-1:271669412379:secret:rds!db-672e4afe-9d1d-4c2b-b211-8a96c0e8bbb4-WcgwQf"

echo -e "${YELLOW}🔒 Disabling automatic rotation for RDS secret...${NC}\n"

# Check current rotation status
echo "📋 Current rotation configuration:"
aws secretsmanager describe-secret \
    --secret-id "$AWS_MANAGED_SECRET" \
    --query 'RotationEnabled' \
    --output text

# Disable rotation
echo -e "\n🛑 Disabling rotation..."
aws secretsmanager cancel-rotate-secret \
    --secret-id "$AWS_MANAGED_SECRET" 2>/dev/null || echo "No rotation in progress"

aws secretsmanager rotate-secret \
    --secret-id "$AWS_MANAGED_SECRET" \
    --rotation-lambda-arn "" \
    --rotation-rules AutomaticallyAfterDays=0 2>/dev/null || echo "Rotation already disabled"

echo -e "\n${GREEN}✅ Rotation has been disabled!${NC}"
echo -e "${GREEN}Your RDS password will no longer rotate automatically.${NC}\n"

echo -e "${YELLOW}⚠️  Note: You can re-enable rotation anytime via AWS Console${NC}"
