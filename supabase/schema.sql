-- Fake Loc database schema for Supabase (idempotent and non-destructive).
-- This script safely creates or updates tables, indexes, and RLS policies for Fake Loc.
-- It NEVER drops existing tables, preserving any coexisting data.

-- 1. Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 160),
  latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  schema_version smallint NOT NULL DEFAULT 1 CHECK (schema_version = 1)
);

CREATE INDEX IF NOT EXISTS favorites_user_updated_idx ON public.favorites(user_id, updated_at DESC);

-- 2. Routes table
CREATE TABLE IF NOT EXISTS public.routes (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 160),
  route jsonb NOT NULL CHECK (jsonb_typeof(route) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  schema_version smallint NOT NULL DEFAULT 1 CHECK (schema_version = 1)
);

CREATE INDEX IF NOT EXISTS routes_user_updated_idx ON public.routes(user_id, updated_at DESC);

-- 3. Movement profiles table
CREATE TABLE IF NOT EXISTS public.movement_profiles (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 100),
  profile jsonb NOT NULL CHECK (jsonb_typeof(profile) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  schema_version smallint NOT NULL DEFAULT 1 CHECK (schema_version = 1)
);

CREATE INDEX IF NOT EXISTS movement_profiles_user_updated_idx ON public.movement_profiles(user_id, updated_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Safe creation of RLS Policies (Drop if exists then recreate to ensure idempotency)
DROP POLICY IF EXISTS "owners can read favorites" ON public.favorites;
CREATE POLICY "owners can read favorites" ON public.favorites FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "owners can add favorites" ON public.favorites;
CREATE POLICY "owners can add favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "owners can update favorites" ON public.favorites;
CREATE POLICY "owners can update favorites" ON public.favorites FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "owners can delete favorites" ON public.favorites;
CREATE POLICY "owners can delete favorites" ON public.favorites FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "owners can read routes" ON public.routes;
CREATE POLICY "owners can read routes" ON public.routes FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "owners can add routes" ON public.routes;
CREATE POLICY "owners can add routes" ON public.routes FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "owners can update routes" ON public.routes;
CREATE POLICY "owners can update routes" ON public.routes FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "owners can delete routes" ON public.routes;
CREATE POLICY "owners can delete routes" ON public.routes FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "owners can read movement profiles" ON public.movement_profiles;
CREATE POLICY "owners can read movement profiles" ON public.movement_profiles FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "owners can add movement profiles" ON public.movement_profiles;
CREATE POLICY "owners can add movement profiles" ON public.movement_profiles FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "owners can update movement profiles" ON public.movement_profiles;
CREATE POLICY "owners can update movement profiles" ON public.movement_profiles FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "owners can delete movement profiles" ON public.movement_profiles;
CREATE POLICY "owners can delete movement profiles" ON public.movement_profiles FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- 6. Permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites, public.routes, public.movement_profiles TO authenticated;
REVOKE ALL ON public.favorites, public.routes, public.movement_profiles FROM anon;
