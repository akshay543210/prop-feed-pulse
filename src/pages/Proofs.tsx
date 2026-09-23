import { useEffect, useMemo, useState } from "react";
import { Image, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import Seo from "@/components/Seo";
import LiveDataBadge from "@/components/LiveDataBadge";
import ProofViewer, { caseCode, ProofCase } from "@/components/ProofViewer";
import CaseStatusBadge from "@/components/CaseStatusBadge";
import { Button } from "@/components/ui/button";

const Proofs = () => {
  const [cases, setCases] = useState<ProofCase[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const load = async () => {
    const { data } = await supabase.from("payout_cases").select("id, amount, payout_date, created_at, screenshot_url, verification_status, status, firms(name, logo_url)").not("screenshot_url", "is", null).order("created_at", { ascending: false });
    setCases((data || []) as unknown as ProofCase[]);
  };
  useEffect(() => { load(); const channel = supabase.channel("proof-library").on("postgres_changes", { event: "*", schema: "public", table: "payout_cases" }, load).subscribe(); return () => { supabase.removeChannel(channel); }; }, []);
  const verified = useMemo(() => cases.filter((item) => ["verified", "community_confirmed"].includes(item.verification_status || "")), [cases]);
  return <div className="min-h-screen bg-background"><Seo title="Payout Proofs | Payout Cases" description="Review payout evidence and verification states from proprietary trading firms." path="/proofs" /><Navbar />
    <header className="bg-obsidian text-ivory"><div className="container mx-auto px-4 pb-16 pt-32"><LiveDataBadge /><h1 className="mt-5 text-5xl font-extrabold md:text-7xl">Payout Proofs</h1><p className="mt-5 max-w-2xl text-lg text-ivory-muted">A transparent evidence library for reported and verified payout cases.</p></div></header>
    <main className="container mx-auto px-4 py-14"><div className="mb-8 flex items-end justify-between border-b border-border pb-5"><div><p className="section-kicker"><ShieldCheck className="h-4 w-4" /> Evidence library</p><h2 className="text-3xl font-bold">{verified.length} verified records</h2></div><p className="font-mono text-xs text-muted-foreground">{cases.length} proofs available</p></div>
      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">{cases.map((item) => <article key={item.id} className="group bg-card p-4"><button className="relative aspect-[4/3] w-full overflow-hidden bg-secondary text-left" onClick={() => setActive(item.id)}><img src={item.screenshot_url || ""} alt={`Proof from ${item.firms?.name || "firm"}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /><span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-obsidian/85 px-4 py-3 text-ivory"><span className="font-mono text-sm">{item.amount ? `$${Number(item.amount).toLocaleString()}` : "Evidence"}</span><Image className="h-4 w-4" /></span></button><div className="flex items-center justify-between gap-3 pt-4"><div><p className="font-semibold">{item.firms?.name || "Unknown firm"}</p><p className="font-mono text-[10px] text-muted-foreground">CASE #{caseCode(item.id)}</p></div><CaseStatusBadge status={item.verification_status} /></div><Button variant="link" className="mt-3 px-0" onClick={() => setActive(item.id)}>Open evidence →</Button></article>)}</div>
      {!cases.length && <p className="py-24 text-center text-muted-foreground">No payout proofs have been published yet.</p>}
    </main><ProofViewer cases={cases} activeId={active} onOpenChange={(open) => !open && setActive(null)} /><PublicFooter /></div>;
};

export default Proofs;