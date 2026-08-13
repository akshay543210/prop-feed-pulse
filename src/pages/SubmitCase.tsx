import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  PlusCircle, Upload, CalendarIcon, Twitter, CheckCircle, XCircle,
  ArrowRight, ArrowLeft, ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = ["Firm", "Outcome", "Proof", "Review"];

const SubmitCase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
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
    queryKey: ["firms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("firms").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const firmName = firms?.find((f) => f.id === formData.firm_id)?.name || "";
  const instantVerified = formData.twitter_link.trim().length > 0;

  const canContinue = () => {
    if (step === 0) return !!formData.firm_id;
    if (step === 1) return !!formData.status;
    return true;
  };

  const next = () => {
    if (!canContinue()) {
      toast({
        title: "Complete this step",
        description: step === 0 ? "Select the prop firm." : "Select the payout outcome.",
        variant: "destructive",
      });
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleSubmit = async () => {
    if (!formData.firm_id || !formData.status) {
      setStep(0);
      return;
    }
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Sign in to submit a payout case.",
        variant: "destructive",
      });
      navigate("/auth", { state: { from: { pathname: "/submit" } } });
      return;
    }

    setIsSubmitting(true);
    try {
      let screenshotUrl: string | null = null;
      if (screenshot) {
        const fileExt = screenshot.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("screenshots")
          .upload(fileName, screenshot);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("screenshots").getPublicUrl(fileName);
        screenshotUrl = publicUrl;
      }

      const { error: insertError } = await supabase.from("payout_cases").insert({
        user_id: user.id,
        firm_id: formData.firm_id,
        status: formData.status,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        payout_date: payoutDate ? format(payoutDate, "yyyy-MM-dd") : null,
        screenshot_url: screenshotUrl,
        notes: formData.notes || null,
        twitter_link: formData.twitter_link || null,
      } as any);
      if (insertError) throw insertError;

      toast({
        title: "Case submitted successfully!",
        description: instantVerified
          ? "Your case is verified thanks to the social proof link."
          : "Thank you for contributing to the community",
      });
      navigate(formData.status === "approved" ? "/approvals" : "/denials");
    } catch (error: any) {
      toast({ title: "Error submitting case", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Seo
        title="Submit a Payout Case | Payout Cases"
        description="Report your prop firm payout approval or denial with proof, and help traders see which firms actually pay out."
        path="/submit"
      />
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 gradient-approval-text flex items-center justify-center">
            <PlusCircle className="w-9 h-9 mr-3" />
            Submit Payout Case
          </h1>
          <p className="text-muted-foreground">Four quick steps. Proof makes your case count.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8" aria-label="Submission progress">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-colors",
                  i <= step ? "bg-primary" : "bg-secondary"
                )}
              />
              <p className={cn("text-xs mt-2", i === step ? "text-primary font-semibold" : "text-muted-foreground")}>
                {i + 1}. {label}
              </p>
            </div>
          ))}
        </div>

        <Card className="glass p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {step === 0 && (
                <div>
                  <Label htmlFor="firm">Which prop firm? *</Label>
                  <Select
                    value={formData.firm_id}
                    onValueChange={(value) => setFormData({ ...formData, firm_id: value })}
                  >
                    <SelectTrigger id="firm" className="mt-2">
                      <SelectValue placeholder="Select a firm" />
                    </SelectTrigger>
                    <SelectContent>
                      {firms?.map((firm) => (
                        <SelectItem key={firm.id} value={firm.id}>{firm.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {step === 1 && (
                <>
                  <div>
                    <Label>Payout outcome *</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button
                        type="button"
                        aria-pressed={formData.status === "approved"}
                        onClick={() => setFormData({ ...formData, status: "approved" })}
                        className={cn(
                          "rounded-xl border p-4 flex flex-col items-center gap-2 transition-colors",
                          formData.status === "approved"
                            ? "border-success bg-success/10 text-success"
                            : "border-border hover:border-success/50"
                        )}
                      >
                        <CheckCircle className="w-6 h-6" /> Approved
                      </button>
                      <button
                        type="button"
                        aria-pressed={formData.status === "denied"}
                        onClick={() => setFormData({ ...formData, status: "denied" })}
                        className={cn(
                          "rounded-xl border p-4 flex flex-col items-center gap-2 transition-colors",
                          formData.status === "denied"
                            ? "border-destructive bg-destructive/10 text-destructive"
                            : "border-border hover:border-destructive/50"
                        )}
                      >
                        <XCircle className="w-6 h-6" /> Denied
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="amount">Payout amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="5000"
                      className="mt-2"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col">
                    <Label>Payout date</Label>
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
                </>
              )}

              {step === 2 && (
                <>
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Add a public X/Twitter post link and your case is{" "}
                      <span className="text-primary font-semibold">instantly verified</span> instead of pending.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="twitter_link">Social post link (X/Twitter)</Label>
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
                    <Label htmlFor="screenshot">Screenshot proof</Label>
                    <Input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                      className="cursor-pointer mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a screenshot of your payout approval or denial
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes / additional details</Label>
                    <Textarea
                      id="notes"
                      className="mt-2"
                      placeholder="Share any additional context about your payout experience..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                    />
                  </div>
                </>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Review your case</h2>
                    <Badge variant="outline" className={instantVerified ? "text-primary border-primary/50" : ""}>
                      {instantVerified ? "Will be Verified" : "Will be Pending"}
                    </Badge>
                  </div>
                  <dl className="divide-y divide-border rounded-xl border border-border">
                    {[
                      ["Firm", firmName || "—"],
                      ["Outcome", formData.status === "approved" ? "Approved" : formData.status === "denied" ? "Denied" : "—"],
                      ["Amount", formData.amount ? `$${Number(formData.amount).toLocaleString()}` : "—"],
                      ["Payout date", payoutDate ? format(payoutDate, "PPP") : "—"],
                      ["Social proof", formData.twitter_link || "—"],
                      ["Screenshot", screenshot ? screenshot.name : "—"],
                      ["Notes", formData.notes || "—"],
                    ].map(([k, v]) => (
                      <div key={k as string} className="flex justify-between gap-4 px-4 py-3 text-sm">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="font-medium truncate max-w-[60%] text-right">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next} className="flex-1 bg-gradient-to-r from-primary to-success">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-primary to-success"
              >
                {isSubmitting ? "Submitting..." : (<><Upload className="w-4 h-4 mr-2" /> Submit Case</>)}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SubmitCase;
