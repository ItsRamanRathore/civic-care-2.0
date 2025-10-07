-- Clean RLS Fix - Handles existing policies properly
-- Run this in Supabase SQL Editor

-- 1. Ensure civic_issues table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.civic_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'submitted',
    
    -- Location information
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- User information
    reporter_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    assigned_department_id UUID,
    assigned_to UUID,
    
    -- Contact information (for anonymous reporting)
    reporter_name TEXT,
    reporter_email TEXT,
    reporter_phone TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_reporter CHECK (
        reporter_id IS NOT NULL OR 
        (reporter_name IS NOT NULL AND reporter_email IS NOT NULL)
    )
);

-- 2. Enable RLS
ALTER TABLE public.civic_issues ENABLE ROW LEVEL SECURITY;

-- 3. Drop ALL existing policies to start fresh
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'civic_issues' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON public.civic_issues';
    END LOOP;
END $$;

-- 4. Create comprehensive RLS policies

-- Allow public to read all issues (for transparency)
CREATE POLICY "public_can_read_issues"
ON public.civic_issues
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to create issues
CREATE POLICY "authenticated_can_create_issues"
ON public.civic_issues
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to update their own issues
CREATE POLICY "users_can_update_own_issues"
ON public.civic_issues
FOR UPDATE
TO authenticated
USING (reporter_id = auth.uid())
WITH CHECK (reporter_id = auth.uid());

-- Allow admins to manage all issues
CREATE POLICY "admins_can_manage_issues"
ON public.civic_issues
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role IN ('admin', 'department_manager')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role IN ('admin', 'department_manager')
    )
);

-- Allow service role to manage all issues (for triggers and functions)
CREATE POLICY "service_role_can_manage_issues"
ON public.civic_issues
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Handle related tables

-- Issue Images
CREATE TABLE IF NOT EXISTS public.issue_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES public.civic_issues(id) ON DELETE CASCADE,
    image_path TEXT NOT NULL,
    image_url TEXT,
    caption TEXT,
    uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.issue_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for issue_images
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'issue_images' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON public.issue_images';
    END LOOP;
END $$;

CREATE POLICY "public_can_read_issue_images"
ON public.issue_images
FOR SELECT
TO public
USING (true);

CREATE POLICY "authenticated_can_manage_issue_images"
ON public.issue_images
FOR ALL
TO authenticated
WITH CHECK (true);

-- Issue Votes
CREATE TABLE IF NOT EXISTS public.issue_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES public.civic_issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('upvote', 'important')) DEFAULT 'upvote',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(issue_id, user_id, vote_type)
);

ALTER TABLE public.issue_votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for issue_votes
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'issue_votes' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON public.issue_votes';
    END LOOP;
END $$;

CREATE POLICY "public_can_read_issue_votes"
ON public.issue_votes
FOR SELECT
TO public
USING (true);

CREATE POLICY "authenticated_can_manage_issue_votes"
ON public.issue_votes
FOR ALL
TO authenticated
WITH CHECK (true);

-- Issue Updates
CREATE TABLE IF NOT EXISTS public.issue_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES public.civic_issues(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    comment TEXT,
    updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.issue_updates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for issue_updates
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'issue_updates' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON public.issue_updates';
    END LOOP;
END $$;

CREATE POLICY "public_can_read_public_issue_updates"
ON public.issue_updates
FOR SELECT
TO public
USING (is_public = true);

CREATE POLICY "authenticated_can_manage_issue_updates"
ON public.issue_updates
FOR ALL
TO authenticated
WITH CHECK (true);

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.civic_issues TO authenticated, service_role;
GRANT SELECT ON public.civic_issues TO anon;
GRANT ALL ON public.issue_images TO authenticated, service_role;
GRANT SELECT ON public.issue_images TO anon;
GRANT ALL ON public.issue_votes TO authenticated, service_role;
GRANT SELECT ON public.issue_votes TO anon;
GRANT ALL ON public.issue_updates TO authenticated, service_role;
GRANT SELECT ON public.issue_updates TO anon;

-- 7. Test the setup and show results
SELECT 
  'RLS Policies for civic_issues' as test_type,
  policyname,
  'EXISTS' as status
FROM pg_policies 
WHERE tablename = 'civic_issues' AND schemaname = 'public'
ORDER BY policyname;

-- Show a summary
SELECT 
  'Summary' as info,
  'RLS policies created successfully' as message,
  'Ready for issue submission' as status;