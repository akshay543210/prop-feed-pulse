import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CheckCircle, Calendar, DollarSign, LayoutGrid, List, Twitter, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const Approvals = () => {
  const { toast } = useToast();
  const [cases, setCases] = useState<any[]>([]);
  const [view, setView] = useState<"table" | "card">("table");

  useEffect(() => {
    fetchApprovals();
    const channel = supabase
      .channel('approvals-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payout_cases', filter: 'status=eq.approved' }, () => {
        fetchApprovals();
        toast({ title: "New Approval Added!", description: "A new payout approval has been submitted" });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchApprovals = async () => {
    try {
      const { data, error } = await supabase
        .from('payout_cases')
        .select(`*, firms (name, logo_url)`)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCases(data || []);
    } catch (error: any) {
      toast({ title: "Error fetching approvals", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-4 gradient-approval-text flex items-center">
              <CheckCircle className="w-10 h-10 mr-3" /> Approved Payouts
            </h1>
            <p className="text-muted-foreground">Real-time feed of approved payout cases across all firms</p>
          </div>
          <div className="flex gap-1 border border-border rounded-lg p-1">
            <Button variant={view === "table" ? "default" : "ghost"} size="icon" onClick={() => setView("table")} className="h-8 w-8"><List className="h-4 w-4" /></Button>
            <Button variant={view === "card" ? "default" : "ghost"} size="icon" onClick={() => setView("card")} className="h-8 w-8"><LayoutGrid className="h-4 w-4" /></Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === "table" ? (
            <motion.div key="table" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="glass rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Firm</TableHead>
                      <TableHead className="text-muted-foreground text-right">Amount</TableHead>
                      <TableHead className="text-muted-foreground">Payout Date</TableHead>
                      <TableHead className="text-muted-foreground text-center">Twitter</TableHead>
                      <TableHead className="text-muted-foreground">Screenshot</TableHead>
                      <TableHead className="text-muted-foreground">Notes</TableHead>
                      <TableHead className="text-muted-foreground">Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cases.map((c) => (
                      <TableRow key={c.id} className="border-border hover:bg-secondary/30 transition-colors border-l-2 border-l-success/50">
                        <TableCell className="font-semibold">{c.firms?.name}</TableCell>
                        <TableCell className="text-right font-medium">{c.amount ? `$${parseFloat(c.amount).toLocaleString()}` : "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.payout_date ? format(new Date(c.payout_date), 'MMM dd, yyyy') : "—"}</TableCell>
                        <TableCell className="text-center">
                          {(c as any).twitter_link ? (
                            <a href={(c as any).twitter_link} target="_blank" rel="noopener noreferrer" className="inline-flex text-primary hover:text-primary/80"><Twitter className="h-4 w-4" /></a>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          {c.screenshot_url ? <img src={c.screenshot_url} alt="Proof" className="w-12 h-8 object-cover rounded" /> : "—"}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{c.notes || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(c.created_at), 'MMM dd, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          ) : (
            <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cases.map((payoutCase) => (
                  <Card key={payoutCase.id} className="glass p-6 transition-smooth hover:scale-105 hover:glow-approval">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{payoutCase.firms?.name}</h3>
                        <Badge className="bg-success/20 text-success">Approved</Badge>
                      </div>
                      <CheckCircle className="w-6 h-6 text-success" />
                    </div>
                    {payoutCase.amount && (
                      <div className="flex items-center mb-2">
                        <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-lg font-semibold">${parseFloat(payoutCase.amount).toLocaleString()}</span>
                      </div>
                    )}
                    {payoutCase.payout_date && (
                      <div className="flex items-center mb-4">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{format(new Date(payoutCase.payout_date), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    {(payoutCase as any).twitter_link && (
                      <a href={(payoutCase as any).twitter_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary text-sm mb-4 hover:underline">
                        <Twitter className="w-4 h-4" /> View on Twitter/X
                      </a>
                    )}
                    {payoutCase.screenshot_url && <img src={payoutCase.screenshot_url} alt="Payout proof" className="w-full h-40 object-cover rounded-lg mb-4" />}
                    {payoutCase.notes && <p className="text-sm text-muted-foreground line-clamp-3">{payoutCase.notes}</p>}
                    <div className="mt-4 pt-4 border-t border-border">
                      <span className="text-xs text-muted-foreground">Submitted {format(new Date(payoutCase.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {cases.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted" />
            <p className="text-muted-foreground">No approved payouts yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Approvals;
