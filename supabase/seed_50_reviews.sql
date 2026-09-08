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
    v_buyer_ids UUID[];
    v_comments TEXT[] := ARRAY[
        'Tài liệu chất lượng, đúng mô tả',
        'Rất hài lòng, sẽ quay lại mua tiếp',
        'Giao hàng nhanh, file đầy đủ',
        'Nội dung hay, đáng giá tiền',
        'Seller uy tín, hỗ trợ nhiệt tình',
        'Tài liệu đẹp, in màu rõ nét',
        'Đúng yêu cầu, không thất vọng',
        'File đầy đủ, giao hàng nhanh',
        'Chất lượng tốt, đáng đồng tiền bát gạo',
        'Sẽ giới thiệu cho bạn bè'
    ];
    v_count INT := 0;
BEGIN
    -- Collect buyer / profile IDs
    SELECT ARRAY_AGG(id) INTO v_buyer_ids FROM (
        SELECT id FROM profiles LIMIT 50
    ) sub;

    IF v_buyer_ids IS NULL OR array_length(v_buyer_ids, 1) = 0 THEN
        v_buyer_ids := ARRAY['00000000-0000-0000-0000-000000000000'::UUID];
    END IF;

    -- Iterate over 50 products with price > 0
    FOR r IN (
        SELECT p.id, p.title 
        FROM products p 
        WHERE p.price > 0
        ORDER BY p.created_at DESC
        LIMIT 50
    ) LOOP
        -- Rotate buyer
        v_buyer_id := v_buyer_ids[(v_count % array_length(v_buyer_ids, 1)) + 1];
        
        -- Rating: 70% 5-star, 30% 4-star
        v_rating := CASE WHEN random() < 0.70 THEN 5 ELSE 4 END;
        
        -- Comment: 1 of 10 exact Vietnamese approved phrases
        v_comment := v_comments[(v_count % array_length(v_comments, 1)) + 1];
        
        -- Random created_at in past 30 days
        v_created_at := NOW() - (floor(random() * 28 + 1) || ' days')::INTERVAL - (floor(random() * 24) || ' hours')::INTERVAL;

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

        -- Update aggregate rating and count on the product
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
