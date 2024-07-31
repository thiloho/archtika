-- migrate:up
CREATE SCHEMA api;

CREATE ROLE anon NOLOGIN NOINHERIT;
GRANT USAGE ON SCHEMA api TO anon;

CREATE ROLE authenticated_user NOLOGIN NOINHERIT;
GRANT USAGE ON SCHEMA api TO authenticated_user;

CREATE ROLE authenticator LOGIN NOINHERIT NOCREATEDB NOCREATEROLE NOSUPERUSER;
GRANT anon TO authenticator;
GRANT authenticated_user TO authenticator;

CREATE SCHEMA internal;

CREATE TABLE internal.user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(16) UNIQUE NOT NULL CHECK (length(username) >= 3),
  password_hash CHAR(60) NOT NULL,
  role NAME NOT NULL DEFAULT 'authenticated_user'
);

CREATE TABLE internal.cms_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES internal.user(id) ON DELETE CASCADE NOT NULL DEFAULT (current_setting('request.jwt.claims', true)::JSON->>'user_id')::UUID,
  content_type VARCHAR(10) CHECK (content_type IN ('Blog', 'Docs')) NOT NULL,
  project_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_at TIMESTAMPTZ,
  last_modified_by UUID REFERENCES internal.user(id) ON DELETE SET NULL
);

CREATE TABLE internal.cms_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES internal.cms_content(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES internal.user(id) ON DELETE CASCADE NOT NULL DEFAULT (current_setting('request.jwt.claims', true)::JSON->>'user_id')::UUID,
  original_name TEXT NOT NULL,
  file_system_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP()
);

CREATE TABLE internal.cms_settings (
  content_id UUID PRIMARY KEY REFERENCES internal.cms_content(id) ON DELETE CASCADE,
  accent_color_light_theme CHAR(7) CHECK (accent_color_light_theme ~ '^#[a-fA-F0-9]{6}$') NOT NULL DEFAULT '#a5d8ff',
  accent_color_dark_theme CHAR(7) CHECK (accent_color_dark_theme ~ '^#[a-fA-F0-9]{6}$') NOT NULL DEFAULT '#114678',
  favicon_image UUID REFERENCES internal.cms_media(id) ON DELETE SET NULL,
  last_modified_at TIMESTAMPTZ,
  last_modified_by UUID REFERENCES internal.user(id) ON DELETE SET NULL
);

CREATE TABLE internal.cms_header (
  content_id UUID PRIMARY KEY REFERENCES internal.cms_content(id) ON DELETE CASCADE,
  logo_type TEXT CHECK (logo_type IN ('text', 'image')) NOT NULL DEFAULT 'text',
  logo_text VARCHAR(255),
  logo_image UUID REFERENCES internal.cms_media(id) ON DELETE SET NULL,
  last_modified_at TIMESTAMPTZ,
  last_modified_by UUID REFERENCES internal.user(id) ON DELETE SET NULL
);

CREATE TABLE internal.cms_home (
  content_id UUID PRIMARY KEY REFERENCES internal.cms_content(id) ON DELETE CASCADE,
  main_content TEXT,
  last_modified_at TIMESTAMPTZ,
  last_modified_by UUID REFERENCES internal.user(id) ON DELETE SET NULL
);

CREATE TABLE internal.cms_article (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES internal.cms_content(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  meta_description VARCHAR(500),
  meta_author VARCHAR(255),
  cover_image UUID REFERENCES internal.cms_media(id) ON DELETE SET NULL,
  publication_date DATE NOT NULL DEFAULT CURRENT_DATE,
  main_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_at TIMESTAMPTZ,
  last_modified_by UUID REFERENCES internal.user(id) ON DELETE SET NULL
);

CREATE TABLE internal.cms_footer (
  content_id UUID PRIMARY KEY REFERENCES internal.cms_content(id) ON DELETE CASCADE,
  additional_text VARCHAR(255),
  last_modified_at TIMESTAMPTZ,
  last_modified_by UUID REFERENCES internal.user(id) ON DELETE SET NULL
);

CREATE TABLE internal.cms_collab (
  content_id UUID REFERENCES internal.cms_content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES internal.user(id) ON DELETE CASCADE,
  permission_level INTEGER CHECK (permission_level IN (10, 20, 30)) NOT NULL DEFAULT 10,
  added_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_at TIMESTAMPTZ,
  last_modified_by UUID REFERENCES internal.user(id) ON DELETE SET NULL,
  PRIMARY KEY (content_id, user_id)
);

CREATE TABLE internal.cms_change_log (
  content_id UUID REFERENCES internal.cms_content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES internal.user(id) ON DELETE CASCADE DEFAULT (current_setting('request.jwt.claims', true)::JSON->>'user_id')::UUID,
  change_summary VARCHAR(255) NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  PRIMARY KEY (content_id, user_id, timestamp)
);

-- migrate:down
DROP TABLE internal.cms_change_log;
DROP TABLE internal.cms_collab;
DROP TABLE internal.cms_footer;
DROP TABLE internal.cms_article;
DROP TABLE internal.cms_home;
DROP TABLE internal.cms_header;
DROP TABLE internal.cms_settings;
DROP TABLE internal.cms_media;
DROP TABLE internal.cms_content;
DROP SCHEMA api;

DROP TABLE internal.user;
DROP SCHEMA internal;

DROP ROLE authenticator;
DROP ROLE anon;
DROP ROLE authenticated_user;