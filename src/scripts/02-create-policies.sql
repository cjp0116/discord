-- Temporarily disable RLS to debug the issue
ALTER TABLE public.server_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.servers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all server_members operations" ON public.server_members;
DROP POLICY IF EXISTS "Allow all channels operations" ON public.channels;
DROP POLICY IF EXISTS "Allow all servers operations" ON public.servers;
DROP POLICY IF EXISTS "Allow all messages operations" ON public.messages;
DROP POLICY IF EXISTS "Allow all message_reactions operations" ON public.message_reactions;
-- Re-enable RLS with proper policies
ALTER TABLE public.server_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
-- Temporarily disable RLS for users table during development
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Create minimal policies that don't cause recursion
CREATE POLICY "Allow all server_members operations" ON public.server_members FOR ALL USING (true);
CREATE POLICY "Allow all channels operations" ON public.channels FOR ALL USING (true);
CREATE POLICY "Allow all servers operations" ON public.servers FOR ALL USING (true);
CREATE POLICY "Allow all messages operations" ON public.messages FOR ALL USING (true);
CREATE POLICY "Allow all message_reactions operations" ON public.message_reactions FOR ALL USING (true);
-- Users can read their own profile
-- CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
-- Users can update their own profile
-- CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
-- Allow insert during signup
-- CREATE POLICY "Allow insert during signup" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);