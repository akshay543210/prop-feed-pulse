import { Badge } from "@/components/ui/badge";

export type VerificationStatus =
  | "pending"
  | "verified"
  | "community_confirmed"
  | "disputed";

const CONFIG: Record<VerificationStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning/20 text-warning border-warning/30" },
  verified: { label: "Verified", className: "bg-primary/20 text-primary border-primary/30" },
  community_confirmed: { label: "Community Confirmed", className: "bg-success/20 text-success border-success/30" },
  disputed: { label: "Disputed", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

const CaseStatusBadge = ({ status }: { status?: string | null }) => {
  const cfg = CONFIG[(status as VerificationStatus) || "pending"] ?? CONFIG.pending;
  return (
    <Badge variant="outline" className={`whitespace-nowrap ${cfg.className}`}>
      {cfg.label}
    </Badge>
  );
};

export default CaseStatusBadge;
