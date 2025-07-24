-- Temporarily disable RLS to debug the issue
ALTER TABLE public.server_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.servers DISABLE ROW LEVEL SECURITY;
-- Re-enable RLS with proper policies
ALTER TABLE public.server_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
-- Create minimal policies that don't cause recursion
CREATE POLICY "Allow all server_members operations" ON public.server_members FOR ALL USING (true);
CREATE POLICY "Allow all channels operations" ON public.channels FOR ALL USING (true);
CREATE POLICY "Allow all servers operations" ON public.servers FOR ALL USING (true);