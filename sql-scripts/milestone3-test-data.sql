-- Milestone 3 Test Data Setup
-- Run this script directly in Supabase SQL editor to create test data

-- Milestone 3 Test Data Setup
-- Run this script directly in Supabase SQL editor to create test data

-- Note: The test user will be created automatically by the application
-- This script only creates the test projects

-- Create test projects with sample script generation data
INSERT INTO projects (
  id,
  user_id,
  title,
  description,
  personal_photo_url,
  product_images,
  status,
  generated_script,
  script_status,
  script_generation_params,
  created_at,
  updated_at
) VALUES 
 (
   gen_random_uuid(),
   '550e8400-e29b-41d4-a716-446655440000',
   'AI-Powered Task Manager',
  'A smart task management app that uses AI to prioritize your work and suggest optimal schedules based on your productivity patterns.',
  NULL,
  '["https://via.placeholder.com/300x200"]',
  'draft',
  '{
    "title": "AI Task Manager - Boost Your Productivity",
    "script": "Meet Sarah, a busy project manager drowning in endless tasks. With our AI-powered task manager, Sarah''s workload is automatically organized and prioritized. The result? 40% increase in productivity and stress-free workdays. Transform your workday with intelligent task management.",
    "scenes": [
      {
        "id": "scene_1",
        "startTime": 0,
        "endTime": 6,
        "description": "Busy professional overwhelmed with tasks",
        "voiceover": "Meet Sarah, a busy project manager drowning in endless tasks.",
        "visualElements": ["professional_office", "task_lists", "stressed_person"],
        "transition": "fade"
      },
      {
        "id": "scene_2", 
        "startTime": 6,
        "endTime": 18,
        "description": "AI interface organizing and prioritizing tasks",
        "voiceover": "With our AI-powered task manager, Sarah''s workload is automatically organized and prioritized.",
        "visualElements": ["ai_interface", "smart_prioritization", "organized_dashboard"],
        "transition": "slide"
      },
      {
        "id": "scene_3",
        "startTime": 18,
        "endTime": 25,
        "description": "Results showing increased productivity",
        "voiceover": "The result? 40% increase in productivity and stress-free workdays.",
        "visualElements": ["productivity_charts", "happy_professional", "success_metrics"],
        "transition": "fade"
      }
    ],
    "duration": 25,
    "voiceover": "Transform your workday with intelligent task management.",
    "visualCues": ["professional_office", "ai_interface", "productivity_charts"]
  }',
  'completed',
  '{
    "targetAudience": "Busy professionals and project managers",
    "keyFeatures": ["AI prioritization", "Smart scheduling", "Productivity analytics"],
    "tone": "professional",
    "duration": 25
  }',
  NOW(),
  NOW()
),
 (
   gen_random_uuid(),
   '550e8400-e29b-41d4-a716-446655440000',
   'Eco-Friendly Delivery Service',
  'A sustainable delivery platform that connects local businesses with eco-conscious consumers using electric vehicles and carbon-neutral packaging.',
  NULL,
  '["https://via.placeholder.com/300x200"]',
  'draft',
  '{
    "title": "Eco Delivery - Delivering a Better Future",
    "script": "Traditional delivery services contribute to pollution and climate change. Our eco-friendly delivery service uses electric vehicles and sustainable packaging to connect you with local businesses. Support local businesses while reducing your carbon footprint. Deliver change, one package at a time.",
    "scenes": [
      {
        "id": "scene_1",
        "startTime": 0,
        "endTime": 7,
        "description": "Environmental problems caused by traditional delivery",
        "voiceover": "Traditional delivery services contribute to pollution and climate change.",
        "visualElements": ["pollution_visuals", "delivery_trucks", "environmental_impact"],
        "transition": "fade"
      },
      {
        "id": "scene_2",
        "startTime": 7,
        "endTime": 18,
        "description": "Eco-friendly solution with electric vehicles",
        "voiceover": "Our eco-friendly delivery service uses electric vehicles and sustainable packaging to connect you with local businesses.",
        "visualElements": ["electric_vehicles", "eco_packaging", "local_businesses"],
        "transition": "slide"
      },
      {
        "id": "scene_3",
        "startTime": 18,
        "endTime": 24,
        "description": "Call to action for sustainable choice",
        "voiceover": "Support local businesses while reducing your carbon footprint.",
        "visualElements": ["happy_customers", "local_shops", "green_impact"],
        "transition": "fade"
      }
    ],
    "duration": 24,
    "voiceover": "Deliver change, one package at a time.",
    "visualCues": ["electric_vehicles", "eco_packaging", "local_businesses"]
  }',
  'completed',
  '{
    "targetAudience": "Environmentally conscious consumers",
    "keyFeatures": ["Electric vehicles", "Carbon-neutral packaging", "Local business support"],
    "tone": "friendly",
    "duration": 24
  }',
  NOW(),
  NOW()
),
 (
   gen_random_uuid(),
   '550e8400-e29b-41d4-a716-446655440000',
   'Virtual Reality Fitness Studio',
  'An immersive VR fitness platform that transforms your living room into a personal gym with AI-powered trainers and interactive workout environments.',
  NULL,
  '["https://via.placeholder.com/300x200"]',
  'draft',
  NULL,
  'pending',
  NULL,
  NOW(),
  NOW()
);

-- Display confirmation
SELECT 'Test data created successfully!' as message,
       (SELECT COUNT(*) FROM projects WHERE user_id = '550e8400-e29b-41d4-a716-446655440000') as projects_created; 