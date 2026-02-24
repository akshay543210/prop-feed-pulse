import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Upload, CalendarIcon, Twitter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const SubmitCase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firm_id: "",
    status: "",
    amount: "",
    notes: "",
    twitter_link: "",
  });
  const [payoutDate, setPayoutDate] = useState<Date>();
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

      const { error: insertError } = await supabase
        .from('payout_cases')
        .insert({
          firm_id: formData.firm_id,
          status: formData.status,
          amount: formData.amount ? parseFloat(formData.amount) : null,
          payout_date: payoutDate ? format(payoutDate, 'yyyy-MM-dd') : null,
          screenshot_url: screenshotUrl,
          notes: formData.notes || null,
          twitter_link: formData.twitter_link || null,
        } as any);

      if (insertError) throw insertError;

      toast({
        title: "Case submitted successfully!",
        description: "Thank you for contributing to the community",
      });

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

            <div className="flex flex-col">
              <Label>Payout Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2",
                      !payoutDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {payoutDate ? format(payoutDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={payoutDate}
                    onSelect={setPayoutDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="twitter_link">Twitter/X Link (optional)</Label>
              <div className="relative mt-2">
                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="twitter_link"
                  type="url"
                  placeholder="https://x.com/yourpost"
                  value={formData.twitter_link}
                  onChange={(e) => setFormData({ ...formData, twitter_link: e.target.value })}
                  className="pl-10"
                />
              </div>
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
