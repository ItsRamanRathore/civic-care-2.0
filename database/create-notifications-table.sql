-- Create notifications table for tracking WhatsApp/SMS notifications
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES public.civic_issues(id) ON DELETE CASCADE,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('user', 'admin', 'department')),
    recipient_phone TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('whatsapp', 'sms', 'failed')),
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'delivered', 'read')),
    message_content TEXT NOT NULL,
    error_message TEXT,
    external_id TEXT, -- Twilio message SID
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_notifications_issue_id ON public.notifications(issue_id);
CREATE INDEX idx_notifications_recipient_type ON public.notifications(recipient_type);
CREATE INDEX idx_notifications_status ON public.notifications(status);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "admins_can_read_all_notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'admin'
    )
);

CREATE POLICY "system_can_insert_notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_notifications_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.update_notifications_updated_at();