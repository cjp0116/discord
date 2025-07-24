-- Note: In production, users are created through Supabase Auth
-- These are mock user profiles that would correspond to auth.users entries
INSERT INTO public.users (id, username, display_name, avatar_url, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'alice_dev', 'Alice Johnson', '/placeholder.svg?height=40&width=40', 'online'),
('550e8400-e29b-41d4-a716-446655440002', 'bob_gamer', 'Bob Smith', '/placeholder.svg?height=40&width=40', 'away'),
('550e8400-e29b-41d4-a716-446655440003', 'charlie_artist', 'Charlie Brown', '/placeholder.svg?height=40&width=40', 'busy'),
('550e8400-e29b-41d4-a716-446655440004', 'diana_writer', 'Diana Prince', '/placeholder.svg?height=40&width=40', 'online'),
('550e8400-e29b-41d4-a716-446655440005', 'eve_student', 'Eve Wilson', '/placeholder.svg?height=40&width=40', 'offline'),
('550e8400-e29b-41d4-a716-446655440006', 'frank_teacher', 'Frank Miller', '/placeholder.svg?height=40&width=40', 'online'),
('550e8400-e29b-41d4-a716-446655440007', 'grace_designer', 'Grace Lee', '/placeholder.svg?height=40&width=40', 'away'),
('550e8400-e29b-41d4-a716-446655440008', 'henry_musician', 'Henry Davis', '/placeholder.svg?height=40&width=40', 'online');

-- Insert sample servers
INSERT INTO public.servers (id, name, description, owner_id, invite_code) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Tech Enthusiasts', 'A community for developers and tech lovers', '550e8400-e29b-41d4-a716-446655440001', 'TECH2024'),
('660e8400-e29b-41d4-a716-446655440002', 'Gaming Hub', 'Where gamers unite to play and chat', '550e8400-e29b-41d4-a716-446655440002', 'GAME2024'),
('660e8400-e29b-41d4-a716-446655440003', 'Creative Corner', 'Artists, writers, and creators welcome', '550e8400-e29b-41d4-a716-446655440003', 'ART2024'),
('660e8400-e29b-41d4-a716-446655440004', 'Study Group', 'Academic discussions and study sessions', '550e8400-e29b-41d4-a716-446655440006', 'STUDY24'),
('660e8400-e29b-41d4-a716-446655440005', 'Music Makers', 'For musicians and music lovers', '550e8400-e29b-41d4-a716-446655440008', 'MUSIC24');

-- Insert server members with various roles
INSERT INTO public.server_members (server_id, user_id, role) VALUES
-- Tech Enthusiasts server
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'owner'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'admin'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'moderator'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', 'member'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440007', 'member'),

-- Gaming Hub server
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'owner'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'member'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'member'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'moderator'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440008', 'member'),

-- Creative Corner server
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'owner'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'admin'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', 'member'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', 'member'),

-- Study Group server
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440006', 'owner'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'admin'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'member'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'member'),

-- Music Makers server
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440008', 'owner'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'member'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440007', 'moderator');

-- Insert channels for each server
INSERT INTO public.channels (id, server_id, name, description, type, position) VALUES
-- Tech Enthusiasts channels
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'general', 'General tech discussions', 'text', 0),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'web-dev', 'Web development topics', 'text', 1),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'mobile-dev', 'Mobile app development', 'text', 2),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'code-review', 'Share code for review', 'text', 3),

