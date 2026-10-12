-- Normalized taxonomy and content relationships for MCMS.
-- Existing categories/tags text arrays remain as a compatibility layer for the static site publisher.
create table if not exists public.mcms_categories (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.mcms_workspaces(id) on delete cascade,
 site_id uuid not null,
 name text not null check (length(trim(name)) between 1 and 120),
 slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{1,100}$'),
 description text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (id, workspace_id), unique (site_id, slug),
 foreign key (site_id, workspace_id) references public.mcms_sites(id, workspace_id) on delete cascade
);
create table if not exists public.mcms_tags (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.mcms_workspaces(id) on delete cascade,
 site_id uuid not null,
 name text not null check (length(trim(name)) between 1 and 120),
 slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{1,100}$'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique (id, workspace_id), unique (site_id, slug),
 foreign key (site_id, workspace_id) references public.mcms_sites(id, workspace_id) on delete cascade
);
create table if not exists public.mcms_content_categories (
 workspace_id uuid not null, content_id uuid not null, category_id uuid not null,
 primary key (content_id, category_id),
 foreign key (content_id, workspace_id) references public.mcms_content(id, workspace_id) on delete cascade,
 foreign key (category_id, workspace_id) references public.mcms_categories(id, workspace_id) on delete cascade
);
create table if not exists public.mcms_content_tags (
 workspace_id uuid not null, content_id uuid not null, tag_id uuid not null,
 primary key (content_id, tag_id),
 foreign key (content_id, workspace_id) references public.mcms_content(id, workspace_id) on delete cascade,
 foreign key (tag_id, workspace_id) references public.mcms_tags(id, workspace_id) on delete cascade
);
create index if not exists mcms_categories_workspace_idx on public.mcms_categories(workspace_id,site_id,name);
create index if not exists mcms_tags_workspace_idx on public.mcms_tags(workspace_id,site_id,name);
create index if not exists mcms_content_categories_category_idx on public.mcms_content_categories(category_id);
create index if not exists mcms_content_tags_tag_idx on public.mcms_content_tags(tag_id);
alter table public.mcms_categories enable row level security;
alter table public.mcms_tags enable row level security;
alter table public.mcms_content_categories enable row level security;
alter table public.mcms_content_tags enable row level security;
grant select,insert,update,delete on public.mcms_categories,public.mcms_tags,public.mcms_content_categories,public.mcms_content_tags to authenticated;
create policy "Members can read categories" on public.mcms_categories for select to authenticated using (private.mcms_is_workspace_member(workspace_id));
create policy "Editors manage categories" on public.mcms_categories for all to authenticated using (private.mcms_has_workspace_role(workspace_id,array['owner'::public.mcms_workspace_role,'admin'::public.mcms_workspace_role,'editor'::public.mcms_workspace_role,'publisher'::public.mcms_workspace_role])) with check (private.mcms_has_workspace_role(workspace_id,array['owner'::public.mcms_workspace_role,'admin'::public.mcms_workspace_role,'editor'::public.mcms_workspace_role,'publisher'::public.mcms_workspace_role]));
create policy "Members can read tags" on public.mcms_tags for select to authenticated using (private.mcms_is_workspace_member(workspace_id));
create policy "Editors manage tags" on public.mcms_tags for all to authenticated using (private.mcms_has_workspace_role(workspace_id,array['owner'::public.mcms_workspace_role,'admin'::public.mcms_workspace_role,'editor'::public.mcms_workspace_role,'publisher'::public.mcms_workspace_role])) with check (private.mcms_has_workspace_role(workspace_id,array['owner'::public.mcms_workspace_role,'admin'::public.mcms_workspace_role,'editor'::public.mcms_workspace_role,'publisher'::public.mcms_workspace_role]));
create policy "Members can read content categories" on public.mcms_content_categories for select to authenticated using (private.mcms_is_workspace_member(workspace_id));
create policy "Editors manage content categories" on public.mcms_content_categories for all to authenticated using (private.mcms_has_workspace_role(workspace_id,array['owner'::public.mcms_workspace_role,'admin'::public.mcms_workspace_role,'editor'::public.mcms_workspace_role,'publisher'::public.mcms_workspace_role])) with check (private.mcms_has_workspace_role(workspace_id,array['owner'::public.mcms_workspace_role,'admin'::public.mcms_workspace_role,'editor'::public.mcms_workspace_role,'publisher'::public.mcms_workspace_role]));
create policy "Members can read content tags" on public.mcms_content_tags for select to authenticated using (private.mcms_is_workspace_member(workspace_id));
create policy "Editors manage content tags" on public.mcms_content_tags for all to authenticated using (private.mcms_has_workspace_role(workspace_id,array['owner'::public.mcms_workspace_role,'admin'::public.mcms_workspace_role,'editor'::public.mcms_workspace_role,'publisher'::public.mcms_workspace_role])) with check (private.mcms_has_workspace_role(workspace_id,array['owner'::public.mcms_workspace_role,'admin'::public.mcms_workspace_role,'editor'::public.mcms_workspace_role,'publisher'::public.mcms_workspace_role]));
create or replace function public.mcms_sync_content_taxonomy() returns trigger language plpgsql set search_path=public,private as $$
declare label text; term_id uuid; term_slug text;
begin
 delete from public.mcms_content_categories where content_id=new.id;
 delete from public.mcms_content_tags where content_id=new.id;
 foreach label in array coalesce(new.categories,array[]::text[]) loop
  label:=trim(label);
  if label<>'' then
   term_slug:=trim(both '-' from lower(regexp_replace(label,'[^a-zA-Z0-9]+','-','g')));
   if length(term_slug)<2 then term_slug:='topic-'||substr(md5(lower(label)),1,10); end if;
   insert into public.mcms_categories(workspace_id,site_id,name,slug) values(new.workspace_id,new.site_id,label,term_slug)
   on conflict(site_id,slug) do update set name=excluded.name,updated_at=now() returning id into term_id;
   insert into public.mcms_content_categories(workspace_id,content_id,category_id) values(new.workspace_id,new.id,term_id) on conflict do nothing;
  end if;
 end loop;
 foreach label in array coalesce(new.tags,array[]::text[]) loop
  label:=trim(label);
  if label<>'' then
   term_slug:=trim(both '-' from lower(regexp_replace(label,'[^a-zA-Z0-9]+','-','g')));
   if length(term_slug)<2 then term_slug:='tag-'||substr(md5(lower(label)),1,10); end if;
   insert into public.mcms_tags(workspace_id,site_id,name,slug) values(new.workspace_id,new.site_id,label,term_slug)
   on conflict(site_id,slug) do update set name=excluded.name,updated_at=now() returning id into term_id;
   insert into public.mcms_content_tags(workspace_id,content_id,tag_id) values(new.workspace_id,new.id,term_id) on conflict do nothing;
  end if;
 end loop;
 return new;
end; $$;
drop trigger if exists mcms_content_taxonomy_sync on public.mcms_content;
create trigger mcms_content_taxonomy_sync after insert or update of categories,tags,site_id,workspace_id on public.mcms_content for each row execute function public.mcms_sync_content_taxonomy();
