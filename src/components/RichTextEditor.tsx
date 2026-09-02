import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Node, mergeAttributes } from '@tiptap/react';
import { useCallback, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  ImageIcon,
  Video,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Minus,
  Type,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  X,
  Code2,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractHeadings } from '@/components/TableOfContents';

// Custom Iframe extension for embedding videos
const Iframe = Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: '100%' },
      height: { default: '400' },
      frameborder: { default: '0' },
      allowfullscreen: { default: true },
      title: { default: 'Embedded video' },
    };
  },

  parseHTML() {
    return [{ tag: 'iframe' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'iframe-wrapper' }, ['iframe', mergeAttributes(HTMLAttributes)]];
  },

  addCommands(): any {
    return {
      setIframe: (options: { src: string }) => ({ commands }: any) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});

// Convert Google Drive link to embeddable URL
function toEmbedUrl(url: string): string {
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
  }

  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  const driveThumbnailMatch = url.match(/drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/);
  if (driveThumbnailMatch) {
    return url;
  }

  return url;
}

// Convert Google Drive link to direct image URL
function toDriveImageUrl(url: string): string | null {
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch) {
    return `https://drive.google.com/thumbnail?id=${driveFileMatch[1]}&sz=w800`;
  }
  
  const driveOpenMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (driveOpenMatch) {
    return `https://drive.google.com/thumbnail?id=${driveOpenMatch[1]}&sz=w800`;
  }

  return null;
}

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton = ({ onClick, active, disabled, title, children }: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      'p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center',
      active && 'bg-primary/15 text-primary font-medium shadow-2xs'
    )}
  >
    {children}
  </button>
);

