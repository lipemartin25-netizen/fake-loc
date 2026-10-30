-- Fake Loc initial schema for Supabase project cejivififvlhnwyeajwc.
-- Destructive replacement: drops all previous app tables in public.
-- Supabase Auth and Storage schemas/buckets are not modified.
DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'scans','photos','face_clusters','event_clusters','profiles','families','family_members',
    'categories','accounts','transactions','budgets','goals','bills','ai_interactions',
    'notifications','audit_logs','user_sessions','two_factor_auth','rate_limit_log',
    'credit_card_invoices','boletos','open_finance_connections','open_finance_sync_log',
    'wealth_lab_simulations','academy_progress','couples_shared','couples_expenses',
    'mei_data','mei_revenue','family_transactions','family_splits','family_goals',
    'family_goal_contributions','user_badges','user_gamification','push_subscriptions',
    'bank_connections','bank_accounts','bank_transactions','stripe_webhook_events'
  ] LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', table_name);
  END LOOP;
END $$;

COMMENT ON SCHEMA public IS 'Fake Loc app data. Project display name can be changed in Supabase Dashboard.';

CREATE TABLE public.favorites (
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
CREATE INDEX favorites_user_updated_idx ON public.favorites(user_id, updated_at DESC);

CREATE TABLE public.routes (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 160),
  route jsonb NOT NULL CHECK (jsonb_typeof(route) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  schema_version smallint NOT NULL DEFAULT 1 CHECK (schema_version = 1)
);
CREATE INDEX routes_user_updated_idx ON public.routes(user_id, updated_at DESC);

CREATE TABLE public.movement_profiles (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 100),
  profile jsonb NOT NULL CHECK (jsonb_typeof(profile) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  schema_version smallint NOT NULL DEFAULT 1 CHECK (schema_version = 1)
);
CREATE INDEX movement_profiles_user_updated_idx ON public.movement_profiles(user_id, updated_at DESC);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners can read favorites" ON public.favorites FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "owners can add favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "owners can update favorites" ON public.favorites FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "owners can delete favorites" ON public.favorites FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "owners can read routes" ON public.routes FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "owners can add routes" ON public.routes FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "owners can update routes" ON public.routes FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "owners can delete routes" ON public.routes FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "owners can read movement profiles" ON public.movement_profiles FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "owners can add movement profiles" ON public.movement_profiles FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "owners can update movement profiles" ON public.movement_profiles FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "owners can delete movement profiles" ON public.movement_profiles FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites, public.routes, public.movement_profiles TO authenticated;
REVOKE ALL ON public.favorites, public.routes, public.movement_profiles FROM anon;
