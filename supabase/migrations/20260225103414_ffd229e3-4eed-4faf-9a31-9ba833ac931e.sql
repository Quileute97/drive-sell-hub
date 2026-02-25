
-- Function to normalize product slugs
CREATE OR REPLACE FUNCTION public.normalize_product_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Lowercase
  NEW.slug := lower(NEW.slug);
  
  -- Remove common file extensions stuck to words
  NEW.slug := regexp_replace(NEW.slug, '([a-z0-9])(pdf|docx?|xlsx?|pptx?|zip|rar|exe|mp[34]|avi|mov|jpe?g|png|gif|psd|svg|txt|csv)(?=-|$)', '\1-\2', 'g');
  
  -- Remove any characters that aren't alphanumeric or hyphens
  NEW.slug := regexp_replace(NEW.slug, '[^a-z0-9-]', '-', 'g');
  
  -- Collapse multiple hyphens
  NEW.slug := regexp_replace(NEW.slug, '-+', '-', 'g');
  
  -- Trim leading/trailing hyphens
  NEW.slug := trim(both '-' from NEW.slug);
  
  RETURN NEW;
END;
$function$;

-- Create trigger on products table
DROP TRIGGER IF EXISTS normalize_slug_before_save ON public.products;
CREATE TRIGGER normalize_slug_before_save
  BEFORE INSERT OR UPDATE OF slug ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_product_slug();
