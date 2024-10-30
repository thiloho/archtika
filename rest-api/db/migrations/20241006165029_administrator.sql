-- migrate:up
CREATE FUNCTION api.user_websites_storage_size ()
  RETURNS TABLE (
    website_id UUID,
    website_title VARCHAR(50),
    storage_size_bytes BIGINT,
    storage_size_pretty TEXT,
    max_storage_bytes BIGINT,
    max_storage_pretty TEXT,
    diff_storage_pretty TEXT
  )
  AS $$
DECLARE
  _user_id UUID := (CURRENT_SETTING('request.jwt.claims', TRUE)::JSON ->> 'user_id')::UUID;
  _tables TEXT[] := ARRAY['article', 'collab', 'docs_category', 'domain_prefix', 'footer', 'header', 'home', 'legal_information', 'media', 'settings', 'change_log'];
  _query TEXT;
  _union_queries TEXT := '';
BEGIN
  FOR i IN 1..ARRAY_LENGTH(_tables, 1)
  LOOP
    _union_queries := _union_queries || FORMAT('
      SELECT SUM(PG_COLUMN_SIZE(t)) FROM internal.%s AS t WHERE t.website_id = w.id', _tables[i]);
    IF i < ARRAY_LENGTH(_tables, 1) THEN
      _union_queries := _union_queries || ' UNION ALL ';
    END IF;
  END LOOP;
  _query := FORMAT('
    SELECT
      w.id AS website_id,
      w.title AS website_title,
      COALESCE(SUM(sizes.total_size), 0)::BIGINT AS storage_size_bytes,
      PG_SIZE_PRETTY(COALESCE(SUM(sizes.total_size), 0)) AS storage_size_pretty,
      (w.max_storage_size::BIGINT * 1024 * 1024) AS max_storage_bytes,
      PG_SIZE_PRETTY(w.max_storage_size::BIGINT * 1024 * 1024) AS max_storage_pretty,
      PG_SIZE_PRETTY((w.max_storage_size::BIGINT * 1024 * 1024) - COALESCE(SUM(sizes.total_size), 0)) AS diff_storage_pretty
    FROM
      internal.website AS w
    LEFT JOIN LATERAL (
      %s
    ) AS sizes(total_size) ON TRUE
    WHERE
      w.user_id = $1
    GROUP BY
      w.id,
      w.title', _union_queries);
  RETURN QUERY EXECUTE _query
  USING _user_id;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION api.user_websites_storage_size TO authenticated_user;

CREATE FUNCTION internal.prevent_website_storage_size_excess ()
  RETURNS TRIGGER
  AS $$
DECLARE
  _website_id UUID := NEW.website_id;
  _current_size BIGINT;
  _size_difference BIGINT := PG_COLUMN_SIZE(NEW) - COALESCE(PG_COLUMN_SIZE(OLD), 0);
  _max_storage_mb INT := (
    SELECT
      w.max_storage_size
    FROM
      internal.website AS w
    WHERE
      w.id = _website_id);
  _max_storage_bytes BIGINT := _max_storage_mb::BIGINT * 1024 * 1024;
  _tables TEXT[] := ARRAY['article', 'collab', 'docs_category', 'domain_prefix', 'footer', 'header', 'home', 'legal_information', 'media', 'settings', 'change_log'];
  _union_queries TEXT := '';
  _query TEXT;
BEGIN
  FOR i IN 1..ARRAY_LENGTH(_tables, 1)
  LOOP
    _union_queries := _union_queries || FORMAT('
      SELECT SUM(PG_COLUMN_SIZE(t)) FROM internal.%s AS t WHERE t.website_id = $1', _tables[i]);
    IF i < ARRAY_LENGTH(_tables, 1) THEN
      _union_queries := _union_queries || ' UNION ALL ';
    END IF;
  END LOOP;
  _query := FORMAT('
    SELECT COALESCE(SUM(sizes.total_size), 0)::BIGINT
    FROM (%s) AS sizes(total_size)', _union_queries);
  EXECUTE _query INTO _current_size
  USING _website_id;
  IF (_current_size + _size_difference) > _max_storage_bytes THEN
    RAISE program_limit_exceeded
    USING message = FORMAT('Storage limit exceeded. Current size: %s, Max size: %s', PG_SIZE_PRETTY(_current_size), PG_SIZE_PRETTY(_max_storage_bytes));
  END IF;
    RETURN NEW;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE TRIGGER _prevent_storage_excess_article
  BEFORE INSERT OR UPDATE ON internal.article
  FOR EACH ROW
  EXECUTE FUNCTION internal.prevent_website_storage_size_excess ();

CREATE TRIGGER _prevent_storage_excess_collab
  BEFORE INSERT OR UPDATE ON internal.collab
  FOR EACH ROW
  EXECUTE FUNCTION internal.prevent_website_storage_size_excess ();

CREATE TRIGGER _prevent_storage_excess_docs_category
  BEFORE INSERT OR UPDATE ON internal.docs_category
  FOR EACH ROW
  EXECUTE FUNCTION internal.prevent_website_storage_size_excess ();

CREATE TRIGGER _prevent_storage_excess_domain_prefix
  BEFORE INSERT OR UPDATE ON internal.domain_prefix
  FOR EACH ROW
  EXECUTE FUNCTION internal.prevent_website_storage_size_excess ();

CREATE TRIGGER _prevent_storage_excess_footer
  BEFORE UPDATE ON internal.footer
  FOR EACH ROW
  EXECUTE FUNCTION internal.prevent_website_storage_size_excess ();

CREATE TRIGGER _prevent_storage_excess_header
  BEFORE UPDATE ON internal.header
  FOR EACH ROW
  EXECUTE FUNCTION internal.prevent_website_storage_size_excess ();

CREATE TRIGGER _prevent_storage_excess_home
  BEFORE UPDATE ON internal.home
  FOR EACH ROW
  EXECUTE FUNCTION internal.prevent_website_storage_size_excess ();

CREATE TRIGGER _prevent_storage_excess_legal_information
  BEFORE INSERT OR UPDATE ON internal.legal_information
  FOR EACH ROW
  EXECUTE FUNCTION internal.prevent_website_storage_size_excess ();

CREATE TRIGGER _prevent_storage_excess_media
  BEFORE INSERT ON internal.media
  FOR EACH ROW
  EXECUTE FUNCTION internal.prevent_website_storage_size_excess ();

CREATE TRIGGER _prevent_storage_excess_settings
  BEFORE UPDATE ON internal.settings
  FOR EACH ROW
  EXECUTE FUNCTION internal.prevent_website_storage_size_excess ();

GRANT UPDATE (max_storage_size) ON internal.website TO administrator;

GRANT UPDATE, DELETE ON internal.user TO administrator;

GRANT UPDATE, DELETE ON api.user TO administrator;

-- migrate:down
DROP FUNCTION api.user_websites_storage_size;

DROP TRIGGER _prevent_storage_excess_article ON internal.article;

DROP TRIGGER _prevent_storage_excess_collab ON internal.collab;

DROP TRIGGER _prevent_storage_excess_docs_category ON internal.docs_category;

DROP TRIGGER _prevent_storage_excess_domain_prefix ON internal.domain_prefix;

DROP TRIGGER _prevent_storage_excess_footer ON internal.footer;

DROP TRIGGER _prevent_storage_excess_header ON internal.header;

DROP TRIGGER _prevent_storage_excess_home ON internal.home;

DROP TRIGGER _prevent_storage_excess_legal_information ON internal.legal_information;

DROP TRIGGER _prevent_storage_excess_media ON internal.media;

DROP TRIGGER _prevent_storage_excess_settings ON internal.settings;

DROP FUNCTION internal.prevent_website_storage_size_excess;

REVOKE UPDATE (max_storage_size) ON internal.website FROM administrator;

REVOKE UPDATE, DELETE ON internal.user FROM administrator;

REVOKE UPDATE, DELETE ON api.user FROM administrator;

