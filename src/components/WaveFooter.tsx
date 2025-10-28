import { motion } from 'framer-motion';
import { Twitter, Send, MessageCircle } from 'lucide-react';

const WaveFooter = () => {
  return (
    <footer className="relative mt-32 overflow-hidden">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 z-0">
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 1440 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            fill="url(#wave-gradient)"
            d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,112C960,117,1056,107,1152,101.3C1248,96,1344,96,1392,96L1440,96L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z"
          />
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(195 100% 50% / 0.2)" />
              <stop offset="50%" stopColor="hsl(180 100% 45% / 0.3)" />
              <stop offset="100%" stopColor="hsl(195 100% 50% / 0.2)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 glass-strong">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold gradient-text-primary mb-4">
                PropFirm Tracker
              </h3>
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
              © 2024 PropFirm Tracker. All rights reserved. Built with precision
              for traders.
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default WaveFooter;
