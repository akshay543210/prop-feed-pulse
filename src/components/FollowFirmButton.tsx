import { useEffect, useState } from "react";
import { Heart, HeartOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FollowFirmButton = ({ firmId }: { firmId: string }) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const refresh = async () => {
    if (!user) { setFollowing(false); return; }
    const { data } = await supabase
      .from("firm_follows")
      .select("id")
      .eq("firm_id", firmId)
      .eq("user_id", user.id)
      .maybeSingle();
    setFollowing(!!data);
  };

  useEffect(() => { refresh(); }, [user, firmId]);

  const toggle = async () => {
    if (!user) { setAuthOpen(true); return; }
    setBusy(true);
    try {
      if (following) {
        const { error } = await supabase
          .from("firm_follows").delete().eq("firm_id", firmId).eq("user_id", user.id);
        if (error) throw error;
        setFollowing(false);
        toast.success("Unfollowed firm");
      } else {
        const { error } = await supabase
          .from("firm_follows").insert({ firm_id: firmId, user_id: user.id });
        if (error) throw error;
        setFollowing(true);
        toast.success("Following firm");
      }
    } catch (error: any) {
      toast.error(error.message || "Could not update follow");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button variant={following ? "default" : "outline"} onClick={toggle} disabled={busy}>
        {following ? <Heart className="w-4 h-4 mr-2 fill-current" /> : <Heart className="w-4 h-4 mr-2" />}
        {following ? "Following" : "Follow"}
      </Button>
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        message="Sign in to follow this firm."
        onAuthenticated={refresh}
      />
    </>
  );
};

export default FollowFirmButton;
