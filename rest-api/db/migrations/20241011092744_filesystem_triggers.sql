-- migrate:up
CREATE FUNCTION internal.cleanup_filesystem ()
  RETURNS TRIGGER
  AS $$
DECLARE
  _website_id UUID;
  _domain_prefix VARCHAR(16);
BEGIN
  IF TG_TABLE_NAME = 'website' THEN
    _website_id := OLD.id;
    SELECT
      d.prefix INTO _domain_prefix
    FROM
      internal.domain_prefix AS d
    WHERE
      d.website_id = _website_id;
    EXECUTE FORMAT('COPY (SELECT '''') TO PROGRAM ''rm -rf /var/www/archtika-websites/previews/%s''', _website_id);
    EXECUTE FORMAT('COPY (SELECT '''') TO PROGRAM ''rm -rf /var/www/archtika-websites/%s''', COALESCE(_domain_prefix, _website_id::VARCHAR));
  ELSE
    _website_id := OLD.website_id;
    SELECT
      d.prefix INTO _domain_prefix
    FROM
      internal.domain_prefix AS d
    WHERE
      d.website_id = _website_id;
    EXECUTE FORMAT('COPY (SELECT '''') TO PROGRAM ''rm -rf /var/www/archtika-websites/previews/%s/legal-information.html''', _website_id);
    EXECUTE FORMAT('COPY (SELECT '''') TO PROGRAM ''rm -rf /var/www/archtika-websites/%s/legal-information.html''', COALESCE(_domain_prefix, _website_id::VARCHAR));
  END IF;
  RETURN OLD;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE TRIGGER _cleanup_filesystem_website
  BEFORE DELETE ON internal.website
  FOR EACH ROW
  EXECUTE FUNCTION internal.cleanup_filesystem ();

CREATE TRIGGER _cleanup_filesystem_legal_information
  BEFORE DELETE ON internal.legal_information
  FOR EACH ROW
  EXECUTE FUNCTION internal.cleanup_filesystem ();

-- migrate:down
DROP TRIGGER _cleanup_filesystem_website ON internal.website;

DROP TRIGGER _cleanup_filesystem_legal_information ON internal.legal_information;

DROP FUNCTION internal.cleanup_filesystem;

