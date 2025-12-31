-- Create seller_followers table
CREATE TABLE public.seller_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, seller_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seller_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for seller_followers
CREATE POLICY "Users can follow sellers"
  ON public.seller_followers
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow sellers"
  ON public.seller_followers
  FOR DELETE
  USING (auth.uid() = follower_id);

CREATE POLICY "Anyone can view follower counts"
  ON public.seller_followers
  FOR SELECT
  USING (true);

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Create function to notify followers when new product is created
CREATE OR REPLACE FUNCTION public.notify_followers_new_product()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  seller_name TEXT;
  follower_record RECORD;
BEGIN
  -- Only notify when product becomes active
  IF NEW.status = 'active' AND (OLD IS NULL OR OLD.status != 'active') THEN
    -- Get seller name
    SELECT full_name INTO seller_name
    FROM profiles
    WHERE user_id = NEW.seller_id;
    
    -- Create notification for each follower
    FOR follower_record IN 
      SELECT follower_id FROM seller_followers WHERE seller_id = NEW.seller_id
    LOOP
      INSERT INTO notifications (user_id, type, title, message, link, metadata)
      VALUES (
        follower_record.follower_id,
        'new_product',
        'Sản phẩm mới từ ' || COALESCE(seller_name, 'người bán'),
        NEW.title,
        '/product/' || NEW.slug,
        jsonb_build_object('product_id', NEW.id, 'seller_id', NEW.seller_id, 'thumbnail', NEW.thumbnail_url)
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new product notifications
CREATE TRIGGER on_product_active
  AFTER INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION notify_followers_new_product();

-- Add indexes for performance
CREATE INDEX idx_seller_followers_seller ON seller_followers(seller_id);
CREATE INDEX idx_seller_followers_follower ON seller_followers(follower_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;