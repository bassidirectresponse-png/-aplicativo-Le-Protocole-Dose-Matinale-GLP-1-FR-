create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    id,
    email,
    full_name,
    current_weight,
    target_weight,
    height,
    age,
    previous_diets,
    preferred_language
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', 'Cliente Pink Salt'),
    coalesce((new.raw_user_meta_data->>'current_weight')::numeric, 75),
    coalesce((new.raw_user_meta_data->>'target_weight')::numeric, 65),
    coalesce((new.raw_user_meta_data->>'height')::numeric, 165),
    coalesce((new.raw_user_meta_data->>'age')::integer, 35),
    coalesce(new.raw_user_meta_data->>'previous_diets', 'none'),
    coalesce(new.raw_user_meta_data->>'preferred_language', 'fr')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    current_weight = excluded.current_weight,
    target_weight = excluded.target_weight,
    height = excluded.height,
    age = excluded.age,
    previous_diets = excluded.previous_diets,
    preferred_language = excluded.preferred_language;

  insert into public.weight_entries (user_id, date, weight)
  values (
    new.id,
    current_date,
    coalesce((new.raw_user_meta_data->>'current_weight')::numeric, 75)
  )
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;

create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();
