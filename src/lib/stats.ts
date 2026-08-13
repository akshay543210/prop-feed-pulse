export type CaseLike = {
  status?: string | null;
  created_at?: string | null;
  payout_date?: string | null;
  verification_status?: string | null;
  upvotes_count?: number | null;
  flags_count?: number | null;
  firm_id?: string | null;
};

const DAY = 86_400_000;

export const approvalRate = (cases: CaseLike[]) => {
  const total = cases.length;
  if (!total) return 0;
  return (cases.filter((c) => c.status === "approved").length / total) * 100;
};

/** Average days between the payout date and when the case was reported. */
export const avgPayoutDays = (cases: CaseLike[]) => {
  const deltas = cases
    .filter((c) => c.payout_date && c.created_at)
    .map((c) => Math.abs((new Date(c.created_at as string).getTime() - new Date(c.payout_date as string).getTime()) / DAY));
  if (!deltas.length) return null;
  return deltas.reduce((a, b) => a + b, 0) / deltas.length;
};

/** Approval-rate change (in percentage points) of the last 30 days vs the 30 days before. */
export const trendDelta = (cases: CaseLike[]) => {
  const now = Date.now();
  const within = (from: number, to: number) =>
    cases.filter((c) => {
      const t = c.created_at ? new Date(c.created_at).getTime() : 0;
      return t > now - from && t <= now - to;
    });
  const recent = within(30 * DAY, 0);
  const prior = within(60 * DAY, 30 * DAY);
  if (!recent.length || !prior.length) return null;
  return approvalRate(recent) - approvalRate(prior);
};

export const caseScore = (c: CaseLike) => (c.upvotes_count || 0) - (c.flags_count || 0);

export const groupByFirm = <T extends CaseLike>(cases: T[]) => {
  const map: Record<string, T[]> = {};
  cases.forEach((c) => {
    if (!c.firm_id) return;
    (map[c.firm_id] ||= []).push(c);
  });
  return map;
};

export const formatDays = (d: number | null) => (d === null ? "—" : `${d.toFixed(1)}d`);
