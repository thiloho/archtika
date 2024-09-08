-- migrate:up
CREATE TABLE internal.legal_information (
  website_id UUID PRIMARY KEY REFERENCES internal.website (id) ON DELETE CASCADE,
  main_content TEXT NOT NULL CHECK (TRIM(main_content) != ''),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  last_modified_by UUID REFERENCES internal.user (id) ON DELETE SET NULL
);

CREATE VIEW api.legal_information WITH ( security_invoker = ON
) AS
SELECT
  website_id,
  main_content,
  last_modified_at,
  last_modified_by
FROM
  internal.legal_information;

GRANT SELECT, INSERT, UPDATE, DELETE ON internal.legal_information TO authenticated_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON api.legal_information TO authenticated_user;

ALTER TABLE internal.legal_information ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_legal_information ON internal.legal_information
  FOR SELECT
    USING (internal.user_has_website_access (website_id, 10));

CREATE POLICY update_legal_information ON internal.legal_information
  FOR UPDATE
    USING (internal.user_has_website_access (website_id, 30));

CREATE POLICY delete_legal_information ON internal.legal_information
  FOR DELETE
    USING (internal.user_has_website_access (website_id, 30));

CREATE POLICY insert_legal_information ON internal.legal_information
  FOR INSERT
    WITH CHECK (internal.user_has_website_access (website_id, 30));

-- migrate:down
DROP POLICY insert_legal_information ON internal.legal_information;

DROP POLICY delete_legal_information ON internal.legal_information;

DROP POLICY update_legal_information ON internal.legal_information;

DROP POLICY view_legal_information ON internal.legal_information;

ALTER TABLE internal.legal_information DISABLE ROW LEVEL SECURITY;

DROP VIEW api.legal_information;

DROP TABLE internal.legal_information;

