import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import ParticleBackground from "@/components/ParticleBackground";
import GlobeScene from "@/components/GlobeScene";
import AnimatedCounter from "@/components/AnimatedCounter";
import TiltCard from "@/components/TiltCard";
import LiveFeed from "@/components/LiveFeed";
import WaveFooter from "@/components/WaveFooter";
import PageTransition from "@/components/PageTransition";
import SubmitCaseButton from "@/components/SubmitCaseButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, TrendingUp, ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { approvalRate, avgPayoutDays, formatDays, groupByFirm } from "@/lib/stats";
import TrendBadge from "@/components/TrendBadge";
import { trendDelta } from "@/lib/stats";

const Index = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalApprovals: 0,
    totalDenials: 0,
    totalFirms: 0,
  });
  const [topFirms, setTopFirms] = useState<any[]>([]);
  const [allCases, setAllCases] = useState<any[]>([]);
  const [firmNames, setFirmNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchStats();
    fetchTopFirms();
    fetchCases();
    
    const firmsChannel = supabase
      .channel('firms-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'firms' }, () => {
        fetchStats();
        fetchTopFirms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(firmsChannel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const { data: firms, error } = await supabase
        .from('firms')
        .select('approvals_count, denials_count');

      if (error) throw error;

      const totalApprovals = firms?.reduce((sum, f) => sum + f.approvals_count, 0) || 0;
      const totalDenials = firms?.reduce((sum, f) => sum + f.denials_count, 0) || 0;

      setStats({
        totalApprovals,
        totalDenials,
        totalFirms: firms?.length || 0,
      });
    } catch (error: any) {
      toast({
        title: "Error fetching stats",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchTopFirms = async () => {
    try {
      const { data, error } = await supabase
        .from('firms')
        .select('*')
        .order('approvals_count', { ascending: false })
        .limit(3);

      if (error) throw error;
      setTopFirms(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching top firms",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchCases = async () => {
    const [{ data: cases }, { data: firms }] = await Promise.all([
      supabase.from('payout_cases').select('firm_id, status, created_at, payout_date, verification_status'),
      supabase.from('firms').select('id, name'),
    ]);
    setAllCases(cases || []);
    const names: Record<string, string> = {};
    (firms || []).forEach((f) => { names[f.id] = f.name; });
    setFirmNames(names);
  };

  return (
    <PageTransition>
      <Seo
        title="Payout Cases — Prop Firm Payout Tracker"
        description="Real-time tracking of payout approvals and denials across top proprietary trading firms. Compare approval rates and verified payout cases."
        path="/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Payout Cases",
            url: "https://payoutcases.lovable.app",
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Payout Cases",
            url: "https://payoutcases.lovable.app",
          },
        ]}
      />
      <div className="min-h-screen relative overflow-hidden">
        <ParticleBackground />
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 px-4 min-h-screen flex items-center">
          <GlobeScene />
          <div className="container mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="inline-block mb-6"
              >
                <span className="px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-sm">
                  Live Payout Analytics Platform
                </span>
              </motion.div>
              
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                <span className="gradient-text-primary block animate-gradient">
                  Real-time Prop Firm Payout Tracking &amp; Statistics
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Real-time tracking of payout approvals and denials across top proprietary trading firms.
                <span className="block mt-2 text-primary font-medium">
                  Make informed decisions with premium analytics.
                </span>
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 mb-16">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent glow-primary px-8 py-6 text-lg rounded-xl">
                    <Link to="/firms">
                      Explore Firms
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <SubmitCaseButton size="lg" variant="outline" className="px-8 py-6 text-lg rounded-xl border-2 glass">
                    Submit Your Case
                  </SubmitCaseButton>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Live Stats Bar */}
        <section className="py-20 px-4 relative z-10">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="glass-strong p-12 rounded-3xl glow-card"
            >
              <h2 className="text-3xl font-bold mb-10 text-center gradient-text-primary">
                Platform Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="w-20 h-20 mx-auto mb-4 rounded-xl border border-primary/30 bg-card/60 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/10"
                  >
                    <CheckCircle className="w-10 h-10 text-success" />
                  </motion.div>
                  <h3 className="text-6xl font-bold mb-3 gradient-text-success">
                    <AnimatedCounter end={stats.totalApprovals} />
                  </h3>
                  <p className="text-muted-foreground text-lg">Total Approvals</p>
                </div>
                
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="w-20 h-20 mx-auto mb-4 rounded-xl border border-destructive/30 bg-card/60 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-destructive/10"
                  >
                    <XCircle className="w-10 h-10 text-destructive" />
                  </motion.div>
                  <h3 className="text-6xl font-bold mb-3 gradient-text-danger">
                    <AnimatedCounter end={stats.totalDenials} />
                  </h3>
                  <p className="text-muted-foreground text-lg">Total Denials</p>
                </div>
                
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="w-20 h-20 mx-auto mb-4 rounded-xl border border-primary/30 bg-card/60 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/10"
                  >
                    <TrendingUp className="w-10 h-10 text-primary" />
                  </motion.div>
                  <h3 className="text-6xl font-bold mb-3 gradient-text-primary">
                    <AnimatedCounter end={stats.totalFirms} />
                  </h3>
                  <p className="text-muted-foreground text-lg">Tracked Firms</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-4xl mx-auto">
                {[
                  { label: "Cases tracked", value: allCases.length.toLocaleString() },
                  {
                    label: "Verified or confirmed",
                    value: `${allCases.length
                      ? Math.round(
                          (allCases.filter((c) =>
                            ["verified", "community_confirmed"].includes(c.verification_status)
                          ).length /
                            allCases.length) *
                            100
                        )
                      : 0}%`,
                  },
                  { label: "Avg payout time", value: formatDays(avgPayoutDays(allCases)) },
                  { label: "Overall approval rate", value: `${approvalRate(allCases).toFixed(1)}%` },
                ].map((m) => (
                  <div key={m.label} className="glass-card rounded-xl p-5 text-center">
                    <p className="text-2xl font-bold gradient-text-primary">{m.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Top Firms Section */}
        <section className="py-20 px-4 relative z-10">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold mb-4 gradient-text-primary">
                Top Performing Firms
              </h2>
              <p className="text-xl text-muted-foreground">
                Interactive 3D cards with real-time performance metrics
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {topFirms.map((firm, index) => {
                const totalCases = firm.approvals_count + firm.denials_count;
                const approvalRatio = totalCases > 0 ? (firm.approvals_count / totalCases) * 100 : 0;
                
                return (
                  <motion.div
                    key={firm.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link to={`/firms/${firm.id}`}>
                      <TiltCard className="h-full">
                        <Card className="glass-card p-8 h-full hover-lift glow-card">
                          <div className="text-center mb-6">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
                              <span className="text-3xl font-bold">{index + 1}</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{firm.name}</h3>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-success flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                {firm.approvals_count} Approved
                              </span>
                              <span className="text-destructive flex items-center gap-2">
                                <XCircle className="w-4 h-4" />
                                {firm.denials_count} Denied
                              </span>
                            </div>
                            
                            <div className="relative w-full h-4 bg-card rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${approvalRatio}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                viewport={{ once: true }}
                                className="absolute h-full bg-gradient-to-r from-primary to-success rounded-full"
                              />
                            </div>
                            
                            <p className="text-center text-xl font-bold gradient-text-primary">
                              <AnimatedCounter end={approvalRatio} decimals={1} suffix="%" />
                              <span className="block text-sm text-muted-foreground font-normal mt-1">
                                approval rate
                              </span>
                            </p>
                          </div>
                        </Card>
                      </TiltCard>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Top firms this month */}
            <div className="mt-16 max-w-4xl mx-auto glass-card rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="text-lg font-bold">Top firms this month</h3>
                <Link to="/firms" className="text-sm text-primary hover:underline">View all firms</Link>
              </div>
              <div className="divide-y divide-border">
                {(() => {
                  const monthCases = allCases.filter(
                    (c) => new Date(c.created_at).getTime() > Date.now() - 30 * 86400000
                  );
                  const rows = Object.entries(groupByFirm(monthCases))
                    .map(([firmId, list]) => ({
                      firmId,
                      name: firmNames[firmId] || "Unknown firm",
                      cases: list.length,
                      rate: approvalRate(list),
                      avg: avgPayoutDays(list),
                      trend: trendDelta(allCases.filter((c) => c.firm_id === firmId)),
                    }))
                    .sort((a, b) => b.rate - a.rate || b.cases - a.cases)
                    .slice(0, 5);

                  if (!rows.length) {
                    return (
                      <p className="px-6 py-8 text-center text-muted-foreground text-sm">
                        No cases reported in the last 30 days
                      </p>
                    );
                  }

                  return rows.map((r) => (
                    <Link
                      key={r.firmId}
                      to={`/firms/${r.firmId}`}
                      className="grid grid-cols-4 items-center gap-2 px-6 py-4 hover:bg-secondary/30 transition-colors text-sm"
                    >
                      <span className="font-semibold truncate">{r.name}</span>
                      <span className="text-center text-muted-foreground">{r.cases} cases</span>
                      <span className="text-center font-mono text-success">{r.rate.toFixed(1)}%</span>
                      <span className="text-right flex items-center justify-end gap-3">
                        <span className="text-muted-foreground font-mono">{formatDays(r.avg)}</span>
                        <TrendBadge delta={r.trend} />
                      </span>
                    </Link>
                  ));
                })()}
              </div>
            </div>
          </div>
        </section>

        {/* Live Feed Section */}
        <section className="py-20 px-4 relative z-10">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-5xl font-bold mb-4 gradient-text-primary">
                Live Payout Feed
              </h2>
              <p className="text-xl text-muted-foreground">
                Real-time updates as they happen
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <LiveFeed />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 relative z-10">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold mb-4">
                Why Choose <span className="gradient-text-primary">Payout Cases</span>?
              </h2>
              <p className="text-xl text-muted-foreground">
                Premium features designed for professional traders
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Real-Time Updates",
                  description: "Get instant notifications when new payout cases are submitted and verified across all firms.",
                  color: "primary",
                },
                {
                  icon: BarChart3,
                  title: "Performance Metrics",
                  description: "Track approval ratios and payout trends with advanced analytics and interactive charts.",
                  color: "success",
                },
                {
                  icon: Shield,
                  title: "Transparent Data",
                  description: "See verified screenshots and complete details for every approval and denial case.",
                  color: "accent",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <TiltCard>
                    <Card className="glass-card p-8 h-full hover-lift">
                      <div className={`w-16 h-16 rounded-2xl bg-${feature.color}/10 border border-${feature.color}/20 flex items-center justify-center mb-6`}>
                        <feature.icon className={`w-8 h-8 text-${feature.color}`} />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </Card>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <WaveFooter />
      </div>
    </PageTransition>
  );
};

export default Index;
