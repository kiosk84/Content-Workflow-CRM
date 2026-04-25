-- ContentFlow — Supabase schema
-- Run these statements in the Supabase SQL editor to enable persistence.

create extension if not exists "pgcrypto";

create table if not exists content_cards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  idea_text text default '',
  script_text text default '',
  platform text[] default '{}',
  stage text default 'idea',
  priority text default 'medium',
  deadline date,
  tags text[] default '{}',
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists content_cards_stage_idx on content_cards (stage);
create index if not exists content_cards_updated_at_idx on content_cards (updated_at desc);

create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references content_cards(id) on delete cascade,
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Auto-update updated_at on content_cards
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_content_cards_updated_at on content_cards;
create trigger trg_content_cards_updated_at
before update on content_cards
for each row execute procedure set_updated_at();

-- Optional: Row-level security setup. Uncomment and adjust to your auth model.
-- alter table content_cards enable row level security;
-- alter table ai_conversations enable row level security;
-- create policy "Anyone can read/write (dev)" on content_cards for all using (true) with check (true);
-- create policy "Anyone can read/write (dev)" on ai_conversations for all using (true) with check (true);
