import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ProofViewerProps = {
  src: string;
  firm: string;
  amount?: number | string | null;
  caseId?: string;
  className?: string;
};

const ProofViewer = ({ src, firm, amount, caseId, className }: ProofViewerProps) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm" className={className}>
        <Eye className="h-4 w-4" /> View proof
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-4xl bg-card p-3 sm:p-5">
      <DialogHeader className="px-2 pt-2">
        <DialogTitle>{firm} payout proof</DialogTitle>
        <DialogDescription>
          {amount ? `$${Number(amount).toLocaleString()} · ` : ""}{caseId ? `Case ${caseId.slice(0, 8)}` : "Submitted evidence"}
        </DialogDescription>
      </DialogHeader>
      <div className="overflow-hidden rounded-md border border-border bg-secondary/40">
        <img src={src} alt={`Payout evidence submitted for ${firm}`} className="max-h-[72vh] w-full object-contain" />
      </div>
    </DialogContent>
  </Dialog>
);

export default ProofViewer;