import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import AnimatedCounter from "@/components/AnimatedCounter";
import LiveFeed from "@/components/LiveFeed";
import WaveFooter from "@/components/WaveFooter";
import PageTransition from "@/components/PageTransition";
import SubmitCaseButton from "@/components/SubmitCaseButton";
import ProofViewer from "@/components/ProofViewer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { approvalRate, avgPayoutDays, formatDays } from "@/lib/stats";
import {
  ArrowRight, BarChart3, Building2, CheckCircle2, CircleDollarSign,
  Clock3, DollarSign, ShieldCheck, TrendingUp, XCircle,
} from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({ totalApprovals: 0, totalDenials: 0, totalFirms: 0 });
  const [firms, setFirms] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);

  const load = async () => {
    try {
      const [{ data: caseRows, error: casesError }, { data: firmRows, error: firmsError }] = await Promise.all([
        supabase.from("payout_cases").select("*, firms(name, logo_url)").order("created_at", { ascending: false }),
        supabase.from("firms").select("*").order("approvals_count", { ascending: false }),
      ]);
      if (casesError) throw casesError;
      if (firmsError) throw firmsError;
      const safeCases = caseRows || [];
      setCases(safeCases);
      setFirms(firmRows || []);
      setStats({
        totalApprovals: safeCases.filter((item) => item.status === "approved").length,
        totalDenials: safeCases.filter((item) => item.status === "denied").length,
        totalFirms: firmRows?.length || 0,
      });
    } catch (error: any) {
      toast({ title: "Unable to refresh live data", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("premium-home-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "payout_cases" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "firms" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalVolume = useMemo(
    () => cases.filter((item) => item.status === "approved").reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [cases]
  );
  const verified = cases.filter((item) => ["verified", "community_confirmed"].includes(item.verification_status)).length;
  const recentApprovals = cases.filter((item) => item.status === "approved").slice(0, 6);
  const heroCases = cases.slice(0, 5);

  return (
    <PageTransition>
      <Seo
        title="Payout Cases — Prop Firm Payout Tracker"
        description="Real-time tracking of payout approvals and denials across top proprietary trading firms. Compare approval rates and verified payout cases."
        path="/"
      />
      <div className="min-h-screen overflow-hidden bg-background">
        <Navbar />

        <section className="market-texture relative border-b border-border pt-24 lg:pt-28">
          <div className="container mx-auto grid min-h-[610px] items-center gap-12 px-4 py-14 lg:grid-cols-[.92fr_1.08fr] lg:py-16">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Live payout analytics platform
              </div>
              <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.03] sm:text-6xl lg:text-7xl">
                Real-time<br />Prop Firm Payout<br /><span className="text-primary">Tracking</span> &amp; Statistics
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Track real payout approvals, denials, evidence, and prop-firm performance. Make informed trading decisions from transparent community data.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild className="px-7"><Link to="/firms">Explore Firms <ArrowRight /></Link></Button>
                <SubmitCaseButton size="lg" variant="outline" className="border-foreground px-7">Submit a Case</SubmitCaseButton>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Verified proof</span>
                <span>Real cases</span><span>Live community data</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .75, delay: .1 }} className="relative mx-auto w-full max-w-2xl">
              <div className="absolute -inset-8 rounded-full bg-primary/10 blur-3xl" />
              <div className="dark-panel market-grid relative rounded-lg p-5 sm:p-7">
                <div className="mb-2 flex items-center justify-between border-b border-primary/20 pb-4">
                  <div><p className="text-sm font-bold text-champagne">Live Payout Activity</p><p className="mt-1 text-xs text-muted-foreground">Real records as they are reported</p></div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-success/20 px-3 py-1 text-xs font-bold text-success"><span className="h-2 w-2 rounded-full bg-success animate-pulse" />Live</span>
                </div>
                {heroCases.length ? <LiveFeed /> : <p className="py-16 text-center text-sm text-muted-foreground">Waiting for the first case</p>}
                <div className="mt-5 overflow-hidden rounded-md border border-primary/20 bg-dark-soft/90 p-4">
                  <div className="mb-3 flex items-center justify-between text-xs"><span className="text-muted-foreground">Payout activity</span><span className="text-champagne">Live trend</span></div>
                  <div className="flex h-20 items-end gap-1" aria-hidden="true">
                    {[35,48,42,60,54,72,64,80,74,92,86,100,90,108,98,120].map((height, index) => (
                      <motion.span key={index} initial={{ height: 0 }} animate={{ height }} transition={{ delay: .5 + index * .035 }} className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/25 to-champagne" />
                    ))}
                  </div>
                </div>
              </div>
              {heroCases[0] && (
                <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 5, repeat: Infinity }} className={`absolute -bottom-8 right-3 w-52 rotate-[-3deg] rounded-md border p-4 shadow-2xl sm:right-[-18px] ${heroCases[0].status === "approved" ? "border-success/30 bg-card text-success" : "border-destructive/30 bg-card text-destructive"}`}>
                  <p className="text-xs font-bold">Latest {heroCases[0].status}</p><p className="mt-1 text-2xl font-extrabold text-foreground">{heroCases[0].amount ? `$${Number(heroCases[0].amount).toLocaleString()}` : "Reported"}</p><p className="text-xs text-muted-foreground">{heroCases[0].firms?.name}</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        <section className="border-b border-border bg-card py-7">
          <div className="container mx-auto grid gap-3 px-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: CheckCircle2, value: stats.totalApprovals, label: "Verified approvals", tone: "text-success", prefix: "", suffix: "" },
              { icon: XCircle, value: stats.totalDenials, label: "Reported denials", tone: "text-destructive", prefix: "", suffix: "" },
              { icon: Building2, value: stats.totalFirms, label: "Prop firms tracked", tone: "text-foreground", prefix: "", suffix: "" },
              { icon: CircleDollarSign, value: totalVolume, label: "Total approved volume", tone: "text-primary", prefix: "$", suffix: "" },
            ].map((item, index) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .07 }} className="rounded-lg border border-border bg-background p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between"><span className={`flex h-9 w-9 items-center justify-center rounded-full bg-secondary ${item.tone}`}><item.icon className="h-5 w-5" /></span><BarChart3 className="h-5 w-5 text-primary/50" /></div>
                <p className="text-3xl font-extrabold"><AnimatedCounter end={item.value} prefix={item.prefix} suffix={item.suffix} /></p><p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="dark-band py-20">
          <div className="container mx-auto px-4">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4"><div><p className="editorial-kicker">Latest payouts</p><h2 className="mt-2 text-4xl font-extrabold sm:text-5xl">Recent Payout Approvals</h2><p className="mt-2 text-sm text-muted-foreground">Latest reported payout proofs from real traders.</p></div><Button variant="outline" asChild className="border-primary/40 bg-transparent text-cream hover:bg-primary/10 hover:text-cream"><Link to="/approvals">View all <ArrowRight /></Link></Button></div>
            <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-4">
              {recentApprovals.map((item) => (
                <motion.article key={item.id} whileHover={{ y: -4 }} className="group min-w-[280px] max-w-[320px] flex-1 snap-start overflow-hidden rounded-lg border border-primary/25 bg-dark-soft p-4">
                  <div className="mb-5 flex items-center gap-3"><Avatar className="h-10 w-10 border border-primary/30 bg-card"><AvatarImage src={item.firms?.logo_url} className="object-contain" /><AvatarFallback>{item.firms?.name?.slice(0,2).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.firms?.name}</p><p className="text-xs text-muted-foreground">{format(new Date(item.payout_date || item.created_at), "MMM dd, yyyy")}</p></div><span className="rounded-full bg-success/15 px-2 py-1 text-[10px] font-bold text-success">Approved</span></div>
                  <p className="mb-3 text-3xl font-extrabold">{item.amount ? `$${Number(item.amount).toLocaleString()}` : "Amount not shared"}</p>
                  {item.screenshot_url ? <div className="mb-4 h-32 overflow-hidden rounded-md border border-primary/15 bg-card"><img src={item.screenshot_url} alt={`Proof for ${item.firms?.name}`} className="proof-image h-full w-full object-cover" /></div> : <div className="mb-4 flex h-32 items-center justify-center rounded-md border border-dashed border-primary/25 text-xs text-muted-foreground">No screenshot submitted</div>}
                  {item.screenshot_url ? <ProofViewer src={item.screenshot_url} firm={item.firms?.name || "Firm"} amount={item.amount} caseId={item.id} className="border-primary/30 bg-transparent text-cream hover:text-cream" /> : <span className="text-xs text-muted-foreground">Case {item.id.slice(0,8)}</span>}
                </motion.article>
              ))}
              {!recentApprovals.length && <p className="py-12 text-muted-foreground">No approved payouts reported yet.</p>}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4"><div><p className="editorial-kicker">Trusted firms</p><h2 className="mt-2 text-4xl font-extrabold sm:text-5xl">Explore Prop Firms</h2><p className="mt-2 text-muted-foreground">Compare firms using reported payout history.</p></div><Button variant="outline" asChild><Link to="/firms">View all firms <ArrowRight /></Link></Button></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {firms.slice(0, 6).map((firm) => {
                const total = firm.approvals_count + firm.denials_count;
                const rate = total ? (firm.approvals_count / total) * 100 : 0;
                return <motion.div key={firm.id} whileHover={{ y: -4 }} className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:border-primary/50 hover:shadow-lg">
                  <div className="flex items-start gap-3"><Avatar className="h-12 w-12 border border-border bg-secondary"><AvatarImage src={firm.logo_url} className="object-contain transition-transform duration-300 hover:scale-[1.02]" /><AvatarFallback>{firm.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar><div className="flex-1"><h3 className="text-lg font-extrabold">{firm.name}</h3><p className="mt-1 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success"><ShieldCheck className="h-3 w-3" /> Reported payout history</p></div></div>
                  <div className="my-5 grid grid-cols-2 gap-3 border-y border-border py-4"><div><p className="text-xl font-bold text-success">{firm.approvals_count}</p><p className="text-xs text-muted-foreground">Approvals</p></div><div><p className="text-xl font-bold text-destructive">{firm.denials_count}</p><p className="text-xs text-muted-foreground">Denials</p></div></div>
                  <div className="mb-5 flex items-center gap-4"><div className="relative flex h-16 w-16 items-center justify-center rounded-full" style={{ background: `conic-gradient(hsl(var(--success)) ${rate}%, hsl(var(--secondary)) 0)` }}><div className="flex h-12 w-12 items-center justify-center rounded-full bg-card text-sm font-extrabold">{rate.toFixed(0)}%</div></div><div><p className="font-bold">Approval rate</p><p className="text-xs text-muted-foreground">Based on {total} reported cases</p></div></div>
                  <Button asChild className="w-full"><Link to={`/firms/${firm.id}`}>View firm <ArrowRight /></Link></Button>
                </motion.div>;
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card py-20">
          <div className="container mx-auto grid gap-5 px-4 lg:grid-cols-2">
            <div className="dark-panel rounded-lg p-6"><div className="mb-7 flex items-start justify-between"><div><p className="editorial-kicker">Live intelligence</p><h2 className="mt-2 text-2xl font-extrabold">Payout Approval Trends</h2></div><TrendingUp className="text-success" /></div><div className="flex h-52 items-end gap-2 border-b border-l border-primary/20 px-3 pb-3">{[45,58,52,70,66,82,75,92,86,108,98,118].map((height,index)=><span key={index} className="relative flex-1"><motion.span initial={{height:0}} whileInView={{height}} viewport={{once:true}} transition={{delay:index*.04}} className="absolute bottom-0 w-full rounded-t-sm bg-success/75" /></span>)}</div><div className="mt-4 flex gap-6 text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success" />Approvals</span><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-destructive" />Denials tracked</span></div></div>
            <div className="rounded-lg border border-border bg-background p-6"><div className="mb-7 flex items-start justify-between"><div><p className="editorial-kicker">Case distribution</p><h2 className="mt-2 text-2xl font-extrabold">Platform Intelligence</h2></div><BarChart3 className="text-primary" /></div><div className="grid grid-cols-2 gap-4">{[
              { label: "All cases", value: cases.length, icon: BarChart3 },
              { label: "Verified", value: verified, icon: ShieldCheck },
              { label: "Avg payout", value: formatDays(avgPayoutDays(cases)), icon: Clock3 },
              { label: "Approval rate", value: `${approvalRate(cases).toFixed(1)}%`, icon: CheckCircle2 },
            ].map(item=><div key={item.label} className="rounded-md border border-border bg-card p-5"><item.icon className="mb-5 h-5 w-5 text-primary" /><p className="text-2xl font-extrabold">{item.value}</p><p className="mt-1 text-xs text-muted-foreground">{item.label}</p></div>)}</div></div>
          </div>
        </section>

        <WaveFooter />
      </div>
    </PageTransition>
  );
};

export default Index;