# RDS Password Rotation - Permanent Solutions

## The Problem

AWS automatically rotates your RDS password every 30-90 days for security. Your Lambda function uses a custom secret (`meloyjudge/rds/credentials`) that doesn't auto-update, causing "authentication failed" errors after rotation.

---

##  Solution Options

### **Option 1: Manual Sync Script** (Simple, Recommended for Now)

Run the sync script whenever you get auth errors or before deployments:

```bash
./scripts/sync-rds-secret.sh
```

**Pros:**
- Simple, no infrastructure changes
- Works immediately
- Full control over when syncing happens

**Cons:**
- Manual intervention needed when rotation happens
- You'll only know there's an issue when the app breaks

---

### **Option 2: Scheduled Sync** (Set It and Forget It)

Set up a weekly cron job to automatically sync:

#### **On Mac/Linux (crontab):**

```bash
# Edit crontab
crontab -e

# Add this line (runs every Monday at 2 AM)
0 2 * * 1 cd /Users/abhivur/Documents/Meloy/Code/Judging-App && ./scripts/sync-rds-secret.sh >> /tmp/rds-sync.log 2>&1
```

#### **On Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task → Weekly → Monday 2 AM
3. Action: Start a Program → `bash` with arguments: `/path/to/scripts/sync-rds-secret.sh`

**Pros:**
- Fully automated
- Prevents issues before they happen
- Zero ongoing maintenance

**Cons:**
- Requires your local machine to be on when scheduled
- Logs are local only

---

### **Option 3: AWS EventBridge + Lambda** (Production-Grade)

Create a Lambda function triggered by AWS EventBridge that automatically syncs secrets after rotation.

<details>
<summary>Click to see implementation</summary>

#### 1. Create Sync Lambda Function:

```javascript
// lambda-sync-secrets/index.js
const { SecretsManagerClient, GetSecretValueCommand, UpdateSecretCommand } = require("@aws-sdk/client-secrets-manager");
const { LambdaClient, UpdateFunctionConfigurationCommand } = require("@aws-sdk/client-lambda");

const secretsClient = new SecretsManagerClient({ region: "us-east-1" });
const lambdaClient = new LambdaClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    // Get real password from AWS-managed secret
    const awsSecret = await secretsClient.send(new GetSecretValueCommand({
      SecretId: "arn:aws:secretsmanager:us-east-1:271669412379:secret:rds!db-672e4afe-9d1d-4c2b-b211-8a96c0e8bbb4-WcgwQf"
    }));
    
    const realPassword = JSON.parse(awsSecret.SecretString).password;
    
    // Update Lambda's secret
    await secretsClient.send(new UpdateSecretCommand({
      SecretId: "meloyjudge/rds/credentials",
      SecretString: JSON.stringify({
        host: "meloyjudgeportal-db.cwlcycaiaeos.us-east-1.rds.amazonaws.com",
        port: 5432,
        username: "judgetoolmaster",
        password: realPassword,
        dbname: "judging_app"
      })
    }));
    
    // Force API Lambda to reload
    await lambdaClient.send(new UpdateFunctionConfigurationCommand({
      FunctionName: "meloy-judge-api",
      Description: `Auto-synced: ${new Date().toISOString()}`
    }));
    
    return { statusCode: 200, body: "Sync successful" };
  } catch (error) {
    console.error("Sync failed:", error);
    throw error;
  }
};
```

#### 2. Deploy Sync Lambda:

```bash
# Create deployment package
cd lambda-sync-secrets
npm install @aws-sdk/client-secrets-manager @aws-sdk/client-lambda
zip -r function.zip .

# Create Lambda function
aws lambda create-function \
  --function-name rds-secret-sync \
  --runtime nodejs18.x \
  --role arn:aws:iam::271669412379:role/LambdaSyncRole \
  --handler index.handler \
  --zip-file fileb://function.zip
```

#### 3. Create EventBridge Rule:

```bash
# Trigger on rotation completion or schedule weekly
aws events put-rule \
  --name rds-password-rotation-sync \
  --schedule-expression "rate(7 days)"

aws events put-targets \
  --rule rds-password-rotation-sync \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:271669412379:function:rds-secret-sync"
```

</details>

**Pros:**
- Fully automated, runs in AWS
- No local machine needed
- Production-grade reliability
- Can trigger immediately after rotation

**Cons:**
- More complex setup
- Additional AWS resources to manage
- Small additional cost (pennies/month)

---

## 🎯 Recommended Approach

**For Now:** Use **Option 1** (manual script) - it's working and you're already set up.

**Long Term:** Add **Option 2** (scheduled sync) if you use this app regularly.

**For Production:** Implement **Option 3** (EventBridge) when you have paying customers.

---

## Quick Reference

### Run Manual Sync
```bash
cd /Users/abhivur/Documents/Meloy/Code/Judging-App
./scripts/sync-rds-secret.sh
```

### Check if Passwords Match
```bash
AWS_PASS=$(aws secretsmanager get-secret-value \
  --secret-id 'arn:aws:secretsmanager:us-east-1:271669412379:secret:rds!db-672e4afe-9d1d-4c2b-b211-8a96c0e8bbb4-WcgwQf' \
  --query SecretString --output text | jq -r '.password')

LAMBDA_PASS=$(aws secretsmanager get-secret-value \
  --secret-id meloyjudge/rds/credentials \
  --query SecretString --output text | jq -r '.password')

if [ "$AWS_PASS" = "$LAMBDA_PASS" ]; then
  echo " In sync"
else
  echo " Out of sync - run ./scripts/sync-rds-secret.sh"
fi
```

### Disable Auto-Rotation (Not Recommended)
```bash
# Only if you really don't want rotation
aws secretsmanager cancel-rotate-secret \
  --secret-id 'arn:aws:secretsmanager:us-east-1:271669412379:secret:rds!db-672e4afe-9d1d-4c2b-b211-8a96c0e8bbb4-WcgwQf'
```

---

##  Troubleshooting

### App suddenly stopped working?
**Likely cause:** Password rotated  
**Fix:** Run `./scripts/sync-rds-secret.sh`

### How often does AWS rotate?
**Default:** Every 30-90 days (random for security)

### Can I disable rotation?
**Yes, but not recommended** - password rotation is a security best practice

### What if the script fails?
Check AWS CLI is configured: `aws sts get-caller-identity`
