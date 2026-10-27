-- Applied on nuxt3-ShortenIt-v2 (aqvqiwmcthljqzyhclmk) as migration
-- links_url_and_key_check_constraints.
-- Mirrors server/api validation so direct REST writes cannot store invalid keys/URLs.
-- Anonymous SELECT redirects and service_role demo inserts remain allowed.

alter table public.links
  add constraint links_key_format_check
  check (
    key ~ '^[A-Za-z0-9_-]+$'
    and lower(key) not in (
      'try', 'dashboard', 'auth', 'api', 'login', 'register', '_nuxt', 'favicon.ico'
    )
  );

alter table public.links
  add constraint links_long_url_http_check
  check (
    long_url is not null
    and long_url ~* '^https?://'
  );
