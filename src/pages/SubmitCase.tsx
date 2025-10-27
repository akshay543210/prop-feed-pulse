import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Upload } from "lucide-react";

const SubmitCase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firm_id: "",
    status: "",
    amount: "",
    payout_date: "",
    notes: "",
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const { data: firms } = useQuery({
    queryKey: ['firms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('firms')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firm_id || !formData.status) {
      toast({
        title: "Missing required fields",
        description: "Please select a firm and status",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let screenshotUrl = null;

      // Upload screenshot if provided
      if (screenshot) {
        const fileExt = screenshot.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('screenshots')
          .upload(fileName, screenshot);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('screenshots')
          .getPublicUrl(fileName);

        screenshotUrl = publicUrl;
      }

      // Insert payout case
      const { error: insertError } = await supabase
        .from('payout_cases')
        .insert({
          firm_id: formData.firm_id,
          status: formData.status,
          amount: formData.amount ? parseFloat(formData.amount) : null,
          payout_date: formData.payout_date || null,
          screenshot_url: screenshotUrl,
          notes: formData.notes || null,
        });

      if (insertError) throw insertError;

      toast({
        title: "Case submitted successfully!",
        description: "Thank you for contributing to the community",
      });

      // Redirect based on status
      navigate(formData.status === 'approved' ? '/approvals' : '/denials');
    } catch (error: any) {
      toast({
        title: "Error submitting case",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 gradient-approval-text flex items-center justify-center">
            <PlusCircle className="w-10 h-10 mr-3" />
            Submit Payout Case
          </h1>
          <p className="text-muted-foreground">
            Share your payout experience to help the trading community
          </p>
        </div>

        <Card className="glass p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="firm">Prop Firm *</Label>
              <Select
                value={formData.firm_id}
                onValueChange={(value) => setFormData({ ...formData, firm_id: value })}
              >
                <SelectTrigger id="firm">
                  <SelectValue placeholder="Select a firm" />
                </SelectTrigger>
                <SelectContent>
                  {firms?.map((firm) => (
                    <SelectItem key={firm.id} value={firm.id}>
                      {firm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Payout Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="5000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="date">Payout Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.payout_date}
                onChange={(e) => setFormData({ ...formData, payout_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="screenshot">Screenshot Proof</Label>
              <div className="mt-2">
                <Input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a screenshot of your payout approval or denial
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes / Additional Details</Label>
              <Textarea
                id="notes"
                placeholder="Share any additional context about your payout experience..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-success"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Case
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SubmitCase;
