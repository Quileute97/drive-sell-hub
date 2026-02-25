/**
 * Normalize a slug string for SEO-friendly URLs.
 * - Converts to lowercase
 * - Removes Vietnamese diacritics
 * - Replaces special characters with hyphens
 * - Separates file extensions stuck to words (e.g., "documentpdf" -> "document-pdf")
 * - Removes consecutive hyphens
 * - Trims leading/trailing hyphens
 */

const FILE_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'zip', 'rar', 'exe', 'mp3', 'mp4', 'avi', 'mov',
  'jpg', 'jpeg', 'png', 'gif', 'psd', 'ai', 'eps', 'svg',
  'txt', 'csv'
];

export function normalizeSlug(input: string): string {
  if (!input) return '';

  let slug = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove Vietnamese diacritics
    .replace(/đ/g, 'd')             // Handle Vietnamese đ
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')   // Remove special characters (including .pdf etc.)
    .replace(/\s+/g, '-')           // Spaces to hyphens
    .replace(/-+/g, '-')            // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '');       // Trim leading/trailing hyphens

  // Separate file extensions stuck to words
  // e.g., "tai-lieu-on-thipdf" -> "tai-lieu-on-thi-pdf"
  FILE_EXTENSIONS.forEach(ext => {
    const regex = new RegExp(`([a-z0-9])${ext}(?=-|$)`, 'g');
    slug = slug.replace(regex, `$1-${ext}`);
  });

  // Final cleanup
  slug = slug
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug;
}

/**
 * Generate a slug from a product title.
 * Applies normalizeSlug and can optionally append a unique suffix.
 */
export function generateSlugFromTitle(title: string, appendUnique = false): string {
  const slug = normalizeSlug(title);
  if (appendUnique) {
    return `${slug}-${Date.now().toString(36)}`;
  }
  return slug;
}
