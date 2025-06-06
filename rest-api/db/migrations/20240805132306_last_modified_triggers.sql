-- migrate:up
CREATE FUNCTION internal.update_last_modified ()
  RETURNS TRIGGER
  AS $$
DECLARE
  _user_id UUID := (CURRENT_SETTING('request.jwt.claims', TRUE)::JSON ->> 'user_id')::UUID;
BEGIN
  IF (NOT EXISTS (
    SELECT
      u.id
    FROM
      internal.user AS u
    WHERE
      u.id = _user_id)) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  IF TG_OP != 'DELETE' THEN
    NEW.last_modified_at = CLOCK_TIMESTAMP();
    NEW.last_modified_by = _user_id;
  END IF;
  IF TG_TABLE_NAME != 'website' THEN
    UPDATE
      internal.website
    SET
      last_modified_at = CLOCK_TIMESTAMP(),
      last_modified_by = _user_id
    WHERE
      id = COALESCE(NEW.website_id, OLD.website_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE TRIGGER update_website_last_modified
  BEFORE UPDATE ON internal.website
  FOR EACH ROW
  EXECUTE FUNCTION internal.update_last_modified ();

CREATE TRIGGER update_settings_last_modified
  BEFORE UPDATE ON internal.settings
  FOR EACH ROW
  EXECUTE FUNCTION internal.update_last_modified ();

CREATE TRIGGER update_header_last_modified
  BEFORE UPDATE ON internal.header
  FOR EACH ROW
  EXECUTE FUNCTION internal.update_last_modified ();

CREATE TRIGGER update_home_last_modified
  BEFORE UPDATE ON internal.home
  FOR EACH ROW
  EXECUTE FUNCTION internal.update_last_modified ();

CREATE TRIGGER update_article_last_modified
  BEFORE INSERT OR UPDATE OR DELETE ON internal.article
  FOR EACH ROW
  EXECUTE FUNCTION internal.update_last_modified ();

CREATE TRIGGER update_docs_category_modified
  BEFORE INSERT OR UPDATE OR DELETE ON internal.docs_category
  FOR EACH ROW
  EXECUTE FUNCTION internal.update_last_modified ();

CREATE TRIGGER update_footer_last_modified
  BEFORE UPDATE ON internal.footer
  FOR EACH ROW
  EXECUTE FUNCTION internal.update_last_modified ();

CREATE TRIGGER update_collab_last_modified
  BEFORE INSERT OR UPDATE OR DELETE ON internal.collab
  FOR EACH ROW
  EXECUTE FUNCTION internal.update_last_modified ();

-- migrate:down
