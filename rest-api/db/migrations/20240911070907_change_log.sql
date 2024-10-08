-- migrate:up
CREATE EXTENSION hstore;

CREATE TABLE internal.change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  website_id UUID REFERENCES internal.website (id) ON DELETE CASCADE,
  user_id UUID REFERENCES internal.user (id) ON DELETE SET NULL DEFAULT (CURRENT_SETTING('request.jwt.claims', TRUE)::JSON ->> 'user_id') ::UUID,
  username VARCHAR(16) NOT NULL DEFAULT (CURRENT_SETTING('request.jwt.claims', TRUE)::JSON ->> 'username'),
  tstamp TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_value HSTORE,
  new_value HSTORE
);

CREATE VIEW api.change_log WITH ( security_invoker = ON
) AS
SELECT
  *
FROM
  internal.change_log;

GRANT SELECT ON internal.change_log TO authenticated_user;

GRANT SELECT ON api.change_log TO authenticated_user;

ALTER TABLE internal.change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_change_log ON internal.change_log
  FOR SELECT
    USING (internal.user_has_website_access (website_id, 10));

CREATE FUNCTION internal.track_changes ()
  RETURNS TRIGGER
  AS $$
DECLARE
  _website_id UUID;
  _user_id UUID := (CURRENT_SETTING('request.jwt.claims', TRUE)::JSON ->> 'user_id')::UUID;
BEGIN
  IF (NOT EXISTS (
    SELECT
      u.id
    FROM
      internal.user AS u
    WHERE
      u.id = _user_id) OR (to_jsonb (OLD.*) - 'last_modified_at' - 'last_modified_by') = (to_jsonb (NEW.*) - 'last_modified_at' - 'last_modified_by')) THEN
    RETURN NULL;
  END IF;
  IF TG_TABLE_NAME = 'website' THEN
    _website_id := NEW.id;
  ELSE
    _website_id := COALESCE(NEW.website_id, OLD.website_id);
  END IF;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO internal.change_log (website_id, table_name, operation, new_value)
      VALUES (_website_id, TG_TABLE_NAME, TG_OP, HSTORE (NEW));
  ELSIF (TG_OP = 'UPDATE'
      AND EXISTS (
        SELECT
          w.id
        FROM
          internal.website AS w
        WHERE
          w.id = _website_id)) THEN
    INSERT INTO internal.change_log (website_id, table_name, operation, old_value, new_value)
      VALUES (_website_id, TG_TABLE_NAME, TG_OP, HSTORE (OLD) - HSTORE (NEW), HSTORE (NEW) - HSTORE (OLD));
  ELSIF (TG_OP = 'DELETE'
      AND EXISTS (
        SELECT
          w.id
        FROM
          internal.website AS w
        WHERE
          w.id = _website_id)) THEN
    INSERT INTO internal.change_log (website_id, table_name, operation, old_value)
      VALUES (_website_id, TG_TABLE_NAME, TG_OP, HSTORE (OLD));
  END IF;
  RETURN NULL;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE TRIGGER track_changes_website
  AFTER UPDATE ON internal.website
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE TRIGGER track_changes_settings
  AFTER UPDATE ON internal.settings
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE TRIGGER track_changes_header
  AFTER UPDATE ON internal.header
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE TRIGGER track_changes_home
  AFTER UPDATE ON internal.home
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE TRIGGER track_changes_article
  AFTER INSERT OR UPDATE OR DELETE ON internal.article
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE TRIGGER track_changes_docs_category
  AFTER INSERT OR UPDATE OR DELETE ON internal.docs_category
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE TRIGGER track_changes_footer
  AFTER UPDATE ON internal.footer
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE TRIGGER track_changes_legal_information
  AFTER INSERT OR UPDATE OR DELETE ON internal.legal_information
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE TRIGGER track_changes_collab
  AFTER INSERT OR UPDATE OR DELETE ON internal.collab
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

-- migrate:down
DROP TRIGGER track_changes_website ON internal.website;

DROP TRIGGER track_changes_settings ON internal.settings;

DROP TRIGGER track_changes_header ON internal.header;

DROP TRIGGER track_changes_home ON internal.home;

DROP TRIGGER track_changes_article ON internal.article;

DROP TRIGGER track_changes_docs_category ON internal.docs_category;

DROP TRIGGER track_changes_footer ON internal.footer;

DROP TRIGGER track_changes_legal_information ON internal.legal_information;

DROP TRIGGER track_changes_collab ON internal.collab;

DROP FUNCTION internal.track_changes;

DROP VIEW api.change_log;

DROP TABLE internal.change_log;

DROP EXTENSION hstore;

