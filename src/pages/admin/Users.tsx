import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, Ban } from 'lucide-react';
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

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(role)
      `)
      .order('created_at', { ascending: false });

    setUsers(data || []);
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBanToggle = async (userId: string, currentBanned: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ banned: !currentBanned })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update user');
    } else {
      toast.success(currentBanned ? 'User unbanned' : 'User banned');
      fetchUsers();
      
      // Log action
      await supabase.rpc('log_audit', {
        p_action: currentBanned ? 'Unban User' : 'Ban User',
        p_target_table: 'profiles',
        p_target_id: userId,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-bold gradient-text-primary">Users Management</h1>
          <p className="text-muted-foreground mt-2">Manage all users and roles</p>
        </motion.div>

        <div className="glass-card p-6 rounded-xl border border-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <Shield className="w-3 h-3 mr-1" />
                      {user.user_roles?.[0]?.role || 'user'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.banned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="default">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBanToggle(user.id, user.banned)}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      {user.banned ? 'Unban' : 'Ban'}
                    </Button>
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
