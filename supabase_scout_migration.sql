-- =========================================================================
-- TRENDLOOP AI PRODUCT SCOUT DATABASE MIGRATION
-- Project: Gen-Z Trends & Discovery Platform - AI Curation Addendum
-- Target: Supabase (Postgres)
-- =========================================================================

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. Research Jobs Tracker Table
create table if not exists public.research_jobs (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references public.users(id) on delete cascade,
  query_text text not null,
  filters_json jsonb not null default '{}'::jsonb,
  status text not null default 'pending', -- 'pending' | 'running' | 'completed' | 'failed'
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  constraint chk_job_status check (status in ('pending', 'running', 'completed', 'failed'))
);

-- 2. Raw Candidate Products Table
create table if not exists public.product_candidates (
  id uuid primary key default uuid_generate_v4(),
  research_job_id uuid references public.research_jobs(id) on delete cascade,
  source_url text not null,
  source_name text not null,
  title text not null,
  price numeric,
  rating numeric,
  review_count integer,
  image_urls_json jsonb not null default '[]'::jsonb,
  retrieved_at timestamptz not null default now(),
  raw_snippet text
);

-- 3. AI Generated Draft Products Table
create table if not exists public.draft_products (
  id uuid primary key default uuid_generate_v4(),
  research_job_id uuid references public.research_jobs(id) on delete set null,
  product_candidate_id uuid references public.product_candidates(id) on delete set null,
  name text not null,
  seo_title text,
  short_description text,
  long_description text,
  features_json jsonb not null default '[]'::jsonb,
  category text not null,
  subcategory text,
  tags_json jsonb not null default '[]'::jsonb,
  price numeric,
  suggested_keywords_json jsonb not null default '[]'::jsonb,
  meta_description text,
  trend_score numeric,
  trend_score_breakdown_json jsonb not null default '{}'::jsonb,
  data_confidence text not null default 'unverified', -- 'verified' | 'partial' | 'unverified'
  status text not null default 'draft', -- 'draft' | 'approved' | 'rejected' | 'published'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_draft_status check (status in ('draft', 'approved', 'rejected', 'published')),
  constraint chk_data_confidence check (data_confidence in ('verified', 'partial', 'unverified'))
);

