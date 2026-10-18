-- Chạy trong Supabase SQL Editor sau khi tạo bucket private "listing-photos"

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', false)
on conflict (id) do nothing;

-- User chỉ thao tác trong thư mục của mình: {userId}/...
create policy "listing_photos_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "listing_photos_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "listing_photos_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "listing_photos_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
