import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XCircle, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Denials = () => {
  const { toast } = useToast();
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    fetchDenials();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('denials-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payout_cases',
          filter: 'status=eq.denied'
        },
        (payload) => {
          console.log('New denial!', payload);
          fetchDenials();
          toast({
            title: "New Denial Added",
            description: "A new payout denial has been submitted",
            variant: "destructive",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDenials = async () => {
    try {
      const { data, error } = await supabase
        .from('payout_cases')
        .select(`
          *,
          firms (
            name,
            logo_url
          )
        `)
        .eq('status', 'denied')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching denials",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-denial-text flex items-center">
            <XCircle className="w-10 h-10 mr-3" />
            Denied Payouts
          </h1>
          <p className="text-muted-foreground">
            Real-time feed of denied payout cases across all firms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((payoutCase) => (
            <Card key={payoutCase.id} className="glass p-6 transition-smooth hover:scale-105 hover:glow-denial">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    {payoutCase.firms?.name}
                  </h3>
                  <Badge className="bg-destructive/20 text-destructive">Denied</Badge>
                </div>
                <XCircle className="w-6 h-6 text-destructive" />
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
          ))}
        </div>

        {cases.length === 0 && (
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-muted" />
            <p className="text-muted-foreground">No denied payouts yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Denials;
