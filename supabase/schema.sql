-- Run this file in Supabase SQL Editor.
-- It creates the database tables/functions and clears the key pool.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  image_url text not null,
  platform text not null default 'iOS',
  price text not null default 'FREE',
  expires_label text not null default '3 gio',
  downloads text not null default '0',
  note text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.key_pool (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  key_value text not null,
  created_at timestamptz not null default now(),
  unique (game_id, key_value)
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  service text not null,
  username text not null,
  password text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.key_pool enable row level security;
alter table public.accounts enable row level security;

create or replace function public.wgk_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "profiles select own or admin" on public.profiles;
create policy "profiles select own or admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.wgk_is_admin());

drop policy if exists "games readable" on public.games;
create policy "games readable"
on public.games for select
to anon, authenticated
using (true);

drop policy if exists "games admin insert" on public.games;
create policy "games admin insert"
on public.games for insert
to authenticated
with check (public.wgk_is_admin());

drop policy if exists "games admin update" on public.games;
create policy "games admin update"
on public.games for update
to authenticated
using (public.wgk_is_admin())
with check (public.wgk_is_admin());

drop policy if exists "games admin delete" on public.games;
create policy "games admin delete"
on public.games for delete
to authenticated
using (public.wgk_is_admin());

drop policy if exists "key_pool admin select" on public.key_pool;
create policy "key_pool admin select"
on public.key_pool for select
to authenticated
using (public.wgk_is_admin());

drop policy if exists "key_pool admin insert" on public.key_pool;
create policy "key_pool admin insert"
on public.key_pool for insert
to authenticated
with check (public.wgk_is_admin());

drop policy if exists "key_pool admin update" on public.key_pool;
create policy "key_pool admin update"
on public.key_pool for update
to authenticated
using (public.wgk_is_admin())
with check (public.wgk_is_admin());

drop policy if exists "key_pool admin delete" on public.key_pool;
create policy "key_pool admin delete"
on public.key_pool for delete
to authenticated
using (public.wgk_is_admin());

drop policy if exists "accounts authenticated select" on public.accounts;
create policy "accounts authenticated select"
on public.accounts for select
to authenticated
using (true);

drop policy if exists "accounts admin insert" on public.accounts;
create policy "accounts admin insert"
on public.accounts for insert
to authenticated
with check (public.wgk_is_admin());

drop policy if exists "accounts admin update" on public.accounts;
create policy "accounts admin update"
on public.accounts for update
to authenticated
using (public.wgk_is_admin())
with check (public.wgk_is_admin());

drop policy if exists "accounts admin delete" on public.accounts;
create policy "accounts admin delete"
on public.accounts for delete
to authenticated
using (public.wgk_is_admin());

create or replace function public.wgk_list_games()
returns table (
  id uuid,
  slug text,
  name text,
  image_url text,
  platform text,
  price text,
  expires_label text,
  downloads text,
  note text,
  is_active boolean,
  stock_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    g.id,
    g.slug,
    g.name,
    g.image_url,
    g.platform,
    g.price,
    g.expires_label,
    g.downloads,
    g.note,
    g.is_active,
    count(k.id) as stock_count
  from public.games g
  left join public.key_pool k on k.game_id = g.id
  group by g.id
  order by g.sort_order, g.created_at;
$$;

create or replace function public.wgk_claim_next_key(p_game_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key record;
begin
  select id, key_value
  into v_key
  from public.key_pool
  where game_id = p_game_id
    and exists (
      select 1 from public.games
      where id = p_game_id and is_active = true
    )
  order by created_at, id
  for update skip locked
  limit 1;

  if v_key.id is null then
    return null;
  end if;

  delete from public.key_pool where id = v_key.id;
  return v_key.key_value;
end;
$$;

grant execute on function public.wgk_is_admin() to authenticated;
grant execute on function public.wgk_list_games() to anon, authenticated;
grant execute on function public.wgk_claim_next_key(uuid) to authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.games to anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.accounts to authenticated;
grant insert, update, delete on public.games to authenticated;
grant select, insert, update, delete on public.key_pool to authenticated;
grant insert, update, delete on public.accounts to authenticated;

insert into public.games (slug, name, image_url, platform, price, expires_label, downloads, note, is_active, sort_order)
values
  ('lien-quan-mobile', 'Lien Quan Mobile', 'https://play-lh.googleusercontent.com/DduNvUMc6rXuH1v9ErjwBcLQ5VUxHNnRK2EVL9odjJ7vGubZZh0_M0VfsBjK-4TsQMg%3Dw240-h480', 'iOS', 'FREE', '3 gio', '15K', 'iOS | FREE | 3 gio', true, 1),
  ('pubg-mobile', 'PUBG Mobile', 'https://play-lh.googleusercontent.com/zCSGnBtZk0Lmp1BAbyaZfLktDzHmC6oke67qzz3G1lBegAF2asyt5KzXOJ2PVdHDYkU%3Dw240-h480', 'iOS', 'FREE', '6 gio', '8K', 'iOS | FREE | 6 gio', true, 2),
  ('free-fire', 'Free Fire', 'https://play-lh.googleusercontent.com/1wE91ae_1YIJtIjQ1YJz5RhAajxEpF1TfrXGg7tcrKl90MOnF7XdFj71pw_MSQbyhM5PYz-eRdeBFQBzSGrV%3Dw240-h480', 'iOS', 'FREE', '3 gio', '186', 'iOS | FREE | Moi cap nhat', true, 3),
  ('free-fire-max', 'Free Fire MAX', 'https://play-lh.googleusercontent.com/EJ83sg58Oo2gAjMHFxFVLM6Z53kuH4_R0M7Yq7gts5fWSIlFchUlmskG1vJKMoncmfOxBXcgJyIaO-nak6sO-MM%3Dw240-h480', 'Android', 'FREE', '2 gio', '2K', 'Android | FREE', true, 4),
  ('fc-online-m', 'FC Online M', 'https://play-lh.googleusercontent.com/KjEM7U-WBSbhBHGsSPlylm5c-Mv2KkguCm2Om2QNgJG-TTeyEGYk3BRf3Yh3iXp4v5s%3Dw240-h480', 'iOS', 'FREE', '3 gio', '4K', 'iOS | FREE | 3 gio', true, 5),
  ('codm-garena', 'CODM Garena', 'https://play-lh.googleusercontent.com/qbOiSlyprOTjbV2_VrOrlhsxeSmxuNW1Ug0-BQglEdEh6hfZOUxg2FcxUCW9AXMwCxybgEBtyVAJY0ZUaM87%3Dw240-h480', 'Android', 'FREE', 'Bao tri', '1K', 'Android | Dang bao tri', true, 6)
on conflict (slug) do update set
  name = excluded.name,
  image_url = excluded.image_url,
  platform = excluded.platform,
  price = excluded.price,
  expires_label = excluded.expires_label,
  downloads = excluded.downloads,
  note = excluded.note,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- Clear all previously saved keys. This is intentional for the current reset.
truncate table public.key_pool restart identity;
