-- ============================================================================
-- Migration: Update User Roles
-- Description: Change role system from (judge, admin, moderator) to (member, judge, admin)
-- Date: 2024
-- ============================================================================

-- Step 1: Drop the existing CHECK constraint on role
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Update existing 'moderator' users to 'admin' (since we're removing moderator role)
UPDATE users SET role = 'admin' WHERE role = 'moderator';

-- Step 3: Change default role from 'judge' to 'member'
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'member';

-- Step 4: Add new CHECK constraint with updated roles
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('member', 'judge', 'admin'));

-- Step 5: Verify the changes
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'member' THEN 1 END) as members,
    COUNT(CASE WHEN role = 'judge' THEN 1 END) as judges,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
FROM users;
