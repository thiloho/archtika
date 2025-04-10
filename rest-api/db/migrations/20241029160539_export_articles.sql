-- migrate:up
CREATE FUNCTION api.export_articles_zip (website_id UUID)
  RETURNS "*/*"
  AS $$
DECLARE
  _has_access BOOLEAN;
  _headers TEXT;
  _article RECORD;
  _markdown_dir TEXT := '/tmp/website-' || export_articles_zip.website_id;
BEGIN
  _has_access = internal.user_has_website_access (export_articles_zip.website_id, 20);
  SELECT
    FORMAT('[{ "Content-Type": "application/gzip" },'
    '{ "Content-Disposition": "attachment; filename=\"%s\"" }]', 'archtika-export-articles-' || export_articles_zip.website_id || '.tar.gz') INTO _headers;
  PERFORM
    SET_CONFIG('response.headers', _headers, TRUE);
  EXECUTE FORMAT('COPY (SELECT 1) TO PROGRAM ''mkdir -p %s''', _markdown_dir || '/articles');
  FOR _article IN (
    SELECT
      a.id,
      a.website_id,
      a.slug,
      a.main_content
    FROM
      internal.article AS a
    WHERE
      a.website_id = export_articles_zip.website_id)
    LOOP
      EXECUTE FORMAT('COPY (SELECT %L) TO ''%s'' WITH (FORMAT CSV)', COALESCE(_article.main_content, 'No content yet'), _markdown_dir || '/articles/' || _article.slug || '.md');
      EXECUTE FORMAT('COPY (SELECT 1) TO PROGRAM ''sed -i "s/^\"//;s/\"$//;s/\"\"/\"/g" %s''', _markdown_dir || '/articles/' || _article.slug || '.md');
    END LOOP;
  EXECUTE FORMAT('COPY (SELECT 1) TO PROGRAM ''tar -czf %s -C %s articles && rm %s''', _markdown_dir || '/export.tar.gz', _markdown_dir, _markdown_dir || '/articles/*.md');
  RETURN PG_READ_BINARY_FILE(_markdown_dir || '/export.tar.gz');
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION api.export_articles_zip TO authenticated_user;

-- migrate:down
