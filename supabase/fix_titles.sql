-- ==============================================================================
-- SQL Migration: Fix Broken Vietnamese Encoding & Standardize Medical Titles
-- ==============================================================================

-- Fix common medical title abbreviations
UPDATE products
SET title = REPLACE(title, 'BSCKII', 'BS.CKII')
WHERE title LIKE '%BSCKII%';

UPDATE products
SET title = REPLACE(title, 'BSCKI', 'BS.CKI')
WHERE title LIKE '%BSCKI%';

UPDATE products
SET title = REPLACE(title, 'BSCK1', 'BS.CKI')
WHERE title LIKE '%BSCK1%';

UPDATE products
SET title = REPLACE(title, 'BSCK2', 'BS.CKII')
WHERE title LIKE '%BSCK2%';

UPDATE products
SET title = REPLACE(title, 'Bs.CK', 'BS.CK')
WHERE title LIKE '%Bs.CK%';

-- Fix specific misencoded names/words
UPDATE products
SET title = REPLACE(title, 'Châu Thò', 'Châu Thị')
WHERE title LIKE '%Châu Thò%';

UPDATE products
SET title = REPLACE(title, 'Thò Kim', 'Thị Kim')
WHERE title LIKE '%Thò Kim%';

-- Also update meta_title if present
UPDATE products
SET meta_title = REPLACE(meta_title, 'BSCKII', 'BS.CKII')
WHERE meta_title LIKE '%BSCKII%';

UPDATE products
SET meta_title = REPLACE(meta_title, 'BSCKI', 'BS.CKI')
WHERE meta_title LIKE '%BSCKI%';
