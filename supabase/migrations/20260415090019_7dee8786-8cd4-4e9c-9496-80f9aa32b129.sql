
-- Create notifications table for admin risk alerts
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  visitor_id uuid REFERENCES public.visitors(id) ON DELETE SET NULL,
  risk_score integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view notifications
CREATE POLICY "Authenticated users can view notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (true);

-- System/edge functions can insert notifications (using service role)
CREATE POLICY "Anyone can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Authenticated users can update (mark as read)
CREATE POLICY "Authenticated users can update notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
