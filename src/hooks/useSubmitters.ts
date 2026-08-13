import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CaseStatusCounts, emptyCounts, trustScore } from "@/lib/trust";

export type Submitter = {
  id: string;
  username: string | null;
  counts: CaseStatusCounts;
  score: number;
};

export type SubmitterMap = Record<string, Submitter>;

/** Loads profile + trust info for a set of submitter user ids. */
export const useSubmitters = (userIds: (string | null | undefined)[]) => {
  const [submitters, setSubmitters] = useState<SubmitterMap>({});
  const ids = Array.from(new Set(userIds.filter(Boolean) as string[])).sort();
  const key = ids.join(",");

  useEffect(() => {
    if (ids.length === 0) {
      setSubmitters({});
      return;
    }
    let active = true;

    const load = async () => {
      const [{ data: profiles }, { data: cases }] = await Promise.all([
        supabase.from("profiles").select("id, username").in("id", ids),
        supabase.from("payout_cases").select("user_id, verification_status").in("user_id", ids),
      ]);

      if (!active) return;

      const map: SubmitterMap = {};
      (profiles || []).forEach((p) => {
        map[p.id] = { id: p.id, username: p.username, counts: emptyCounts(), score: 0 };
      });
      (cases || []).forEach((c) => {
        if (!c.user_id) return;
        const entry = map[c.user_id];
        if (!entry) return;
        const status = (c.verification_status || "pending") as keyof CaseStatusCounts;
        if (status in entry.counts) entry.counts[status] += 1;
      });
      Object.values(map).forEach((s) => {
        s.score = trustScore(s.counts);
      });
      setSubmitters(map);
    };

    load();
    return () => {
      active = false;
    };
  }, [key]);

  return submitters;
};
