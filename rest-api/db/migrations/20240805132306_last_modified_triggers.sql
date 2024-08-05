-- migrate:up
CREATE FUNCTION update_last_modified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified_at = CLOCK_TIMESTAMP();
  NEW.last_modified_by = (current_setting('request.jwt.claims', true)::JSON->>'user_id')::UUID;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_website_last_modified
BEFORE UPDATE ON internal.website
FOR EACH ROW
EXECUTE FUNCTION update_last_modified();

CREATE TRIGGER update_settings_last_modified
BEFORE UPDATE ON internal.settings
FOR EACH ROW
EXECUTE FUNCTION update_last_modified();

CREATE TRIGGER update_header_last_modified
BEFORE UPDATE ON internal.header
FOR EACH ROW
EXECUTE FUNCTION update_last_modified();

CREATE TRIGGER update_home_last_modified
BEFORE UPDATE ON internal.home
FOR EACH ROW
EXECUTE FUNCTION update_last_modified();

CREATE TRIGGER update_article_last_modified
BEFORE UPDATE ON internal.article
FOR EACH ROW
EXECUTE FUNCTION update_last_modified();

CREATE TRIGGER update_footer_last_modified
BEFORE UPDATE ON internal.footer
FOR EACH ROW
EXECUTE FUNCTION update_last_modified();

CREATE TRIGGER update_collab_last_modified
BEFORE UPDATE ON internal.collab
FOR EACH ROW
EXECUTE FUNCTION update_last_modified();

-- migrate:down
DROP TRIGGER update_website_last_modified ON internal.website;
DROP TRIGGER update_settings_last_modified ON internal.settings;
DROP TRIGGER update_header_last_modified ON internal.header;
DROP TRIGGER update_home_last_modified ON internal.home;
DROP TRIGGER update_article_last_modified ON internal.article;
DROP TRIGGER update_footer_last_modified ON internal.footer;
DROP TRIGGER update_collab_last_modified ON internal.collab;

DROP FUNCTION update_last_modified();