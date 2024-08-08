-- migrate:up
ALTER TABLE internal.user ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.website ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.header ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.home ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.article ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.footer ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.collab ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION internal.user_has_website_access(website_id UUID, required_permission INTEGER DEFAULT 10)
RETURNS BOOLEAN AS $$
DECLARE
  _user_id UUID;
  _has_access BOOLEAN;
BEGIN
  _user_id := (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID;

  SELECT EXISTS (
    SELECT 1
    FROM internal.website
    WHERE id = website_id AND user_id = _user_id
  ) INTO _has_access;
  
  IF _has_access THEN
    RETURN _has_access;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM internal.collab c
    WHERE c.website_id = user_has_website_access.website_id
    AND c.user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
    AND c.permission_level >= user_has_website_access.required_permission
  ) INTO _has_access;

  RETURN _has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE POLICY view_user ON internal.user
FOR SELECT
USING (true);

CREATE POLICY view_websites ON internal.website
FOR SELECT
USING (internal.user_has_website_access(id, 10));

CREATE POLICY update_website ON internal.website
FOR UPDATE
USING (internal.user_has_website_access(id, 20));

CREATE POLICY delete_website ON internal.website
FOR DELETE
USING (internal.user_has_website_access(id, 40));


CREATE POLICY view_media ON internal.media
FOR SELECT
USING (internal.user_has_website_access(website_id, 10));

CREATE POLICY insert_media ON internal.media
FOR INSERT
WITH CHECK (internal.user_has_website_access(website_id, 20));


CREATE POLICY view_settings ON internal.settings
FOR SELECT
USING (internal.user_has_website_access(website_id, 10));

CREATE POLICY update_settings ON internal.settings
FOR UPDATE
USING (internal.user_has_website_access(website_id, 20));


CREATE POLICY view_header ON internal.header
FOR SELECT
USING (internal.user_has_website_access(website_id, 10));

CREATE POLICY update_header ON internal.header
FOR UPDATE
USING (internal.user_has_website_access(website_id, 20));


CREATE POLICY view_home ON internal.home
FOR SELECT
USING (internal.user_has_website_access(website_id, 10));

CREATE POLICY update_home ON internal.home
FOR UPDATE
USING (internal.user_has_website_access(website_id, 20));


CREATE POLICY view_articles ON internal.article
FOR SELECT
USING (internal.user_has_website_access(website_id, 10));

CREATE POLICY update_article ON internal.article
FOR UPDATE
USING (internal.user_has_website_access(website_id, 20));

CREATE POLICY delete_article ON internal.article
FOR DELETE
USING (
  internal.user_has_website_access(website_id, 30)
  OR
  (
    internal.user_has_website_access(website_id, 20)
    AND
    user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY insert_article ON internal.article
FOR INSERT
WITH CHECK (internal.user_has_website_access(website_id, 20));


CREATE POLICY view_footer ON internal.footer
FOR SELECT
USING (internal.user_has_website_access(website_id, 10));

CREATE POLICY update_footer ON internal.footer
FOR UPDATE
USING (internal.user_has_website_access(website_id, 20));


CREATE POLICY view_collaborations ON internal.collab
FOR SELECT
USING (internal.user_has_website_access(website_id, 10));

CREATE POLICY insert_collaborations ON internal.collab
FOR INSERT
WITH CHECK (
  CASE
    WHEN internal.user_has_website_access(website_id, 40) THEN
      true
    WHEN internal.user_has_website_access(website_id, 30) THEN
      (user_id != (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID)
      AND
      (permission_level < 30)
    ELSE
      false
  END
);

CREATE POLICY update_collaborations ON internal.collab
FOR UPDATE
USING (
  CASE
    WHEN internal.user_has_website_access(website_id, 40) THEN
      true
    WHEN internal.user_has_website_access(website_id, 30) THEN
      (user_id != (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID)
      AND
      (permission_level < 30)
    ELSE
      false
  END
);

CREATE POLICY delete_collaborations ON internal.collab
FOR DELETE
USING (
  CASE
    WHEN internal.user_has_website_access(website_id, 40) THEN
      TRUE
    WHEN internal.user_has_website_access(website_id, 30) THEN
      (user_id != (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID)
      AND
      (permission_level < 30)
    ELSE
      FALSE
  END
);


-- migrate:down
DROP POLICY view_user ON internal.user;
DROP POLICY view_websites ON internal.website;
DROP POLICY delete_website ON internal.website;
DROP POLICY update_website ON internal.website;
DROP POLICY view_media ON internal.media;
DROP POLICY insert_media ON internal.media;
DROP POLICY view_settings ON internal.settings;
DROP POLICY update_settings ON internal.settings;
DROP POLICY view_header ON internal.header;
DROP POLICY update_header ON internal.header;
DROP POLICY view_home ON internal.home;
DROP POLICY update_home ON internal.home;
DROP POLICY view_articles ON internal.article;
DROP POLICY update_article ON internal.article;
DROP POLICY delete_article ON internal.article;
DROP POLICY insert_article ON internal.article;
DROP POLICY view_footer ON internal.footer;
DROP POLICY update_footer ON internal.footer;
DROP POLICY view_collaborations ON internal.collab;
DROP POLICY insert_collaborations ON internal.collab;
DROP POLICY update_collaborations ON internal.collab;
DROP POLICY delete_collaborations ON internal.collab;
DROP FUNCTION internal.user_has_website_access(UUID, INTEGER);

ALTER TABLE internal.user DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.website DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.media DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.header DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.home DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.article DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.footer DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.collab DISABLE ROW LEVEL SECURITY;