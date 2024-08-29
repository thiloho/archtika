-- migrate:up
ALTER TABLE internal.article
  ADD COLUMN article_weight INTEGER CHECK (article_weight IS NULL
    OR article_weight >= 0);

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
  category,
  article_weight -- New column
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
  last_modified_by,
  title_description_search,
  category
FROM
  internal.article;

ALTER TABLE internal.article
  DROP COLUMN article_weight;

