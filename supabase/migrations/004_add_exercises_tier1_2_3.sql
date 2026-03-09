-- =============================================================
-- Kinalyze — Add 14 new exercises (Tier 1, 2 & 3)
-- Paste into: Supabase Dashboard → SQL Editor → Run
-- =============================================================

insert into public.exercises (id, name, muscle_group, difficulty, description, reference_model_path)
values
  -- ── Tier 1 ────────────────────────────────────────────────────────────────
  (
    'bicep_curl',
    'Bicep Curl',
    'Biceps & Elbow',
    'Beginner',
    'Stand with arms at your sides. Curl both forearms upward toward your shoulders, keeping elbows tucked in. Builds bicep strength and improves elbow joint health.',
    'app/data/models/bicep_curl_model.json'
  ),
  (
    'tricep_extension',
    'Tricep Extension',
    'Triceps & Shoulders',
    'Beginner',
    'Raise both arms overhead and extend them fully, keeping elbows close to your head. Strengthens the triceps and improves overhead shoulder mobility.',
    'app/data/models/tricep_extension_model.json'
  ),
  (
    'high_knee_march',
    'High Knee March',
    'Hip Flexors & Core',
    'Beginner',
    'March in place, raising each knee to hip height alternately. Improves hip flexor strength, core stability, and cardiovascular endurance — ideal for desk workers.',
    'app/data/models/high_knee_march_model.json'
  ),
  (
    'hip_abduction',
    'Hip Abduction',
    'Hip Abductors & Glutes',
    'Beginner',
    'Stand tall and raise one leg out to the side, keeping your toes pointing forward. Strengthens the hip abductors and glutes — key for knee and lower back stability.',
    'app/data/models/hip_abduction_model.json'
  ),
  (
    'glute_bridge',
    'Glute Bridge',
    'Glutes, Hamstrings & Lower Back',
    'Intermediate',
    'Lie on your back with knees bent and feet flat. Push your hips upward until your body forms a straight line from shoulders to knees. Position your camera to the side for best tracking.',
    'app/data/models/glute_bridge_model.json'
  ),
  (
    'shoulder_rotation',
    'Shoulder Rotation',
    'Rotator Cuff & Shoulder Stabilisers',
    'Beginner',
    'Hold your elbows at 90° at your sides. Rotate your forearms outward away from your body. Strengthens the rotator cuff — critical for preventing shoulder impingement.',
    'app/data/models/shoulder_rotation_model.json'
  ),
  -- ── Tier 2 ────────────────────────────────────────────────────────────────
  (
    'calf_raise',
    'Calf Raise',
    'Calves & Ankles',
    'Beginner',
    'Stand with feet hip-width apart. Rise up onto your toes, hold for a moment, then lower back down. Strengthens the calves and improves ankle stability.',
    'app/data/models/calf_raise_model.json'
  ),
  (
    'single_leg_stand',
    'Single Leg Stand',
    'Balance, Ankles & Core',
    'Intermediate',
    'Stand on one leg with the other knee raised to hip height. Hold the position for balance. Improves proprioception, ankle stability, and single-leg strength.',
    'app/data/models/single_leg_stand_model.json'
  ),
  (
    'torso_rotation',
    'Torso Rotation',
    'Core & Obliques',
    'Beginner',
    'Stand with arms extended in front. Rotate your upper body to each side while keeping your hips facing forward. Improves spinal mobility and strengthens the obliques.',
    'app/data/models/torso_rotation_model.json'
  ),
  (
    'dead_bug',
    'Dead Bug',
    'Core Stability & Coordination',
    'Intermediate',
    'Stand tall and extend one arm forward while raising the opposite knee to hip height. Challenges core stability and coordination without floor exercises.',
    'app/data/models/dead_bug_model.json'
  ),
  -- ── Tier 3 ────────────────────────────────────────────────────────────────
  (
    'incline_plank',
    'Incline Plank',
    'Core, Shoulders & Chest',
    'Intermediate',
    'Place your hands on a sturdy desk or wall. Walk your feet back until your body forms a straight line from head to heels. Hold the position. No floor required — great core activation.',
    'app/data/models/incline_plank_model.json'
  ),
  (
    'wall_sit',
    'Wall Sit',
    'Quadriceps & Glutes',
    'Intermediate',
    'Stand with your back against a wall. Slide down until your knees are at 90°. Hold the position. Position your camera to the side for best knee angle tracking.',
    'app/data/models/wall_sit_model.json'
  ),
  (
    'standing_bird_dog',
    'Standing Bird Dog',
    'Core, Lower Back & Balance',
    'Intermediate',
    'Stand on one leg. Extend the opposite arm forward and the same-side leg backward simultaneously, keeping your core braced. Challenges balance and back stability.',
    'app/data/models/standing_bird_dog_model.json'
  ),
  (
    'chest_opener',
    'Chest Opener',
    'Chest, Shoulders & Posture',
    'Beginner',
    'Stand tall, extend both arms out to your sides and gently pull them back behind your body. Hold for 2 seconds. Opens the chest and corrects forward shoulder posture.',
    'app/data/models/chest_opener_model.json'
  )
on conflict (id) do nothing;
