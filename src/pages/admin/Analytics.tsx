import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminAnalytics() {
  const [timeframe, setTimeframe] = useState<'7' | '30' | 'all'>('30');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    const { data: cases } = await supabase
      .from('payout_cases')
      .select('*');

    const { data: firms } = await supabase
      .from('firms')
      .select('*');

    // Process data for analytics
    const totalApprovals = cases?.filter(c => c.status === 'approved').length || 0;
    const totalDenials = cases?.filter(c => c.status === 'denied').length || 0;

    setStats({
      totalApprovals,
      totalDenials,
      topFirms: firms?.slice(0, 10) || [],
    });
  };

  const exportToCSV = () => {
    toast.success('Exporting to CSV...');
    // Implement CSV export logic
  };

  const exportToJSON = () => {
    toast.success('Exporting to JSON...');
    // Implement JSON export logic
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-bold gradient-text-primary">Analytics & Reports</h1>
            <p className="text-muted-foreground mt-2">View detailed analytics</p>
          </motion.div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={exportToJSON}>
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={timeframe === '7' ? 'default' : 'outline'}
            onClick={() => setTimeframe('7')}
          >
            Last 7 Days
          </Button>
          <Button
            variant={timeframe === '30' ? 'default' : 'outline'}
            onClick={() => setTimeframe('30')}
          >
            Last 30 Days
          </Button>
          <Button
            variant={timeframe === 'all' ? 'default' : 'outline'}
            onClick={() => setTimeframe('all')}
          >
            All Time
          </Button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-xl border border-border"
            >
              <h3 className="text-xl font-bold mb-4">Approval vs Denial</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Approvals</span>
                  <span className="text-success font-bold">{stats.totalApprovals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Denials</span>
                  <span className="text-destructive font-bold">{stats.totalDenials}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 rounded-xl border border-border"
            >
              <h3 className="text-xl font-bold mb-4">Top Performing Firms</h3>
              <div className="space-y-2">
                {stats.topFirms.slice(0, 5).map((firm: any) => (
                  <div key={firm.id} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{firm.name}</span>
                    <span className="font-bold">{firm.approvals_count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
