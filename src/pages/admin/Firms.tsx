import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminFirms() {
  const [firms, setFirms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    logo_url: '',
  });

  useEffect(() => {
    fetchFirms();

    const channel = supabase
      .channel('firms-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'firms' }, () => {
        fetchFirms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFirms = async () => {
    const { data } = await supabase
      .from('firms')
      .select('*')
      .order('created_at', { ascending: false });

    setFirms(data || []);
  };

  const filteredFirms = firms.filter(firm =>
    firm.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('firms').insert([formData]);

    if (error) {
      toast.error('Failed to add firm');
    } else {
      toast.success('Firm added successfully');
      setIsDialogOpen(false);
      setFormData({ name: '', description: '', website: '', logo_url: '' });
      
      // Log action
      await supabase.rpc('log_audit', {
        p_action: 'Add Firm',
        p_target_table: 'firms',
        p_target_id: null,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this firm?')) return;

    const { error } = await supabase.from('firms').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete firm');
    } else {
      toast.success('Firm deleted successfully');
      
      // Log action
      await supabase.rpc('log_audit', {
        p_action: 'Delete Firm',
        p_target_table: 'firms',
        p_target_id: id,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-bold gradient-text-primary">Firms Management</h1>
            <p className="text-muted-foreground mt-2">Manage all prop firms</p>
          </motion.div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Firm
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Firm</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Firm Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">Add Firm</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="glass-card p-6 rounded-xl border border-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search firms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Approvals</TableHead>
                <TableHead>Denials</TableHead>
                <TableHead>Approval Rate</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFirms.map((firm) => {
                const total = firm.approvals_count + firm.denials_count;
                const rate = total > 0 ? ((firm.approvals_count / total) * 100).toFixed(1) : '0';
                
                return (
                  <TableRow key={firm.id}>
                    <TableCell>
                      {firm.logo_url && (
                        <img src={firm.logo_url} alt={firm.name} className="w-10 h-10 rounded" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{firm.name}</TableCell>
                    <TableCell className="text-success">{firm.approvals_count}</TableCell>
                    <TableCell className="text-destructive">{firm.denials_count}</TableCell>
                    <TableCell>{rate}%</TableCell>
                    <TableCell>{new Date(firm.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(firm.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
