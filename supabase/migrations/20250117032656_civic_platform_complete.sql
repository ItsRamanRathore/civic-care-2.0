-- Location: supabase/migrations/20250117032656_civic_platform_complete.sql
-- Schema Analysis: Fresh project - no existing schema detected
-- Integration Type: Complete civic platform database creation
-- Dependencies: None - fresh start

-- 1. Extensions & Types
CREATE TYPE public.user_role AS ENUM ('citizen', 'admin', 'department_manager');
CREATE TYPE public.issue_category AS ENUM ('roads', 'sanitation', 'utilities', 'infrastructure', 'safety', 'environment', 'other');
CREATE TYPE public.issue_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.issue_status AS ENUM ('submitted', 'in_review', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected');

-- 2. Core tables (no foreign keys)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role public.user_role DEFAULT 'citizen'::public.user_role,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Dependent tables (with foreign keys)
CREATE TABLE public.civic_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category public.issue_category NOT NULL,
    priority public.issue_priority DEFAULT 'medium'::public.issue_priority,
    status public.issue_status DEFAULT 'submitted'::public.issue_status,
    
    -- Location information
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- User information
    reporter_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    assigned_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    
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

CREATE TABLE public.issue_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES public.civic_issues(id) ON DELETE CASCADE,
    image_path TEXT NOT NULL,
    image_url TEXT,
    caption TEXT,
    uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.issue_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES public.civic_issues(id) ON DELETE CASCADE,
    status public.issue_status NOT NULL,
    comment TEXT,
    updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.issue_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES public.civic_issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('upvote', 'important')) DEFAULT 'upvote',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one vote per user per issue
    UNIQUE(issue_id, user_id, vote_type)
);

-- 4. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);

CREATE INDEX idx_civic_issues_status ON public.civic_issues(status);
CREATE INDEX idx_civic_issues_category ON public.civic_issues(category);
CREATE INDEX idx_civic_issues_priority ON public.civic_issues(priority);
CREATE INDEX idx_civic_issues_reporter_id ON public.civic_issues(reporter_id);
CREATE INDEX idx_civic_issues_assigned_department ON public.civic_issues(assigned_department_id);
CREATE INDEX idx_civic_issues_location ON public.civic_issues(latitude, longitude);
CREATE INDEX idx_civic_issues_created_at ON public.civic_issues(created_at DESC);

CREATE INDEX idx_issue_images_issue_id ON public.issue_images(issue_id);
CREATE INDEX idx_issue_updates_issue_id ON public.issue_updates(issue_id);
CREATE INDEX idx_issue_votes_issue_id ON public.issue_votes(issue_id);

-- 5. Storage bucket for issue images (public for transparency)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'issue-images',
    'issue-images', 
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
);

-- 6. Functions (MUST BE BEFORE RLS POLICIES)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')::public.user_role
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_issue_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_issue_update_on_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.issue_updates (issue_id, status, comment, updated_by)
        VALUES (NEW.id, NEW.status, 'Status changed automatically', NEW.assigned_to);
    END IF;
    RETURN NEW;
END;
$$;

-- 7. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_votes ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies
-- Pattern 1: Core user table (user_profiles) - Simple only, no functions
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 4: Public read, private write for departments
CREATE POLICY "public_can_read_departments"
ON public.departments
FOR SELECT
TO public
USING (true);

CREATE POLICY "admins_manage_departments"
ON public.departments
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid() 
        AND (au.raw_user_meta_data->>'role' = 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid() 
        AND (au.raw_user_meta_data->>'role' = 'admin')
    )
);

-- Pattern 4: Public read, private write for civic issues (transparency)
CREATE POLICY "public_can_read_civic_issues"
ON public.civic_issues
FOR SELECT
TO public
USING (true);

CREATE POLICY "authenticated_users_create_issues"
ON public.civic_issues
FOR INSERT
TO authenticated
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "reporters_update_own_issues"
ON public.civic_issues
FOR UPDATE
TO authenticated
USING (reporter_id = auth.uid())
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "admins_manage_all_issues"
ON public.civic_issues
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid() 
        AND (au.raw_user_meta_data->>'role' = 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid() 
        AND (au.raw_user_meta_data->>'role' = 'admin')
    )
);

