-- Add download_only_link field for non-embeddable files (EXE, images, videos)
ALTER TABLE public.products
ADD COLUMN download_only_link text DEFAULT NULL;

-- Add comment explaining the field purpose
COMMENT ON COLUMN public.products.download_only_link IS 'Google Drive link for non-embeddable files (EXE, images, videos) that should be downloaded instead of previewed';