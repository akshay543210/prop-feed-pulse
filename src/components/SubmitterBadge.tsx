import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { trustLabel, trustLabelClass } from "@/lib/trust";
import type { Submitter } from "@/hooks/useSubmitters";

const SubmitterBadge = ({ submitter }: { submitter?: Submitter }) => {
  if (!submitter || !submitter.username) {
    return <span className="text-xs text-muted-foreground">Anonymous</span>;
  }

  return (
    <Link
      to={`/users/${encodeURIComponent(submitter.username)}`}
      className="inline-flex items-center gap-1.5 text-xs hover:underline"
      aria-label={`View profile of ${submitter.username}`}
    >
      <span className="font-medium">{submitter.username}</span>
      <Badge variant="outline" className={`px-1.5 py-0 text-[10px] ${trustLabelClass(submitter.score)}`}>
        {trustLabel(submitter.score)}
      </Badge>
    </Link>
  );
};

export default SubmitterBadge;
