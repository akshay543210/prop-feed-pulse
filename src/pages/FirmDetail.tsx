import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Star, ExternalLink, Calendar, DollarSign, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const FirmDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [firm, setFirm] = useState<any>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [denials, setDenials] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchFirm();
      fetchCases();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel(`firm-${id}-updates`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'firms',
            filter: `id=eq.${id}`
          },
          (payload) => {
            console.log('Firm updated:', payload);
            setFirm(payload.new);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payout_cases',
            filter: `firm_id=eq.${id}`
          },
          () => {
            fetchCases();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id]);

  const fetchFirm = async () => {
    try {
      const { data, error } = await supabase
        .from('firms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setFirm(data);
    } catch (error: any) {
      toast({
        title: "Error fetching firm",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from('payout_cases')
        .select('*')
        .eq('firm_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setApprovals(data?.filter(c => c.status === 'approved') || []);
      setDenials(data?.filter(c => c.status === 'denied') || []);
    } catch (error: any) {
      toast({
        title: "Error fetching cases",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRating = () => {
    if (!firm) return 0;
    const total = firm.approvals_count + firm.denials_count;
    if (total === 0) return 0;
    const ratio = firm.approvals_count / total;
    
    if (ratio >= 0.9) return 5;
    if (ratio >= 0.75) return 4;
    if (ratio >= 0.5) return 3;
    if (ratio >= 0.25) return 2;
    return 1;
  };

  if (!firm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const totalCases = firm.approvals_count + firm.denials_count;
  const approvalRatio = totalCases > 0 ? (firm.approvals_count / totalCases) * 100 : 0;
  const rating = getRating();

  const CaseCard = ({ payoutCase, isApproval }: any) => (
    <Card className={`glass p-6 transition-smooth hover:scale-105 ${isApproval ? 'hover:glow-approval' : 'hover:glow-denial'}`}>
      <div className="flex items-start justify-between mb-4">
        <Badge className={isApproval ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}>
          {isApproval ? 'Approved' : 'Denied'}
        </Badge>
        {isApproval ? 
          <CheckCircle className="w-6 h-6 text-success" /> : 
          <XCircle className="w-6 h-6 text-destructive" />
        }
      </div>

      {payoutCase.amount && (
        <div className="flex items-center mb-2">
          <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
          <span className="text-lg font-semibold">
            ${parseFloat(payoutCase.amount).toLocaleString()}
          </span>
        </div>
      )}

      {payoutCase.payout_date && (
        <div className="flex items-center mb-4">
          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {format(new Date(payoutCase.payout_date), 'MMM dd, yyyy')}
          </span>
        </div>
      )}

      {payoutCase.screenshot_url && (
        <img 
          src={payoutCase.screenshot_url}
          alt="Payout proof"
          className="w-full h-40 object-cover rounded-lg mb-4"
        />
      )}

      {payoutCase.notes && (
        <p className="text-sm text-muted-foreground line-clamp-3">
          {payoutCase.notes}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground">
          Submitted {format(new Date(payoutCase.created_at), 'MMM dd, yyyy')}
        </span>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/firms">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Firms
          </Link>
        </Button>

        {/* Firm Header */}
        <Card className="glass p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4">{firm.name}</h1>
              
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < rating ? "fill-primary text-primary" : "text-muted"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({rating}/5 stars)
                </span>
              </div>

              {firm.description && (
                <p className="text-muted-foreground mb-4">{firm.description}</p>
              )}

              {firm.website && (
                <Button variant="outline" asChild>
                  <a href={firm.website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              )}
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold gradient-approval-text">
                  {approvalRatio.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
              </div>
              
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{firm.approvals_count}</p>
                  <p className="text-xs text-muted-foreground">Approvals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">{firm.denials_count}</p>
                  <p className="text-xs text-muted-foreground">Denials</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-3 bg-card rounded-full overflow-hidden mt-6">
            <div 
              className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
              style={{ width: `${approvalRatio}%` }}
            />
          </div>
        </Card>

        {/* Cases Tabs */}
        <Tabs defaultValue="approvals" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="approvals">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approvals ({approvals.length})
            </TabsTrigger>
            <TabsTrigger value="denials">
              <XCircle className="w-4 h-4 mr-2" />
              Denials ({denials.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvals.map((payoutCase) => (
                <CaseCard key={payoutCase.id} payoutCase={payoutCase} isApproval={true} />
              ))}
            </div>
            {approvals.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted" />
                <p className="text-muted-foreground">No approved cases yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="denials" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {denials.map((payoutCase) => (
                <CaseCard key={payoutCase.id} payoutCase={payoutCase} isApproval={false} />
              ))}
            </div>
            {denials.length === 0 && (
              <div className="text-center py-12">
                <XCircle className="w-16 h-16 mx-auto mb-4 text-muted" />
                <p className="text-muted-foreground">No denied cases yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FirmDetail;
