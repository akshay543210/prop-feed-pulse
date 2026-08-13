import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";

interface SubmitCaseButtonProps {
  children?: ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
}

const SubmitCaseButton = ({ children, className, size, variant }: SubmitCaseButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);

  const handleClick = () => {
    if (user) {
      navigate("/submit");
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <>
      <Button onClick={handleClick} className={className} size={size} variant={variant}>
        {children || "Submit Your Case"}
      </Button>
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        message="Sign in to submit a payout case."
        onAuthenticated={() => navigate("/submit")}
      />
    </>
  );
};

export default SubmitCaseButton;
