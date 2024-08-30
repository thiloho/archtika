-- migrate:up
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
  title_search,
  is_published -- New column
FROM
  internal.website;

GRANT SELECT, UPDATE, DELETE ON api.website TO authenticated_user;

-- migrate:down
DROP VIEW api.website;

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
  title_search
FROM
  internal.website;

