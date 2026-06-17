-- Rolling Paper · Supabase schema
-- 실행 위치: Supabase 대시보드 → SQL Editor → New query → 붙여넣고 Run
-- (이미 만들어둔 경우 다시 실행해도 안전하도록 IF NOT EXISTS / drop policy 처리되어 있습니다)

-- ────────────────────────────────────────────────
-- 1. 테이블
-- ────────────────────────────────────────────────
create table if not exists public.memos (
  id          text primary key,
  author_name text        not null,
  team        text,
  message     text        not null,
  color       text        not null,
  rotation    double precision not null default 0,
  x           double precision not null default 50,
  y           double precision not null default 50,
  created_at  timestamptz not null default now(),
  session_id  text
);

create table if not exists public.stickers (
  id          text primary key,
  emoji       text        not null,
  x           double precision not null default 50,
  y           double precision not null default 50,
  rotation    double precision not null default 0,
  scale       double precision not null default 1,
  session_id  text,
  created_at  timestamptz not null default now()
);

-- 이미 만들어진 stickers 테이블에도 크기(scale) 컬럼을 더한다(기존 행은 1로 채워짐).
alter table public.stickers
  add column if not exists scale double precision not null default 1;

-- 사용자가 업로드해 모두가 공유하는 이미지 스티커 카탈로그 (base64 data URL 저장)
create table if not exists public.sticker_assets (
  id          text primary key,
  data_url    text        not null,
  session_id  text,
  created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────
-- 2. RLS (공개 롤링페이퍼 → 익명 사용자 모두 읽기/쓰기 허용)
--    더 엄격히 가려면 정책을 조정하세요.
-- ────────────────────────────────────────────────
alter table public.memos          enable row level security;
alter table public.stickers       enable row level security;
alter table public.sticker_assets enable row level security;

drop policy if exists "memos public access"          on public.memos;
drop policy if exists "stickers public access"       on public.stickers;
drop policy if exists "sticker_assets public access" on public.sticker_assets;

create policy "memos public access"
  on public.memos
  for all
  using (true)
  with check (true);

create policy "stickers public access"
  on public.stickers
  for all
  using (true)
  with check (true);

create policy "sticker_assets public access"
  on public.sticker_assets
  for all
  using (true)
  with check (true);

-- ────────────────────────────────────────────────
-- 3. Realtime (실시간 동기화) 활성화
-- ────────────────────────────────────────────────
-- 이미 추가된 테이블을 다시 add 하면 에러가 나므로, 중복은 무시합니다.
do $$
begin
  begin
    alter publication supabase_realtime add table public.memos;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.stickers;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.sticker_assets;
  exception when duplicate_object then null;
  end;
end $$;