-- Pattern 4: Public read for issue images (transparency)
CREATE POLICY "public_can_read_issue_images"
ON public.issue_images
FOR SELECT
TO public
USING (true);

CREATE POLICY "authenticated_users_upload_issue_images"
ON public.issue_images
FOR INSERT
TO authenticated
WITH CHECK (uploaded_by = auth.uid());

-- Pattern 4: Public read for issue updates (transparency)
CREATE POLICY "public_can_read_issue_updates"
ON public.issue_updates
FOR SELECT
TO public
USING (is_public = true);

CREATE POLICY "authenticated_users_create_updates"
ON public.issue_updates
FOR INSERT
TO authenticated
WITH CHECK (updated_by = auth.uid());

-- Pattern 2: Simple user ownership for votes
CREATE POLICY "users_manage_own_votes"
ON public.issue_votes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Storage RLS policies
CREATE POLICY "public_can_view_issue_images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'issue-images');

CREATE POLICY "authenticated_users_upload_issue_images"
ON storage.objects  
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'issue-images');

CREATE POLICY "users_delete_own_issue_images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'issue-images' AND owner = auth.uid());

-- 9. Triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_civic_issues_updated_at
    BEFORE UPDATE ON public.civic_issues
    FOR EACH ROW EXECUTE FUNCTION public.update_issue_updated_at();

CREATE TRIGGER create_issue_status_update
    AFTER UPDATE ON public.civic_issues
    FOR EACH ROW EXECUTE FUNCTION public.create_issue_update_on_status_change();

-- 10. Mock Data for Testing
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    citizen_uuid UUID := gen_random_uuid();
    dept_roads_uuid UUID := gen_random_uuid();
    dept_sanitation_uuid UUID := gen_random_uuid();
    issue1_uuid UUID := gen_random_uuid();
    issue2_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@civic.gov', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin User", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (citizen_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'citizen@example.com', crypt('citizen123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "John Citizen", "role": "citizen"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create departments
    INSERT INTO public.departments (id, name, description, contact_email, contact_phone) VALUES
        (dept_roads_uuid, 'Roads & Transportation', 'Handles road maintenance, traffic signals, and transportation infrastructure', 'roads@civic.gov', '+1-555-ROADS'),
        (dept_sanitation_uuid, 'Sanitation & Waste Management', 'Responsible for garbage collection, cleaning, and waste disposal', 'sanitation@civic.gov', '+1-555-CLEAN');

    -- Create sample civic issues
    INSERT INTO public.civic_issues (
        id, title, description, category, priority, status, 
        address, latitude, longitude, reporter_id, assigned_department_id,
        reporter_name, reporter_email, reporter_phone
    ) VALUES
        (issue1_uuid, 'Large pothole on Main Street', 
         'There is a significant pothole near 123 Main Street that is causing damage to vehicles. It has been there for several weeks and is getting worse with recent rain.',
         'roads', 'high', 'submitted',
         '123 Main Street, Downtown', 40.7128, -74.0060,
         citizen_uuid, dept_roads_uuid,
         'John Citizen', 'citizen@example.com', '+1-555-0123'),
        (issue2_uuid, 'Overflowing garbage bin at Central Park',
         'The garbage bin near the main entrance of Central Park has been overflowing for days. It is attracting pests and creating an unpleasant smell.',
         'sanitation', 'medium', 'in_review',
         'Central Park Main Entrance', 40.7589, -73.9851,
         citizen_uuid, dept_sanitation_uuid,
         'John Citizen', 'citizen@example.com', '+1-555-0123');

    -- Create issue updates
    INSERT INTO public.issue_updates (issue_id, status, comment, updated_by, is_public) VALUES
        (issue2_uuid, 'in_review', 'Issue has been reviewed and assigned to our team for investigation.', admin_uuid, true);

    -- Create sample votes
    INSERT INTO public.issue_votes (issue_id, user_id, vote_type) VALUES
        (issue1_uuid, citizen_uuid, 'upvote'),
        (issue1_uuid, citizen_uuid, 'important');

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;