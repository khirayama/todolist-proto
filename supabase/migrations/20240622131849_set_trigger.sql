-- inserts a row into public."Profile"
create function public.handle_new_user_for_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public."Profile" ("userId")
  values (new.id);
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created_for_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user_for_profile();


-- inserts a row into public."App"
create function public.handle_new_user_app()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public."App" ("userId")
  values (new.id);
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created_for_app
  after insert on auth.users
  for each row execute procedure public.handle_new_user_app();


-- inserts a row into public."Preferences"
create function public.handle_new_user_preferences()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public."Preferences" ("userId")
  values (new.id);
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created_for_preferences
  after insert on auth.users
  for each row execute procedure public.handle_new_user_preferences();


-- delete a row into public."Profile"
create function public.handle_deleted_user_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  delete from public."Profile" where "userId" = old.id;
  return old;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_deleted_for_profile
  after delete on auth.users
  for each row execute function public.handle_deleted_user_profile();


-- delete a row into public."App"
create function public.handle_deleted_user_app()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  delete from public."App" where "userId" = old.id;
  return old;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_deleted_for_app
  after delete on auth.users
  for each row execute function public.handle_deleted_user_app();


-- delete a row into public."Preferences"
create function public.handle_deleted_user_preferences()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  delete from public."Preferences" where "userId" = old.id;
  return old;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_deleted_for_preferences
  after delete on auth.users
  for each row execute function public.handle_deleted_user_preferences();
