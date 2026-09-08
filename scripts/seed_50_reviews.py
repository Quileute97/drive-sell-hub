# -*- coding: utf-8 -*-
"""
Python script to insert 50 sample reviews into Supabase
Requirements:
1. Fetch 50 products with price > 0
2. Authenticate buyers to satisfy RLS policy: (auth.uid() = buyer_id)
3. Insert 50 reviews:
   - product_id: rotate across 50 products
   - buyer_id: rotate across authentic buyers
   - rating: 4 or 5 (70% 5, 30% 4)
   - comment: 1 of 10 approved natural Vietnamese comments
   - is_verified_purchase: true
   - is_approved: true
   - created_at: random in past 30 days
4. Update product rating_average and rating_count
"""
import os
import sys
import json
import random
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone

# Ensure stdout handles utf-8
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def load_env():
    env_vars = {}
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env_vars[k.strip()] = v.strip().strip('"').strip("'")
    return env_vars

env = load_env()
SUPABASE_URL = env.get("VITE_SUPABASE_URL") or env.get("SUPABASE_URL")
SUPABASE_KEY = env.get("VITE_SUPABASE_PUBLISHABLE_KEY") or env.get("SUPABASE_PUBLISHABLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing SUPABASE_URL or SUPABASE_KEY in .env")
    exit(1)

APPROVED_COMMENTS = [
    "Tài liệu chất lượng, đúng mô tả",
    "Rất hài lòng, sẽ quay lại mua tiếp",
    "Giao hàng nhanh, file đầy đủ",
    "Nội dung hay, đáng giá tiền",
    "Seller uy tín, hỗ trợ nhiệt tình",
    "Tài liệu đẹp, in màu rõ nét",
    "Đúng yêu cầu, không thất vọng",
    "File đầy đủ, giao hàng nhanh",
    "Chất lượng tốt, đáng đồng tiền bát gạo",
    "Sẽ giới thiệu cho bạn bè"
]

BUYER_ACCOUNTS = [
    {"email": "buyer_review_1@salemylink.com", "password": "Password123!@", "full_name": "Trần Thị Mai"},
    {"email": "buyer_review_2@salemylink.com", "password": "Password123!@", "full_name": "Nguyễn Hoàng Long"},
    {"email": "buyer_review_3@salemylink.com", "password": "Password123!@", "full_name": "Phạm Minh Tuấn"},
    {"email": "buyer_review_4@salemylink.com", "password": "Password123!@", "full_name": "Hoàng Thu Trang"},
    {"email": "buyer_review_5@salemylink.com", "password": "Password123!@", "full_name": "Đỗ Đức Thắng"},
]

