-- Create bank accounts table for storing seller banking information
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  branch TEXT,
  is_primary BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, account_number)
);

-- Create withdrawal requests table
CREATE TYPE withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'rejected');

CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  fee NUMERIC DEFAULT 0,
  net_amount NUMERIC NOT NULL,
  status withdrawal_status DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bank_accounts
CREATE POLICY "Users can view their own bank accounts"
ON public.bank_accounts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bank accounts"
ON public.bank_accounts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts"
ON public.bank_accounts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank accounts"
ON public.bank_accounts
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bank accounts"
ON public.bank_accounts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- RLS Policies for withdrawal_requests
CREATE POLICY "Users can view their own withdrawal requests"
ON public.withdrawal_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawal requests"
ON public.withdrawal_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all withdrawal requests"
ON public.withdrawal_requests
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_bank_accounts_updated_at
BEFORE UPDATE ON public.bank_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawal_requests_updated_at
BEFORE UPDATE ON public.withdrawal_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_bank_accounts_user_id ON public.bank_accounts(user_id);
CREATE INDEX idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON public.withdrawal_requests(status);