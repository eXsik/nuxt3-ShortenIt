-- Read-only: run against the active Supabase project before changing policies.
-- Returns schema/security metadata only, not user records.
select c.relname as table_name, c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as force_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('links', 'clicks');

select tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('links', 'clicks')
order by tablename, policyname;

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('links', 'clicks')
  and grantee in ('anon', 'authenticated', 'service_role')
order by table_name, grantee, privilege_type;

select c.relname as table_name, con.conname, con.convalidated,
       pg_get_constraintdef(con.oid) as definition
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('links', 'clicks')
order by table_name, con.conname;
