-- =============================================================
-- Kinalyze v1 — Add 3 new exercises
-- Paste into: Supabase Dashboard → SQL Editor → Run
-- =============================================================

insert into public.exercises (id, name, muscle_group, difficulty, description, reference_model_path)
values
  (
    'lateral_raise',
    'Lateral Raise',
    'Deltoids & Rotator Cuff',
    'Beginner',
    'Raise both arms out to your sides until they reach shoulder height, keeping elbows nearly straight. Targets the deltoids and builds shoulder stability — key for preventing impingement.',
    'app/data/models/lateral_raise_model.json'
  ),
  (
    'shoulder_press',
    'Shoulder Press',
    'Shoulders, Triceps & Upper Back',
    'Intermediate',
    'Press both arms from shoulder height to fully extended overhead. Builds overhead strength and shoulder stability. Keep your core braced and avoid arching your lower back.',
    'app/data/models/shoulder_press_model.json'
  ),
  (
    'lunge',
    'Lunge',
    'Quadriceps, Glutes & Hamstrings',
    'Intermediate',
    'Step forward and lower your body until your front knee reaches 90°, keeping your torso upright and front knee tracking over your toes. Builds single-leg strength and improves balance.',
    'app/data/models/lunge_model.json'
  )
on conflict (id) do nothing;
