-- Seed data for EmpowHer platform

-- Insert default crisis helplines
INSERT INTO crisis_helplines (region, name, phone_number, description, is_active) VALUES
('United States', 'National Suicide Prevention Lifeline', '988', '24/7 free and confidential support for people in distress', true),
('United States', 'Crisis Text Line', 'Text HOME to 741741', '24/7 crisis support via text message', true),
('United States', 'SAMHSA National Helpline', '1-800-662-4357', 'Substance abuse and mental health services', true),
('International', 'International Association for Suicide Prevention', 'Visit iasp.info/resources', 'Find crisis helplines worldwide', true),
('United Kingdom', 'Samaritans', '116 123', '24/7 emotional support hotline', true),
('Canada', 'Crisis Services Canada', '1-833-456-4566', '24/7 support for people in crisis', true);

-- Insert sample skill modules

-- Wellness modules
INSERT INTO skill_modules (title, description, difficulty, category, duration_minutes, content, points_reward) VALUES
(
  'Breathing Exercise: 4-7-8 Technique',
  'Learn a simple breathing technique to calm your mind and reduce stress instantly.',
  'beginner',
  'wellness',
  10,
  '{
    "sections": [
      {
        "type": "intro",
        "content": "The 4-7-8 breathing technique is a powerful tool for relaxation. It helps activate your body''s natural relaxation response."
      },
      {
        "type": "instructions",
        "content": "1. Sit comfortably with your back straight\n2. Place the tip of your tongue behind your upper front teeth\n3. Exhale completely through your mouth\n4. Close your mouth and inhale through your nose for 4 counts\n5. Hold your breath for 7 counts\n6. Exhale completely through your mouth for 8 counts\n7. Repeat this cycle 3-4 times"
      },
      {
        "type": "practice",
        "content": "Try it now! Follow along with the timer and complete 4 cycles."
      },
      {
        "type": "reflection",
        "content": "How do you feel after completing this exercise? Notice any changes in your body or mind."
      }
    ]
  }',
  10
),
(
  'Gratitude Journaling',
  'Discover the power of gratitude through simple daily reflection.',
  'beginner',
  'wellness',
  15,
  '{
    "sections": [
      {
        "type": "intro",
        "content": "Gratitude journaling has been scientifically proven to improve mood, reduce stress, and increase overall well-being."
      },
      {
        "type": "instructions",
        "content": "Take a moment to write down:\n\n1. Three things you''re grateful for today\n2. One person who made you smile\n3. One small victory you had\n4. One thing you''re looking forward to"
      },
      {
        "type": "prompts",
        "content": "Need inspiration?\n- A warm meal\n- A kind word from someone\n- Your favorite song\n- A comfortable place to sleep\n- Your ability to learn new things"
      },
      {
        "type": "reflection",
        "content": "Remember: gratitude is a practice. The more you do it, the easier it becomes to notice the good things in your life."
      }
    ]
  }',
  15
);

-- Creative modules
INSERT INTO skill_modules (title, description, difficulty, category, duration_minutes, content, points_reward) VALUES
(
  'Creative Doodling for Mindfulness',
  'Use simple doodling to express yourself and relax your mind.',
  'beginner',
  'creative',
  10,
  '{
    "sections": [
      {
        "type": "intro",
        "content": "Doodling isn''t just for fun—it''s a powerful tool for mindfulness and self-expression."
      },
      {
        "type": "materials",
        "content": "You''ll need:\n- Paper (any kind)\n- Pen, pencil, or markers\n- 10 minutes of quiet time"
      },
      {
        "type": "instructions",
        "content": "1. Start with simple shapes: circles, squares, triangles\n2. Let your hand move freely without judgment\n3. Add patterns: dots, lines, swirls\n4. Fill in spaces with colors or shading\n5. Don''t worry about making it ''perfect''"
      },
      {
        "type": "prompts",
        "content": "Try these patterns:\n- Zentangle patterns\n- Mandala designs\n- Nature-inspired doodles\n- Abstract shapes"
      }
    ]
  }',
  10
),
(
  'Reflection Writing: Your Story',
  'Explore your thoughts and feelings through guided writing prompts.',
  'beginner',
  'creative',
  15,
  '{
    "sections": [
      {
        "type": "intro",
        "content": "Writing is a powerful way to process emotions and gain clarity about your experiences."
      },
      {
        "type": "prompt",
        "content": "Choose one of these prompts and write for 10 minutes:\n\n1. What would you tell your younger self?\n2. Describe a moment when you felt truly proud of yourself\n3. What does your ideal day look like?\n4. Write about a challenge you overcame"
      },
      {
        "type": "tips",
        "content": "Writing tips:\n- Don''t edit as you write\n- Let your thoughts flow freely\n- Be honest with yourself\n- There are no wrong answers"
      }
    ]
  }',
  15
);

