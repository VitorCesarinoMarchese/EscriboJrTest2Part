CREATE TABLE IF NOT EXISTS users (
    id uuid references auth.users on delete cascade not null primary key,
    name text NOT NULL,
    role text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Individuals can view their own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Individuals can update their own profile"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Individuals can insert their own profile"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "No delete by users"
ON users
FOR DELETE
USING (false);
