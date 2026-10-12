-- Keep manually managed taxonomy rows stable when a content item's legacy arrays are synchronized.
create or replace function public.mcms_sync_content_taxonomy()
returns trigger language plpgsql set search_path=public,private as $$
declare label text; term_id uuid; term_slug text;
begin
 delete from public.mcms_content_categories where content_id=new.id;
 delete from public.mcms_content_tags where content_id=new.id;
 foreach label in array coalesce(new.categories,array[]::text[]) loop
  label:=trim(label);
  if label<>'' then
   select id into term_id from public.mcms_categories where site_id=new.site_id and lower(name)=lower(label) limit 1;
   if term_id is null then
    term_slug:=trim(both '-' from lower(regexp_replace(label,'[^a-zA-Z0-9]+','-','g')));
    if length(term_slug)<2 then term_slug:='topic-'||substr(md5(lower(label)),1,10); end if;
    insert into public.mcms_categories(workspace_id,site_id,name,slug) values(new.workspace_id,new.site_id,label,term_slug)
    on conflict(site_id,slug) do update set name=excluded.name,updated_at=now() returning id into term_id;
   end if;
   insert into public.mcms_content_categories(workspace_id,content_id,category_id) values(new.workspace_id,new.id,term_id) on conflict do nothing;
  end if;
 end loop;
 foreach label in array coalesce(new.tags,array[]::text[]) loop
  label:=trim(label);
  if label<>'' then
   select id into term_id from public.mcms_tags where site_id=new.site_id and lower(name)=lower(label) limit 1;
   if term_id is null then
    term_slug:=trim(both '-' from lower(regexp_replace(label,'[^a-zA-Z0-9]+','-','g')));
    if length(term_slug)<2 then term_slug:='tag-'||substr(md5(lower(label)),1,10); end if;
    insert into public.mcms_tags(workspace_id,site_id,name,slug) values(new.workspace_id,new.site_id,label,term_slug)
    on conflict(site_id,slug) do update set name=excluded.name,updated_at=now() returning id into term_id;
   end if;
   insert into public.mcms_content_tags(workspace_id,content_id,tag_id) values(new.workspace_id,new.id,term_id) on conflict do nothing;
  end if;
 end loop;
 return new;
end; $$;