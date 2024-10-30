-- migrate:up
CREATE FUNCTION internal.cleanup_filesystem ()
  RETURNS TRIGGER
  AS $$
DECLARE
  _website_id UUID;
  _domain_prefix VARCHAR(16);
  _base_path CONSTANT TEXT := '/var/www/archtika-websites/';
  _preview_path TEXT;
  _prod_path TEXT;
  _article_slug TEXT;
BEGIN
  IF TG_TABLE_NAME = 'website' THEN
    _website_id := OLD.id;
  ELSE
    _website_id := OLD.website_id;
  END IF;
  SELECT
    d.prefix INTO _domain_prefix
  FROM
    internal.domain_prefix AS d
  WHERE
    d.website_id = _website_id;
  _preview_path := _base_path || 'previews/' || _website_id;
  _prod_path := _base_path || COALESCE(_domain_prefix, _website_id::TEXT);
  IF TG_TABLE_NAME = 'website' THEN
    EXECUTE FORMAT('COPY (SELECT '''') TO PROGRAM ''rm -rf %s''', _preview_path);
    EXECUTE FORMAT('COPY (SELECT '''') TO PROGRAM ''rm -rf %s''', _prod_path);
  ELSIF TG_TABLE_NAME = 'article' THEN
    SELECT
      a.slug INTO _article_slug
    FROM
      internal.article AS a
    WHERE
      a.id = OLD.id;
    EXECUTE FORMAT('COPY (SELECT '''') TO PROGRAM ''rm -f %s/articles/%s.html''', _preview_path, _article_slug);
    EXECUTE FORMAT('COPY (SELECT '''') TO PROGRAM ''rm -f %s/articles/%s.html''', _prod_path, _article_slug);
  ELSIF TG_TABLE_NAME = 'legal_information' THEN
    EXECUTE FORMAT('COPY (SELECT '''') TO PROGRAM ''rm -f %s/legal-information.html''', _preview_path);
    EXECUTE FORMAT('COPY (SELECT '''') TO PROGRAM ''rm -f %s/legal-information.html''', _prod_path);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE TRIGGER _cleanup_filesystem_website
  BEFORE DELETE ON internal.website
  FOR EACH ROW
  EXECUTE FUNCTION internal.cleanup_filesystem ();

CREATE TRIGGER _cleanup_filesystem_article
  BEFORE UPDATE OR DELETE ON internal.article
  FOR EACH ROW
  EXECUTE FUNCTION internal.cleanup_filesystem ();

CREATE TRIGGER _cleanup_filesystem_legal_information
  BEFORE DELETE ON internal.legal_information
  FOR EACH ROW
  EXECUTE FUNCTION internal.cleanup_filesystem ();

-- migrate:down
DROP TRIGGER _cleanup_filesystem_website ON internal.website;

DROP TRIGGER _cleanup_filesystem_article ON internal.article;

DROP TRIGGER _cleanup_filesystem_legal_information ON internal.legal_information;

DROP FUNCTION internal.cleanup_filesystem;

