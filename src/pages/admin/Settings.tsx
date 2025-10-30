import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'PayoutCases',
    siteTagline: 'Track PropFirm Payouts',
    emailNotifications: true,
    darkMode: true,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-bold gradient-text-primary">Settings</h1>
          <p className="text-muted-foreground mt-2">Configure site settings</p>
        </motion.div>

        <div className="glass-card p-6 rounded-xl border border-border space-y-6">
          <div>
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="siteTagline">Site Tagline</Label>
            <Input
              id="siteTagline"
              value={settings.siteTagline}
              onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
              className="mt-2"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive email updates for case approvals</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="darkMode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Enable dark theme</p>
            </div>
            <Switch
              id="darkMode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
