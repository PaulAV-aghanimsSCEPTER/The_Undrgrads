-- Stores completed/previous orders outside the active dashboard list.
-- Safe to run on an existing Supabase project.

create table if not exists public.previous_orders (
  id bigint generated always as identity primary key,
  name text not null,
  phone text,
  facebook text,
  chapter text,
  address text,
  color text not null,
  size text not null,
  design text,
  payment_method text,
  payment_status text default 'pending',
  price numeric default 0,
  downpayment numeric default 0,
  note text default '',
  status text default 'Pending',
  created_at timestamp with time zone default now(),
  archived_at timestamp with time zone default now(),
  defective_note text default '',
  is_defective boolean default false,
  is_deleted boolean default false,
  is_trashed boolean default false,
  batch_folder text,
  batch text
);

create index if not exists previous_orders_archived_at_idx on public.previous_orders(archived_at);
