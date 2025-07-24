-- Add missing INSERT policy for users table
CREATE POLICY "Users can insert their own profile" ON public.users FOR
INSERT WITH CHECK (auth.uid() = id);
-- Add missing INSERT policy for server_members table (simplified to avoid recursion)
CREATE POLICY "Users can join servers" ON public.server_members FOR
INSERT WITH CHECK (user_id = auth.uid());
-- Add missing INSERT policy for channels table (simplified to avoid recursion)
CREATE POLICY "Server owners and admins can create channels" ON public.channels FOR
INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.server_members
      WHERE server_id = channels.server_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );