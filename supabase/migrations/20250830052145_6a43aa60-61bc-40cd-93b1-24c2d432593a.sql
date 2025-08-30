-- Insert sample categories
INSERT INTO public.categories (name, icon, description, slug, sort_order, is_active) VALUES
('Ebook & Tài liệu', 'BookOpen', 'Sách điện tử và tài liệu học tập', 'ebook-tai-lieu', 1, true),
('Khóa học Online', 'GraduationCap', 'Các khóa học trực tuyến chất lượng cao', 'khoa-hoc-online', 2, true),
('Template & Design', 'Palette', 'Mẫu thiết kế và template chuyên nghiệp', 'template-design', 3, true),
('Source Code', 'Code', 'Mã nguồn và dự án lập trình', 'source-code', 4, true),
('Audio & Music', 'Music', 'Âm thanh và nhạc nền', 'audio-music', 5, true),
('Video & Phim', 'Camera', 'Video học tập và giải trí', 'video-phim', 6, true),
('Báo cáo & Luận văn', 'FileText', 'Báo cáo nghiên cứu và luận văn mẫu', 'bao-cao-luan-van', 7, true),
('Slide & Presentation', 'Presentation', 'Slide thuyết trình chuyên nghiệp', 'slide-presentation', 8, true)
ON CONFLICT (slug) DO NOTHING;