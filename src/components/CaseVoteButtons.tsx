import { useEffect, useState } from "react";
import { ThumbsUp, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CaseVoteButtonsProps {
  caseId: string;
  ownerId?: string | null;
  upvotes: number;
  flags: number;
  onVoted?: () => void;
  compact?: boolean;
}

const CaseVoteButtons = ({ caseId, ownerId, upvotes, flags, onVoted, compact }: CaseVoteButtonsProps) => {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [myVote, setMyVote] = useState<"upvote" | "flag" | null>(null);
  const [busy, setBusy] = useState(false);

  const isOwnCase = !!user && !!ownerId && user.id === ownerId;

  useEffect(() => {
    let active = true;
    if (!user) {
      setMyVote(null);
      return;
    }
    supabase
      .from("case_votes")
      .select("vote_type")
      .eq("case_id", caseId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setMyVote((data?.vote_type as "upvote" | "flag") ?? null);
      });
    return () => {
      active = false;
    };
  }, [user, caseId]);

  const vote = async (type: "upvote" | "flag") => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (isOwnCase) {
      toast.error("You cannot vote on your own case");
      return;
    }
    setBusy(true);
    try {
      if (myVote === type) {
        const { error } = await supabase
          .from("case_votes")
          .delete()
          .eq("case_id", caseId)
          .eq("user_id", user.id);
        if (error) throw error;
        setMyVote(null);
      } else {
        const { error } = await supabase
          .from("case_votes")
          .upsert({ case_id: caseId, user_id: user.id, vote_type: type }, { onConflict: "case_id,user_id" });
        if (error) throw error;
        setMyVote(type);
      }
      onVoted?.();
    } catch (error: any) {
      toast.error(error.message || "Could not record your vote");
    } finally {
      setBusy(false);
    }
  };

  const size = compact ? "h-7 px-2 text-xs" : "h-8 px-2.5 text-sm";

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        disabled={busy || isOwnCase}
        onClick={() => vote("upvote")}
        aria-label="Upvote this payout case"
        title={isOwnCase ? "You cannot vote on your own case" : "Upvote"}
        className={`${size} gap-1 ${myVote === "upvote" ? "text-success" : "text-muted-foreground"}`}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
        {upvotes}
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={busy || isOwnCase}
        onClick={() => vote("flag")}
        aria-label="Flag this payout case as fake"
        title={isOwnCase ? "You cannot vote on your own case" : "Looks fake"}
        className={`${size} gap-1 ${myVote === "flag" ? "text-destructive" : "text-muted-foreground"}`}
      >
        <Flag className="h-3.5 w-3.5" />
        {flags}
      </Button>
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        message="Sign in to vote on payout cases."
      />
    </div>
  );
};

export default CaseVoteButtons;
