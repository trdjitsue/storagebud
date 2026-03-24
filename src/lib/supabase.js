import { createClient } from '@supabase/supabase-js'

// Paste your Supabase project URL and anon key here
// Get these from: https://supabase.com → your project → Settings → API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/*
──────────────────────────────────────────────
  PASTE THIS SQL INTO SUPABASE → SQL EDITOR
──────────────────────────────────────────────

-- USERS (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  created_at timestamptz default now()
);

-- GROUPS
create table public.groups (
  id uuid default gen_random_uuid() primary key,
  hall text not null,
  room text not null,
  max_members int not null default 4,
  admin_id uuid references public.profiles(id) on delete cascade,
  requires_approval boolean default true,
  rent_sgd int default 300,
  storage_start date,
  storage_end date,
  notes text,
  created_at timestamptz default now()
);

-- GROUP MEMBERS
create table public.group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  size text check (size in ('small','medium','large','xlarge')),
  items text[],
  move_in date,
  move_out date,
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- JOIN REQUESTS
create table public.join_requests (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  size text check (size in ('small','medium','large','xlarge')),
  items text[],
  move_in date,
  move_out date,
  status text default 'pending' check (status in ('pending','approved','declined')),
  created_at timestamptz default now(),
  unique(group_id, user_id)
);

-- MESSAGES
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.join_requests enable row level security;
alter table public.messages enable row level security;

-- Profiles: anyone can read, only you can update yours
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Groups: anyone can read, only authenticated users can create
create policy "groups_select" on public.groups for select using (true);
create policy "groups_insert" on public.groups for insert with check (auth.uid() = admin_id);
create policy "groups_update" on public.groups for update using (auth.uid() = admin_id);
create policy "groups_delete" on public.groups for delete using (auth.uid() = admin_id);

-- Members: readable by all, insert by self
create policy "members_select" on public.group_members for select using (true);
create policy "members_insert" on public.group_members for insert with check (auth.uid() = user_id);
create policy "members_delete" on public.group_members for delete using (auth.uid() = user_id);

-- Join requests
create policy "requests_select" on public.join_requests for select using (
  auth.uid() = user_id or
  auth.uid() = (select admin_id from public.groups where id = group_id)
);
create policy "requests_insert" on public.join_requests for insert with check (auth.uid() = user_id);
create policy "requests_update" on public.join_requests for update using (
  auth.uid() = (select admin_id from public.groups where id = group_id)
);

-- Messages: only group members can read/write
create policy "messages_select" on public.messages for select using (
  exists (select 1 from public.group_members where group_id = messages.group_id and user_id = auth.uid())
);
create policy "messages_insert" on public.messages for insert with check (
  auth.uid() = user_id and
  exists (select 1 from public.group_members where group_id = messages.group_id and user_id = auth.uid())
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

──────────────────────────────────────────────
*/
