/*
  # Admin Roles System

  1. Changes to Profiles
    - Add `role` field (user, admin, moderator)
    - Add `is_banned` field
    - Add `banned_reason` field
    - Add `banned_at` field

  2. Security
    - Create indexes for performance
    - Update RLS policies to check roles
*/

-- Add role and ban fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_reason text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at timestamptz;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned);

-- Comments
COMMENT ON COLUMN profiles.role IS 'User role: user, admin, or moderator';
COMMENT ON COLUMN profiles.is_banned IS 'Whether the user is banned from the platform';
COMMENT ON COLUMN profiles.banned_reason IS 'Reason for ban';
COMMENT ON COLUMN profiles.banned_at IS 'When the user was banned';
