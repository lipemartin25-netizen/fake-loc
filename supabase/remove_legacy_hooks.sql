-- Remove the previous product's auth hook and unused public RPCs. The old
-- on_auth_user_created trigger targeted public.profiles, which was replaced.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_couple_balance(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_mei_annual_revenue(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_transaction_summary(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_account_balance() CASCADE;
DROP FUNCTION IF EXISTS public.update_account_balance_add(uuid, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.update_account_balance_subtract(uuid, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
