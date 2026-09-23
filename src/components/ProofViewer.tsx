import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CaseStatusBadge from "@/components/CaseStatusBadge";
import { format } from "date-fns";

export type ProofCase = {
  id: string;
  amount?: number | string | null;
  payout_date?: string | null;
  created_at: string;
  screenshot_url?: string | null;
  verification_status?: string | null;
  status: string;
  firms?: { name?: string; logo_url?: string | null } | null;
};

const caseCode = (id: string) => `PC-${id.replace(/-/g, "").slice(0, 5).toUpperCase()}`;

const ProofViewer = ({ cases, activeId, onOpenChange }: { cases: ProofCase[]; activeId: string | null; onOpenChange: (open: boolean) => void }) => {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const open = activeId !== null;

  useEffect(() => {
    if (!activeId) return;
    const next = cases.findIndex((item) => item.id === activeId);
    if (next >= 0) setIndex(next);
    setZoom(1);
  }, [activeId, cases]);

  const current = cases[index];
  if (!current) return null;

  const move = (delta: number) => {
    setIndex((value) => (value + delta + cases.length) % cases.length);
    setZoom(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="proof-viewer max-w-[96vw] h-[92vh] p-0 overflow-hidden border-border bg-obsidian text-ivory sm:rounded-sm">
        <DialogHeader className="sr-only">
          <DialogTitle>Payout proof</DialogTitle>
          <DialogDescription>Verified payout evidence and case details.</DialogDescription>
        </DialogHeader>
        <div className="grid h-full min-h-0 lg:grid-cols-[1fr_340px]">
          <div className="relative min-h-0 overflow-hidden bg-obsidian-muted flex items-center justify-center p-8">
            {current.screenshot_url ? (
              <img
                src={current.screenshot_url}
                alt={`Payout proof for ${current.firms?.name || "case"}`}
                className="max-h-full max-w-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              />
            ) : <p className="text-sm text-ivory-muted">No screenshot attached</p>}
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1 border border-border bg-obsidian/90 p-1 shadow-premium">
              <Button variant="ghost" size="icon" onClick={() => setZoom((v) => Math.max(0.75, v - 0.25))} aria-label="Zoom out"><Minus /></Button>
              <span className="w-14 text-center font-mono text-xs">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="icon" onClick={() => setZoom((v) => Math.min(2.5, v + 0.25))} aria-label="Zoom in"><Plus /></Button>
              <Button variant="ghost" size="icon" onClick={() => setZoom(1)} aria-label="Reset zoom"><Maximize2 /></Button>
            </div>
            {cases.length > 1 && <>
              <Button variant="secondary" size="icon" className="absolute left-4 top-1/2" onClick={() => move(-1)} aria-label="Previous proof"><ChevronLeft /></Button>
              <Button variant="secondary" size="icon" className="absolute right-4 top-1/2" onClick={() => move(1)} aria-label="Next proof"><ChevronRight /></Button>
            </>}
          </div>
          <aside className="overflow-y-auto border-l border-border bg-card p-7">
            <div className="mb-8 flex items-center gap-3 text-success">
              <ShieldCheck className="h-6 w-6" />
              <div><p className="text-xs font-semibold uppercase tracking-[0.18em]">Payout record</p><p className="text-lg font-bold">Evidence review</p></div>
            </div>
            <dl className="space-y-6">
              <div><dt className="data-label">Firm</dt><dd className="mt-1 text-lg font-semibold">{current.firms?.name || "Unknown firm"}</dd></div>
              <div><dt className="data-label">Amount</dt><dd className="mt-1 font-mono text-3xl font-semibold">{current.amount ? `$${Number(current.amount).toLocaleString()}` : "—"}</dd></div>
              <div><dt className="data-label">Outcome</dt><dd className={current.status === "approved" ? "mt-1 font-semibold text-success" : "mt-1 font-semibold text-destructive"}>{current.status.toUpperCase()}</dd></div>
              <div><dt className="data-label">Payout date</dt><dd className="mt-1 font-mono text-sm">{current.payout_date ? format(new Date(current.payout_date), "MMM dd, yyyy") : "Not provided"}</dd></div>
              <div><dt className="data-label">Case ID</dt><dd className="mt-1 font-mono text-sm">CASE #{caseCode(current.id)}</dd></div>
              <div><dt className="data-label">Verification</dt><dd className="mt-2"><CaseStatusBadge status={current.verification_status} /></dd></div>
            </dl>
            <p className="mt-10 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">Evidence is displayed with its current platform verification state. Reported records are not presented as independently verified facts.</p>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { caseCode };
export default ProofViewer;