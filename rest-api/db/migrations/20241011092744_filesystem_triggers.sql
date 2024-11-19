-- migrate:up
CREATE FUNCTION internal.cleanup_filesystem ()
  RETURNS TRIGGER
  AS $$
DECLARE
  _website_id UUID;
  _website_user_id UUID;
  _website_slug TEXT;
  _username TEXT;
  _base_path CONSTANT TEXT := '/var/www/archtika-websites';
  _preview_path TEXT;
  _prod_path TEXT;
  _article_slug TEXT;
BEGIN
  IF TG_TABLE_NAME = 'website' THEN
    _website_id := OLD.id;
    _website_user_id = OLD.user_id;
    _website_slug := OLD.slug;
  ELSE
    _website_id := OLD.website_id;
  END IF;
  SELECT
    u.username INTO _username
  FROM
    internal.user AS u
  WHERE
    u.id = _website_user_id;
  _preview_path := _base_path || '/previews/' || _website_id;
  _prod_path := _base_path || '/' || _username || '/' || _website_slug;
  IF TG_TABLE_NAME = 'website' THEN
    EXECUTE FORMAT('COPY (SELECT 1) TO PROGRAM ''rm -rf %s''', _preview_path);
    EXECUTE FORMAT('COPY (SELECT 1) TO PROGRAM ''rm -rf %s''', _prod_path);
  ELSIF TG_TABLE_NAME = 'article' THEN
    SELECT
      a.slug INTO _article_slug
    FROM
      internal.article AS a
    WHERE
      a.id = OLD.id;
    EXECUTE FORMAT('COPY (SELECT 1) TO PROGRAM ''rm -f %s/articles/%s.html''', _preview_path, _article_slug);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE TRIGGER _cleanup_filesystem_website
  BEFORE UPDATE OR DELETE ON internal.website
  FOR EACH ROW
  EXECUTE FUNCTION internal.cleanup_filesystem ();

CREATE TRIGGER _cleanup_filesystem_article
  BEFORE UPDATE OR DELETE ON internal.article
  FOR EACH ROW
  EXECUTE FUNCTION internal.cleanup_filesystem ();

-- migrate:down
DROP TRIGGER _cleanup_filesystem_website ON internal.website;

DROP TRIGGER _cleanup_filesystem_article ON internal.article;

DROP FUNCTION internal.cleanup_filesystem;