-- Gaming Hub channels
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'general', 'General gaming chat', 'text', 0),
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'fps-games', 'First-person shooter discussions', 'text', 1),
('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 'rpg-games', 'Role-playing game discussions', 'text', 2),
('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440002', 'game-voice', 'Voice chat for gaming', 'voice', 3),

-- Creative Corner channels
('770e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440003', 'general', 'General creative discussions', 'text', 0),
('770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440003', 'artwork-showcase', 'Share your artwork', 'text', 1),
('770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440003', 'writing-corner', 'Share stories and poems', 'text', 2),
('770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440003', 'feedback', 'Get feedback on your work', 'text', 3),

-- Study Group channels
('770e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440004', 'general', 'General study discussions', 'text', 0),
('770e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440004', 'mathematics', 'Math help and discussions', 'text', 1),
('770e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440004', 'science', 'Science topics and help', 'text', 2),
('770e8400-e29b-41d4-a716-446655440016', '660e8400-e29b-41d4-a716-446655440004', 'study-voice', 'Voice study sessions', 'voice', 3),

-- Music Makers channels
('770e8400-e29b-41d4-a716-446655440017', '660e8400-e29b-41d4-a716-446655440005', 'general', 'General music discussions', 'text', 0),
('770e8400-e29b-41d4-a716-446655440018', '660e8400-e29b-41d4-a716-446655440005', 'compositions', 'Share your music', 'text', 1),
('770e8400-e29b-41d4-a716-446655440019', '660e8400-e29b-41d4-a716-446655440005', 'collaboration', 'Find collaborators', 'text', 2);

-- Insert sample messages
INSERT INTO public.messages (channel_id, user_id, content, created_at) VALUES
-- Tech Enthusiasts - General
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Welcome to Tech Enthusiasts! 👋 Feel free to introduce yourself and share what technologies you''re passionate about.', NOW() - INTERVAL '2 days'),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Hey everyone! I''m Bob, primarily a game developer but I love exploring new tech. Currently diving deep into Rust!', NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'Hi! Diana here, I''m a technical writer who''s been getting into web development lately. Excited to learn from you all!', NOW() - INTERVAL '1 day'),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', 'Frank here! I teach computer science and I''m always looking for new ways to explain complex concepts to students.', NOW() - INTERVAL '1 day' + INTERVAL '2 hours'),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440007', 'Grace checking in! UI/UX designer who codes on the side. Love discussing the intersection of design and development.', NOW() - INTERVAL '12 hours'),

-- Tech Enthusiasts - Web Dev
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Has anyone tried the new Next.js 15 features yet? The caching changes are pretty significant.', NOW() - INTERVAL '6 hours'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'Yes! I''ve been experimenting with the new async request APIs. Much cleaner than the previous approach.', NOW() - INTERVAL '5 hours'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007', 'The React 19 integration is smooth too. Server Components feel much more intuitive now.', NOW() - INTERVAL '4 hours'),

-- Gaming Hub - General
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Welcome to Gaming Hub! 🎮 What games is everyone playing this week?', NOW() - INTERVAL '3 days'),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Just picked up the new Spider-Man game! The web-swinging mechanics are incredible.', NOW() - INTERVAL '2 days'),
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'Still grinding through Elden Ring. This game never gets old!', NOW() - INTERVAL '1 day'),
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Anyone up for some co-op gaming tonight? I''m thinking Deep Rock Galactic!', NOW() - INTERVAL '8 hours'),

-- Gaming Hub - FPS Games
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Counter-Strike 2 tournament this weekend! Who''s joining?', NOW() - INTERVAL '1 day'),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', 'Count me in! I''ve been practicing my aim all week.', NOW() - INTERVAL '20 hours'),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440008', 'I''m more of a Valorant player, but I''ll give CS2 a shot!', NOW() - INTERVAL '18 hours'),

