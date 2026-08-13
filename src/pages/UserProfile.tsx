import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CaseStatusBadge from "@/components/CaseStatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { CaseStatusCounts, emptyCounts, trustLabel, trustLabelClass, trustScore } from "@/lib/trust";
import { format } from "date-fns";
import { CalendarDays, UserCircle } from "lucide-react";

const UserProfile = ({ self = false }: { self?: boolean }) => {
  const { username } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (self && authLoading) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      let query = supabase.from("profiles").select("id, username, created_at");
      if (self) {
        if (!user) {
          if (active) { setProfile(null); setLoading(false); }
          return;
        }
        query = query.eq("id", user.id);
      } else {
        query = query.eq("username", username ?? "");
      }

      const { data: prof } = await query.maybeSingle();
      if (!active) return;
      setProfile(prof ?? null);

      if (prof) {
        const { data } = await supabase
          .from("payout_cases")
          .select("*, firms (name)")
          .eq("user_id", prof.id)
          .order("created_at", { ascending: false });
        if (active) setCases(data || []);
      } else {
        setCases([]);
      }
      if (active) setLoading(false);
    };

    load();
    return () => { active = false; };
  }, [username, self, user, authLoading]);

  const counts: CaseStatusCounts = emptyCounts();
  cases.forEach((c) => {
    const s = (c.verification_status || "pending") as keyof CaseStatusCounts;
    if (s in counts) counts[s] += 1;
  });
  const score = trustScore(counts);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Seo
        title={profile ? `${profile.username} — Contributor Profile | Payout Cases` : "Contributor Profile | Payout Cases"}
        description={profile ? `Payout cases submitted by ${profile.username}, with verification statuses and community trust standing.` : "Contributor profile on Payout Cases."}
        path={profile?.username ? `/users/${profile.username}` : "/users"}
      />
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading profile...</p>
        ) : !profile ? (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-2">Profile not found</h1>
            <p className="text-muted-foreground">
              {self ? "Sign in to view your profile." : "We couldn't find a contributor with that username."}
            </p>
          </div>
        ) : (
          <>
            <Card className="glass p-8 mb-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <UserCircle className="w-9 h-9 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{profile.username}</h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <CalendarDays className="w-4 h-4" />
                      Joined {profile.created_at ? format(new Date(profile.created_at), "MMM yyyy") : "—"}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold gradient-text-primary">{score}</p>
                  <p className="text-xs text-muted-foreground mb-2">Trust score</p>
                  <Badge variant="outline" className={trustLabelClass(score)}>{trustLabel(score)}</Badge>
                </div>
              </div>

              <h2 className="text-lg font-semibold mt-8 mb-4">Contribution breakdown</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Verified", value: counts.verified },
                  { label: "Community Confirmed", value: counts.community_confirmed },
                  { label: "Pending", value: counts.pending },
                  { label: "Disputed", value: counts.disputed },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-border p-4 text-center">
                    <p className="text-2xl font-bold">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {cases.length} total case{cases.length === 1 ? "" : "s"} submitted
              </p>
            </Card>

            <h2 className="text-2xl font-bold mb-4">Submitted cases</h2>
            <div className="space-y-3">
              {cases.map((c) => (
                <Card key={c.id} className="glass p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link to={`/firms/${c.firm_id}`} className="font-semibold hover:underline">
                      {c.firms?.name || "Unknown firm"}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {c.status === "approved" ? "Approved" : "Denied"} · {format(new Date(c.created_at), "MMM dd, yyyy")}
                      {c.amount ? ` · $${parseFloat(c.amount).toLocaleString()}` : ""}
                    </p>
                  </div>
                  <CaseStatusBadge status={c.verification_status} />
                </Card>
              ))}
              {cases.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No cases submitted yet</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
