-- migrate:up
CREATE VIEW api.account WITH ( security_invoker = ON
) AS
SELECT
  id,
  username
FROM
  internal.user
WHERE
  id = (
    CURRENT_SETTING(
      'request.jwt.claims', TRUE
)::JSON ->> 'user_id')::UUID;

CREATE VIEW api.user WITH ( security_invoker = ON
) AS
SELECT
  id,
  username
FROM
  internal.user;

CREATE VIEW api.website WITH ( security_invoker = ON
) AS
SELECT
  id,
  user_id,
  content_type,
  title,
  created_at,
  last_modified_at,
  last_modified_by
FROM
  internal.website;

CREATE VIEW api.media WITH ( security_invoker = ON
) AS
SELECT
  id,
  website_id,
  user_id,
  original_name,
  file_system_path,
  created_at
FROM
  internal.media;

CREATE VIEW api.settings WITH ( security_invoker = ON
) AS
SELECT
  website_id,
  accent_color_light_theme,
  accent_color_dark_theme,
  favicon_image,
  last_modified_at,
  last_modified_by
FROM
  internal.settings;

CREATE VIEW api.header WITH ( security_invoker = ON
) AS
SELECT
  website_id,
  logo_type,
  logo_text,
  logo_image,
  last_modified_at,
  last_modified_by
FROM
  internal.header;

CREATE VIEW api.home WITH ( security_invoker = ON
) AS
SELECT
  website_id,
  main_content,
  last_modified_at,
  last_modified_by
FROM
  internal.home;

CREATE VIEW api.article WITH ( security_invoker = ON
) AS
SELECT
  id,
  website_id,
  user_id,
  title,
  meta_description,
  meta_author,
  cover_image,
  publication_date,
  main_content,
  created_at,
  last_modified_at,
  last_modified_by
FROM
  internal.article;

CREATE VIEW api.footer WITH ( security_invoker = ON
) AS
SELECT
  website_id,
  additional_text,
  last_modified_at,
  last_modified_by
FROM
  internal.footer;

CREATE VIEW api.collab WITH ( security_invoker = ON
) AS
SELECT
  website_id,
  user_id,
  permission_level,
  added_at,
  last_modified_at,
  last_modified_by
FROM
  internal.collab;

CREATE VIEW api.change_log WITH ( security_invoker = ON
) AS
SELECT
  website_id,
  user_id,
  change_summary,
  previous_value,
  new_value,
  timestamp
FROM
  internal.change_log;

CREATE FUNCTION api.create_website (content_type VARCHAR(10), title VARCHAR(50), OUT website_id UUID)
AS $$
DECLARE
  _website_id UUID;
  _user_id UUID;
BEGIN
  _user_id := (CURRENT_SETTING('request.jwt.claims', TRUE)::JSON ->> 'user_id')::UUID;
  INSERT INTO internal.website (content_type, title)
    VALUES (create_website.content_type, create_website.title)
  RETURNING
    id INTO _website_id;
  INSERT INTO internal.settings (website_id)
    VALUES (_website_id);
  INSERT INTO internal.header (website_id, logo_text)
    VALUES (_website_id, 'archtika ' || create_website.content_type);
  INSERT INTO internal.home (website_id, main_content)
    VALUES (_website_id, '
## About

archtika is a FLOSS, modern, performant and lightweight CMS (Content Mangement System) in the form of a web application. It allows you to easily create, manage and publish minimal, responsive and SEO friendly blogging and documentation websites with official, professionally designed templates.

It is also possible to add contributors to your sites, which is very useful for larger projects where, for example, several people are constantly working on the documentation.

## How it works

For the backend, PostgreSQL is used in combination with PostgREST to create a RESTful API. JSON web tokens along with row-level security control authentication and authorisation flows.

The web application uses SvelteKit with SSR (Server Side Rendering) and Svelte version 5, currently in beta.

NGINX is used to deploy the websites, serving the static site files from the `/var/www/archtika-websites` directory. The static files can be found in this directory via the path `<user_id>/<website_id>`, which is dynamically created by the web application.
  ');
  INSERT INTO internal.footer (website_id, additional_text)
    VALUES (_website_id, 'archtika is a free, open, modern, performant and lightweight CMS');
  website_id := _website_id;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION api.create_website (VARCHAR(10), VARCHAR(50)) TO authenticated_user;

-- Security invoker only works on views if the user has access to the underlying table
GRANT SELECT ON internal.user TO authenticated_user;

GRANT SELECT ON api.account TO authenticated_user;

GRANT SELECT ON api.user TO authenticated_user;

GRANT SELECT, UPDATE, DELETE ON internal.website TO authenticated_user;

GRANT SELECT, UPDATE, DELETE ON api.website TO authenticated_user;

GRANT SELECT, INSERT ON internal.media TO authenticated_user;

GRANT SELECT, INSERT ON api.media TO authenticated_user;

GRANT SELECT, UPDATE ON internal.settings TO authenticated_user;

GRANT SELECT, UPDATE ON api.settings TO authenticated_user;

GRANT SELECT, UPDATE ON internal.header TO authenticated_user;

GRANT SELECT, UPDATE ON api.header TO authenticated_user;

GRANT SELECT, UPDATE ON internal.home TO authenticated_user;

GRANT SELECT, UPDATE ON api.home TO authenticated_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON internal.article TO authenticated_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON api.article TO authenticated_user;

GRANT SELECT, UPDATE ON internal.footer TO authenticated_user;

GRANT SELECT, UPDATE ON api.footer TO authenticated_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON internal.collab TO authenticated_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON api.collab TO authenticated_user;

GRANT SELECT ON internal.change_log TO authenticated_user;

GRANT SELECT ON api.change_log TO authenticated_user;

-- migrate:down
REVOKE SELECT ON internal.user FROM authenticated_user;

REVOKE SELECT, UPDATE, DELETE ON internal.website FROM authenticated_user;

REVOKE SELECT, INSERT ON internal.media FROM authenticated_user;

REVOKE SELECT, UPDATE ON internal.settings FROM authenticated_user;

REVOKE SELECT, UPDATE ON internal.header FROM authenticated_user;

REVOKE SELECT, INSERT, UPDATE, DELETE ON internal.article FROM authenticated_user;

REVOKE SELECT, UPDATE ON internal.footer FROM authenticated_user;

REVOKE SELECT, INSERT, UPDATE, DELETE ON internal.collab FROM authenticated_user;

REVOKE SELECT ON internal.change_log FROM authenticated_user;

DROP FUNCTION api.create_website (VARCHAR(10), VARCHAR(50));

DROP VIEW api.change_log;

DROP VIEW api.collab;

DROP VIEW api.footer;

DROP VIEW api.home;

DROP VIEW api.article;

DROP VIEW api.header;

DROP VIEW api.settings;

DROP VIEW api.media;

DROP VIEW api.website;

DROP VIEW api.user;

DROP VIEW api.account;

