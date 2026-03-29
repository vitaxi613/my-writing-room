-- 写字房间：邮箱绑定后的云端镜像（RLS：仅本人）
-- 在 Supabase SQL Editor 执行或 `supabase db push`

create table if not exists public.writing_room_profile (
  user_id uuid primary key references auth.users (id) on delete cascade,
  writer_id text not null,
  writer_slug text not null,
  nickname text,
  bio text,
  updated_at bigint not null default 0,
  inserted_at timestamptz not null default now()
);

create unique index if not exists writing_room_profile_writer_id_key
  on public.writing_room_profile (writer_id);

create table if not exists public.writing_room_entries (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists writing_room_entries_user_id_idx
  on public.writing_room_entries (user_id);

alter table public.writing_room_profile enable row level security;
alter table public.writing_room_entries enable row level security;

create policy "writing_room_profile_select_own"
  on public.writing_room_profile for select
  using (auth.uid() = user_id);

create policy "writing_room_profile_insert_own"
  on public.writing_room_profile for insert
  with check (auth.uid() = user_id);

create policy "writing_room_profile_update_own"
  on public.writing_room_profile for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "writing_room_profile_delete_own"
  on public.writing_room_profile for delete
  using (auth.uid() = user_id);

create policy "writing_room_entries_select_own"
  on public.writing_room_entries for select
  using (auth.uid() = user_id);

create policy "writing_room_entries_insert_own"
  on public.writing_room_entries for insert
  with check (auth.uid() = user_id);

create policy "writing_room_entries_update_own"
  on public.writing_room_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "writing_room_entries_delete_own"
  on public.writing_room_entries for delete
  using (auth.uid() = user_id);
