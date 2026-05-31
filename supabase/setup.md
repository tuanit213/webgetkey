# Supabase setup

## 1. Create database tables

Open Supabase Dashboard -> SQL Editor, paste `supabase/schema.sql`, then run it.

The SQL creates:

- `profiles`: role `admin` or `user`
- `games`: game cards shown on the web
- `key_pool`: private key stock
- `accounts`: account list
- `wgk_list_games()`: list games with stock count
- `wgk_claim_next_key(game_id)`: returns 1 key and deletes it from `key_pool`

The script also clears `key_pool` so the old key stock is empty.

## 2. Create login users

In Supabase Dashboard -> Authentication -> Users, create users, for example:

- `admin@example.com` / your password
- `user@example.com` / your password

Then get each user id and run:

```sql
insert into public.profiles (id, username, role)
values
  ('ADMIN_AUTH_USER_ID', 'admin', 'admin'),
  ('USER_AUTH_USER_ID', 'user', 'user')
on conflict (id) do update set
  username = excluded.username,
  role = excluded.role;
```

## 3. Configure the website

Copy your Supabase Project URL and anon public key into `js/config.js`:

```js
window.WGK_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT_ID.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
};
```

The anon key is public by design. Do not put the service role key in this website.

## 4. Login

Use the email/password created in Supabase Auth. The login input also maps `admin` to `admin@example.com` and `user` to `user@example.com` for convenience.