def make_req(url, method="GET", data=None, token=None):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {token or SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    req_data = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        return {"error": e.code, "message": body}
    except Exception as e:
        return {"error": 500, "message": str(e)}

def get_or_create_buyer(account):
    # Try sign in
    signin_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    res = make_req(signin_url, method="POST", data={"email": account["email"], "password": account["password"]})
    if "access_token" in res:
        return {"id": res["user"]["id"], "token": res["access_token"], "name": account["full_name"]}
    
    # Otherwise sign up
    signup_url = f"{SUPABASE_URL}/auth/v1/signup"
    signup_data = {
        "email": account["email"],
        "password": account["password"],
        "data": {"full_name": account["full_name"], "role": "buyer"}
    }
    res = make_req(signup_url, method="POST", data=signup_data)
    if "access_token" in res:
        # Update profile name
        profile_url = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{res['user']['id']}"
        make_req(profile_url, method="PATCH", data={"full_name": account["full_name"], "role": "buyer"}, token=res["access_token"])
        return {"id": res["user"]["id"], "token": res["access_token"], "name": account["full_name"]}
    elif "user" in res and res["user"].get("id"):
        # If signup worked without session, sign in
        res_signin = make_req(signin_url, method="POST", data={"email": account["email"], "password": account["password"]})
        if "access_token" in res_signin:
            return {"id": res_signin["user"]["id"], "token": res_signin["access_token"], "name": account["full_name"]}
    
    return None

def main():
    print("Connecting to Supabase at:", SUPABASE_URL)

    # 1. Fetch 50 products with price > 0
    prod_url = f"{SUPABASE_URL}/rest/v1/products?price=gt.0&status=eq.active&select=id,title,price,slug&limit=50&order=created_at.desc"
    products = make_req(prod_url)
    if not isinstance(products, list) or len(products) == 0:
        prod_url = f"{SUPABASE_URL}/rest/v1/products?price=gt.0&select=id,title,price,slug&limit=50&order=created_at.desc"
        products = make_req(prod_url)

    if not isinstance(products, list) or len(products) == 0:
        print("Error: No products with price > 0 found.")
        return

    print(f"Retrieved {len(products)} products with price > 0.")

    # 2. Authenticate buyers
    buyers = []
    for acc in BUYER_ACCOUNTS:
        b = get_or_create_buyer(acc)
        if b:
            buyers.append(b)
            print(f"Buyer authenticated: {b['name']} ({b['id']})")

    if not buyers:
        print("Error: Failed to authenticate buyer accounts.")
        return

    # 3. Insert 50 reviews distributed across products
    now = datetime.now(timezone.utc)
    seeded_count = 0
    product_review_counts = {}

    for i in range(50):
        prod = products[i % len(products)]
        buyer = buyers[i % len(buyers)]
        
        # 70% 5-star, 30% 4-star
        rating = 5 if (random.random() < 0.70) else 4
        comment = random.choice(APPROVED_COMMENTS)

        days_ago = random.randint(1, 29)
        hours_ago = random.randint(0, 23)
        created_time = (now - timedelta(days=days_ago, hours=hours_ago)).isoformat()

        review_payload = {
            "product_id": prod["id"],
            "buyer_id": buyer["id"],
            "rating": rating,
            "comment": comment,
            "is_verified_purchase": True,
            "is_approved": True,
            "created_at": created_time
        }

        insert_url = f"{SUPABASE_URL}/rest/v1/reviews"
        res = make_req(insert_url, method="POST", data=review_payload, token=buyer["token"])
        
        if isinstance(res, list) and len(res) > 0:
            seeded_count += 1
            pid = prod["id"]
            product_review_counts[pid] = product_review_counts.get(pid, 0) + 1
            print(f"[{seeded_count}/50] Inserted review for product {prod['title'][:35]}... ({rating} stars by {buyer['name']})")
        elif isinstance(res, dict) and "error" in res:
            print(f"Warning inserting review {i+1}:", res.get("message"))
        else:
            seeded_count += 1
            pid = prod["id"]
            product_review_counts[pid] = product_review_counts.get(pid, 0) + 1
            print(f"[{seeded_count}/50] Inserted review for product {prod['title'][:35]}...")

    print(f"\nCompleted inserting reviews: {seeded_count} reviews inserted.")

    # 4. Update product rating_average and rating_count
    print("Updating rating_average and rating_count on products...")
    for pid in product_review_counts.keys():
        fetch_revs_url = f"{SUPABASE_URL}/rest/v1/reviews?product_id=eq.{pid}&is_approved=eq.true&select=rating"
        revs = make_req(fetch_revs_url)
        if isinstance(revs, list) and len(revs) > 0:
            avg = round(sum(r.get("rating", 5) for r in revs) / len(revs), 1)
            count = len(revs)
            patch_url = f"{SUPABASE_URL}/rest/v1/products?id=eq.{pid}"
            make_req(patch_url, method="PATCH", data={"rating_average": avg, "rating_count": count})

    # 5. Final Verification
    total_revs_url = f"{SUPABASE_URL}/rest/v1/reviews?select=id,product_id,is_approved"
    all_revs = make_req(total_revs_url)
    if isinstance(all_revs, list):
        total_in_db = len(all_revs)
        prods_with_revs = len(set(r.get("product_id") for r in all_revs if r.get("is_approved")))
        print("\n================ VERIFICATION REPORT ================")
        print(f"Total reviews in DB: {total_in_db} (Acceptance criterion: >= 50)")
        print(f"Products with approved reviews: {prods_with_revs} (Acceptance criterion: >= 30)")
        print("====================================================\n")

if __name__ == "__main__":
    main()
