import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Stats {
  totalFirms: number;
  totalApprovals: number;
  totalDenials: number;
  pendingCases: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalFirms: 0,
    totalApprovals: 0,
    totalDenials: 0,
    pendingCases: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();

    // Real-time subscriptions
    const firmsChannel = supabase
      .channel('admin-firms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'firms' }, () => {
        fetchStats();
      })
      .subscribe();

    const casesChannel = supabase
      .channel('admin-cases')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payout_cases' }, () => {
        fetchStats();
        fetchRecentActivity();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(firmsChannel);
      supabase.removeChannel(casesChannel);
    };
  }, []);

  const fetchStats = async () => {
    const [firmsRes, casesRes] = await Promise.all([
      supabase.from('firms').select('*', { count: 'exact' }),
      supabase.from('payout_cases').select('status', { count: 'exact' }),
    ]);

    const totalApprovals = casesRes.data?.filter(c => c.status === 'approved').length || 0;
    const totalDenials = casesRes.data?.filter(c => c.status === 'denied').length || 0;
    const pendingCases = casesRes.data?.filter(c => c.status === 'pending').length || 0;

    setStats({
      totalFirms: firmsRes.count || 0,
      totalApprovals,
      totalDenials,
      pendingCases,
    });
  };

  const fetchRecentActivity = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    setRecentActivity(data || []);
  };

  const syncData = async () => {
    toast.info('Syncing data...');
    await fetchStats();
    await fetchRecentActivity();
    toast.success('Data synced successfully');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-bold gradient-text-primary">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Overview of all activities</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Button onClick={syncData}>
              Sync Data
            </Button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Firms"
            value={stats.totalFirms}
            icon={Building2}
            colorClass="text-primary"
          />
          <StatsCard
            title="Total Approvals"
            value={stats.totalApprovals}
            icon={CheckCircle}
            colorClass="text-success"
          />
          <StatsCard
            title="Total Denials"
            value={stats.totalDenials}
            icon={XCircle}
            colorClass="text-destructive"
          />
          <StatsCard
            title="Pending Cases"
            value={stats.pendingCases}
            icon={Clock}
            colorClass="text-accent"
          />
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-xl border border-border"
        >
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.target_table && `on ${activity.target_table}`}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
