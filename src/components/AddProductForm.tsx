import React, { useState } from 'react';
import { normalizeSlug, generateSlugFromTitle } from '@/lib/slugUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/RichTextEditor';
import { SEOScoreChecker } from '@/components/SEOScoreChecker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isFreeProduct } from '@/lib/productAccess';
import { notifyProductChange } from '@/lib/indexNow';
import { 
  Upload, 
  Link, 
  Tags, 
  DollarSign, 
  Search, 
  FileText,
  X,
  Plus,
  Eye,
  Globe
} from 'lucide-react';

interface AddProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddProductForm = ({ onClose, onSuccess }: AddProductFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    google_drive_link: '',
    preview_link: '',
    download_only_link: '',
    category_id: '',
    price: '',
    original_price: '',
    file_size: '',
    file_format: '',
    // SEO fields
    meta_title: '',
    meta_description: '',
    // Product specifications
    status: 'active' as 'draft' | 'active'
  });
  const [isFreeEnabled, setIsFreeEnabled] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data;
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'price') {
      setIsFreeEnabled(value !== '' && isFreeProduct(Number(value)));
    }

    // Auto-generate slug from title
    if (field === 'title') {
      const slug = generateSlugFromTitle(value);
      setFormData(prev => ({ ...prev, slug }));
    }

    // Normalize slug when manually edited
    if (field === 'slug') {
      const normalized = normalizeSlug(value);
      setFormData(prev => ({ ...prev, slug: normalized }));
    }

    // Auto-generate meta title from title if empty
    if (field === 'title' && !formData.meta_title) {
      setFormData(prev => ({ ...prev, meta_title: value }));
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addImage = () => {
    if (currentImage.trim() && !images.includes(currentImage.trim())) {
      setImages([...images, currentImage.trim()]);
      setCurrentImage('');
    }
  };

  const removeImage = (imageToRemove: string) => {
    setImages(images.filter(img => img !== imageToRemove));
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    // Validation
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }

    // Get the primary download link
    const primaryLink = formData.google_drive_link.trim() || formData.download_only_link.trim();
    
    // Require at least one download link
    if (!primaryLink) {
      toast.error('Vui lòng nhập ít nhất một link tải xuống');
      return;
    }

    // Validate URL format
    if (!isValidUrl(primaryLink)) {
      toast.error('Link tải xuống không hợp lệ. Vui lòng nhập URL đầy đủ (bắt đầu bằng https://)');
      return;
    }

    if (formData.price === '' || Number(formData.price) < 0) {
      toast.error('Vui lòng nhập giá hợp lệ');
      return;
    }

    if (!formData.category_id) {
      toast.error('Vui lòng chọn danh mục');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate unique slug with timestamp to avoid duplicates
      const baseSlug = normalizeSlug(formData.slug.trim() || formData.title.trim());
      const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

      const { error } = await supabase
        .from('products')
        .insert({
          seller_id: user.id,
          title: formData.title.trim(),
          slug: uniqueSlug,
          description: formData.description.trim(),
          short_description: formData.short_description.trim(),
          google_drive_link: formData.google_drive_link.trim() || formData.download_only_link.trim() || '',
          preview_link: formData.preview_link.trim() || null,
          download_only_link: formData.download_only_link.trim() || null,
          category_id: formData.category_id,
          price: Number(formData.price),
          original_price: formData.original_price ? Number(formData.original_price) : null,
          file_size: formData.file_size.trim() || null,
          file_format: formData.file_format.trim() || null,
          meta_title: formData.meta_title.trim() || formData.title.trim(),
          meta_description: formData.meta_description.trim() || formData.short_description.trim(),
          tags: tags.length > 0 ? tags : null,
          images: images.length > 0 ? images : null,
          status: formData.status,
          thumbnail_url: images[0] || null
        });

      if (error) throw error;

      // Notify IndexNow for faster search engine indexing
      notifyProductChange(uniqueSlug);

      toast.success('Sản phẩm đã được tạo thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Có lỗi xảy ra khi tạo sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Thêm sản phẩm mới</h2>
            <p className="text-muted-foreground">Tạo sản phẩm với link Google Drive và SEO tối ưu</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
              <TabsTrigger value="media">Hình ảnh & Link</TabsTrigger>
              <TabsTrigger value="pricing">Giá & Thông số</TabsTrigger>
              <TabsTrigger value="seo">SEO & Marketing</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Thông tin sản phẩm
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Tên sản phẩm *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Nhập tên sản phẩm"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Đường dẫn (URL)</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder="duong-dan-san-pham"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="short_description">Mô tả ngắn</Label>
                    <Textarea
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) => handleInputChange('short_description', e.target.value)}
                      placeholder="Mô tả ngắn gọn về sản phẩm (hiển thị trong danh sách)"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Mô tả chi tiết</Label>
                    <RichTextEditor
                      value={formData.description}
                      onChange={(html) => handleInputChange('description', html)}
                      placeholder="Viết mô tả chi tiết sản phẩm, tính năng, cách sử dụng... Hỗ trợ chèn ảnh, video từ Google Drive, YouTube"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Danh mục *</Label>
                    <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục sản phẩm" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media & Links */}
            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Google Drive & Media
                  </CardTitle>
                  <CardDescription>
                    Link sản phẩm sẽ được bảo mật và chỉ gửi cho khách hàng sau khi thanh toán
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg border border-dashed">
                    <Label htmlFor="google_drive_link" className="text-base font-medium">
                      Link tải sản phẩm (Google Drive, OneDrive, Dropbox...)
                    </Label>
                    <Input
                      id="google_drive_link"
                      value={formData.google_drive_link}
                      onChange={(e) => handleInputChange('google_drive_link', e.target.value)}
                      placeholder="https://drive.google.com/... hoặc link tải khác"
                      className="mt-2"
                    />
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-muted-foreground">
                        ✅ Hỗ trợ: <span className="font-medium">Google Drive, OneDrive, Dropbox, Mediafire, MEGA...</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        💡 Link sẽ mở trong tab mới sau khi khách thanh toán để họ tự tải xuống
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="preview_link">Link xem trước (tùy chọn)</Label>
                    <Input
                      id="preview_link"
                      value={formData.preview_link}
                      onChange={(e) => handleInputChange('preview_link', e.target.value)}
                      placeholder="https://... (link xem trước an toàn cho khách hàng)"
                    />
                  </div>

                  <Separator />

                  <div className="bg-primary/5 p-4 rounded-lg border border-dashed border-primary/30">
                    <Label htmlFor="download_only_link" className="text-base font-medium">
                      Link tải trực tiếp (tùy chọn - cho EXE, Video, ZIP...)
                    </Label>
                    <Input
                      id="download_only_link"
                      value={formData.download_only_link}
                      onChange={(e) => handleInputChange('download_only_link', e.target.value)}
                      placeholder="https://... (link bất kỳ)"
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Dùng khi muốn hiển thị riêng nút "Tải xuống" cho file không xem trước được
                    </p>
                  </div>
                  
                  <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/30">
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      ⚠️ <strong>Lưu ý:</strong> Bạn cần nhập ít nhất một link ở trên. Link sẽ mở trong tab mới sau khi khách thanh toán.
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <Label>Hình ảnh sản phẩm</Label>
                    <div className="flex gap-2">
                      <Input
                        value={currentImage}
                        onChange={(e) => setCurrentImage(e.target.value)}
                        placeholder="Nhập URL hình ảnh"
                      />
                      <Button type="button" variant="outline" onClick={addImage}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {images.map((image, index) => (
                          <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                            <img src={image} alt="" className="w-8 h-8 object-cover rounded" />
                            <span className="text-sm truncate max-w-32">{image}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage(image)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing & Specs */}
            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Giá & Thông số kỹ thuật
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="mb-3 flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
                        <div>
                          <Label htmlFor="free-product" className="text-sm font-medium">Tài liệu miễn phí</Label>
                          <p className="text-xs text-muted-foreground">Bật để hiển thị nút tải miễn phí cho khách</p>
                        </div>
                        <Switch
                          id="free-product"
                          checked={isFreeEnabled}
                          onCheckedChange={(checked) => {
                            setIsFreeEnabled(checked);
                            setFormData((prev) => ({
                              ...prev,
                              price: checked ? '0' : '',
                              original_price: checked ? '' : prev.original_price,
                            }));
                          }}
                        />
                      </div>
                      <Label htmlFor="price">Giá bán *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0"
                        required
                        min="0"
                        step="1000"
                        disabled={isFreeEnabled}
                      />
                      {isFreeEnabled && (
                        <p className="mt-1 text-xs text-muted-foreground">Sản phẩm này sẽ cho phép tải trực tiếp thay vì thêm vào giỏ.</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="original_price">Giá gốc (tùy chọn)</Label>
                      <Input
                        id="original_price"
                        type="number"
                        value={formData.original_price}
                        onChange={(e) => handleInputChange('original_price', e.target.value)}
                        placeholder="0"
                        min="0"
                        step="1000"
                        disabled={isFreeEnabled}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="file_size">Dung lượng file</Label>
                      <Input
                        id="file_size"
                        value={formData.file_size}
                        onChange={(e) => handleInputChange('file_size', e.target.value)}
                        placeholder="VD: 15MB, 2.5GB"
                      />
                    </div>
                    <div>
                      <Label htmlFor="file_format">Định dạng file</Label>
                      <Input
                        id="file_format"
                        value={formData.file_format}
                        onChange={(e) => handleInputChange('file_format', e.target.value)}
                        placeholder="VD: PDF, ZIP, RAR, PSD"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status">Trạng thái sản phẩm</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Công khai (hiển thị ngay)</SelectItem>
                        <SelectItem value="draft">Bản nháp (ẩn)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Chọn "Công khai" để sản phẩm hiển thị ngay trên trang chủ
                    </p>
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="Nhập tag và ấn thêm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={addTag}>
                        <Tags className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 hover:bg-transparent"
                              onClick={() => removeTag(tag)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO & Marketing */}
            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    SEO & Marketing
                  </CardTitle>
                  <CardDescription>
                    Tối ưu hóa sản phẩm cho công cụ tìm kiếm và marketing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="focus_keyword">Từ khóa chính (Focus Keyword)</Label>
                    <Input
                      id="focus_keyword"
                      value={focusKeyword}
                      onChange={(e) => setFocusKeyword(e.target.value)}
                      placeholder="Nhập từ khóa chính cho sản phẩm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Từ khóa mà bạn muốn sản phẩm xuất hiện trên Google
                    </p>
                  </div>

                  <SEOScoreChecker
                    html={formData.description}
                    title={formData.meta_title || formData.title}
                    metaDescription={formData.meta_description || formData.short_description}
                    focusKeyword={focusKeyword}
                  />

                  <Separator />

                  <div>
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => handleInputChange('meta_title', e.target.value)}
                      placeholder="Tiêu đề SEO (tối đa 60 ký tự)"
                      maxLength={60}
                    />
                    <p className="text-sm text-muted-foreground">
                      {formData.meta_title.length}/60 ký tự
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => handleInputChange('meta_description', e.target.value)}
                      placeholder="Mô tả SEO (tối đa 160 ký tự)"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-sm text-muted-foreground">
                      {formData.meta_description.length}/160 ký tự
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select value={formData.status} onValueChange={(value: 'draft' | 'active') => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Bản nháp (chỉ bạn thấy)
                          </div>
                        </SelectItem>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Công khai (hiển thị trên trang)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang tạo...' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;