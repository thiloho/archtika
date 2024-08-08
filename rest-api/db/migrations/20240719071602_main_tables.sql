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

CREATE TABLE internal.website (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES internal.user(id) ON DELETE CASCADE NOT NULL DEFAULT (current_setting('request.jwt.claims', true)::JSON->>'user_id')::UUID,
  content_type VARCHAR(10) CHECK (content_type IN ('Blog', 'Docs')) NOT NULL,
  title VARCHAR(50) NOT NULL CHECK (trim(title) != ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user(id) ON DELETE SET NULL
);

CREATE TABLE internal.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES internal.website(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES internal.user(id) ON DELETE CASCADE NOT NULL DEFAULT (current_setting('request.jwt.claims', true)::JSON->>'user_id')::UUID,
  original_name TEXT NOT NULL,
  file_system_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP()
);

CREATE TABLE internal.settings (
  website_id UUID PRIMARY KEY REFERENCES internal.website(id) ON DELETE CASCADE,
  accent_color_light_theme CHAR(7) CHECK (accent_color_light_theme ~ '^#[a-fA-F0-9]{6}$') NOT NULL DEFAULT '#a5d8ff',
  accent_color_dark_theme CHAR(7) CHECK (accent_color_dark_theme ~ '^#[a-fA-F0-9]{6}$') NOT NULL DEFAULT '#114678',
  favicon_image UUID REFERENCES internal.media(id) ON DELETE SET NULL,
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user(id) ON DELETE SET NULL
);

CREATE TABLE internal.header (
  website_id UUID PRIMARY KEY REFERENCES internal.website(id) ON DELETE CASCADE,
  logo_type TEXT CHECK (logo_type IN ('text', 'image')) NOT NULL DEFAULT 'text',
  logo_text VARCHAR(50),
  logo_image UUID REFERENCES internal.media(id) ON DELETE SET NULL,
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user(id) ON DELETE SET NULL,
  CONSTRAINT logo_content_check CHECK (
    (logo_type = 'text' AND logo_text IS NOT NULL AND trim(logo_text) != '') OR
    (logo_type = 'image' AND logo_image IS NOT NULL)
  )
);

CREATE TABLE internal.home (
  website_id UUID PRIMARY KEY REFERENCES internal.website(id) ON DELETE CASCADE,
  main_content TEXT NOT NULL CHECK (trim(main_content) != ''),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user(id) ON DELETE SET NULL
);

CREATE TABLE internal.article (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES internal.website(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES internal.user(id) ON DELETE SET NULL,
  title VARCHAR(100) NOT NULL CHECK (trim(title) != ''),
  meta_description VARCHAR(250) CHECK (trim(meta_description) != ''),
  meta_author VARCHAR(100) CHECK (trim(meta_author) != ''),
  cover_image UUID REFERENCES internal.media(id) ON DELETE SET NULL,
  publication_date DATE NOT NULL DEFAULT CURRENT_DATE,
  main_content TEXT CHECK (trim(main_content) != ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user(id) ON DELETE SET NULL
);

CREATE TABLE internal.footer (
  website_id UUID PRIMARY KEY REFERENCES internal.website(id) ON DELETE CASCADE,
  additional_text VARCHAR(250) NOT NULL CHECK (trim(additional_text) != ''),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user(id) ON DELETE SET NULL
);

CREATE TABLE internal.collab (
  website_id UUID REFERENCES internal.website(id) ON DELETE CASCADE,
  user_id UUID REFERENCES internal.user(id) ON DELETE CASCADE,
  permission_level INTEGER CHECK (permission_level IN (10, 20, 30)) NOT NULL DEFAULT 10,
  added_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user(id) ON DELETE SET NULL,
  PRIMARY KEY (website_id, user_id)
);

CREATE TABLE internal.change_log (
  website_id UUID REFERENCES internal.website(id) ON DELETE CASCADE,
  user_id UUID REFERENCES internal.user(id) ON DELETE CASCADE DEFAULT (current_setting('request.jwt.claims', true)::JSON->>'user_id')::UUID,
  change_summary VARCHAR(255) NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  PRIMARY KEY (website_id, user_id, timestamp)
);

-- migrate:down
DROP TABLE internal.change_log;
DROP TABLE internal.collab;
DROP TABLE internal.footer;
DROP TABLE internal.article;
DROP TABLE internal.home;
DROP TABLE internal.header;
DROP TABLE internal.settings;
DROP TABLE internal.media;
DROP TABLE internal.website;
DROP SCHEMA api;

DROP TABLE internal.user;
DROP SCHEMA internal;

DROP ROLE authenticator;
DROP ROLE anon;
DROP ROLE authenticated_user;