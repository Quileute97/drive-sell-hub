-- Function to update product rating statistics
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update product rating statistics
  UPDATE products
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND is_approved = true
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND is_approved = true
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for INSERT
DROP TRIGGER IF EXISTS update_product_rating_on_insert ON reviews;
CREATE TRIGGER update_product_rating_on_insert
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Create trigger for UPDATE
DROP TRIGGER IF EXISTS update_product_rating_on_update ON reviews;
CREATE TRIGGER update_product_rating_on_update
  AFTER UPDATE ON reviews
  FOR EACH ROW
  WHEN (OLD.rating IS DISTINCT FROM NEW.rating OR OLD.is_approved IS DISTINCT FROM NEW.is_approved)
  EXECUTE FUNCTION update_product_rating();

-- Create trigger for DELETE
DROP TRIGGER IF EXISTS update_product_rating_on_delete ON reviews;
CREATE TRIGGER update_product_rating_on_delete
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();