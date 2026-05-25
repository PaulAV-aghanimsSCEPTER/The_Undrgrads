-- Adds folders for organizing archived previous orders.

create table if not exists public.previous_order_folders (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamp with time zone default now()
);

alter table public.previous_orders
  add column if not exists previous_folder text;

create index if not exists previous_orders_previous_folder_idx on public.previous_orders(previous_folder);

alter table public.previous_order_folders enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'previous_order_folders'
      and policyname = 'Dashboard can manage previous order folders'
  ) then
    create policy "Dashboard can manage previous order folders"
      on public.previous_order_folders
      for all
      to anon, authenticated
      using (true)
      with check (true);
  end if;
end $$;