-- Creative Corner - General
('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'Welcome to Creative Corner! 🎨 This is a space for all creators to share, collaborate, and inspire each other.', NOW() - INTERVAL '4 days'),
('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', 'Excited to be here! I write fantasy novels and I''m always looking for feedback and inspiration.', NOW() - INTERVAL '3 days'),
('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440007', 'Digital artist here! Love seeing different creative processes and techniques.', NOW() - INTERVAL '2 days'),
('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440008', 'Musician checking in! Always interested in cross-disciplinary creative collaboration.', NOW() - INTERVAL '1 day'),

-- Creative Corner - Artwork Showcase
('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440007', 'Just finished this digital landscape piece! Spent about 12 hours on the lighting. What do you think?', NOW() - INTERVAL '10 hours'),
('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'Wow, the atmosphere is incredible! The way you handled the fog is masterful.', NOW() - INTERVAL '9 hours'),
('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440008', 'This would make an amazing album cover! The mood is perfect.', NOW() - INTERVAL '8 hours'),

-- Study Group - General
('770e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440006', 'Welcome to our study group! 📚 Let''s help each other succeed academically.', NOW() - INTERVAL '5 days'),
('770e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440005', 'Thanks for creating this space! I''m struggling with calculus and could use some help.', NOW() - INTERVAL '4 days'),
('770e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'I can help with math! I use it daily in my programming work.', NOW() - INTERVAL '3 days'),
('770e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 'I''m working on my thesis about technical communication. Happy to help with writing!', NOW() - INTERVAL '2 days'),

-- Study Group - Mathematics
('770e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', 'Can someone explain integration by parts? I keep getting confused with the formula.', NOW() - INTERVAL '1 day'),
('770e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'Sure! Think of it as the reverse of the product rule. Let me break it down step by step...', NOW() - INTERVAL '23 hours'),
('770e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440006', 'Great explanation! I always tell my students to remember LIATE for choosing u and dv.', NOW() - INTERVAL '22 hours'),

-- Music Makers - General
('770e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440008', 'Welcome to Music Makers! 🎵 Whether you''re a bedroom producer or concert performer, this is your space.', NOW() - INTERVAL '6 days'),
('770e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440003', 'Hey! I''m primarily a visual artist but I''ve been getting into ambient music production lately.', NOW() - INTERVAL '5 days'),
('770e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440007', 'Designer here who loves creating music for my video projects. Always looking for collaborators!', NOW() - INTERVAL '4 days'),

-- Music Makers - Compositions
('770e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440008', 'Just finished this jazz fusion piece I''ve been working on for months. Would love some feedback!', NOW() - INTERVAL '2 days'),
('770e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440003', 'The chord progressions are so smooth! Really love the transition at 2:30.', NOW() - INTERVAL '1 day'),
('770e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440007', 'This has such a cinematic quality. Would be perfect for a film score!', NOW() - INTERVAL '20 hours');

-- Insert direct messages
INSERT INTO public.direct_messages (sender_id, recipient_id, content, created_at) VALUES
-- Conversation between Alice and Bob
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Hey Bob! Saw your message about Rust. I''ve been thinking about learning it too. Any good resources you''d recommend?', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Absolutely! The Rust Book is fantastic for beginners. Also, Rustlings is great for hands-on practice.', NOW() - INTERVAL '23 hours'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Thanks! I''ll check those out. Maybe we could work on a small project together once I get the basics down?', NOW() - INTERVAL '22 hours'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'That sounds awesome! I''ve been wanting to build a CLI tool. Could be a perfect learning project.', NOW() - INTERVAL '21 hours'),

-- Conversation between Diana and Grace
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440007', 'Grace, I loved your comment about design and development intersection. I''m writing an article about it!', NOW() - INTERVAL '8 hours'),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'Oh that''s exciting! I''d love to contribute if you need any insights from the design side.', NOW() - INTERVAL '7 hours'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440007', 'That would be amazing! I''ll send you a draft once I have the first section done.', NOW() - INTERVAL '6 hours'),

-- Conversation between Charlie and Henry
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', 'Henry! Your jazz fusion piece is incredible. I''m working on some abstract art and your music would be perfect inspiration.', NOW() - INTERVAL '12 hours'),
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'Thank you so much! I''d be honored to inspire your art. Feel free to use any of my compositions.', NOW() - INTERVAL '11 hours'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', 'Maybe we could collaborate on something? Music-inspired visual art could be really powerful.', NOW() - INTERVAL '10 hours'),
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'I love that idea! I''ve always wanted to see how my music translates visually.', NOW() - INTERVAL '9 hours'),

-- Conversation between Eve and Frank
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', 'Professor Frank, thanks for the integration explanation! It finally clicked for me.', NOW() - INTERVAL '5 hours'),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', 'You''re very welcome, Eve! That''s exactly why I love teaching. Seeing concepts click is the best feeling.', NOW() - INTERVAL '4 hours'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', 'I have my calculus exam next week. Any last-minute tips?', NOW() - INTERVAL '3 hours'),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', 'Practice the fundamentals and don''t overthink the problems. You''ve got this! Feel free to message me if you get stuck on anything.', NOW() - INTERVAL '2 hours');
