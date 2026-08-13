import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
  onAuthenticated?: () => void;
}

const AuthDialog = ({ open, onOpenChange, message, onAuthenticated }: AuthDialogProps) => {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const finish = () => {
    setLoading(false);
    setEmail("");
    setPassword("");
    onOpenChange(false);
    onAuthenticated?.();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error("Invalid credentials");
      setLoading(false);
      return;
    }
    toast.success("Signed in");
    finish();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password);
    if (error) {
      toast.error(error.message || "Signup failed");
      setLoading(false);
      return;
    }
    toast.success("Account created");
    finish();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text-primary">Login / Sign Up</DialogTitle>
          <DialogDescription>{message || "Sign in to continue."}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="dialog-login-email">Email</Label>
                <Input id="dialog-login-email" type="email" required className="mt-2"
                  value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <Label htmlFor="dialog-login-password">Password</Label>
                <Input id="dialog-login-password" type="password" required className="mt-2"
                  value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="dialog-signup-email">Email</Label>
                <Input id="dialog-signup-email" type="email" required className="mt-2"
                  value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <Label htmlFor="dialog-signup-password">Password</Label>
                <Input id="dialog-signup-password" type="password" required minLength={6} className="mt-2"
                  value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
