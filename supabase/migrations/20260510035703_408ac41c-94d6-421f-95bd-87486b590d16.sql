-- 1. Add referred_by_affiliate_id to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referred_by_affiliate_id uuid;

-- 2. Add seller_referrer_affiliate_id to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS seller_referrer_affiliate_id uuid;

-- 3. Add source column to affiliate_commissions
ALTER TABLE public.affiliate_commissions
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'order';

-- 4. Drop old unique constraint logic via dedup check inside trigger function (existing checked by order_id only; need per-source uniqueness)
-- We'll handle dedup inside trigger using (order_id, source).

-- 5. Replace handle_affiliate_commission to also pay seller referrer
CREATE OR REPLACE FUNCTION public.handle_affiliate_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _commission NUMERIC;
  _seller_ref_aff UUID;
  _seller_ref_user UUID;
BEGIN
  IF NEW.status NOT IN ('paid','delivered') THEN
    RETURN NEW;
  END IF;
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  -- Buyer-side affiliate (existing behavior)
  IF NEW.affiliate_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.affiliate_commissions
    WHERE order_id = NEW.id AND source = 'order'
  ) THEN
    _commission := ROUND(NEW.total_amount * 0.05, 0);
    INSERT INTO public.affiliate_commissions (
      affiliate_id, order_id, product_id, order_amount, commission_rate, commission_amount, status, source
    ) VALUES (
      NEW.affiliate_id, NEW.id, NEW.product_id, NEW.total_amount, 5.00, _commission, 'approved', 'order'
    );
    UPDATE public.affiliates
      SET total_conversions = total_conversions + 1,
          pending_earnings = pending_earnings + _commission,
          total_earnings = total_earnings + _commission
      WHERE id = NEW.affiliate_id;
  END IF;

  -- Seller-referral affiliate
  IF NEW.seller_referrer_affiliate_id IS NOT NULL THEN
    -- Make sure referrer is not the seller themselves
    SELECT user_id INTO _seller_ref_user FROM public.affiliates WHERE id = NEW.seller_referrer_affiliate_id;
    IF _seller_ref_user IS NOT NULL
       AND _seller_ref_user <> NEW.seller_id
       AND NOT EXISTS (
         SELECT 1 FROM public.affiliate_commissions
         WHERE order_id = NEW.id AND source = 'seller_referral'
       )
    THEN
      _commission := ROUND(NEW.total_amount * 0.05, 0);
      INSERT INTO public.affiliate_commissions (
        affiliate_id, order_id, product_id, order_amount, commission_rate, commission_amount, status, source
      ) VALUES (
        NEW.seller_referrer_affiliate_id, NEW.id, NEW.product_id, NEW.total_amount, 5.00, _commission, 'approved', 'seller_referral'
      );
      UPDATE public.affiliates
        SET pending_earnings = pending_earnings + _commission,
            total_earnings = total_earnings + _commission
        WHERE id = NEW.seller_referrer_affiliate_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 6. Ensure trigger exists on orders
DROP TRIGGER IF EXISTS trg_handle_affiliate_commission ON public.orders;
CREATE TRIGGER trg_handle_affiliate_commission
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_affiliate_commission();

-- 7. Function to auto-fill seller_referrer_affiliate_id on order insert
CREATE OR REPLACE FUNCTION public.set_seller_referrer_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _ref UUID;
BEGIN
  IF NEW.seller_referrer_affiliate_id IS NULL THEN
    SELECT referred_by_affiliate_id INTO _ref
    FROM public.profiles
    WHERE user_id = NEW.seller_id;
    IF _ref IS NOT NULL THEN
      NEW.seller_referrer_affiliate_id := _ref;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_set_seller_referrer_on_order ON public.orders;
CREATE TRIGGER trg_set_seller_referrer_on_order
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_seller_referrer_on_order();

-- 8. RPC for client to set seller's referrer (only if not already set, only by self)
CREATE OR REPLACE FUNCTION public.set_seller_referrer(_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _aff_id UUID;
  _aff_user UUID;
  _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN RETURN NULL; END IF;

  SELECT id, user_id INTO _aff_id, _aff_user
  FROM public.affiliates WHERE code = _code AND status = 'active';

  IF _aff_id IS NULL OR _aff_user = _uid THEN RETURN NULL; END IF;

  UPDATE public.profiles
    SET referred_by_affiliate_id = _aff_id
    WHERE user_id = _uid AND referred_by_affiliate_id IS NULL;

  RETURN _aff_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.set_seller_referrer(text) TO authenticated;