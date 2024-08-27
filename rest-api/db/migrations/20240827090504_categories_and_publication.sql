-- migrate:up
CREATE TABLE internal.docs_category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  website_id UUID REFERENCES internal.website (id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES internal.user (id) ON DELETE SET NULL DEFAULT (CURRENT_SETTING('request.jwt.claims', TRUE)::JSON ->> 'user_id') ::UUID,
  category_name VARCHAR(50) NOT NULL CHECK (TRIM(category_name) != ''),
  category_weight INTEGER CHECK (category_weight >= 0) NOT NULL,
  UNIQUE (website_id, category_name),
  UNIQUE (website_id, category_weight)
);

ALTER TABLE internal.website
  ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE internal.article
  ADD COLUMN category UUID REFERENCES internal.docs_category (id) ON DELETE SET NULL;

ALTER TABLE internal.article
  ALTER COLUMN user_id SET DEFAULT (CURRENT_SETTING('request.jwt.claims', TRUE)::JSON ->> 'user_id')::UUID;

ALTER TABLE internal.docs_category ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_categories ON internal.docs_category
  FOR SELECT
    USING (internal.user_has_website_access (website_id, 10));

CREATE POLICY update_category ON internal.docs_category
  FOR UPDATE
    USING (internal.user_has_website_access (website_id, 20));

CREATE POLICY delete_category ON internal.docs_category
  FOR DELETE
    USING (internal.user_has_website_access (website_id, 20, article_user_id => user_id));

CREATE POLICY insert_category ON internal.docs_category
  FOR INSERT
    WITH CHECK (internal.user_has_website_access (website_id, 20));

CREATE VIEW api.docs_category WITH ( security_invoker = ON
) AS
SELECT
  id,
  website_id,
  user_id,
  category_name,
  category_weight
FROM
  internal.docs_category;

CREATE OR REPLACE VIEW api.article WITH ( security_invoker = ON
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
  last_modified_by,
  title_description_search,
  category -- New column
FROM
  internal.article;

GRANT SELECT, INSERT, UPDATE, DELETE ON internal.docs_category TO authenticated_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON api.docs_category TO authenticated_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON api.article TO authenticated_user;

-- migrate:down
DROP POLICY view_categories ON internal.docs_category;

DROP POLICY update_category ON internal.docs_category;

DROP POLICY delete_category ON internal.docs_category;

DROP POLICY insert_category ON internal.docs_category;

DROP VIEW api.article;

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
  last_modified_by,
  title_description_search
FROM
  internal.article;

DROP VIEW api.docs_category;

ALTER TABLE internal.article
  DROP COLUMN category;

DROP TABLE internal.docs_category;

ALTER TABLE internal.website
  DROP COLUMN is_published;

ALTER TABLE internal.article
  ALTER COLUMN user_id DROP DEFAULT;

