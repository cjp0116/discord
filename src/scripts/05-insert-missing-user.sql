-- Insert missing user profile for existing authenticated user
-- Replace '12da3554-571a-4799-8b23-68ce5deda828' with your actual user ID if different
INSERT INTO public.users (
    id,
    username,
    display_name,
    status,
    created_at,
    updated_at
  )
VALUES (
    '12da3554-571a-4799-8b23-68ce5deda828',
    'cjp0116',
    'Jae',
    'online',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO NOTHING;