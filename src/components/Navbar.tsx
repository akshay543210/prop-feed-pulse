import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, LogOut, Menu, User, UserCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import SubmitCaseButton from "@/components/SubmitCaseButton";
import LiveDataBadge from "@/components/LiveDataBadge";
import payoutCasesLogo from "@/assets/payout-cases-logo.png.asset.json";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const NAV = [
  { label: "Approvals", to: "/approvals" }, { label: "Denials", to: "/denials" },
  { label: "Explore Firms", to: "/firms" }, { label: "Payout Proofs", to: "/proofs" }, { label: "Stats", to: "/#statistics" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const { user, signOut } = useAuth();
  useEffect(() => { const onScroll = () => setCompact(window.scrollY > 24); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  const active = (to: string) => to.startsWith("/#") ? false : location.pathname === to;
  const handleSignOut = async () => { const { error } = await signOut(); if (error) toast.error("Failed to sign out"); else { toast.success("Signed out"); navigate("/"); } };

  return <motion.nav initial={{ y: -70 }} animate={{ y: 0 }} className={`fixed inset-x-0 top-0 z-50 border-b text-ivory transition-all duration-300 ${compact ? "border-border/70 bg-obsidian/95 py-1 backdrop-blur-xl" : "border-ivory/10 bg-obsidian py-2"}`}>
    <div className="container mx-auto flex h-16 items-center justify-between px-4">
      <Link to="/" aria-label="Payout Cases home" className="shrink-0"><img src={payoutCasesLogo.url} alt="Payout Cases" className="h-10 w-auto max-w-[145px] object-contain" /></Link>
      <div className="hidden items-center gap-6 lg:flex">
        <LiveDataBadge />
        <div className="h-5 w-px bg-ivory/15" />
        {NAV.map((item) => <Link key={item.label} to={item.to} className={`story-link py-2 text-xs font-semibold transition-colors ${active(item.to) ? "text-ivory" : "text-ivory-muted hover:text-ivory"}`}>{item.label}</Link>)}
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <SubmitCaseButton size="sm" className="bg-ivory text-obsidian hover:bg-success hover:text-success-foreground">Submit a Case</SubmitCaseButton>
        {user ? <><Button asChild variant="ghost" size="icon" className="text-ivory-muted hover:text-ivory"><Link to="/notifications"><Bell /></Link></Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-ivory-muted hover:text-ivory"><User /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => navigate("/me")}><UserCircle className="mr-2" />Profile</DropdownMenuItem><DropdownMenuItem onClick={handleSignOut}><LogOut className="mr-2" />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></> : <Button asChild variant="ghost" size="sm" className="text-ivory-muted hover:text-ivory"><Link to="/auth">Sign in</Link></Button>}
      </div>
      <Button variant="ghost" size="icon" className="text-ivory md:hidden" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <X /> : <Menu />}</Button>
    </div>
    <AnimatePresence>{open && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-t border-ivory/10 bg-obsidian px-4 pb-5 md:hidden"><div className="grid gap-1 pt-3">{NAV.map((item) => <Link key={item.label} to={item.to} onClick={() => setOpen(false)} className="border-b border-ivory/10 py-3 text-sm text-ivory-muted">{item.label}</Link>)}<SubmitCaseButton className="mt-3 w-full bg-ivory text-obsidian">Submit a Case</SubmitCaseButton><Button asChild variant="ghost" className="w-full text-ivory"><Link to={user ? "/me" : "/auth"}>{user ? "My profile" : "Sign in"}</Link></Button></div></motion.div>}</AnimatePresence>
  </motion.nav>;
};

export default Navbar;