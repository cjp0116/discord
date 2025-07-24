-- Create message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON public.message_reactions(user_id);
-- Enable Row Level Security
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
-- Message reactions policies
CREATE POLICY "Users can view reactions on messages they can access" ON public.message_reactions FOR
SELECT USING (
    message_id IN (
      SELECT m.id
      FROM public.messages m
        JOIN public.channels c ON m.channel_id = c.id
        JOIN public.server_members sm ON c.server_id = sm.server_id
      WHERE sm.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can add reactions to messages they can access" ON public.message_reactions FOR
INSERT WITH CHECK (
    user_id = auth.uid()
    AND message_id IN (
      SELECT m.id
      FROM public.messages m
        JOIN public.channels c ON m.channel_id = c.id
        JOIN public.server_members sm ON c.server_id = sm.server_id
      WHERE sm.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can remove their own reactions" ON public.message_reactions FOR DELETE USING (user_id = auth.uid());