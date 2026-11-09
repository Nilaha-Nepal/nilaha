-- Apply once in Supabase SQL editor. No personal case data belongs in this repository.
create table if not exists public.counsellors (
 id text primary key, name text not null, initials text, role text, district text,
 languages jsonb not null default '[]', specialty text, mode text, color text default 'lilac',
 description text, fee text, published boolean not null default false
);
create table if not exists public.helplines (
 id text primary key, name text not null, number text not null, type text,
 hours text, cost text, description text, source text not null, checked text,
 published boolean not null default false
);
create table if not exists public.articles (
 slug text primary key, category text, title text not null, description text, read text,
 art text, body jsonb not null default '[]', source text, published boolean not null default false
);
create table if not exists public.support_requests (
 id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
 message text not null check(length(message) between 2 and 2000),
 channel text not null check(channel in ('phone','sms','whatsapp')),
 contact text not null, safe_time text not null, voicemail boolean not null default false,
 consent boolean not null check(consent), provider_id text references public.counsellors(id),
 status text not null default 'new' check(status in ('new','in_progress','closed'))
);
alter table public.counsellors enable row level security;
alter table public.helplines enable row level security;
alter table public.articles enable row level security;
alter table public.support_requests enable row level security;
create policy "Public published counsellors" on public.counsellors for select to anon using (published=true);
create policy "Public published helplines" on public.helplines for select to anon using (published=true);
create policy "Public published articles" on public.articles for select to anon using (published=true);
-- No policies permit anon/authenticated access to support_requests.
-- Intake writes occur only on the server with the service-role key.
revoke all on public.support_requests from anon,authenticated;
revoke all on public.counsellors,public.helplines,public.articles from anon,authenticated;
grant select on public.counsellors,public.helplines,public.articles to anon;
