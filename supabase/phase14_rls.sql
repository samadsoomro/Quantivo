-- Enable RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantivo_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;

-- site_config: public read, only service role can write
CREATE POLICY "public can read site_config" ON public.site_config FOR SELECT USING (true);

-- notifications: users see only their own
CREATE POLICY "users see own notifications" ON public.quantivo_notifications FOR ALL USING (auth.uid() = user_id);

-- tool_usage: anyone can insert (guest tracking), users see their own
CREATE POLICY "anyone can insert tool_usage" ON public.tool_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "users see own tool_usage" ON public.tool_usage FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