-- 4. Alter Existing Affiliate Links Table to Support Draft Curation
-- Make product_id nullable (since draft products don't have a live product_id yet)
alter table public.affiliate_links alter column product_id drop not null;

-- Add draft_product_id self-reference
alter table public.affiliate_links add column if not exists draft_product_id uuid references public.draft_products(id) on delete cascade;

-- Add helper columns for auditing
alter table public.affiliate_links add column if not exists network_name text;
alter table public.affiliate_links add column if not exists added_by_admin_id uuid references public.users(id) on delete set null;
alter table public.affiliate_links add column if not exists created_at timestamptz not null default now();
alter table public.affiliate_links add column if not exists updated_at timestamptz not null default now();

-- 5. Approval & Publishing Action Log
create table if not exists public.approval_history (
  id uuid primary key default uuid_generate_v4(),
  draft_product_id uuid not null references public.draft_products(id) on delete cascade,
  admin_id uuid not null references public.users(id) on delete cascade,
  action text not null, -- 'approved' | 'rejected' | 'edited' | 'published'
  notes text,
  created_at timestamptz not null default now(),
  constraint chk_approval_action check (action in ('approved', 'rejected', 'edited', 'published'))
);

-- 6. Import Run Logs Table
create table if not exists public.import_logs (
  id uuid primary key default uuid_generate_v4(),
  research_job_id uuid references public.research_jobs(id) on delete cascade,
  candidates_found integer not null default 0,
  candidates_passed_filters integer not null default 0,
  drafts_created integer not null default 0,
  errors_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 7. Research Cache Table to Prevent Rate-Limiting
create table if not exists public.research_cache (
  id uuid primary key default uuid_generate_v4(),
  query_hash text not null unique,
  result_json jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- =========================================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================================
create index if not exists idx_research_jobs_status on public.research_jobs(status);
create index if not exists idx_product_candidates_job on public.product_candidates(research_job_id);
create index if not exists idx_draft_products_job on public.draft_products(research_job_id);
create index if not exists idx_draft_products_status on public.draft_products(status);
create index if not exists idx_aff_links_draft_prod on public.affiliate_links(draft_product_id);
create index if not exists idx_research_cache_hash on public.research_cache(query_hash);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
alter table public.research_jobs enable row level security;
alter table public.product_candidates enable row level security;
alter table public.draft_products enable row level security;
alter table public.approval_history enable row level security;
alter table public.import_logs enable row level security;
alter table public.research_cache enable row level security;

-- Only Admins can view/manage Scout-related tables
create policy "Only admins can view research jobs" on public.research_jobs for select to authenticated using (public.is_admin());
create policy "Only admins can manage research jobs" on public.research_jobs for all to authenticated using (public.is_admin());

create policy "Only admins can view product candidates" on public.product_candidates for select to authenticated using (public.is_admin());
create policy "Only admins can manage product candidates" on public.product_candidates for all to authenticated using (public.is_admin());

create policy "Only admins can view draft products" on public.draft_products for select to authenticated using (public.is_admin());
create policy "Only admins can manage draft products" on public.draft_products for all to authenticated using (public.is_admin());

create policy "Only admins can view approval history" on public.approval_history for select to authenticated using (public.is_admin());
create policy "Only admins can manage approval history" on public.approval_history for all to authenticated using (public.is_admin());

create policy "Only admins can view import logs" on public.import_logs for select to authenticated using (public.is_admin());
create policy "Only admins can manage import logs" on public.import_logs for all to authenticated using (public.is_admin());

create policy "Only admins can view research cache" on public.research_cache for select to authenticated using (public.is_admin());
create policy "Only admins can manage research cache" on public.research_cache for all to authenticated using (public.is_admin());

-- =========================================================================
-- DATABASE FUNCTIONS & RPCs
-- =========================================================================

/**
 * Atomic transaction to publish a draft product.
 * Resolves references, creates a live product entry, maps the affiliate link,
 * marks the draft status, and writes to audit logs.
 */
create or replace function public.publish_draft_product(
  p_draft_id uuid,
  p_admin_id uuid,
  p_affiliate_url text,
  p_network_name text
)
returns uuid as $$
declare
  v_live_product_id uuid;
  v_draft record;
  v_category_id uuid;
  v_subcategory_id uuid;
  v_slug text;
  v_base_slug text;
  v_counter integer := 1;
  v_images jsonb;
begin
  -- 1. Lock and fetch draft details
  select * into v_draft from public.draft_products where id = p_draft_id;
  if not found then
    raise exception 'Draft product not found for ID: %', p_draft_id;
  end if;

  if v_draft.status = 'published' then
    raise exception 'Draft product is already published.';
  end if;

  -- 2. Resolve Category & Subcategory UUIDs
  select id into v_category_id from public.categories 
  where lower(name) = lower(v_draft.category) and parent_id is null 
  limit 1;

  if v_category_id is null then
    -- Fallback to first parent category if unmatched
    select id into v_category_id from public.categories where parent_id is null limit 1;
  end if;

  if v_draft.subcategory is not null and v_draft.subcategory != '' then
    select id into v_subcategory_id from public.categories 
    where lower(name) = lower(v_draft.subcategory) and parent_id = v_category_id 
    limit 1;
  end if;

  -- 3. Resolve Unique Product Slug
  v_base_slug := lower(regexp_replace(v_draft.name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_base_slug := regexp_replace(v_base_slug, '^-|-$', '', 'g'); -- trim hyphens
  v_slug := v_base_slug;

  while exists (select 1 from public.products where slug = v_slug) loop
    v_slug := v_base_slug || '-' || v_counter;
    v_counter := v_counter + 1;
  end loop;

  -- Resolve product images from draft's candidate details
  select image_urls_json into v_images from public.product_candidates where id = v_draft.product_candidate_id;
  if v_images is null or jsonb_array_length(v_images) = 0 then
    v_images := '[{"url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600", "alt": "Product Image", "order": 0}]'::jsonb;
  end if;

  -- 4. Create Live Product Row
  insert into public.products (
    slug,
    name,
    description,
    category_id,
    subcategory_id,
    price,
    currency,
    brand,
    images,
    features,
    pros,
    cons,
    is_featured,
    is_trending,
    trending_score,
    created_at,
    updated_at
  )
  values (
    v_slug,
    v_draft.name,
    v_draft.long_description,
    v_category_id,
    v_subcategory_id,
    v_draft.price,
    'INR',
    'Curated',
    v_images,
    v_draft.features_json,
    coalesce(v_draft.features_json, '[]'::jsonb), -- pros fallback
    coalesce(v_draft.features_json, '[]'::jsonb), -- cons fallback
    false,
    (v_draft.trend_score >= 85),
    v_draft.trend_score,
    now(),
    now()
  )
  returning id into v_live_product_id;

  -- 5. Insert Live Affiliate Link Mapping
  insert into public.affiliate_links (
    product_id,
    draft_product_id,
    retailer,
    raw_url,
    network_name,
    added_by_admin_id
  )
  values (
    v_live_product_id,
    p_draft_id,
    lower(p_network_name),
    p_affiliate_url,
    p_network_name,
    p_admin_id
  );

  -- 6. Update Draft Product status
  update public.draft_products
  set status = 'published', updated_at = now()
  where id = p_draft_id;

  -- 7. Add Audit Log to Approval History
  insert into public.approval_history (
    draft_product_id,
    admin_id,
    action,
    notes
  )
  values (
    p_draft_id,
    p_admin_id,
    'published',
    'Atomic migration via publish_draft_product RPC function'
  );

  return v_live_product_id;
end;
$$ language plpgsql security definer;
