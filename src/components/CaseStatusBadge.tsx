import { Badge } from "@/components/ui/badge";

export type VerificationStatus =
  | "pending"
  | "verified"
  | "community_confirmed"
  | "disputed";

const CONFIG: Record<VerificationStatus, { label: string; className: string }> = {
  pending: { label: "Reported", className: "bg-warning/10 text-warning border-warning/30" },
  verified: { label: "Verified", className: "bg-success/10 text-success border-success/30" },
  community_confirmed: { label: "Verified by Community", className: "bg-success/10 text-success border-success/30" },
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
