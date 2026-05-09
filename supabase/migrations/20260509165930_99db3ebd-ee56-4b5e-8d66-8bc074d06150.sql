
-- Affiliates table: users who registered as affiliate
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active', -- active | suspended
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_conversions INTEGER NOT NULL DEFAULT 0,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  pending_earnings NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own affiliate" ON public.affiliates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users register as affiliate" ON public.affiliates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own affiliate" ON public.affiliates
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage affiliates" ON public.affiliates
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER affiliates_updated_at BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Affiliate clicks log
CREATE TABLE public.affiliate_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  product_id UUID,
  visitor_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_clicks_affiliate ON public.affiliate_clicks(affiliate_id, created_at DESC);

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log click" ON public.affiliate_clicks
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Affiliate owner views clicks" ON public.affiliate_clicks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_clicks.affiliate_id AND a.user_id = auth.uid())
  );
CREATE POLICY "Admins manage clicks" ON public.affiliate_clicks
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Affiliate commissions (per order)
CREATE TABLE public.affiliate_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  order_id UUID NOT NULL UNIQUE,
  product_id UUID,
  order_amount NUMERIC NOT NULL,
  commission_rate NUMERIC NOT NULL DEFAULT 5.00,
  commission_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | paid | cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_commissions_affiliate ON public.affiliate_commissions(affiliate_id, created_at DESC);

ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliate owner views commissions" ON public.affiliate_commissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_commissions.affiliate_id AND a.user_id = auth.uid())
  );
CREATE POLICY "Admins manage commissions" ON public.affiliate_commissions
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER affiliate_commissions_updated_at BEFORE UPDATE ON public.affiliate_commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add affiliate_id to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS affiliate_id UUID;

-- Trigger: when order becomes paid/delivered, create commission record
CREATE OR REPLACE FUNCTION public.handle_affiliate_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _commission NUMERIC;
BEGIN
  IF NEW.affiliate_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.status IN ('paid','delivered') AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Avoid duplicates
    IF EXISTS (SELECT 1 FROM public.affiliate_commissions WHERE order_id = NEW.id) THEN
      RETURN NEW;
    END IF;

    _commission := ROUND(NEW.total_amount * 0.05, 0);

    INSERT INTO public.affiliate_commissions (
      affiliate_id, order_id, product_id, order_amount, commission_rate, commission_amount, status
    ) VALUES (
      NEW.affiliate_id, NEW.id, NEW.product_id, NEW.total_amount, 5.00, _commission, 'approved'
    );

    UPDATE public.affiliates
      SET total_conversions = total_conversions + 1,
          pending_earnings = pending_earnings + _commission,
          total_earnings = total_earnings + _commission
      WHERE id = NEW.affiliate_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_handle_affiliate_commission ON public.orders;
CREATE TRIGGER trg_handle_affiliate_commission
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_affiliate_commission();

-- RPC: log click + increment counter atomically (callable by anon)
CREATE OR REPLACE FUNCTION public.log_affiliate_click(
  _code TEXT,
  _product_id UUID DEFAULT NULL,
  _visitor_id TEXT DEFAULT NULL,
  _referrer TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _aff_id UUID;
BEGIN
  SELECT id INTO _aff_id FROM public.affiliates WHERE code = _code AND status = 'active';
  IF _aff_id IS NULL THEN RETURN NULL; END IF;

  INSERT INTO public.affiliate_clicks (affiliate_id, product_id, visitor_id, referrer, user_agent)
  VALUES (_aff_id, _product_id, _visitor_id, _referrer, _user_agent);

  UPDATE public.affiliates SET total_clicks = total_clicks + 1 WHERE id = _aff_id;
  RETURN _aff_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_affiliate_click(TEXT, UUID, TEXT, TEXT, TEXT) TO anon, authenticated;

-- RPC: resolve affiliate code to id (used at checkout)
CREATE OR REPLACE FUNCTION public.resolve_affiliate_code(_code TEXT)
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.affiliates WHERE code = _code AND status = 'active' LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_affiliate_code(TEXT) TO anon, authenticated;
