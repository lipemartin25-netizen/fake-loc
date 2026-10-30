-- Keep the database-owned RLS enforcement event trigger, but do not expose a
-- SECURITY DEFINER trigger function as a callable Data API routine.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
