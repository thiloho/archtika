-- migrate:up
CREATE EXTENSION unaccent;

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

CREATE FUNCTION internal.generate_slug (TEXT)
  RETURNS TEXT
  AS $$
BEGIN
  IF $1 ~ '[/\\.]' THEN
    RAISE invalid_parameter_value
    USING message = 'Title cannot contain "/", "\" or "."';
  END IF;
    RETURN REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(LOWER(TRIM(REGEXP_REPLACE(unaccent ($1), '\s+', '-', 'g'))), '[^\w-]', '', 'g'), '-+', '-', 'g'), '^-+', '', 'g'), '-+$', '', 'g');
END;
$$
LANGUAGE plpgsql
IMMUTABLE;

GRANT EXECUTE ON FUNCTION internal.generate_slug TO authenticated_user;

CREATE TABLE internal.user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  username VARCHAR(16) UNIQUE NOT NULL CHECK (LENGTH(username) >= 3 AND username ~ '^[a-zA-Z0-9_-]+$'),
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
  slug VARCHAR(50) GENERATED ALWAYS AS (internal.generate_slug (title)) STORED,
  max_storage_size INT NOT NULL DEFAULT CURRENT_SETTING('app.website_max_storage_size') ::INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user (id) ON DELETE SET NULL,
  UNIQUE (user_id, slug)
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
  category_name VARCHAR(50) NOT NULL CHECK (TRIM(category_name) != '' AND category_name != 'Uncategorized'),
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
  slug VARCHAR(100) GENERATED ALWAYS AS (internal.generate_slug (title)) STORED,
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
  UNIQUE (website_id, slug),
  UNIQUE (website_id, category, article_weight)
);

CREATE TABLE internal.footer (
  website_id UUID PRIMARY KEY REFERENCES internal.website (id) ON DELETE CASCADE,
  additional_text VARCHAR(250) NOT NULL CHECK (TRIM(additional_text) != ''),
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
