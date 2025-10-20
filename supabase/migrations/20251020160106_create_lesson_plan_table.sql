CREATE TABLE IF NOT EXISTS lesson_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    main_theme varchar(150) NOT NULL,
    secondary_theme varchar(150),
    objective text,
    subject varchar(100),
    age_group varchar(50),
    resources text,
    duration_minutes integer,
    introduction text,
    steps text,
    evaluation_rubric text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_can_manage_own_plans"
ON lesson_plans
FOR ALL
USING (auth.uid() = user_id);

CREATE INDEX idx_main_theme ON lesson_plans(main_theme);
CREATE INDEX idx_user_id ON lesson_plans(user_id);
CREATE INDEX idx_subject ON lesson_plans(subject);
CREATE INDEX idx_age_group ON lesson_plans(age_group);
