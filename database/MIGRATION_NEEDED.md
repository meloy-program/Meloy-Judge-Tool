# Database Migration Required

## Add Team Photo Column

The frontend now supports displaying team photos. To enable this feature, you need to add a `photo_url` column to the `teams` table.

### Option 1: AWS RDS Query Editor

1. Go to AWS Console → RDS → Query Editor
2. Connect to `meloyjudgeportal-db`
3. Run this SQL:

```sql
ALTER TABLE teams ADD COLUMN IF NOT EXISTS photo_url TEXT;
COMMENT ON COLUMN teams.photo_url IS 'URL to team photo (uploaded by admin)';
```

### Option 2: Via psql (if you have VPN/network access)

```bash
PGPASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id 'arn:aws:secretsmanager:us-east-1:271669412379:secret:rds!db-672e4afe-9d1d-4c2b-b211-8a96c0e8bbb4-WcgwQf' \
  --query SecretString --output text | jq -r '.password') \
psql -h meloyjudgeportal-db.cwlcycaiaeos.us-east-1.rds.amazonaws.com \
  -U judgetoolmaster -d judging_app \
  -c "ALTER TABLE teams ADD COLUMN IF NOT EXISTS photo_url TEXT;"
```

### What This Does

- Adds a `photo_url` column to store team photo URLs
- Existing teams will have `NULL` for this field (shows placeholder image icon)
- Admins can upload team photos through the event management interface

### Status

- ✅ Frontend code updated
- ✅ Backend API ready (uses `SELECT *` so automatically includes new column)
- ⏳ Database migration pending

The app will work fine without this column - teams without photos will show a placeholder icon.
