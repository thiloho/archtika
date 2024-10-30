-- migrate:up
CREATE TABLE internal.domain_prefix (
  website_id UUID PRIMARY KEY REFERENCES internal.website (id) ON DELETE CASCADE,
  prefix VARCHAR(16) UNIQUE NOT NULL CHECK (LENGTH(prefix) >= 3 AND prefix ~ '^[a-z]+(-[a-z]+)*$' AND prefix != 'previews'),
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

GRANT SELECT ON internal.domain_prefix TO authenticated_user;

GRANT SELECT ON api.domain_prefix TO authenticated_user;

ALTER TABLE internal.domain_prefix ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_domain_prefix ON internal.domain_prefix
  FOR SELECT
    USING (internal.user_has_website_access (website_id, 10));

CREATE FUNCTION api.set_domain_prefix (website_id UUID, prefix VARCHAR(16), OUT was_set BOOLEAN)
AS $$
DECLARE
  _has_access BOOLEAN;
  _old_domain_prefix VARCHAR(16);
  _base_path CONSTANT TEXT := '/var/www/archtika-websites/';
  _old_path TEXT;
  _new_path TEXT;
BEGIN
  _has_access = internal.user_has_website_access (set_domain_prefix.website_id, 30);
  SELECT
    d.prefix INTO _old_domain_prefix
  FROM
    internal.domain_prefix AS d
  WHERE
    d.website_id = set_domain_prefix.website_id;
  INSERT INTO internal.domain_prefix (website_id, prefix)
    VALUES (set_domain_prefix.website_id, set_domain_prefix.prefix)
  ON CONFLICT ON CONSTRAINT domain_prefix_pkey
    DO UPDATE SET
      prefix = EXCLUDED.prefix;
  _old_path = _base_path || COALESCE(_old_domain_prefix, set_domain_prefix.website_id::TEXT);
  _new_path = _base_path || set_domain_prefix.prefix;
  IF _old_path != _new_path THEN
    EXECUTE FORMAT('COPY (SELECT '''') TO PROGRAM ''mv -T %s %s''', _old_path, _new_path);
  END IF;
  was_set := TRUE;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION api.set_domain_prefix TO authenticated_user;

CREATE FUNCTION api.delete_domain_prefix (website_id UUID, OUT was_deleted BOOLEAN)
AS $$
DECLARE
  _has_access BOOLEAN;
  _old_domain_prefix VARCHAR(16);
  _base_path CONSTANT TEXT := '/var/www/archtika-websites/';
  _old_path TEXT;
  _new_path TEXT;
BEGIN
  _has_access = internal.user_has_website_access (delete_domain_prefix.website_id, 30);
  DELETE FROM internal.domain_prefix AS d
  WHERE d.website_id = delete_domain_prefix.website_id
  RETURNING
    prefix INTO _old_domain_prefix;
  _old_path = _base_path || _old_domain_prefix;
  _new_path = _base_path || delete_domain_prefix.website_id;
  EXECUTE FORMAT('COPY (SELECT '''') TO PROGRAM ''mv -T %s %s''', _old_path, _new_path);
  was_deleted := TRUE;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION api.delete_domain_prefix TO authenticated_user;

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

DROP FUNCTION api.set_domain_prefix;

DROP FUNCTION api.delete_domain_prefix;

DROP VIEW api.domain_prefix;

DROP TABLE internal.domain_prefix;