// SEO Outline Templates
const SEO_TEMPLATES = [
  {
    id: 'course_document',
    title: 'Khóa học / Tài liệu học tập / Ebook',
    icon: GraduationCap,
    description: 'Cấu trúc hoàn chỉnh gồm giới thiệu, mục lục module chi tiết, lợi ích và FAQ',
    content: `<h2>1. Giới thiệu tổng quan & Giá trị sản phẩm</h2>
<p>Mô tả ngắn gọn về sản phẩm này giải quyết vấn đề gì cho người học/người mua, tại sao họ nên sở hữu ngay bây giờ.</p>

<h2>2. Nội dung chi tiết bạn sẽ nhận được</h2>
<p>Bộ tài liệu/khóa học này được biên soạn bài bản và phân chia thành các phần rõ ràng:</p>
<h3>Module 1: Kiến thức nền tảng & Khởi động</h3>
<ul>
  <li>Bài học 1.1: Giới thiệu & Cài đặt môi trường cần thiết</li>
  <li>Bài học 1.2: Các nguyên lý cốt lõi cần nắm vững</li>
</ul>
<h3>Module 2: Thực chiến & Kỹ thuật chuyên sâu</h3>
<ul>
  <li>Bài học 2.1: Quy trình từng bước triển khai thực tế</li>
  <li>Bài học 2.2: Case study thành công và các lỗi thường gặp</li>
</ul>
<h3>Module 3: Tài nguyên & File đính kèm</h3>
<ul>
  <li>Source code mẫu, tài liệu PDF tóm tắt, Template thiết kế</li>
</ul>

<h2>3. Lợi ích & Ưu điểm vượt trội</h2>
<ul>
  <li>Tiết kiệm hơn 80% thời gian tự mày mò và tìm kiếm.</li>
  <li>Nội dung thực tế, áp dụng được ngay vào công việc và dự án.</li>
  <li>Cập nhật trọn đời miễn phí khi có phiên bản mới.</li>
</ul>

<h2>4. Hướng dẫn tải về & Sử dụng</h2>
<ol>
  <li>Sau khi thanh toán thành công, nhấn vào nút <strong>"Tải xuống"</strong> để nhận link Google Drive tốc độ cao.</li>
  <li>Tải toàn bộ thư mục hoặc lưu về Google Drive của bạn để xem mọi lúc mọi nơi.</li>
</ol>

<h2>5. Cam kết & Hỗ trợ kỹ thuật</h2>
<p>Cam kết file đầy đủ 100%, hỗ trợ giải đáp thắc mắc trong quá trình học và sử dụng qua Zalo/Email.</p>

<h2>6. Câu hỏi thường gặp (FAQ)</h2>
<p><strong>Hỏi:</strong> Tôi có thể xem trên điện thoại hay iPad không?</p>
<p><strong>Đáp:</strong> Hoàn toàn được, bạn có thể xem trực tuyến hoặc tải về mọi thiết bị.</p>`,
  },
  {
    id: 'source_code_software',
    title: 'Source Code / Website / Phần mềm',
    icon: Code2,
    description: 'Cấu trúc chuyên biệt cho lập trình viên, tech specs, hướng dẫn cài đặt & deploy',
    content: `<h2>1. Giới thiệu Project & Tính năng chính</h2>
<p>Mô tả tổng quan về hệ thống/source code, các tính năng nổi bật đã được tối ưu hóa và hoàn thiện sẵn sàng sử dụng.</p>
<ul>
  <li>Tính năng xác thực người dùng, phân quyền bảo mật.</li>
  <li>Giao diện Responsive chuẩn UI/UX trên Mobile và Desktop.</li>
  <li>Tích hợp cổng thanh toán tự động và gửi thông báo.</li>
</ul>

<h2>2. Công nghệ sử dụng (Tech Stack)</h2>
<h3>Frontend & Giao diện</h3>
<ul>
  <li>React / Next.js / Vue.js, Tailwind CSS, TypeScript</li>
</ul>
<h3>Backend & Cơ sở dữ liệu</h3>
<ul>
  <li>Node.js / Python / PHP, PostgreSQL / Supabase / MongoDB</li>
</ul>

<h2>3. Bạn sẽ nhận được gì trong gói tải về?</h2>
<ul>
  <li>Full mã nguồn sạch (Clean Code), có chú thích rõ ràng.</li>
  <li>File cơ sở dữ liệu (Database Schema & Seed Data).</li>
  <li>File hướng dẫn cài đặt từng bước (.md hoặc .pdf).</li>
</ul>

<h2>4. Hướng dẫn cài đặt & Deploy</h2>
<ol>
  <li>Clone hoặc giải nén thư mục mã nguồn.</li>
  <li>Chạy lệnh cài đặt thư viện phụ thuộc: <code>npm install</code></li>
  <li>Cấu hình file môi trường <code>.env</code> theo hướng dẫn mẫu.</li>
  <li>Chạy lệnh khởi động: <code>npm run dev</code></li>
</ol>

<h2>5. Chính sách bảo hành & Hỗ trợ</h2>
<p>Hỗ trợ fix lỗi cài đặt ban đầu, tư vấn tích hợp thêm tính năng theo yêu cầu.</p>`,
  },
  {
    id: 'graphics_digital_assets',
    title: 'Đồ họa / Video Template / Asset Pack',
    icon: Layers,
    description: 'Cấu trúc mô tả tài nguyên đồ họa, font chữ, mockup, preset, video effects',
    content: `<h2>1. Tổng quan bộ tài nguyên</h2>
<p>Bộ tài nguyên thiết kế chất lượng cao với độ phân giải sắc nét, tối ưu cho Designer, Editor và Content Creator.</p>

<h2>2. Thông số & Định dạng chi tiết</h2>
<ul>
  <li>Định dạng file: PSD, AI, EPS, Canva Link, Premiere Mogrt, After Effects</li>
  <li>Độ phân giải: 4K / Full HD, 300 DPI chuẩn in ấn và hiển thị số</li>
  <li>Dễ dàng tùy biến màu sắc, text, layer được sắp xếp khoa học</li>
</ul>

<h2>3. Bản quyền sử dụng</h2>
<p>Sử dụng không giới hạn cho các dự án cá nhân và thương mại của khách hàng.</p>

<h2>4. Hướng dẫn tải & Giải nén</h2>
<p>Link tải trực tiếp từ Google Drive tốc độ cao, hỗ trợ tải từng file hoặc trọn bộ định dạng ZIP.</p>`,
  },
];

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Viết mô tả chi tiết sản phẩm chuẩn SEO...',
  className,
}: RichTextEditorProps) => {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showTocSidebar, setShowTocSidebar] = useState(false);

  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaAlt, setMediaAlt] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto mx-auto shadow-sm',
          loading: 'lazy',
        },
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2 hover:text-primary/80',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Iframe,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-sm sm:prose-base max-w-none focus:outline-hidden min-h-[220px] p-4 text-foreground',
      },
    },
  });

  const addImage = useCallback(() => {
    if (!editor || !mediaUrl.trim()) return;

    const driveImageUrl = toDriveImageUrl(mediaUrl);
    const finalUrl = driveImageUrl || mediaUrl;

    editor.chain().focus().setImage({
      src: finalUrl,
      alt: mediaAlt.trim() || 'Hình ảnh chi tiết sản phẩm',
    }).run();

    setMediaUrl('');
    setMediaAlt('');
    setShowImageDialog(false);
  }, [editor, mediaUrl, mediaAlt]);

  const addVideo = useCallback(() => {
    if (!editor || !mediaUrl.trim()) return;

    const embedUrl = toEmbedUrl(mediaUrl);
    (editor.chain().focus() as any).setIframe({ src: embedUrl }).run();

    setMediaUrl('');
    setShowVideoDialog(false);
  }, [editor, mediaUrl]);

  const addLink = useCallback(() => {
    if (!editor || !linkUrl.trim()) return;

    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;

    if (linkText) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}" rel="noopener noreferrer">${linkText}</a>`)
        .run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }

    setLinkUrl('');
    setLinkText('');
    setShowLinkDialog(false);
  }, [editor, linkUrl, linkText]);

  const applyTemplate = (templateContent: string) => {
    if (!editor) return;
    editor.chain().focus().setContent(templateContent).run();
    setShowTemplateDialog(false);
  };

  // SEO & Heading Statistics
  const currentHtml = editor ? editor.getHTML() : value || '';
  const currentText = editor ? editor.getText() : '';

  const headings = useMemo(() => {
    return extractHeadings(currentHtml);
  }, [currentHtml]);

  const stats = useMemo(() => {
    const text = currentText.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;

    const h1Count = headings.filter((h) => h.level === 1).length;
    const h2Count = headings.filter((h) => h.level === 2).length;
    const h3Count = headings.filter((h) => h.level === 3).length;
    const h4Count = headings.filter((h) => h.level === 4).length;

    // Parse images and links
    let imgCount = 0;
    let imgWithAlt = 0;
    let linkCount = 0;

    if (typeof window !== 'undefined' && currentHtml) {
      try {
        const doc = new DOMParser().parseFromString(currentHtml, 'text/html');
        const imgs = doc.querySelectorAll('img');
        imgCount = imgs.length;
        imgs.forEach((img) => {
          if (img.alt && img.alt.trim().length > 0) imgWithAlt++;
        });
        linkCount = doc.querySelectorAll('a[href]').length;
      } catch {
        // ignore
      }
    }

    return {
      words,
      chars,
      h1Count,
      h2Count,
      h3Count,
      h4Count,
      imgCount,
      imgWithAlt,
      linkCount,
    };
  }, [currentHtml, currentText, headings]);

  // Current selected heading / block format
  const currentFormat = useMemo(() => {
    if (!editor) return 'paragraph';
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    if (editor.isActive('heading', { level: 4 })) return 'h4';
    return 'paragraph';
  }, [editor, editor?.state.selection]);

  const handleFormatChange = (val: string) => {
    if (!editor) return;
    if (val === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else if (val === 'h1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (val === 'h2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (val === 'h3') {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    } else if (val === 'h4') {
      editor.chain().focus().toggleHeading({ level: 4 }).run();
    }
  };

  const jumpToHeadingInEditor = (itemText: string) => {
    if (!editor) return;
    // Find heading text in document and scroll
    const editorDom = document.querySelector('.tiptap');
    if (editorDom) {
      const headingElements = editorDom.querySelectorAll('h1, h2, h3, h4');
      for (const el of Array.from(headingElements)) {
        if (el.textContent?.includes(itemText)) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (el as HTMLElement).style.outline = '2px solid hsl(var(--primary))';
          setTimeout(() => {
            (el as HTMLElement).style.outline = 'none';
          }, 1500);
          break;
        }
      }
    }
  };

  if (!editor) return null;

  const iconSize = 'h-4 w-4';

  return (
    <div className={cn('border rounded-xl bg-background overflow-hidden shadow-2xs transition-all', className)}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 border-b bg-muted/25">
        <div className="flex flex-wrap items-center gap-1">
          {/* Heading / Paragraph Selector Dropdown */}
          <div className="w-[140px] sm:w-[160px]">
            <Select value={currentFormat} onValueChange={handleFormatChange}>
              <SelectTrigger className="h-8 text-xs font-medium bg-background">
                <SelectValue placeholder="Định dạng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paragraph">
                  <div className="flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Đoạn văn (P)</span>
                  </div>
                </SelectItem>
                <SelectItem value="h1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-xs px-1 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">H1</span>
                    <span>Tiêu đề H1 (Lớn)</span>
                  </div>
                </SelectItem>
                <SelectItem value="h2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-xs px-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">H2</span>
                    <span>Tiêu đề H2 (SEO ⭐)</span>
                  </div>
                </SelectItem>
                <SelectItem value="h3">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <span className="text-xs px-1 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">H3</span>
                    <span>Tiêu đề H3 (SEO ⭐)</span>
                  </div>
                </SelectItem>
                <SelectItem value="h4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs px-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">H4</span>
                    <span>Tiêu đề H4</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator orientation="vertical" className="h-5 mx-0.5" />

          {/* Quick Heading Buttons */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Tiêu đề H1 (Ctrl+Alt+1)"
          >
            <div className="flex items-center gap-0.5 text-xs font-bold px-0.5">
              <Heading1 className={iconSize} />
            </div>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Tiêu đề H2 - Mục chính chuẩn SEO (Ctrl+Alt+2)"
          >
            <div className="flex items-center gap-0.5 text-xs font-bold px-0.5">
              <Heading2 className={iconSize} />
            </div>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Tiêu đề H3 - Mục con chuẩn SEO (Ctrl+Alt+3)"
          >
            <div className="flex items-center gap-0.5 text-xs font-bold px-0.5">
              <Heading3 className={iconSize} />
            </div>
          </ToolbarButton>

          <Separator orientation="vertical" className="h-5 mx-0.5" />

          {/* Text formatting */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="In đậm (Ctrl+B)">
            <Bold className={iconSize} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="In nghiêng (Ctrl+I)">
            <Italic className={iconSize} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Gạch chân (Ctrl+U)">
            <UnderlineIcon className={iconSize} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Gạch ngang">
            <Strikethrough className={iconSize} />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-5 mx-0.5" />

          {/* Lists */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Danh sách chấm tròn">
            <List className={iconSize} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Danh sách đánh số">
            <ListOrdered className={iconSize} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Hộp trích dẫn / Điểm nhấn">
            <Quote className={iconSize} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Khối Code">
            <Code className={iconSize} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Đường kẻ phân cách">
            <Minus className={iconSize} />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-5 mx-0.5" />

          {/* Alignment */}
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Căn trái">
            <AlignLeft className={iconSize} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Căn giữa">
            <AlignCenter className={iconSize} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Căn phải">
            <AlignRight className={iconSize} />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-5 mx-0.5" />

          {/* Media */}
          <ToolbarButton onClick={() => { setMediaUrl(''); setMediaAlt(''); setShowImageDialog(true); }} title="Chèn hình ảnh (tối ưu SEO)">
            <ImageIcon className={iconSize} />
          </ToolbarButton>
          <ToolbarButton onClick={() => { setMediaUrl(''); setShowVideoDialog(true); }} title="Chèn video (YouTube, Drive)">
            <Video className={iconSize} />
          </ToolbarButton>
          <ToolbarButton onClick={() => { setLinkUrl(''); setLinkText(''); setShowLinkDialog(true); }} title="Chèn liên kết">
            <LinkIcon className={iconSize} />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-5 mx-0.5" />

          {/* Undo/Redo */}
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Hoàn tác (Ctrl+Z)">
            <Undo className={iconSize} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Làm lại (Ctrl+Y)">
            <Redo className={iconSize} />
          </ToolbarButton>
        </div>

        {/* Right side helper actions */}
        <div className="flex items-center gap-1.5 ml-auto pt-1 sm:pt-0">
          {/* 1-Click SEO Outline Template */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTemplateDialog(true)}
            className="h-8 text-xs font-medium text-primary border-primary/30 hover:bg-primary/10 gap-1.5"
            title="Chèn khung sườn bài viết mẫu chuẩn SEO"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Mẫu sườn SEO</span>
          </Button>

          {/* Live Table of Contents Toggle */}
          <Button
            type="button"
            variant={showTocSidebar ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowTocSidebar(!showTocSidebar)}
            className={cn(
              'h-8 text-xs font-medium gap-1.5 transition-all',
              showTocSidebar ? 'bg-primary text-primary-foreground' : 'text-foreground'
            )}
            title="Xem Mục lục và cấu trúc Heading bài viết"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Mục lục</span>
            <span className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px]",
              showTocSidebar ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {headings.length}
            </span>
          </Button>
        </div>
      </div>

      {/* Editor Body with Live TOC side panel */}
      <div className="flex flex-col lg:flex-row relative min-h-[250px]">
        {/* Main Editor Text Area */}
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>

        {/* Live Table of Contents Panel */}
        {showTocSidebar && (
          <aside className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l bg-card/60 p-4 shrink-0 transition-all">
            <div className="flex items-center justify-between pb-2 mb-3 border-b">
              <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Mục lục bài viết ({headings.length})</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTocSidebar(false)}
                className="h-6 w-6 p-0 text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Structure status check */}
            <div className="mb-3 p-2.5 rounded-lg bg-muted/40 border text-xs space-y-1.5">
              <div className="font-semibold text-foreground flex items-center justify-between">
                <span>Cấu trúc Heading:</span>
                {stats.h2Count >= 2 ? (
                  <Badge variant="default" className="text-[10px] h-5 bg-green-600 hover:bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Đạt chuẩn SEO
                  </Badge>
                ) : stats.h2Count === 1 ? (
                  <Badge variant="secondary" className="text-[10px] h-5 text-amber-600 bg-amber-100">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Nên thêm H2
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-[10px] h-5">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Thiếu thẻ H2
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-[11px] leading-tight">
                {stats.h2Count === 0
                  ? '⚠️ Bạn chưa có thẻ H2 nào. Hãy bôi đen tiêu đề mục lớn và chọn "H2" để Google dễ lập chỉ mục.'
                  : `Đang có ${stats.h2Count} thẻ H2 và ${stats.h3Count} thẻ H3.`}
              </p>
            </div>

            {/* List of Headings */}
            {headings.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                <p>Chưa phát hiện tiêu đề nào.</p>
                <p className="mt-1 text-[11px]">Chọn một đoạn văn và bấm <strong>H2</strong> hoặc <strong>H3</strong> trên thanh công cụ để tạo mục lục.</p>
              </div>
            ) : (
              <ol className="space-y-1.5 max-h-[300px] overflow-y-auto text-xs pr-1">
                {headings.map((item, idx) => {
                  const depth = Math.max(0, item.level - 1);
                  return (
                    <li
                      key={`${item.id}-${idx}`}
                      style={{ paddingLeft: `${depth * 12}px` }}
                    >
                      <button
                        type="button"
                        onClick={() => jumpToHeadingInEditor(item.text)}
                        className="flex items-start gap-1.5 w-full text-left py-1 px-1.5 rounded hover:bg-muted text-foreground/90 transition-colors group cursor-pointer"
                        title="Nhấp để chuyển đến vị trí tiêu đề này trong trình soạn thảo"
                      >
                        <span className={cn(
                          "text-[10px] px-1 py-0.2 rounded font-mono shrink-0",
                          item.level === 1 && "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold",
                          item.level === 2 && "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold",
                          item.level === 3 && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                          item.level >= 4 && "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        )}>
                          H{item.level}
                        </span>
                        <span className="line-clamp-1 group-hover:text-primary transition-colors text-[11px] sm:text-xs">
                          {item.text}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="mt-4 pt-3 border-t text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Tự động hiển thị cho người mua</span>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
          </aside>
        )}
      </div>

      {/* SEO Metrics & Statistics Bar */}
      <div className="px-4 py-2.5 border-t bg-muted/20 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Word Count */}
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "font-semibold",
              stats.words >= 300 ? "text-green-600" : stats.words >= 150 ? "text-amber-600" : "text-muted-foreground"
            )}>
              {stats.words} từ
            </span>
            <span className="text-muted-foreground/50">({stats.chars} ký tự)</span>
            {stats.words >= 300 && (
              <Badge variant="outline" className="text-[10px] py-0 text-green-700 border-green-300 bg-green-50 dark:bg-green-950/40">
                Chuẩn độ dài
              </Badge>
            )}
          </div>

          <Separator orientation="vertical" className="h-4 hidden sm:block" />

          {/* Heading breakdown */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Headings:</span>
            <span className={cn("px-1.5 py-0.2 rounded text-[11px]", stats.h2Count > 0 ? "bg-blue-100 text-blue-700 font-semibold dark:bg-blue-950 dark:text-blue-300" : "bg-muted text-muted-foreground")}>
              H2: {stats.h2Count}
            </span>
            <span className={cn("px-1.5 py-0.2 rounded text-[11px]", stats.h3Count > 0 ? "bg-emerald-100 text-emerald-700 font-semibold dark:bg-emerald-950 dark:text-emerald-300" : "bg-muted text-muted-foreground")}>
              H3: {stats.h3Count}
            </span>
          </div>

          <Separator orientation="vertical" className="h-4 hidden sm:block" />

          {/* Media & Link stats */}
          <div className="flex items-center gap-2 text-[11px]">
            <span>📷 {stats.imgCount} ảnh {stats.imgCount > 0 && `(${stats.imgWithAlt}/${stats.imgCount} có Alt)`}</span>
            <span>🔗 {stats.linkCount} link</span>
          </div>
        </div>

        {/* SEO Tip */}
        <div className="hidden md:flex items-center gap-1 text-[11px] text-muted-foreground/80">
          <span>💡 Mẹo: H2 nên chứa từ khóa chính, các đoạn văn nên dưới 150 từ</span>
        </div>
      </div>

      {/* 1-Click SEO Outline Templates Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Chèn khung sườn bài viết chuẩn SEO mẫu
            </DialogTitle>
            <DialogDescription>
              Chọn một mẫu dàn bài phù hợp với thể loại sản phẩm của bạn để tự động tạo cấu trúc Heading chuẩn Google.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {SEO_TEMPLATES.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <div
                  key={tpl.id}
                  className="border rounded-xl p-4 hover:border-primary/60 hover:bg-muted/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{tpl.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{tpl.description}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => applyTemplate(tpl.content)}
                    className="shrink-0"
                  >
                    Áp dụng mẫu này
                  </Button>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog with SEO Alt Text Helper */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Chèn hình ảnh vào bài viết
            </DialogTitle>
            <DialogDescription>
              Hình ảnh có Alt text rõ ràng giúp sản phẩm xuất hiện trên Google Image Search.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL hình ảnh *</Label>
              <Input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://... hoặc link Google Drive, Imgur"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Hỗ trợ: Link trực tiếp, Google Drive ảnh, Imgur, v.v.
              </p>
            </div>
            <div>
              <Label className="flex items-center justify-between">
                <span>Văn bản mô tả ảnh (Alt Text)</span>
                <span className="text-[11px] text-primary font-medium">Khuyên dùng cho SEO ⭐</span>
              </Label>
              <Input
                value={mediaAlt}
                onChange={(e) => setMediaAlt(e.target.value)}
                placeholder="VD: Giao diện dashboard quản lý khóa học Salemylink"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mô tả ngắn gọn nội dung của ảnh kèm từ khóa chính nếu có.
              </p>
            </div>
            {mediaUrl && (
              <div className="border rounded-lg p-2 bg-muted/20">
                <p className="text-xs text-muted-foreground mb-2">Xem trước:</p>
                <img 
                  src={toDriveImageUrl(mediaUrl) || mediaUrl} 
                  alt={mediaAlt || 'Preview'} 
                  className="max-h-40 mx-auto rounded-md shadow-xs"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>Hủy</Button>
            <Button onClick={addImage} disabled={!mediaUrl.trim()}>Chèn ảnh</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Chèn video vào bài viết
            </DialogTitle>
            <DialogDescription>
              Nhúng video giới thiệu sản phẩm từ YouTube, Vimeo hoặc Google Drive.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL video *</Label>
              <Input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... hoặc link Google Drive video"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Hỗ trợ: YouTube, Vimeo, Google Drive video
              </p>
            </div>
            {mediaUrl && (
              <div className="border rounded-lg p-2 bg-muted/20">
                <p className="text-xs text-muted-foreground mb-2">Xem trước:</p>
                <iframe
                  src={toEmbedUrl(mediaUrl)}
                  className="w-full h-48 rounded-md"
                  frameBorder="0"
                  allowFullScreen
                  title="Video preview"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVideoDialog(false)}>Hủy</Button>
            <Button onClick={addVideo} disabled={!mediaUrl.trim()}>Chèn video</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              Chèn liên kết (Link)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL đích *</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Văn bản hiển thị (Anchor text)</Label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="VD: Xem tài liệu chi tiết tại đây"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Anchor text có ý nghĩa giúp tăng trải nghiệm người dùng và SEO.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Hủy</Button>
            <Button onClick={addLink} disabled={!linkUrl.trim()}>Chèn link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

