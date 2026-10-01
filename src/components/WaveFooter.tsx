import { motion } from 'framer-motion';
import { Twitter, Send, MessageCircle } from 'lucide-react';
import payoutCasesLogo from '@/assets/payout-cases-logo.png.asset.json';

const WaveFooter = () => {
  return (
    <footer className="relative overflow-hidden dark-band border-t border-primary/20">
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img src={payoutCasesLogo.url} alt="Payout Cases" className="h-12 w-auto object-contain brightness-0 invert mb-4" />
              <p className="text-muted-foreground text-sm">
                Premium real-time analytics for proprietary trading firm payouts.
                Track, analyze, and make informed decisions.
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/firms" className="hover:text-primary transition-colors">
                    Explore Firms
                  </a>
                </li>
                <li>
                  <a href="/approvals" className="hover:text-success transition-colors">
                    Approvals
                  </a>
                </li>
                <li>
                  <a href="/denials" className="hover:text-destructive transition-colors">
                    Denials
                  </a>
                </li>
                <li>
                  <a href="/submit" className="hover:text-primary transition-colors">
                    Submit Case
                  </a>
                </li>
              </ul>
            </motion.div>

            {/* Community */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-4">Join Our Community</h4>
              <div className="flex gap-4">
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://twitter.com"
                  aria-label="Payout Cases on Twitter/X"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-primary" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://t.me"
                  aria-label="Payout Cases on Telegram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center hover:bg-accent/20 transition-colors"
                >
                  <Send className="w-5 h-5 text-accent" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://discord.com"
                  aria-label="Payout Cases on Discord"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center hover:bg-success/20 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-success" />
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground"
          >
            <p>
              © 2024 Payout Cases. All rights reserved. Built with precision
              for traders.
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default WaveFooter;
