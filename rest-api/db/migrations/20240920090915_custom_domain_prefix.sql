-- migrate:up
CREATE TABLE internal.domain_prefix (
  website_id UUID PRIMARY KEY REFERENCES internal.website (id) ON DELETE CASCADE,
  prefix VARCHAR(16) UNIQUE NOT NULL CHECK (LENGTH(prefix) >= 3 AND prefix ~ '^[a-z]+(-[a-z]+)*$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user (id) ON DELETE SET NULL
);

CREATE VIEW api.domain_prefix WITH ( security_invoker = ON
) AS
SELECT
  *
FROM
  internal.domain_prefix;

GRANT SELECT, INSERT (website_id, prefix), UPDATE (website_id, prefix), DELETE ON internal.domain_prefix TO authenticated_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON api.domain_prefix TO authenticated_user;

ALTER TABLE internal.domain_prefix ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_domain_prefix ON internal.domain_prefix
  FOR SELECT
    USING (internal.user_has_website_access (website_id, 10));

CREATE POLICY update_domain_prefix ON internal.domain_prefix
  FOR UPDATE
    USING (internal.user_has_website_access (website_id, 30));

CREATE POLICY delete_domain_prefix ON internal.domain_prefix
  FOR DELETE
    USING (internal.user_has_website_access (website_id, 30));

CREATE POLICY insert_domain_prefix ON internal.domain_prefix
  FOR INSERT
    WITH CHECK (internal.user_has_website_access (website_id, 30));

CREATE TRIGGER update_domain_prefix_last_modified
  BEFORE INSERT OR UPDATE OR DELETE ON internal.domain_prefix
  FOR EACH ROW
  EXECUTE FUNCTION internal.update_last_modified ();

CREATE TRIGGER track_changes_domain_prefix
  AFTER INSERT OR UPDATE OR DELETE ON internal.domain_prefix
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

-- migrate:down
DROP TRIGGER track_changes_domain_prefix ON internal.domain_prefix;

DROP TRIGGER update_domain_prefix_last_modified ON internal.domain_prefix;

DROP VIEW api.domain_prefix;

DROP TABLE internal.domain_prefix;

