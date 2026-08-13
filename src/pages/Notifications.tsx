import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CaseStatusBadge from "@/components/CaseStatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Bell } from "lucide-react";

const LAST_VISIT_KEY = "notifications:last-visit";

const Notifications = () => {
  const { user, loading: authLoading } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [lastVisit, setLastVisit] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    let active = true;

    const load = async () => {
      if (!user) { setLoading(false); return; }

      const stored = localStorage.getItem(LAST_VISIT_KEY);
      setLastVisit(stored ? Number(stored) : 0);

      const { data: follows } = await supabase
        .from("firm_follows")
        .select("firm_id")
        .eq("user_id", user.id);

      const firmIds = (follows || []).map((f) => f.firm_id);
      if (firmIds.length === 0) {
        if (active) { setCases([]); setLoading(false); }
        return;
      }

      const { data } = await supabase
        .from("payout_cases")
        .select("*, firms (name)")
        .in("firm_id", firmIds)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!active) return;
      setCases(data || []);
      setLoading(false);
      localStorage.setItem(LAST_VISIT_KEY, String(Date.now()));
    };

    load();
    return () => { active = false; };
  }, [user, authLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Seo
        title="Your Notifications | Payout Cases"
        description="New payout cases submitted for the proprietary trading firms you follow."
        path="/notifications"
      />
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Bell className="w-8 h-8 text-primary" /> Notifications
        </h1>
        <p className="text-muted-foreground mb-8">New cases from firms you follow</p>

        {!user && !authLoading ? (
          <Card className="glass p-8 text-center">
            <p className="text-muted-foreground mb-4">Sign in to see updates from firms you follow.</p>
            <Button asChild><Link to="/auth">Login / Sign Up</Link></Button>
          </Card>
        ) : loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : cases.length === 0 ? (
          <Card className="glass p-8 text-center">
            <p className="text-muted-foreground mb-4">Nothing here yet — follow a firm to get updates.</p>
            <Button asChild variant="outline"><Link to="/firms">Browse firms</Link></Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {cases.map((c) => {
              const isNew = new Date(c.created_at).getTime() > lastVisit;
              return (
                <Card key={c.id} className="glass p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link to={`/firms/${c.firm_id}`} className="font-semibold hover:underline">
                        {c.firms?.name}
                      </Link>
                      {isNew && <Badge className="bg-primary/20 text-primary">New</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {c.status === "approved" ? "Approved payout" : "Denied payout"}
                      {c.amount ? ` · $${parseFloat(c.amount).toLocaleString()}` : ""} ·{" "}
                      {format(new Date(c.created_at), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <CaseStatusBadge status={c.verification_status} />
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
