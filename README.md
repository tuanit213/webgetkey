# Web Get Key

Web shop key bằng HTML, CSS, JavaScript thuần, có thể deploy lên GitHub Pages và dùng Supabase làm database.

## Cách chạy local

```bash
python -m http.server 5500
```

Sau đó mở `http://127.0.0.1:5500`.

## Setup database

1. Tạo project trên Supabase.
2. Mở Supabase SQL Editor, chạy file `supabase/schema.sql`.
3. Tạo user trong Supabase Authentication.
4. Tạo profile role theo hướng dẫn trong `supabase/setup.md`.
5. Điền Supabase Project URL và anon key vào `js/config.js`.

File `supabase/schema.sql` đã có lệnh xóa sạch kho key:

```sql
truncate table public.key_pool restart identity;
```

## Tài khoản

Khi đã cấu hình Supabase, đăng nhập bằng email/password trong Supabase Auth.

Nếu chưa cấu hình Supabase, web chạy local fallback:

- Admin: `admin` / `admin123`
- User: `user` / `user123`

## Chức năng

- User xem danh sách game, lấy 1 key và copy key.
- Khi user lấy key, database function `wgk_claim_next_key()` trả về 1 key và xóa key đó khỏi `key_pool`.
- Admin nhập nhiều key cùng lúc theo từng game.
- Admin xóa kho key của từng game.
- Admin quản lý acc.

## Deploy GitHub Pages

1. Tạo GitHub repository mới.
2. Push toàn bộ thư mục này lên repo.
3. Vào repo Settings -> Pages.
4. Chọn branch `main` và folder `/root`.
5. Mở link GitHub Pages sau khi deploy xong.

Không đưa Supabase service role key vào website. Chỉ dùng anon public key trong `js/config.js`.
