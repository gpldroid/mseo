-- Add indexes for foreign-key columns frequently used in admin joins and audit queries.
create index if not exists mseo_audit_logs_actor_id_idx on public.mseo_audit_logs (actor_id);
create index if not exists mseo_content_items_created_by_idx on public.mseo_content_items (created_by);
create index if not exists mseo_content_items_updated_by_idx on public.mseo_content_items (updated_by);
create index if not exists mseo_content_revisions_changed_by_idx on public.mseo_content_revisions (changed_by);