-- Coding modules
INSERT INTO skill_modules (title, description, difficulty, category, duration_minutes, content, points_reward) VALUES
(
  'HTML Basics: Your First Webpage',
  'Learn the fundamentals of HTML and create your first simple webpage.',
  'beginner',
  'coding',
  15,
  '{
    "sections": [
      {
        "type": "intro",
        "content": "HTML (HyperText Markup Language) is the foundation of every website. Let''s build something!"
      },
      {
        "type": "lesson",
        "content": "Basic HTML structure:\n\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>My First Page</title>\n  </head>\n  <body>\n    <h1>Hello, World!</h1>\n    <p>This is my first webpage.</p>\n  </body>\n</html>"
      },
      {
        "type": "exercise",
        "content": "Create a simple webpage about yourself with:\n- A heading with your name\n- A paragraph about your interests\n- A list of your favorite things"
      },
      {
        "type": "quiz",
        "content": "Quick check:\n1. What does HTML stand for?\n2. What tag is used for the main heading?\n3. What goes inside the <head> tag?"
      }
    ]
  }',
  20
);

-- Language modules
INSERT INTO skill_modules (title, description, difficulty, category, duration_minutes, content, points_reward) VALUES
(
  'Spanish Basics: Greetings & Introductions',
  'Learn essential Spanish phrases for everyday conversations.',
  'beginner',
  'language',
  15,
  '{
    "sections": [
      {
        "type": "intro",
        "content": "¡Hola! Let''s learn some basic Spanish greetings and introductions."
      },
      {
        "type": "vocabulary",
        "content": "Essential phrases:\n\nHola - Hello\nBuenos días - Good morning\nBuenas tardes - Good afternoon\nBuenas noches - Good evening/night\n¿Cómo estás? - How are you?\nMe llamo... - My name is...\nMucho gusto - Nice to meet you\nGracias - Thank you\nDe nada - You''re welcome"
      },
      {
        "type": "practice",
        "content": "Practice saying:\n1. Hello, my name is [your name]\n2. How are you?\n3. Nice to meet you\n4. Thank you very much"
      },
      {
        "type": "quiz",
        "content": "Match the Spanish phrase to its English meaning:\n1. Hola\n2. Gracias\n3. ¿Cómo estás?\n4. Me llamo..."
      }
    ]
  }',
  15
);

-- Business module
INSERT INTO skill_modules (title, description, difficulty, category, duration_minutes, content, points_reward) VALUES
(
  'Business Idea Brainstorming',
  'Learn a structured approach to generating and evaluating business ideas.',
  'intermediate',
  'business',
  15,
  '{
    "sections": [
      {
        "type": "intro",
        "content": "Every great business starts with an idea. Let''s discover yours!"
      },
      {
        "type": "framework",
        "content": "The Problem-Solution Framework:\n\n1. Identify a problem you or others face\n2. Brainstorm possible solutions\n3. Evaluate which solution is most viable\n4. Define your unique value proposition"
      },
      {
        "type": "exercise",
        "content": "Brainstorm 5 problems you''ve noticed in your daily life. For each:\n- Who experiences this problem?\n- How often does it occur?\n- What current solutions exist?\n- How could you solve it better?"
      },
      {
        "type": "validation",
        "content": "Evaluate your ideas:\n- Is there a real need?\n- Can you build it?\n- Would people pay for it?\n- What makes it unique?"
      }
    ]
  }',
  20
);

-- Create an admin user (password: Admin123!)
-- Note: In production, this should be created securely
INSERT INTO users (email, password_hash, role) VALUES
('admin@empowher.local', '$2a$10$YourHashedPasswordHere', 'admin');

-- Note: The password hash above is a placeholder. 
-- In actual deployment, generate a proper bcrypt hash for a secure password.
