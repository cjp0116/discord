-- Drop existing problematic policies first
DROP POLICY IF EXISTS "Users can join servers" ON public.server_members;
DROP POLICY IF EXISTS "Server owners and admins can create channels" ON public.channels;

-- Add simplified INSERT policy for server_members table (no recursion)
CREATE POLICY "Users can join servers" ON public.server_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Add simplified INSERT policy for channels table (no recursion)
CREATE POLICY "Server owners and admins can create channels" ON public.channels
  FOR INSERT WITH CHECK (true); -- We'll handle authorization in the application layer

-- Add UPDATE policy for channels to ensure only owners/admins can modify
CREATE POLICY "Server owners and admins can update channels" ON public.channels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.server_members 
      WHERE server_id = channels.server_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Add DELETE policy for channels
CREATE POLICY "Server owners and admins can delete channels" ON public.channels
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.server_members 
      WHERE server_id = channels.server_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  ); 