import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PayoutCase {
  id: string;
  firm_id: string;
  status: string;
  created_at: string;
  firms: {
    name: string;
  };
}

const LiveFeed = () => {
  const [cases, setCases] = useState<PayoutCase[]>([]);
  const [displayedCases, setDisplayedCases] = useState<PayoutCase[]>([]);

  useEffect(() => {
    fetchRecentCases();

    const channel = supabase
      .channel('live-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payout_cases',
        },
        (payload) => {
          console.log('New case:', payload);
          fetchRecentCases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Animate cases one by one
    cases.forEach((c, index) => {
      setTimeout(() => {
        setDisplayedCases((prev) => {
          if (!prev.find((p) => p.id === c.id)) {
            return [...prev, c].slice(-5); // Keep only last 5
          }
          return prev;
        });
      }, index * 200);
    });
  }, [cases]);

  const fetchRecentCases = async () => {
    const { data, error } = await supabase
      .from('payout_cases')
      .select('*, firms(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching cases:', error);
      return;
    }

    setCases(data || []);
  };

  return (
    <div className="w-full space-y-3">
      <AnimatePresence mode="popLayout">
        {displayedCases.map((payoutCase) => (
          <motion.div
            key={payoutCase.id}
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`glass-card p-4 rounded-xl border-l-4 ${
              payoutCase.status === 'approved'
                ? 'border-l-success'
                : 'border-l-destructive'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {payoutCase.status === 'approved' ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
                <div>
                  <p className="font-semibold text-sm">{payoutCase.firms.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(payoutCase.created_at), 'MMM dd, HH:mm')}
                  </p>
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  payoutCase.status === 'approved'
                    ? 'bg-success/20 text-success'
                    : 'bg-destructive/20 text-destructive'
                }`}
              >
                {payoutCase.status === 'approved' ? 'Approved' : 'Denied'}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default LiveFeed;
