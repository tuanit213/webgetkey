# Web Get Key

Web shop key bang HTML, CSS, JavaScript thuan, co the deploy len GitHub Pages va dung Supabase lam database.

## Cach chay local

```bash
python -m http.server 5500
```

Sau do mo `http://127.0.0.1:5500`.

## Setup database

1. Tao project tren Supabase.
2. Mo Supabase SQL Editor, chay file `supabase/schema.sql`.
3. Tao user trong Supabase Authentication.
4. Tao profile role theo huong dan trong `supabase/setup.md`.
5. Dien Supabase Project URL va anon key vao `js/config.js`.

File `supabase/schema.sql` da co lenh xoa sach kho key:

```sql
truncate table public.key_pool restart identity;
```

## Tai khoan

Khi da cau hinh Supabase, dang nhap bang email/password trong Supabase Auth.

Neu chua cau hinh Supabase, web chay local fallback:

- Admin: `admin` / `admin123`
- User: `user` / `user123`

## Chuc nang

- User xem danh sach game, lay 1 key va copy key.
- Khi user lay key, database function `wgk_claim_next_key()` tra ve 1 key va xoa key do khoi `key_pool`.
- Admin nhap nhieu key cung luc theo tung game.
- Admin xoa kho key cua tung game.
- Admin quan ly acc.

## Deploy GitHub Pages

1. Tao GitHub repository moi.
2. Push toan bo thu muc nay len repo.
3. Vao repo Settings -> Pages.
4. Chon branch `main` va folder `/root`.
5. Mo link GitHub Pages sau khi deploy xong.

Khong dua Supabase service role key vao website. Chi dung anon public key trong `js/config.js`.
