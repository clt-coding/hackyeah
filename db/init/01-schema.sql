CREATE EXTENSION IF NOT EXISTS postgis;

create table public.user (
  "createdAt" timestamp with time zone not null default now(),
  email text not null,
  id text not null,
  name text not null,
  password_hash text not null,
  surname text not null,
  type integer not null,
  "updatedAt" timestamp with time zone not null default now(),
  constraint user_pkey primary key (id),
  constraint user_email_key unique (email)
);

create table public.address (
  building_number text not null,
  city text not null,
  country text not null,
  "createdAt" timestamp with time zone not null default now(),
  id text not null,
  name text not null,
  "postalCode" text not null,
  street text not null,
  type integer not null,
  unit_number text null,
  "updatedAt" timestamp with time zone not null default now(),
  "userId" text not null,
  lat double precision null,
  lng double precision null,
  constraint address_pkey primary key (id),
  constraint address_userId_fkey foreign KEY ("userId") references "user" (id)
);

create index IF not exists "address_userId_idx_a489d58a" on public.address using btree ("userId");

create table public.daycare (
  building_number text not null,
  city text not null,
  closing_hours time without time zone not null,
  country text not null,
  "createdAt" timestamp with time zone not null default now(),
  id text not null,
  lat double precision null,
  lng double precision null,
  name text not null,
  opening_hours time without time zone not null,
  "postalCode" text not null,
  street text not null,
  unit_number text null,
  "updatedAt" timestamp with time zone not null default now(),
  constraint daycare_pkey primary key (id)
);

create table public.institution (
  building_number text not null,
  city text not null,
  country text not null,
  "createdAt" timestamp with time zone not null default now(),
  id text not null,
  name text not null,
  "postalCode" text not null,
  street text not null,
  type integer not null,
  unit_number text null,
  "updatedAt" timestamp with time zone not null default now(),
  lat double precision null,
  lng double precision null,
  closing_hours time without time zone not null,
  opening_hours time without time zone not null,
  constraint institution_pkey primary key (id)
);

create table public.nanny (
  availability boolean not null default true,
  hourly_wage double precision not null default 0,
  id text not null,
  phone_number text not null,
  rating double precision null default 0,
  rating_count integer null default 0,
  "userId" text not null,
  constraint nanny_pkey primary key (id),
  constraint nanny_userId_key unique ("userId"),
  constraint nanny_userId_fkey foreign KEY ("userId") references "user" (id)
);