/*
# [Initial User Schema Setup]
This script sets up the necessary database structure for multi-role user authentication. It creates a `profiles` table to store public user data like full name and role, linking it to the private `auth.users` table. It also includes a trigger to automatically create a user profile upon successful signup.

## Query Description: 
This operation is foundational and non-destructive to existing user authentication data. It adds a new table, a custom type, and security policies. It is safe to run on a new project. For existing projects, ensure no table named `profiles` or type named `user_role` exists.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (with a corresponding down migration)

## Structure Details:
- **Types Created:**
  - `public.user_role`: An ENUM to constrain user roles to ('student', 'coaching', 'library', 'pg', 'tiffin').
- **Tables Created:**
  - `public.profiles`: Stores public user information.
    - `id` (UUID): Foreign key to `auth.users.id`.
    - `full_name` (TEXT): User's full name.
    - `role` (user_role): The role selected at signup.
- **Functions Created:**
  - `public.handle_new_user()`: A trigger function to populate the `profiles` table.
- **Triggers Created:**
  - `on_auth_user_created`: Fires after a new user is inserted into `auth.users`.

## Security Implications:
- RLS Status: Enabled on `public.profiles`.
- Policy Changes: Yes. New policies are created to allow users to read and write their own profile data, but not others'. This is a critical security enhancement.
- Auth Requirements: These changes are designed to work with Supabase's built-in JWT authentication.

## Performance Impact:
- Indexes: A primary key index is automatically created on `profiles.id`.
- Triggers: A single trigger is added to `auth.users`, which has a negligible performance impact on signup operations.
- Estimated Impact: Low. The changes are lightweight and optimized for common authentication flows.
*/

-- 1. Create a custom type for user roles
CREATE TYPE public.user_role AS ENUM ('student', 'coaching', 'library', 'pg', 'tiffin');

-- 2. Create the profiles table to store public user data
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role public.user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Add comments to the new table and columns for clarity
COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user.';
COMMENT ON COLUMN public.profiles.id IS 'References the user''s ID from auth.users.';
COMMENT ON COLUMN public.profiles.role IS 'The role assigned to the user at signup.';

-- 4. Enable Row Level Security (RLS) on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for the profiles table
--    - Users can view their own profile.
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

--    - Users can insert their own profile.
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

--    - Users can update their own profile.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Create a function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'role')::public.user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create a trigger that calls the function after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
