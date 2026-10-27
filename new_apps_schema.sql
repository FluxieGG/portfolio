-- ─────────────────────────────────────────
-- 1. WORKOUT LOGGER
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workout_sessions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  notes       TEXT,
  logged_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sets        JSONB NOT NULL DEFAULT '[]' -- [{reps: 10, weight: 60}]
);

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on workout_sessions" ON workout_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on workout_exercises" ON workout_exercises FOR ALL USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────
-- 2. DIY HOME KANBAN BOARD
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kanban_columns (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title     TEXT NOT NULL,
  color     TEXT NOT NULL DEFAULT 'indigo',
  position  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS kanban_tasks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id   UUID REFERENCES kanban_columns(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  priority    TEXT NOT NULL DEFAULT 'medium', -- low | medium | high | urgent
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on kanban_columns" ON kanban_columns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on kanban_tasks" ON kanban_tasks FOR ALL USING (true) WITH CHECK (true);

-- Seed default DIY columns
INSERT INTO kanban_columns (title, color, position) VALUES
  ('To Do', 'slate', 0),
  ('In Progress', 'indigo', 1),
  ('Needs Parts / Materials', 'amber', 2),
  ('Done', 'emerald', 3);


-- ─────────────────────────────────────────
-- 3. RECIPES & SMART SHOPPING LIST
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recipes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  servings    INTEGER DEFAULT 2,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  quantity  TEXT NOT NULL,
  unit      TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS shopping_trips (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL DEFAULT 'Shopping Trip',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shopping_trip_recipes (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_trip_id UUID REFERENCES shopping_trips(id) ON DELETE CASCADE,
  recipe_id        UUID REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shopping_items (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_trip_id UUID REFERENCES shopping_trips(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  quantity         TEXT NOT NULL,
  unit             TEXT NOT NULL DEFAULT '',
  is_checked       BOOLEAN NOT NULL DEFAULT false,
  recipe_id        UUID REFERENCES recipes(id) ON DELETE SET NULL
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_trip_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on recipes" ON recipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on recipe_ingredients" ON recipe_ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on shopping_trips" ON shopping_trips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on shopping_trip_recipes" ON shopping_trip_recipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on shopping_items" ON shopping_items FOR ALL USING (true) WITH CHECK (true);
