-- migrate:up
CREATE SCHEMA internal;

CREATE SCHEMA api;

CREATE ROLE authenticator LOGIN NOINHERIT NOCREATEDB NOCREATEROLE NOSUPERUSER;

CREATE ROLE anon NOLOGIN NOINHERIT;

CREATE ROLE authenticated_user NOLOGIN NOINHERIT;

CREATE ROLE administrator NOLOGIN;

GRANT anon TO authenticator;

GRANT authenticated_user TO authenticator;

GRANT administrator TO authenticator;

GRANT authenticated_user TO administrator;

GRANT USAGE ON SCHEMA api TO anon;

GRANT USAGE ON SCHEMA api TO authenticated_user;

GRANT USAGE ON SCHEMA internal TO authenticated_user;

ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

CREATE TABLE internal.user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  username VARCHAR(16) UNIQUE NOT NULL CHECK (LENGTH(username) >= 3),
  password_hash CHAR(60) NOT NULL,
  user_role NAME NOT NULL DEFAULT 'authenticated_user',
  max_number_websites INT NOT NULL DEFAULT CURRENT_SETTING('app.website_max_number_user') ::INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP()
);

CREATE TABLE internal.website (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id UUID REFERENCES internal.user (id) ON DELETE CASCADE NOT NULL DEFAULT (CURRENT_SETTING('request.jwt.claims', TRUE)::JSON ->> 'user_id') ::UUID,
  content_type VARCHAR(10) CHECK (content_type IN ('Blog', 'Docs')) NOT NULL,
  title VARCHAR(50) NOT NULL CHECK (TRIM(title) != ''),
  max_storage_size INT NOT NULL DEFAULT CURRENT_SETTING('app.website_max_storage_size') ::INT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user (id) ON DELETE SET NULL
);

CREATE TABLE internal.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  website_id UUID REFERENCES internal.website (id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES internal.user (id) ON DELETE SET NULL DEFAULT (CURRENT_SETTING('request.jwt.claims', TRUE)::JSON ->> 'user_id') ::UUID,
  blob BYTEA NOT NULL,
  mimetype TEXT NOT NULL,
  original_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP()
);

CREATE TABLE internal.settings (
  website_id UUID PRIMARY KEY REFERENCES internal.website (id) ON DELETE CASCADE,
  accent_color_dark_theme CHAR(7) CHECK (accent_color_light_theme ~ '^#[a-fA-F0-9]{6}$') NOT NULL DEFAULT '#a5d8ff',
  accent_color_light_theme CHAR(7) CHECK (accent_color_dark_theme ~ '^#[a-fA-F0-9]{6}$') NOT NULL DEFAULT '#114678',
  background_color_dark_theme CHAR(7) CHECK (accent_color_light_theme ~ '^#[a-fA-F0-9]{6}$') NOT NULL DEFAULT '#262626',
  background_color_light_theme CHAR(7) CHECK (accent_color_dark_theme ~ '^#[a-fA-F0-9]{6}$') NOT NULL DEFAULT '#ffffff',
  favicon_image UUID REFERENCES internal.media (id) ON DELETE SET NULL,
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user (id) ON DELETE SET NULL
);

CREATE TABLE internal.header (
  website_id UUID PRIMARY KEY REFERENCES internal.website (id) ON DELETE CASCADE,
  logo_type TEXT CHECK (logo_type IN ('text', 'image')) NOT NULL DEFAULT 'text',
  logo_text VARCHAR(50),
  logo_image UUID REFERENCES internal.media (id) ON DELETE SET NULL,
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user (id) ON DELETE SET NULL,
  CONSTRAINT logo_content_check CHECK ((logo_type = 'text' AND logo_text IS NOT NULL AND TRIM(logo_text) != '') OR (logo_type = 'image' AND logo_image IS NOT NULL))
);

CREATE TABLE internal.home (
  website_id UUID PRIMARY KEY REFERENCES internal.website (id) ON DELETE CASCADE,
  main_content VARCHAR(200000) NOT NULL CHECK (TRIM(main_content) != ''),
  meta_description VARCHAR(250) CHECK (TRIM(meta_description) != ''),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user (id) ON DELETE SET NULL
);

CREATE TABLE internal.docs_category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  website_id UUID REFERENCES internal.website (id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES internal.user (id) ON DELETE SET NULL DEFAULT (CURRENT_SETTING('request.jwt.claims', TRUE)::JSON ->> 'user_id') ::UUID,
  category_name VARCHAR(50) NOT NULL CHECK (TRIM(category_name) != ''),
  category_weight INT CHECK (category_weight >= 0) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user (id) ON DELETE SET NULL,
  UNIQUE (website_id, category_name),
  UNIQUE (website_id, category_weight)
);

CREATE TABLE internal.article (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  website_id UUID REFERENCES internal.website (id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES internal.user (id) ON DELETE SET NULL DEFAULT (CURRENT_SETTING('request.jwt.claims', TRUE)::JSON ->> 'user_id') ::UUID,
  title VARCHAR(100) NOT NULL CHECK (TRIM(title) != ''),
  meta_description VARCHAR(250) CHECK (TRIM(meta_description) != ''),
  meta_author VARCHAR(100) CHECK (TRIM(meta_author) != ''),
  cover_image UUID REFERENCES internal.media (id) ON DELETE SET NULL,
  publication_date DATE,
  main_content VARCHAR(200000) CHECK (TRIM(main_content) != ''),
  category UUID REFERENCES internal.docs_category (id) ON DELETE SET NULL,
  article_weight INT CHECK (article_weight IS NULL OR article_weight >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user (id) ON DELETE SET NULL,
  UNIQUE (website_id, category, article_weight)
);

CREATE TABLE internal.footer (
  website_id UUID PRIMARY KEY REFERENCES internal.website (id) ON DELETE CASCADE,
  additional_text VARCHAR(250) NOT NULL CHECK (TRIM(additional_text) != ''),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user (id) ON DELETE SET NULL
);

CREATE TABLE internal.legal_information (
  website_id UUID PRIMARY KEY REFERENCES internal.website (id) ON DELETE CASCADE,
  main_content VARCHAR(200000) NOT NULL CHECK (TRIM(main_content) != ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user (id) ON DELETE SET NULL
);

CREATE TABLE internal.collab (
  website_id UUID REFERENCES internal.website (id) ON DELETE CASCADE,
  user_id UUID REFERENCES internal.user (id) ON DELETE CASCADE,
  permission_level INT CHECK (permission_level IN (10, 20, 30)) NOT NULL DEFAULT 10,
  added_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user (id) ON DELETE SET NULL,
  PRIMARY KEY (website_id, user_id)
);

-- migrate:down
DROP TABLE internal.collab;

DROP TABLE internal.legal_information;

DROP TABLE internal.footer;

DROP TABLE internal.article;

DROP TABLE internal.docs_category;

DROP TABLE internal.home;

DROP TABLE internal.header;

DROP TABLE internal.settings;

DROP TABLE internal.media;

DROP TABLE internal.website;

DROP TABLE internal.user;

DROP SCHEMA api;

DROP SCHEMA internal;

DROP ROLE anon;

DROP ROLE authenticated_user;

DROP ROLE administrator;

DROP ROLE authenticator;

ALTER DEFAULT PRIVILEGES GRANT EXECUTE ON FUNCTIONS TO PUBLIC;

