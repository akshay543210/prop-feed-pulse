import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('logs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    setLogs(data || []);
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-bold gradient-text-primary">Audit Logs</h1>
            <p className="text-muted-foreground mt-2">Track all admin actions</p>
          </motion.div>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>

        <div className="glass-card p-6 rounded-xl border border-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Target ID</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell>{log.target_table || '-'}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.target_id ? log.target_id.substring(0, 8) : '-'}
                  </TableCell>
                  <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
