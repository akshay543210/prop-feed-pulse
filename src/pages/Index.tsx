import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, TrendingUp, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalApprovals: 0,
    totalDenials: 0,
    totalFirms: 0,
  });
  const [topFirms, setTopFirms] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchTopFirms();
    
    // Subscribe to real-time updates
    const firmsChannel = supabase
      .channel('firms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'firms'
        },
        () => {
          fetchStats();
          fetchTopFirms();
        }
      )
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
        .limit(5);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent animate-gradient-approval">
            PropFirm Payout Tracker
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Real-time tracking of payout approvals and denials across top proprietary trading firms
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild className="bg-gradient-to-r from-primary to-success glow-approval">
              <Link to="/firms">
                Explore Firms
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/submit">Submit Your Case</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass p-8 text-center transition-smooth hover:scale-105 hover:glow-approval">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
              <h3 className="text-4xl font-bold mb-2 gradient-approval-text">
                {stats.totalApprovals}
              </h3>
              <p className="text-muted-foreground">Total Approvals</p>
            </Card>
            
            <Card className="glass p-8 text-center transition-smooth hover:scale-105 hover:glow-denial">
              <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-4xl font-bold mb-2 gradient-denial-text">
                {stats.totalDenials}
              </h3>
              <p className="text-muted-foreground">Total Denials</p>
            </Card>
            
            <Card className="glass p-8 text-center transition-smooth hover:scale-105">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-4xl font-bold mb-2">{stats.totalFirms}</h3>
              <p className="text-muted-foreground">Tracked Firms</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Top Firms Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Top Performing Firms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topFirms.map((firm) => {
              const totalCases = firm.approvals_count + firm.denials_count;
              const approvalRatio = totalCases > 0 ? (firm.approvals_count / totalCases) * 100 : 0;
              
              return (
                <Link key={firm.id} to={`/firms/${firm.id}`}>
                  <Card className="glass p-6 transition-smooth hover:scale-105 hover:glow-approval">
                    <h3 className="text-xl font-bold mb-4">{firm.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-success">Approvals: {firm.approvals_count}</span>
                        <span className="text-destructive">Denials: {firm.denials_count}</span>
                      </div>
                      <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-success"
                          style={{ width: `${approvalRatio}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {approvalRatio.toFixed(1)}% approval rate
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose PropFirm Tracker?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-Time Updates</h3>
              <p className="text-muted-foreground">
                Get instant notifications when new payout cases are submitted and verified
              </p>
            </Card>
            
            <Card className="glass p-6">
              <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2">Performance Metrics</h3>
              <p className="text-muted-foreground">
                Track approval ratios and payout trends across all major prop firms
              </p>
            </Card>
            
            <Card className="glass p-6">
              <div className="w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center mb-4">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-xl font-bold mb-2">Transparent Data</h3>
              <p className="text-muted-foreground">
                See verified screenshots and details for every approval and denial case
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
