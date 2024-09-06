-- migrate:up
ALTER TABLE internal.website
  ADD COLUMN title_search TSVECTOR GENERATED ALWAYS AS (TO_TSVECTOR('english', title)) STORED;

CREATE OR REPLACE VIEW api.website WITH ( security_invoker = ON
) AS
SELECT
  id,
  user_id,
  content_type,
  title,
  created_at,
  last_modified_at,
  last_modified_by,
  title_search -- New column
FROM
  internal.website;

GRANT SELECT, UPDATE, DELETE ON api.website TO authenticated_user;

ALTER TABLE internal.article
  ADD COLUMN title_description_search TSVECTOR GENERATED ALWAYS AS (TO_TSVECTOR('english', COALESCE(title, '') || ' ' || COALESCE(meta_description, ''))) STORED;

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
  title_description_search -- New column
FROM
  internal.article;

GRANT SELECT, INSERT, UPDATE, DELETE ON api.article TO authenticated_user;

-- migrate:down
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
  last_modified_by
FROM
  internal.article;

ALTER TABLE internal.article
  DROP COLUMN title_description_search;

DROP VIEW api.website;

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

ALTER TABLE internal.website
  DROP COLUMN title_search;

GRANT SELECT, UPDATE, DELETE ON api.website TO authenticated_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON api.article TO authenticated_user;

