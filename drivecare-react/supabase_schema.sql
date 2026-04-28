-- Supabase Schema for DriveCare Admin Access

-- 1. Create the admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Note: Use hashed passwords in production
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insert mock admin credentials
-- IMPORTANT: Change these after first login!
INSERT INTO admin_users (username, password, name, role)
VALUES ('admin', 'admin123', 'Super Admin', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- 3. Set up Row Level Security (Optional but recommended)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow admins to read their own data (simplified for now)
CREATE POLICY "Admins can view their own profile" ON admin_users
  FOR SELECT USING (true);
