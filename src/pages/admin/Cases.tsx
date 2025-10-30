import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function AdminCases() {
  const [cases, setCases] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchCases();

    const channel = supabase
      .channel('cases-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payout_cases' }, () => {
        fetchCases();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCases = async () => {
    const { data } = await supabase
      .from('payout_cases')
      .select(`
        *,
        firms(name, logo_url)
      `)
      .order('created_at', { ascending: false });

    setCases(data || []);
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.firms?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('payout_cases')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated successfully');
      
      // Log action
      await supabase.rpc('log_audit', {
        p_action: `Update Case Status to ${newStatus}`,
        p_target_table: 'payout_cases',
        p_target_id: id,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-bold gradient-text-primary">Cases Management</h1>
          <p className="text-muted-foreground mt-2">Manage all payout cases</p>
        </motion.div>

        <div className="glass-card p-6 rounded-xl border border-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by firm name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('approved')}
              >
                Approved
              </Button>
              <Button
                variant={statusFilter === 'denied' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('denied')}
              >
                Denied
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Firm</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Screenshot</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.firms?.name}</TableCell>
                  <TableCell>${c.amount?.toLocaleString()}</TableCell>
                  <TableCell>{new Date(c.payout_date || c.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        c.status === 'approved' ? 'default' :
                        c.status === 'denied' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {c.screenshot_url && (
                      <a href={c.screenshot_url} target="_blank" rel="noopener noreferrer">
                        <img src={c.screenshot_url} alt="Screenshot" className="w-12 h-12 object-cover rounded" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {c.status !== 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(c.id, 'approved')}
                        >
                          <CheckCircle className="w-4 h-4 text-success" />
                        </Button>
                      )}
                      {c.status !== 'denied' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(c.id, 'denied')}
                        >
                          <XCircle className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
