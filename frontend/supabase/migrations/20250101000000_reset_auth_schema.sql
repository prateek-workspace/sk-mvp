/*
          # [Reset and Rebuild Authentication Schema]
          This script completely resets the user profiles and authentication trigger system. It first drops the existing 'profiles' table, the 'user_role' enum, and the associated trigger to ensure a clean state. It then recreates them with the correct structure and security policies.

          ## Query Description: [This operation is DESTRUCTIVE. It will permanently delete all data in your existing 'public.profiles' table. All user information beyond the basic auth entry (like full names and roles) will be lost. It is designed to fix a broken authentication flow by starting from a clean, known-good state. No backup is performed by this script.]
          
          ## Metadata:
          - Schema-Category: "Dangerous"
          - Impact-Level: "High"
          - Requires-Backup: true
          - Reversible: false
          
          ## Structure Details:
          - Drops Table: public.profiles
          - Drops Type: public.user_role
          - Drops Function: public.handle_new_user
          - Creates Type: public.user_role
          - Creates Table: public.profiles
          - Creates Function: public.handle_new_user
          - Creates Trigger: on_auth_user_created
          - Enables RLS on: public.profiles
          - Creates Policies on: public.profiles
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: This script defines the core tables for authentication.
          
          ## Performance Impact:
          - Indexes: A primary key index is created on public.profiles.
          - Triggers: A trigger is added to auth.users.
          - Estimated Impact: Low. This is a one-time setup script.
          */

-- Step 1: Drop existing objects to ensure a clean slate.
-- We drop them in reverse order of dependency.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles;
DROP TYPE IF EXISTS public.user_role;

-- Step 2: Create the user role enum type.
CREATE TYPE public.user_role AS ENUM ('student', 'coaching', 'library', 'pg', 'tiffin');

-- Step 3: Create the profiles table.
-- This table will store public user data.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role user_role NOT NULL
);

-- Step 4: Create a function to handle new user sign-ups.
-- This function will be triggered when a new user is created in the auth.users table.
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'role')::user_role
  );
  RETURN new;
END;
$$;

-- Step 5: Create the trigger to call the function on new user creation.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 6: Enable Row Level Security (RLS) on the profiles table.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for the profiles table.
-- 1. Allow users to view their own profile.
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

-- 2. Allow users to update their own profile.
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 3. Allow anonymous access for signup (function is security definer).
-- This is implicit as the function `handle_new_user` has `SECURITY DEFINER`.

COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user, linked to the authentication system.';
COMMENT ON COLUMN public.profiles.role IS 'Defines if the user is a student or a type of service owner.';
