import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Upload, X } from "lucide-react";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  fullName: string | null;
  onAvatarUpdate: (newUrl: string) => void;
}

export function AvatarUpload({ userId, currentAvatarUrl, fullName, onAvatarUpdate }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Lỗi",
        description: "Chỉ hỗ trợ file ảnh JPG, PNG, WebP hoặc GIF",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Delete old avatar if exists
      await supabase.storage
        .from('avatars')
        .remove([filePath]);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add timestamp to bust cache
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      onAvatarUpdate(avatarUrl);
      setPreviewUrl(null);

      toast({
        title: "Thành công",
        description: "Đã cập nhật ảnh đại diện",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải lên ảnh đại diện",
        variant: "destructive",
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setUploading(true);

      // Update profile to remove avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Try to delete from storage (ignore errors if file doesn't exist)
      await supabase.storage
        .from('avatars')
        .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.webp`, `${userId}/avatar.gif`]);

      onAvatarUpdate('');
      setPreviewUrl(null);

      toast({
        title: "Thành công",
        description: "Đã xóa ảnh đại diện",
      });
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa ảnh đại diện",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-24 w-24 ring-2 ring-primary/20">
          <AvatarImage 
            src={displayUrl || undefined} 
            alt={`Avatar của ${fullName || 'Người dùng'}`}
          />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>
        
        {/* Upload overlay */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        id="avatar-upload"
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
        </Button>
        
        {currentAvatarUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={uploading}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Xóa
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG, WebP hoặc GIF. Tối đa 5MB.
      </p>
    </div>
  );
}
