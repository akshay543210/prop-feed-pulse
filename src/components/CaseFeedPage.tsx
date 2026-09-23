import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, ExternalLink, Flag, Image, LayoutGrid, List, Search, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import Seo from "@/components/Seo";
import CaseStatusBadge from "@/components/CaseStatusBadge";
import CaseVoteButtons from "@/components/CaseVoteButtons";
import SubmitterBadge from "@/components/SubmitterBadge";
import ProofViewer, { caseCode, ProofCase } from "@/components/ProofViewer";
import LiveDataBadge from "@/components/LiveDataBadge";
import { useSubmitters } from "@/hooks/useSubmitters";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Kind = "approved" | "denied";

const CaseFeedPage = ({ kind }: { kind: Kind }) => {
  const approved = kind === "approved";
  const { toast } = useToast();
  const [cases, setCases] = useState<any[]>([]);
  const [view, setView] = useState<"records" | "grid">("records");
  const [firm, setFirm] = useState("all");
  const [verification, setVerification] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [amount, setAmount] = useState("");
  const [sort, setSort] = useState("newest");
  const [activeProof, setActiveProof] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("payout_cases").select("*, firms (name, logo_url)").eq("status", kind).order("created_at", { ascending: false });
    if (error) toast({ title: `Unable to load ${kind} cases`, description: error.message, variant: "destructive" });
    else setCases(data || []);
  };

  useEffect(() => {
    load();
    const channel = supabase.channel(`${kind}-financial-feed`).on("postgres_changes", { event: "*", schema: "public", table: "payout_cases", filter: `status=eq.${kind}` }, () => {
      load();
      toast({ title: approved ? "New verified payout added" : "New payout issue reported", description: "The live record has been updated." });
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [kind]);

  const submitters = useSubmitters(cases.map((item) => item.user_id));
  const firms = useMemo(() => Array.from(new Set(cases.map((item) => item.firms?.name).filter(Boolean))).sort(), [cases]);
  const visible = useMemo(() => {
    const minimum = Number(amount || 0);
    const cutoff = dateRange === "30" ? Date.now() - 30 * 86400000 : dateRange === "90" ? Date.now() - 90 * 86400000 : 0;
    const list = cases.filter((item) =>
      (firm === "all" || item.firms?.name === firm) &&
      (verification === "all" || item.verification_status === verification) &&
      (!minimum || Number(item.amount || 0) >= minimum) &&
      (!cutoff || new Date(item.created_at).getTime() >= cutoff)
    );
    return [...list].sort((a, b) => sort === "amount" ? Number(b.amount || 0) - Number(a.amount || 0) : sort === "votes" ? (b.upvotes_count || 0) - (a.upvotes_count || 0) : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [cases, firm, verification, dateRange, amount, sort]);

  const proofCases = visible.filter((item) => item.screenshot_url) as ProofCase[];
  const clear = () => { setFirm("all"); setVerification("all"); setDateRange("all"); setAmount(""); setSort("newest"); };

  return <div className="min-h-screen bg-background">
    <Seo title={`${approved ? "Verified Payout Approvals" : "Payout Denials"} | Payout Cases`} description={approved ? "Real payout evidence submitted by traders and reviewed by Payout Cases." : "Transparent records of reported payout issues and rejected payout cases."} path={approved ? "/approvals" : "/denials"} />
    <Navbar />
    <header className={approved ? "bg-obsidian text-ivory" : "bg-destructive text-destructive-foreground"}>
      <div className="container mx-auto px-4 pb-14 pt-32">
        <LiveDataBadge className={approved ? "" : "text-destructive-foreground"} />
        <h1 className="mt-5 max-w-4xl text-4xl font-extrabold md:text-6xl">{approved ? "Verified Payout Approvals" : "Payout Denials"}</h1>
        <p className={approved ? "mt-5 max-w-2xl text-lg text-ivory-muted" : "mt-5 max-w-2xl text-lg text-destructive-foreground/75"}>{approved ? "Real payout evidence submitted by traders and tracked by Payout Cases." : "Transparent records of reported payout issues and rejected payout cases."}</p>
      </div>
    </header>

    <main className="container mx-auto px-4 py-12">
      <div className="mb-8 grid gap-3 border-y border-border py-4 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
        <Select value={firm} onValueChange={setFirm}><SelectTrigger><SelectValue placeholder="Firm" /></SelectTrigger><SelectContent><SelectItem value="all">All firms</SelectItem>{firms.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent></Select>
        <Select value={verification} onValueChange={setVerification}><SelectTrigger><SelectValue placeholder="Verification" /></SelectTrigger><SelectContent><SelectItem value="all">All verification</SelectItem><SelectItem value="verified">Verified</SelectItem><SelectItem value="community_confirmed">Community verified</SelectItem><SelectItem value="pending">Reported</SelectItem><SelectItem value="disputed">Disputed</SelectItem></SelectContent></Select>
        <Select value={dateRange} onValueChange={setDateRange}><SelectTrigger><SelectValue placeholder="Date" /></SelectTrigger><SelectContent><SelectItem value="all">All dates</SelectItem><SelectItem value="30">Last 30 days</SelectItem><SelectItem value="90">Last 90 days</SelectItem></SelectContent></Select>
        <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Minimum amount" className="pl-9" /></div>
        <Select value={sort} onValueChange={setSort}><SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger><SelectContent><SelectItem value="newest">Newest first</SelectItem><SelectItem value="amount">Highest amount</SelectItem><SelectItem value="votes">Most supported</SelectItem></SelectContent></Select>
        <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={clear}>Clear</Button><Button variant={view === "records" ? "secondary" : "ghost"} size="icon" onClick={() => setView("records")} aria-label="Record view"><List /></Button><Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setView("grid")} aria-label="Grid view"><LayoutGrid /></Button></div>
      </div>

      <div className={view === "grid" ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3" : "divide-y divide-border border-y border-border"}>
        {visible.map((item, index) => <motion.article key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * .03, .2) }} className={view === "grid" ? "group border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-premium" : "group grid gap-5 py-6 md:grid-cols-[1.2fr_.7fr_.8fr_1fr_auto] md:items-center"}>
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="h-11 w-11 rounded-sm border border-border bg-secondary"><AvatarImage src={item.firms?.logo_url || undefined} className="object-contain" /><AvatarFallback className="rounded-sm font-bold">{item.firms?.name?.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
            <div className="min-w-0"><p className="truncate font-bold">{item.firms?.name || "Unknown firm"}</p><p className="mt-1 font-mono text-[10px] text-muted-foreground">CASE #{caseCode(item.id)}</p></div>
          </div>
          <div><p className="data-label">Amount</p><p className={`mt-1 font-mono text-xl font-semibold ${approved ? "text-success" : "text-destructive"}`}>{item.amount ? `$${Number(item.amount).toLocaleString()}` : "—"}</p></div>
          <div><p className="data-label">Payout date</p><p className="mt-1 flex items-center gap-2 text-sm"><CalendarDays className="h-4 w-4 text-muted-foreground" />{item.payout_date ? format(new Date(item.payout_date), "MMM dd, yyyy") : "Not provided"}</p></div>
          <div className="space-y-2"><div className="flex flex-wrap gap-2"><span className={`inline-flex items-center gap-1 text-xs font-bold uppercase ${approved ? "text-success" : "text-destructive"}`}>{approved ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{kind}</span><CaseStatusBadge status={item.verification_status} /></div><SubmitterBadge submitter={item.user_id ? submitters[item.user_id] : undefined} /></div>
          <div className="flex items-center justify-end gap-2">{item.twitter_link && <Button asChild variant="ghost" size="icon"><a href={item.twitter_link} target="_blank" rel="noreferrer" aria-label="Open social proof"><ExternalLink /></a></Button>}{item.screenshot_url && <Button variant="outline" size="sm" onClick={() => setActiveProof(item.id)}><Image /> Proof</Button>}<CaseVoteButtons caseId={item.id} ownerId={item.user_id} upvotes={item.upvotes_count || 0} flags={item.flags_count || 0} onVoted={load} compact /></div>
          {view === "grid" && item.notes && <p className="mt-2 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground md:col-span-full">{item.notes}</p>}
        </motion.article>)}
      </div>
      {!visible.length && <div className="py-24 text-center"><Flag className="mx-auto mb-4 h-8 w-8 text-muted-foreground" /><p className="font-semibold">No records match these filters</p><p className="mt-1 text-sm text-muted-foreground">Clear filters to review all available cases.</p></div>}
    </main>
    <ProofViewer cases={proofCases} activeId={activeProof} onOpenChange={(open) => !open && setActiveProof(null)} />
    <PublicFooter />
  </div>;
};

export default CaseFeedPage;