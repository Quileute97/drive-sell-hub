import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Node, mergeAttributes } from '@tiptap/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  addCommands() {
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
  // Google Drive file
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
  }

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Google Drive thumbnail for images
  const driveThumbnailMatch = url.match(/drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/);
  if (driveThumbnailMatch) {
    return url; // Already a valid image URL
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
      'p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-40',
      active && 'bg-primary/10 text-primary'
    )}
  >
    {children}
  </button>
);

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Viết mô tả chi tiết sản phẩm...',
  className,
}: RichTextEditorProps) => {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaAlt, setMediaAlt] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto mx-auto',
          loading: 'lazy',
        },
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80',
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
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  const addImage = useCallback(() => {
    if (!editor || !mediaUrl.trim()) return;

    // Check if it's a Google Drive link and convert
    const driveImageUrl = toDriveImageUrl(mediaUrl);
    const finalUrl = driveImageUrl || mediaUrl;

    editor.chain().focus().setImage({
      src: finalUrl,
      alt: mediaAlt || 'Ảnh sản phẩm',
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

  if (!editor) return null;

  const iconSize = 'h-4 w-4';

  return (
    <div className={cn('border rounded-md bg-background overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30">
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

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Headings */}
        <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Đoạn văn">
          <Type className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Tiêu đề H1">
          <Heading1 className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Tiêu đề H2">
          <Heading2 className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Tiêu đề H3">
          <Heading3 className={iconSize} />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Danh sách">
          <List className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Danh sách đánh số">
          <ListOrdered className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Trích dẫn">
          <Quote className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
          <Code className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Đường kẻ ngang">
          <Minus className={iconSize} />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

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

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Media */}
        <ToolbarButton onClick={() => { setMediaUrl(''); setMediaAlt(''); setShowImageDialog(true); }} title="Chèn ảnh">
          <ImageIcon className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => { setMediaUrl(''); setShowVideoDialog(true); }} title="Chèn video">
          <Video className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => { setLinkUrl(''); setLinkText(''); setShowLinkDialog(true); }} title="Chèn link">
          <LinkIcon className={iconSize} />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Undo/Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Hoàn tác (Ctrl+Z)">
          <Undo className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Làm lại (Ctrl+Y)">
          <Redo className={iconSize} />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* SEO Tips */}
      <div className="px-4 py-2 border-t bg-muted/20 text-xs text-muted-foreground flex items-center gap-4">
        <span>💡 SEO: Sử dụng H2, H3 cho tiêu đề phụ • Thêm alt cho ảnh • Viết 300+ từ</span>
        <span className="ml-auto">
          {editor.storage.characterCount?.characters?.() || editor.getText().length} ký tự
        </span>
      </div>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chèn hình ảnh</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL hình ảnh *</Label>
              <Input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://... hoặc link Google Drive"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Hỗ trợ: URL trực tiếp, Google Drive, Imgur, và các nền tảng khác
              </p>
            </div>
            <div>
              <Label>Mô tả ảnh (alt text - tốt cho SEO)</Label>
              <Input
                value={mediaAlt}
                onChange={(e) => setMediaAlt(e.target.value)}
                placeholder="Mô tả ngắn gọn nội dung ảnh"
              />
            </div>
            {mediaUrl && (
              <div className="border rounded-lg p-2">
                <p className="text-xs text-muted-foreground mb-2">Xem trước:</p>
                <img 
                  src={toDriveImageUrl(mediaUrl) || mediaUrl} 
                  alt={mediaAlt || 'Preview'} 
                  className="max-h-40 mx-auto rounded"
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
            <DialogTitle>Chèn video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL video *</Label>
              <Input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... hoặc Google Drive video"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Hỗ trợ: YouTube, Vimeo, Google Drive video
              </p>
            </div>
            {mediaUrl && (
              <div className="border rounded-lg p-2">
                <p className="text-xs text-muted-foreground mb-2">Xem trước:</p>
                <iframe
                  src={toEmbedUrl(mediaUrl)}
                  className="w-full h-48 rounded"
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
            <DialogTitle>Chèn liên kết</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL *</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Văn bản hiển thị (tùy chọn)</Label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Nhấp vào đây"
              />
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
