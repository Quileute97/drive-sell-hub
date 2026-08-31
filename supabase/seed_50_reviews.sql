-- ==============================================================================
-- SQL Migration: Seed 50 Realistic Reviews and update product rating aggregates
-- ==============================================================================

DO $$
DECLARE
    r RECORD;
    v_buyer_id UUID;
    v_comment TEXT;
    v_rating INT;
    v_created_at TIMESTAMPTZ;
    v_comments TEXT[] := ARRAY[
        'Tài liệu rất chi tiết và trình bày rõ ràng, áp dụng được ngay vào công việc.',
        'File tải về đầy đủ, font chữ rõ nét, rất đáng tiền. Cảm ơn tác giả!',
        'Nội dung chất lượng cao, đúng như mô tả của shop. Đánh giá 5 sao!',
        'Rất hữu ích cho việc học tập và nghiên cứu, tiết kiệm được nhiều thời gian.',
        'Tải nhanh, hướng dẫn chi tiết, tài liệu cập nhật mới nhất 2026.',
        'Kiến thức thực tế, trình bày mạch lạc, rất hài lòng với chất lượng tài liệu.',
        'Shop hỗ trợ nhanh, tài liệu đúng như giới thiệu. Sẽ tiếp tục ủng hộ shop.',
        'Tài liệu chuẩn, đầy đủ bài tập và lời giải chi tiết, rất dễ hiểu.',
        'Nội dung cô đọng, dễ hiểu, phù hợp cho người đang tự học.',
        'Rất đáng tiền, tài liệu hay và hữu ích cho quá trình ôn luyện.'
    ];
    v_count INT := 0;
BEGIN
    -- Get any existing profile to use as buyer_id if possible
    SELECT id INTO v_buyer_id FROM profiles LIMIT 1;

    FOR r IN (
        SELECT p.id, p.title 
        FROM products p 
        WHERE p.status = 'active'
        AND NOT EXISTS (SELECT 1 FROM reviews rw WHERE rw.product_id = p.id)
        LIMIT 40
    ) LOOP
        -- Seed 1-2 reviews per product
        FOR i IN 1..CASE WHEN v_count % 3 = 0 THEN 2 ELSE 1 END LOOP
            v_rating := CASE WHEN random() < 0.8 THEN 5 ELSE 4 END;
            v_comment := v_comments[(v_count % array_length(v_comments, 1)) + 1];
            v_created_at := NOW() - (floor(random() * 25 + 1) || ' days')::INTERVAL;

            INSERT INTO reviews (
                id,
                product_id,
                buyer_id,
                rating,
                comment,
                is_verified_purchase,
                is_approved,
                created_at
            ) VALUES (
                gen_random_uuid(),
                r.id,
                v_buyer_id,
                v_rating,
                v_comment,
                true,
                true,
                v_created_at
            );

            v_count := v_count + 1;
        END LOOP;

        -- Update aggregate rating on product
        UPDATE products
        SET rating_average = (
            SELECT ROUND(AVG(rating)::numeric, 1)
            FROM reviews
            WHERE product_id = r.id AND is_approved = true
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE product_id = r.id AND is_approved = true
        )
        WHERE id = r.id;

        EXIT WHEN v_count >= 50;
    END LOOP;

    RAISE NOTICE 'Successfully seeded % reviews across products.', v_count;
END $$;
