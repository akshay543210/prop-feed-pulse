import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Star, LayoutGrid, List, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const Firms = () => {
  const { toast } = useToast();
  const [firms, setFirms] = useState<any[]>([]);
  const [filteredFirms, setFilteredFirms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("approvals");
  const [view, setView] = useState<"table" | "card">("table");

  useEffect(() => {
    fetchFirms();
    
    const channel = supabase
      .channel('firms-live-feed')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'firms' }, (payload) => {
        setFirms(prev => prev.map(f => f.id === payload.new.id ? payload.new : f));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => { filterAndSortFirms(); }, [firms, searchQuery, sortBy]);

  const fetchFirms = async () => {
    try {
      const { data, error } = await supabase.from('firms').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setFirms(data || []);
    } catch (error: any) {
      toast({ title: "Error fetching firms", description: error.message, variant: "destructive" });
    }
  };

  const filterAndSortFirms = () => {
    let filtered = firms.filter(firm => firm.name.toLowerCase().includes(searchQuery.toLowerCase()));
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "approvals": return b.approvals_count - a.approvals_count;
        case "denials": return b.denials_count - a.denials_count;
        case "ratio":
          const ratioA = a.approvals_count / (a.approvals_count + a.denials_count) || 0;
          const ratioB = b.approvals_count / (b.approvals_count + b.denials_count) || 0;
          return ratioB - ratioA;
        default: return 0;
      }
    });
    setFilteredFirms(filtered);
  };

  const getRating = (firm: any) => {
    const total = firm.approvals_count + firm.denials_count;
    if (total === 0) return 0;
    const ratio = firm.approvals_count / total;
    if (ratio >= 0.9) return 5;
    if (ratio >= 0.75) return 4;
    if (ratio >= 0.5) return 3;
    if (ratio >= 0.25) return 2;
    return 1;
  };

  const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-primary text-primary" : "text-muted"}`} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-approval-text">PropFirms Performance Tracker</h1>
          <p className="text-muted-foreground">Live feed of all prop firms with real-time payout performance tracking</p>
        </div>

        {/* Search, Filter & View Toggle */}
        <div className="glass p-6 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search firms..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approvals">Most Approved</SelectItem>
                <SelectItem value="denials">Most Denied</SelectItem>
                <SelectItem value="ratio">Best Approval Ratio</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1 border border-border rounded-lg p-1">
              <Button variant={view === "table" ? "default" : "ghost"} size="icon" onClick={() => setView("table")} className="h-8 w-8">
                <List className="h-4 w-4" />
              </Button>
              <Button variant={view === "card" ? "default" : "ghost"} size="icon" onClick={() => setView("card")} className="h-8 w-8">
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
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
                      <TableHead className="text-muted-foreground text-center">Approvals</TableHead>
                      <TableHead className="text-muted-foreground text-center">Denials</TableHead>
                      <TableHead className="text-muted-foreground text-center">Approval Rate</TableHead>
                      <TableHead className="text-muted-foreground text-center">Rating</TableHead>
                      <TableHead className="text-muted-foreground">Website</TableHead>
                      <TableHead className="text-muted-foreground">Created</TableHead>
                      <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFirms.map((firm) => {
                      const total = firm.approvals_count + firm.denials_count;
                      const rate = total > 0 ? ((firm.approvals_count / total) * 100).toFixed(1) : "0.0";
                      return (
                        <TableRow key={firm.id} className="border-border hover:bg-secondary/30 transition-colors">
                          <TableCell className="font-semibold flex items-center gap-3">
                            {firm.logo_url && <img src={firm.logo_url} alt="" className="w-8 h-8 rounded-full object-cover" />}
                            {firm.name}
                          </TableCell>
                          <TableCell className="text-center text-success font-medium">{firm.approvals_count}</TableCell>
                          <TableCell className="text-center text-destructive font-medium">{firm.denials_count}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary to-success" style={{ width: `${rate}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground">{rate}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center"><RatingStars rating={getRating(firm)} /></TableCell>
                          <TableCell>
                            {firm.website && (
                              <a href={firm.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                                <ExternalLink className="h-3 w-3" /> Visit
                              </a>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{format(new Date(firm.created_at), 'MMM dd, yyyy')}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/firms/${firm.id}`}>View Details</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          ) : (
            <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFirms.map((firm) => {
                  const totalCases = firm.approvals_count + firm.denials_count;
                  const approvalRatio = totalCases > 0 ? (firm.approvals_count / totalCases) * 100 : 0;
                  const rating = getRating(firm);
                  return (
                    <Card key={firm.id} className="glass p-6 transition-smooth hover:scale-105 hover:glow-approval">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{firm.name}</h3>
                          <RatingStars rating={rating} />
                        </div>
                      </div>
                      {firm.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{firm.description}</p>}
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-success">✓ {firm.approvals_count} Approved</span>
                          <span className="text-destructive">✗ {firm.denials_count} Denied</span>
                        </div>
                        <div className="w-full h-3 bg-card rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500" style={{ width: `${approvalRatio}%` }} />
                        </div>
                        <p className="text-center text-sm font-semibold">{approvalRatio.toFixed(1)}% Approval Rate</p>
                      </div>
                      <Button asChild className="w-full"><Link to={`/firms/${firm.id}`}>View Details</Link></Button>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredFirms.length === 0 && (
          <div className="text-center py-12"><p className="text-muted-foreground">No firms found matching your criteria</p></div>
        )}
      </div>
    </div>
  );
};

export default Firms;
