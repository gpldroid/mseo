-- Restrict public media uploads to raster formats. SVG files can contain active content when opened directly.
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
where id = 'mseo-media';

-- Keep the bucket's existing public-read behavior for published media; only upload types are restricted.
