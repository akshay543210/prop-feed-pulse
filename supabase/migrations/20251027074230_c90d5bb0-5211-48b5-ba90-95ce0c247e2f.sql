-- Create firms table
CREATE TABLE public.firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  approvals_count INTEGER DEFAULT 0 NOT NULL,
  denials_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create payout_cases table
CREATE TABLE public.payout_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID REFERENCES public.firms(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('approved', 'denied')),
  amount NUMERIC,
  payout_date DATE,
  screenshot_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_payout_cases_firm_id ON public.payout_cases(firm_id);
CREATE INDEX idx_payout_cases_status ON public.payout_cases(status);
CREATE INDEX idx_payout_cases_date ON public.payout_cases(payout_date);
CREATE INDEX idx_firms_name ON public.firms(name);

-- Enable Row Level Security
ALTER TABLE public.firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_cases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for firms (public read, no write for now)
CREATE POLICY "Anyone can view firms"
  ON public.firms
  FOR SELECT
  USING (true);

-- Create RLS policies for payout_cases (public read, no write for now)
CREATE POLICY "Anyone can view payout cases"
  ON public.payout_cases
  FOR SELECT
  USING (true);

-- Function to automatically update firm counts
CREATE OR REPLACE FUNCTION public.update_firm_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'approved' THEN
      UPDATE public.firms 
      SET approvals_count = approvals_count + 1 
      WHERE id = NEW.firm_id;
    ELSIF NEW.status = 'denied' THEN
      UPDATE public.firms 
      SET denials_count = denials_count + 1 
      WHERE id = NEW.firm_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status != NEW.status THEN
      -- Decrement old status count
      IF OLD.status = 'approved' THEN
        UPDATE public.firms 
        SET approvals_count = GREATEST(0, approvals_count - 1) 
        WHERE id = OLD.firm_id;
      ELSIF OLD.status = 'denied' THEN
        UPDATE public.firms 
        SET denials_count = GREATEST(0, denials_count - 1) 
        WHERE id = OLD.firm_id;
      END IF;
      -- Increment new status count
      IF NEW.status = 'approved' THEN
        UPDATE public.firms 
        SET approvals_count = approvals_count + 1 
        WHERE id = NEW.firm_id;
      ELSIF NEW.status = 'denied' THEN
        UPDATE public.firms 
        SET denials_count = denials_count + 1 
        WHERE id = NEW.firm_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement count when deleting
    IF OLD.status = 'approved' THEN
      UPDATE public.firms 
      SET approvals_count = GREATEST(0, approvals_count - 1) 
      WHERE id = OLD.firm_id;
    ELSIF OLD.status = 'denied' THEN
      UPDATE public.firms 
      SET denials_count = GREATEST(0, denials_count - 1) 
      WHERE id = OLD.firm_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for automatic count updates
CREATE TRIGGER payout_case_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payout_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_firm_counts();

-- Enable realtime for both tables
ALTER TABLE public.firms REPLICA IDENTITY FULL;
ALTER TABLE public.payout_cases REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.firms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payout_cases;

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true);

-- Storage policies for screenshots
CREATE POLICY "Anyone can view screenshots"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'screenshots');

CREATE POLICY "Anyone can upload screenshots"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'screenshots');

-- Insert some sample firms to get started
INSERT INTO public.firms (name, logo_url, description, website) VALUES
  ('FTMO', 'https://example.com/ftmo-logo.png', 'Leading prop trading firm with competitive challenges', 'https://ftmo.com'),
  ('The5ers', 'https://example.com/the5ers-logo.png', 'Professional funding program for traders', 'https://the5ers.com'),
  ('FundedNext', 'https://example.com/fundednext-logo.png', 'Fast-growing prop firm with instant funding', 'https://fundednext.com'),
  ('MyForexFunds', 'https://example.com/mff-logo.png', 'Popular prop firm with flexible rules', 'https://myforexfunds.com'),
  ('TopstepFX', 'https://example.com/topstep-logo.png', 'Established prop firm for serious traders', 'https://topstepfx.com');