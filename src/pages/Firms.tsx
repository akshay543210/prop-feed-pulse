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
import { Search, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Firms = () => {
  const { toast } = useToast();
  const [firms, setFirms] = useState<any[]>([]);
  const [filteredFirms, setFilteredFirms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("approvals");

  useEffect(() => {
    fetchFirms();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('firms-live-feed')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'firms'
        },
        (payload) => {
          console.log('Firm updated in real-time:', payload);
          setFirms(prev => 
            prev.map(f => f.id === payload.new.id ? payload.new : f)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterAndSortFirms();
  }, [firms, searchQuery, sortBy]);

  const fetchFirms = async () => {
    try {
      const { data, error } = await supabase
        .from('firms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFirms(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching firms",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filterAndSortFirms = () => {
    let filtered = firms.filter(firm =>
      firm.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "approvals":
          return b.approvals_count - a.approvals_count;
        case "denials":
          return b.denials_count - a.denials_count;
        case "ratio":
          const ratioA = a.approvals_count / (a.approvals_count + a.denials_count) || 0;
          const ratioB = b.approvals_count / (b.approvals_count + b.denials_count) || 0;
          return ratioB - ratioA;
        default:
          return 0;
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-approval-text">
            PropFirms Performance Tracker
          </h1>
          <p className="text-muted-foreground">
            Live feed of all prop firms with real-time payout performance tracking
          </p>
        </div>

        {/* Search and Filter */}
        <div className="glass p-6 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search firms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
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
          </div>
        </div>

        {/* Firms Grid */}
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
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating ? "fill-primary text-primary" : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {firm.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {firm.description}
                  </p>
                )}

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-success">✓ {firm.approvals_count} Approved</span>
                    <span className="text-destructive">✗ {firm.denials_count} Denied</span>
                  </div>
                  
                  <div className="w-full h-3 bg-card rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
                      style={{ width: `${approvalRatio}%` }}
                    />
                  </div>
                  
                  <p className="text-center text-sm font-semibold">
                    {approvalRatio.toFixed(1)}% Approval Rate
                  </p>
                </div>

                <Button asChild className="w-full">
                  <Link to={`/firms/${firm.id}`}>View Details</Link>
                </Button>
              </Card>
            );
          })}
        </div>

        {filteredFirms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No firms found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Firms;
