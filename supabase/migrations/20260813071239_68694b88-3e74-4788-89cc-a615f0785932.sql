-- ============ Enums ============
DO $$ BEGIN
  CREATE TYPE public.case_verification_status AS ENUM ('pending', 'verified', 'community_confirmed', 'disputed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.case_proof_type AS ENUM ('screenshot', 'screenshot_and_social');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.vote_type AS ENUM ('upvote', 'flag');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ payout_cases new columns ============
ALTER TABLE public.payout_cases
  ADD COLUMN IF NOT EXISTS verification_status public.case_verification_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS proof_type public.case_proof_type NOT NULL DEFAULT 'screenshot',
  ADD COLUMN IF NOT EXISTS upvotes_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS flags_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.payout_cases ALTER COLUMN user_id SET DEFAULT auth.uid();

-- ============ case_votes ============
CREATE TABLE IF NOT EXISTS public.case_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.payout_cases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type public.vote_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id, user_id)
);

GRANT SELECT ON public.case_votes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_votes TO authenticated;
GRANT ALL ON public.case_votes TO service_role;

ALTER TABLE public.case_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view votes" ON public.case_votes;
CREATE POLICY "Anyone can view votes" ON public.case_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can vote on others cases" ON public.case_votes;
CREATE POLICY "Users can vote on others cases" ON public.case_votes FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.payout_cases pc WHERE pc.id = case_id AND pc.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can change own vote" ON public.case_votes;
CREATE POLICY "Users can change own vote" ON public.case_votes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own vote" ON public.case_votes;
CREATE POLICY "Users can remove own vote" ON public.case_votes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============ firm_follows ============
CREATE TABLE IF NOT EXISTS public.firm_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  firm_id uuid NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, firm_id)
);

GRANT SELECT, INSERT, DELETE ON public.firm_follows TO authenticated;
GRANT ALL ON public.firm_follows TO service_role;

ALTER TABLE public.firm_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own follows" ON public.firm_follows;
CREATE POLICY "Users can view own follows" ON public.firm_follows FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can follow firms" ON public.firm_follows;
CREATE POLICY "Users can follow firms" ON public.firm_follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unfollow firms" ON public.firm_follows;
CREATE POLICY "Users can unfollow firms" ON public.firm_follows FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============ Verification status logic ============
CREATE OR REPLACE FUNCTION public.compute_case_verification(
  _proof_type public.case_proof_type,
  _upvotes integer,
  _flags integer
) RETURNS public.case_verification_status
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN _flags >= 3 THEN 'disputed'::public.case_verification_status
    WHEN _upvotes >= 5 THEN 'community_confirmed'::public.case_verification_status
    WHEN _proof_type = 'screenshot_and_social' THEN 'verified'::public.case_verification_status
    ELSE 'pending'::public.case_verification_status
  END
$$;

CREATE OR REPLACE FUNCTION public.set_case_proof_defaults()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.proof_type := CASE
    WHEN NEW.twitter_link IS NOT NULL AND length(trim(NEW.twitter_link)) > 0
      THEN 'screenshot_and_social'::public.case_proof_type
    ELSE 'screenshot'::public.case_proof_type
  END;
  NEW.verification_status := public.compute_case_verification(
    NEW.proof_type,
    COALESCE(NEW.upvotes_count, 0),
    COALESCE(NEW.flags_count, 0)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payout_cases_proof_defaults ON public.payout_cases;
CREATE TRIGGER payout_cases_proof_defaults
BEFORE INSERT OR UPDATE OF twitter_link ON public.payout_cases
FOR EACH ROW EXECUTE FUNCTION public.set_case_proof_defaults();

CREATE OR REPLACE FUNCTION public.refresh_case_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_case_id uuid;
  v_up integer;
  v_flag integer;
BEGIN
  v_case_id := COALESCE(NEW.case_id, OLD.case_id);

  SELECT
    COUNT(*) FILTER (WHERE vote_type = 'upvote'),
    COUNT(*) FILTER (WHERE vote_type = 'flag')
  INTO v_up, v_flag
  FROM public.case_votes WHERE case_id = v_case_id;

  UPDATE public.payout_cases
  SET upvotes_count = v_up,
      flags_count = v_flag,
      verification_status = public.compute_case_verification(proof_type, v_up, v_flag)
  WHERE id = v_case_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS case_votes_refresh_counts ON public.case_votes;
CREATE TRIGGER case_votes_refresh_counts
AFTER INSERT OR UPDATE OR DELETE ON public.case_votes
FOR EACH ROW EXECUTE FUNCTION public.refresh_case_vote_counts();

-- Backfill existing rows
UPDATE public.payout_cases
SET proof_type = CASE
      WHEN twitter_link IS NOT NULL AND length(trim(twitter_link)) > 0
        THEN 'screenshot_and_social'::public.case_proof_type
      ELSE 'screenshot'::public.case_proof_type
    END;

UPDATE public.payout_cases
SET verification_status = public.compute_case_verification(proof_type, upvotes_count, flags_count);

-- ============ Submission requires auth ============
DROP POLICY IF EXISTS "Users can insert cases" ON public.payout_cases;
CREATE POLICY "Authenticated users can submit own cases" ON public.payout_cases FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);