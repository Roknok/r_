-- ROKNOK'S CASINO — database upgrade
grant usage on schema public to anon, authenticated;
-- Run the entire script in Supabase SQL Editor.
-- Also enable Authentication > Sign In / Providers > Anonymous Sign-Ins.

create table if not exists public.players (
  user_id uuid primary key references auth.users(id) on delete cascade,
  player_name text not null check (char_length(player_name) between 2 and 18),
  balance integer not null default 200 check (balance >= 0 and balance <= 100000000),
  last_daily_bonus date not null,
  last_play_date date,
  is_locked boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists players_player_name_ci_unique
  on public.players (lower(player_name));

alter table public.players enable row level security;
drop policy if exists "Players can read their own profile" on public.players;
create policy "Players can read their own profile"
  on public.players for select to authenticated
  using (auth.uid() = user_id);
revoke all on public.players from anon, authenticated;
grant select on public.players to authenticated;

-- Public read-only scores. New scores are inserted only by finish_player_run().
alter table public.scores add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.scores enable row level security;
drop policy if exists "Anyone can submit a score" on public.scores;
drop policy if exists "Scores are visible to everyone" on public.scores;
create policy "Scores are visible to everyone"
  on public.scores for select to anon, authenticated using (true);
revoke insert, update, delete on public.scores from anon, authenticated;
grant select on public.scores to anon, authenticated;

create or replace view public.leaderboard
with (security_invoker = true) as
select player_name, max(score)::integer as score
from public.scores
group by player_name;
grant select on public.leaderboard to anon, authenticated;

-- Returns the existing player's profile and applies the daily 100-coin login bonus once.
create or replace function public.get_player_state()
returns table (
  player_name text,
  balance integer,
  is_locked boolean,
  daily_bonus_awarded boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
  v_awarded boolean := false;
begin
  if v_uid is null then raise exception 'You must be signed in.'; end if;

  if not exists (select 1 from public.players p where p.user_id = v_uid) then
    return;
  end if;

  select (p.last_daily_bonus < v_today) into v_awarded
    from public.players p where p.user_id = v_uid for update;

  update public.players p
     set balance = case when v_awarded then p.balance + 100 else p.balance end,
         last_daily_bonus = case when v_awarded then v_today else p.last_daily_bonus end,
         is_locked = case when p.last_play_date is null or p.last_play_date < v_today then false else p.is_locked end
   where p.user_id = v_uid;

  return query
    select p.player_name, p.balance, p.is_locked, v_awarded
      from public.players p where p.user_id = v_uid;
end;
$$;

-- Register a unique player name. Existing anonymous-auth users retain their profile.
create or replace function public.register_player(p_name text)
returns table (
  player_name text,
  balance integer,
  is_locked boolean,
  daily_bonus_awarded boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_name text := btrim(p_name);
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
begin
  if v_uid is null then raise exception 'You must be signed in.'; end if;
  if char_length(v_name) < 2 or char_length(v_name) > 18 then
    raise exception 'Name must be between 2 and 18 characters.';
  end if;

  if exists (select 1 from public.players p where p.user_id = v_uid) then
    return query select * from public.get_player_state();
    return;
  end if;

  if exists (select 1 from public.players p where lower(p.player_name) = lower(v_name))
     or exists (select 1 from public.scores s where lower(s.player_name) = lower(v_name)) then
    raise exception 'That name is already taken.' using errcode = '23505';
  end if;

  insert into public.players(user_id, player_name, balance, last_daily_bonus, is_locked)
  values (v_uid, v_name, 200, v_today, false);

  return query select p.player_name, p.balance, p.is_locked, false
    from public.players p where p.user_id = v_uid;
exception when unique_violation then
  raise exception 'That name is already taken.' using errcode = '23505';
end;
$$;

create or replace function public.save_player_balance(p_balance integer)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
begin
  if auth.uid() is null then raise exception 'You must be signed in.'; end if;
  if p_balance < 0 or p_balance > 100000000 then raise exception 'Invalid balance.'; end if;
  update public.players
     set balance = p_balance
   where user_id = auth.uid()
     and is_locked = false
     and (last_play_date is null or last_play_date < v_today or last_play_date = v_today);
  if not found then raise exception 'Player run is locked or profile is missing.'; end if;
end;
$$;

create or replace function public.finish_player_run(p_score integer)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name text;
  v_balance integer;
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
begin
  if auth.uid() is null then raise exception 'You must be signed in.'; end if;
  if p_score < 0 or p_score > 100000000 then raise exception 'Invalid score.'; end if;

  -- The balance saved after the last completed round is authoritative. Do not
  -- overwrite it with a possibly stale browser value when the run is closed.
  update public.players p
     set is_locked = true, last_play_date = v_today
   where p.user_id = auth.uid() and p.is_locked = false
   returning p.player_name, p.balance into v_name, v_balance;
  if not found then raise exception 'This run has already been completed.'; end if;

  insert into public.scores(user_id, player_name, score)
  values (auth.uid(), v_name, v_balance);
end;
$$;

revoke all on function public.get_player_state() from public, anon;
revoke all on function public.register_player(text) from public, anon;
revoke all on function public.save_player_balance(integer) from public, anon;
revoke all on function public.finish_player_run(integer) from public, anon;
grant execute on function public.get_player_state() to authenticated;
grant execute on function public.register_player(text) to authenticated;
grant execute on function public.save_player_balance(integer) to authenticated;
grant execute on function public.finish_player_run(integer) to authenticated;
