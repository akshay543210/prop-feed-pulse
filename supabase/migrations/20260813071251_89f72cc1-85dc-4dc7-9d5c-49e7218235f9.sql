REVOKE ALL ON FUNCTION public.refresh_case_vote_counts() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_case_proof_defaults() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.compute_case_verification(public.case_proof_type, integer, integer) FROM PUBLIC, anon, authenticated;