-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'moderator', 'user');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT,
  banned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super_admin')
  )
$$;

-- Create trigger function for new user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Only super_admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Update firms policies for admin access
CREATE POLICY "Admins can insert firms"
  ON public.firms FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update firms"
  ON public.firms FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete firms"
  ON public.firms FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Update payout_cases policies for admin access
CREATE POLICY "Admins can view all cases"
  ON public.payout_cases FOR SELECT
  USING (public.is_admin(auth.uid()) OR true);

CREATE POLICY "Users can insert cases"
  ON public.payout_cases FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update cases"
  ON public.payout_cases FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete cases"
  ON public.payout_cases FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Add user_id column to payout_cases
ALTER TABLE public.payout_cases 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create function to log audit actions
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action TEXT,
  p_target_table TEXT,
  p_target_id UUID,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (admin_id, action, target_table, target_id, details)
  VALUES (auth.uid(), p_action, p_target_table, p_target_id, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;