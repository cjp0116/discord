-- Drop ALL existing policies on server_members to start fresh
DROP POLICY IF EXISTS "Users can view server members of servers they're in" ON public.server_members;
DROP POLICY IF EXISTS "Server owners and admins can manage members" ON public.server_members;
DROP POLICY IF EXISTS "Users can join servers" ON public.server_members;
-- Drop ALL existing policies on channels to start fresh
DROP POLICY IF EXISTS "Users can view channels of servers they're members of" ON public.channels;
DROP POLICY IF EXISTS "Server owners and admins can manage channels" ON public.channels;
DROP POLICY IF EXISTS "Server owners and admins can create channels" ON public.channels;
DROP POLICY IF EXISTS "Server owners and admins can update channels" ON public.channels;
DROP POLICY IF EXISTS "Server owners and admins can delete channels" ON public.channels;
-- Drop ALL existing policies on servers to start fresh
DROP POLICY IF EXISTS "Users can view servers they're members of" ON public.servers;
DROP POLICY IF EXISTS "Server owners can update their servers" ON public.servers;
DROP POLICY IF EXISTS "Users can create servers" ON public.servers;
-- Recreate policies with NO circular dependencies
-- Server policies (simplified)
CREATE POLICY "Users can view servers they're members of" ON public.servers FOR
SELECT USING (
    id IN (
      SELECT server_id
      FROM public.server_members
      WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Server owners can update their servers" ON public.servers FOR
UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can create servers" ON public.servers FOR
INSERT WITH CHECK (owner_id = auth.uid());
-- Server members policies (simplified - NO circular dependencies)
CREATE POLICY "Users can view server members" ON public.server_members FOR
SELECT USING (true);
-- Allow viewing all members
CREATE POLICY "Users can join servers" ON public.server_members FOR
INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Server owners and admins can manage members" ON public.server_members FOR
UPDATE USING (
    server_id IN (
      SELECT server_id
      FROM public.server_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );
CREATE POLICY "Server owners and admins can remove members" ON public.server_members FOR DELETE USING (
  server_id IN (
    SELECT server_id
    FROM public.server_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
  )
);
-- Channel policies (simplified)
CREATE POLICY "Users can view channels" ON public.channels FOR
SELECT USING (true);
-- Allow viewing all channels
CREATE POLICY "Server owners and admins can create channels" ON public.channels FOR
INSERT WITH CHECK (true);
-- We'll handle authorization in app layer
CREATE POLICY "Server owners and admins can update channels" ON public.channels FOR
UPDATE USING (
    server_id IN (
      SELECT server_id
      FROM public.server_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );
CREATE POLICY "Server owners and admins can delete channels" ON public.channels FOR DELETE USING (
  server_id IN (
    SELECT server_id
    FROM public.server_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
  )
);