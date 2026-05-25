-- Allow the dashboard Supabase anon client to manage archived previous orders.
-- This matches the current app auth model, which uses a local dashboard token
-- instead of Supabase Auth sessions.

alter table public.previous_orders enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'previous_orders'
      and policyname = 'Dashboard can manage previous orders'
  ) then
    create policy "Dashboard can manage previous orders"
      on public.previous_orders
      for all
      to anon, authenticated
      using (true)
      with check (true);
  end if;
end $$;
