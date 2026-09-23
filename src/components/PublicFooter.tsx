import { Link } from "react-router-dom";
import payoutCasesLogo from "@/assets/payout-cases-logo.png.asset.json";

const PublicFooter = () => (
  <footer className="border-t border-border bg-obsidian text-ivory">
    <div className="container mx-auto grid gap-12 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
      <div>
        <img src={payoutCasesLogo.url} alt="Payout Cases" className="h-14 w-auto object-contain" />
        <p className="mt-5 max-w-sm text-lg text-ivory-muted">Real payout data. Real trading experiences.</p>
      </div>
      <div>
        <p className="data-label mb-4">Platform</p>
        <nav className="grid gap-3 text-sm text-ivory-muted">
          <Link to="/approvals" className="hover:text-ivory">Approvals</Link><Link to="/denials" className="hover:text-ivory">Denials</Link>
          <Link to="/firms" className="hover:text-ivory">Explore Firms</Link><Link to="/proofs" className="hover:text-ivory">Payout Proofs</Link>
          <Link to="/submit" className="hover:text-ivory">Submit Case</Link>
        </nav>
      </div>
      <div>
        <p className="data-label mb-4">Trust</p>
        <div className="grid gap-3 text-sm text-ivory-muted"><span>Verification Policy</span><span>Privacy</span><span>Terms</span><span>Disclaimer</span></div>
      </div>
    </div>
    <div className="border-t border-border/70 px-4 py-5 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-ivory-muted">© 2026 Payout Cases · Financial intelligence built on evidence</div>
  </footer>
);

export default PublicFooter;