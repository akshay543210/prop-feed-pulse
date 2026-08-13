export type CaseStatusCounts = {
  verified: number;
  community_confirmed: number;
  disputed: number;
  pending: number;
};

export const emptyCounts = (): CaseStatusCounts => ({
  verified: 0,
  community_confirmed: 0,
  disputed: 0,
  pending: 0,
});

export const trustScore = (c: CaseStatusCounts) =>
  c.verified + c.community_confirmed - c.disputed * 2;

export const trustLabel = (score: number) => {
  if (score >= 20) return "Top Contributor";
  if (score >= 5) return "Trusted";
  return "New";
};

export const trustLabelClass = (score: number) => {
  if (score >= 20) return "bg-primary/20 text-primary border-primary/30";
  if (score >= 5) return "bg-success/20 text-success border-success/30";
  return "bg-muted text-muted-foreground border-border";
};
