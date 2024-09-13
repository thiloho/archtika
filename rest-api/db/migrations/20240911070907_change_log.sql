-- migrate:up
CREATE EXTENSION hstore;

CREATE TABLE internal.change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  website_id UUID REFERENCES internal.website (id) ON DELETE CASCADE,
  user_id UUID REFERENCES internal.user (id) ON DELETE CASCADE DEFAULT (CURRENT_SETTING('request.jwt.claims', TRUE)::JSON ->> 'user_id') ::UUID,
  tstamp TIMESTAMPTZ NOT NULL DEFAULT CLOCK_TIMESTAMP(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_value HSTORE,
  new_value HSTORE
);

CREATE FUNCTION internal.track_changes ()
  RETURNS TRIGGER
  AS $$
DECLARE
  _website_id UUID;
BEGIN
  IF TG_TABLE_NAME = 'website' THEN
    IF (to_jsonb (OLD.*) - 'last_modified_at') = (to_jsonb (NEW.*) - 'last_modified_at') OR (to_jsonb (OLD.*) - 'last_modified_by') = (to_jsonb (NEW.*) - 'last_modified_by') THEN
      RETURN NEW;
    END IF;
    _website_id := NEW.id;
  ELSE
    _website_id := COALESCE(NEW.website_id, OLD.website_id);
  END IF;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO internal.change_log (website_id, table_name, operation, new_value)
      VALUES (_website_id, TG_TABLE_NAME, TG_OP, HSTORE (NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE'
      AND EXISTS (
        SELECT
          id
        FROM
          internal.website
        WHERE
          id = _website_id) THEN
      INSERT INTO internal.change_log (website_id, table_name, operation, old_value, new_value)
        VALUES (_website_id, TG_TABLE_NAME, TG_OP, HSTORE (OLD) - HSTORE (NEW), HSTORE (NEW) - HSTORE (OLD));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE'
      AND EXISTS (
        SELECT
          id
        FROM
          internal.website
        WHERE
          id = _website_id) THEN
      INSERT INTO internal.change_log (website_id, table_name, operation, old_value)
        VALUES (_website_id, TG_TABLE_NAME, TG_OP, HSTORE (OLD));
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE TRIGGER website_track_changes
  AFTER UPDATE ON internal.website
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE TRIGGER settings_track_changes
  AFTER UPDATE ON internal.settings
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE TRIGGER header_track_changes
  AFTER UPDATE ON internal.header
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE TRIGGER home_track_changes
  AFTER UPDATE ON internal.home
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE TRIGGER article_track_changes
  AFTER INSERT OR UPDATE OR DELETE ON internal.article
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE TRIGGER docs_category_track_changes
  AFTER INSERT OR UPDATE OR DELETE ON internal.docs_category
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE TRIGGER footer_track_changes
  AFTER UPDATE ON internal.footer
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE TRIGGER legal_information_track_changes
  AFTER INSERT OR UPDATE OR DELETE ON internal.legal_information
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE TRIGGER collab_track_changes
  AFTER INSERT OR UPDATE OR DELETE ON internal.collab
  FOR EACH ROW
  EXECUTE FUNCTION internal.track_changes ();

CREATE VIEW api.change_log WITH ( security_invoker = ON
) AS
SELECT
  *
FROM
  internal.change_log;

GRANT SELECT ON internal.change_log TO authenticated_user;

GRANT SELECT ON api.change_log TO authenticated_user;

-- migrate:down
DROP TRIGGER website_track_changes ON internal.website;

DROP TRIGGER settings_track_changes ON internal.settings;

DROP TRIGGER header_track_changes ON internal.header;

DROP TRIGGER home_track_changes ON internal.home;

DROP TRIGGER article_track_changes ON internal.article;

DROP TRIGGER docs_category_track_changes ON internal.docs_category;

DROP TRIGGER footer_track_changes ON internal.footer;

DROP TRIGGER legal_information_track_changes ON internal.legal_information;

DROP TRIGGER collab_track_changes ON internal.collab;

DROP FUNCTION internal.track_changes ();

DROP VIEW api.change_log;

DROP TABLE internal.change_log;

DROP EXTENSION hstore;

