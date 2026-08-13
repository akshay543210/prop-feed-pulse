import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import FilterChips from "@/components/FilterChips";
import { CaseStatusCounts, emptyCounts, trustLabel, trustLabelClass, trustScore } from "@/lib/trust";
import { Trophy } from "lucide-react";

type Entry = {
  id: string;
  username: string | null;
  counts: CaseStatusCounts;
  total: number;
  score: number;
};

const Leaderboard = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("score");

  useEffect(() => {
    const load = async () => {
      const [{ data: profiles }, { data: cases }] = await Promise.all([
        supabase.from("profiles").select("id, username"),
        supabase.from("payout_cases").select("user_id, verification_status"),
      ]);

      const map: Record<string, Entry> = {};
      (profiles || []).forEach((p) => {
        map[p.id] = { id: p.id, username: p.username, counts: emptyCounts(), total: 0, score: 0 };
      });
      (cases || []).forEach((c) => {
        if (!c.user_id) return;
        const e = map[c.user_id];
        if (!e) return;
        const s = (c.verification_status || "pending") as keyof CaseStatusCounts;
        if (s in e.counts) e.counts[s] += 1;
        e.total += 1;
      });
      const list = Object.values(map)
        .map((e) => ({ ...e, score: trustScore(e.counts) }))
        .filter((e) => e.total > 0);
      setEntries(list);
      setLoading(false);
    };
    load();
  }, []);

  const sorted = useMemo(() => {
    const list = [...entries];
    if (sortBy === "submissions") list.sort((a, b) => b.total - a.total || b.score - a.score);
    else if (sortBy === "verified") list.sort((a, b) => b.counts.verified - a.counts.verified || b.score - a.score);
    else list.sort((a, b) => b.score - a.score || b.total - a.total);
    return list;
  }, [entries, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Seo
        title="Contributor Leaderboard | Payout Cases"
        description="Top payout case contributors ranked by community trust score, verified submissions and confirmed proof."
        path="/leaderboard"
      />
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text-primary flex items-center gap-3">
            <Trophy className="w-9 h-9" /> Leaderboard
          </h1>
          <p className="text-muted-foreground">Top contributors ranked by trust score.</p>
        </div>

        <FilterChips
          label="Rank contributors by"
          value={sortBy}
          onChange={setSortBy}
          options={[
            { value: "score", label: "Trust score" },
            { value: "verified", label: "Most verified" },
            { value: "submissions", label: "Most submissions" },
          ]}
        />

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading rankings...</p>
        ) : sorted.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No contributors yet</p>
        ) : (
          <div className="glass rounded-xl overflow-hidden divide-y divide-border">
            {sorted.map((e, i) => (
              <div key={e.id} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors">
                <span className={`font-mono w-8 text-sm ${i < 3 ? "text-warning font-bold" : "text-muted-foreground"}`}>
                  {i + 1}
                </span>
                <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                  {(e.username || "?").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  {e.username ? (
                    <Link to={`/users/${e.username}`} className="font-semibold hover:underline truncate block">
                      {e.username}
                    </Link>
                  ) : (
                    <span className="font-semibold text-muted-foreground">Anonymous</span>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {e.total} submitted · {e.counts.verified} verified · {e.counts.community_confirmed} confirmed
                  </p>
                </div>
                <Badge variant="outline" className={trustLabelClass(e.score)}>{trustLabel(e.score)}</Badge>
                <span className="font-mono text-primary text-lg w-10 text-right">{e.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
