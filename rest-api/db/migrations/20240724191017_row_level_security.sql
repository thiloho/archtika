-- migrate:up
ALTER TABLE internal.user ENABLE ROW LEVEL SECURITY;

ALTER TABLE internal.website ENABLE ROW LEVEL SECURITY;

ALTER TABLE internal.media ENABLE ROW LEVEL SECURITY;

ALTER TABLE internal.settings ENABLE ROW LEVEL SECURITY;

ALTER TABLE internal.header ENABLE ROW LEVEL SECURITY;

ALTER TABLE internal.home ENABLE ROW LEVEL SECURITY;

ALTER TABLE internal.article ENABLE ROW LEVEL SECURITY;

ALTER TABLE internal.docs_category ENABLE ROW LEVEL SECURITY;

ALTER TABLE internal.footer ENABLE ROW LEVEL SECURITY;

ALTER TABLE internal.legal_information ENABLE ROW LEVEL SECURITY;

ALTER TABLE internal.collab ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION internal.user_has_website_access (website_id UUID, required_permission INTEGER, collaborator_permission_level INTEGER DEFAULT NULL, collaborator_user_id UUID DEFAULT NULL, article_user_id UUID DEFAULT NULL, raise_error BOOLEAN DEFAULT TRUE, OUT has_access BOOLEAN)
AS $$
DECLARE
  _user_id UUID := (CURRENT_SETTING('request.jwt.claims', TRUE)::JSON ->> 'user_id')::UUID;
BEGIN
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        internal.website AS w
      WHERE
        w.id = user_has_website_access.website_id
        AND w.user_id = _user_id) INTO has_access;
  IF has_access THEN
    RETURN;
  END IF;
  SELECT
    EXISTS (
      SELECT
        1
      FROM
        internal.collab c
      WHERE
        c.website_id = user_has_website_access.website_id
        AND c.user_id = _user_id
        AND c.permission_level >= user_has_website_access.required_permission
        AND (user_has_website_access.article_user_id IS NULL
          OR (c.permission_level = 30
            OR user_has_website_access.article_user_id = _user_id))
        AND (user_has_website_access.collaborator_permission_level IS NULL
          OR (user_has_website_access.collaborator_user_id != _user_id
            AND user_has_website_access.collaborator_permission_level < 30))) INTO has_access;
  IF NOT has_access AND user_has_website_access.raise_error THEN
    RAISE insufficient_privilege
    USING message = 'Insufficient permissions';
  END IF;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION internal.user_has_website_access (UUID, INTEGER, INTEGER, UUID, UUID, BOOLEAN) TO authenticated_user;

CREATE POLICY view_user ON internal.user
  FOR SELECT
    USING (TRUE);

CREATE POLICY view_websites ON internal.website
  FOR SELECT
    USING (internal.user_has_website_access (id, 10, raise_error => FALSE));

CREATE POLICY update_website ON internal.website
  FOR UPDATE
    USING (internal.user_has_website_access (id, 30));

CREATE POLICY delete_website ON internal.website
  FOR DELETE
    USING (internal.user_has_website_access (id, 40));

CREATE POLICY view_settings ON internal.settings
  FOR SELECT
    USING (internal.user_has_website_access (website_id, 10));

CREATE POLICY update_settings ON internal.settings
  FOR UPDATE
    USING (internal.user_has_website_access (website_id, 20));

CREATE POLICY view_header ON internal.header
  FOR SELECT
    USING (internal.user_has_website_access (website_id, 10));

CREATE POLICY update_header ON internal.header
  FOR UPDATE
    USING (internal.user_has_website_access (website_id, 20));

CREATE POLICY view_home ON internal.home
  FOR SELECT
    USING (internal.user_has_website_access (website_id, 10));

CREATE POLICY update_home ON internal.home
  FOR UPDATE
    USING (internal.user_has_website_access (website_id, 20));

CREATE POLICY view_articles ON internal.article
  FOR SELECT
    USING (internal.user_has_website_access (website_id, 10));

CREATE POLICY update_article ON internal.article
  FOR UPDATE
    USING (internal.user_has_website_access (website_id, 20));

CREATE POLICY delete_article ON internal.article
  FOR DELETE
    USING (internal.user_has_website_access (website_id, 20, article_user_id => user_id));

CREATE POLICY insert_article ON internal.article
  FOR INSERT
    WITH CHECK (internal.user_has_website_access (website_id, 20));

CREATE POLICY view_categories ON internal.docs_category
  FOR SELECT
    USING (internal.user_has_website_access (website_id, 10));

CREATE POLICY update_category ON internal.docs_category
  FOR UPDATE
    USING (internal.user_has_website_access (website_id, 20));

CREATE POLICY delete_category ON internal.docs_category
  FOR DELETE
    USING (internal.user_has_website_access (website_id, 20, article_user_id => user_id));

CREATE POLICY insert_category ON internal.docs_category
  FOR INSERT
    WITH CHECK (internal.user_has_website_access (website_id, 20));

CREATE POLICY view_footer ON internal.footer
  FOR SELECT
    USING (internal.user_has_website_access (website_id, 10));

CREATE POLICY update_footer ON internal.footer
  FOR UPDATE
    USING (internal.user_has_website_access (website_id, 20));

CREATE POLICY view_legal_information ON internal.legal_information
  FOR SELECT
    USING (internal.user_has_website_access (website_id, 10));

CREATE POLICY update_legal_information ON internal.legal_information
  FOR UPDATE
    USING (internal.user_has_website_access (website_id, 30));

CREATE POLICY delete_legal_information ON internal.legal_information
  FOR DELETE
    USING (internal.user_has_website_access (website_id, 30));

CREATE POLICY insert_legal_information ON internal.legal_information
  FOR INSERT
    WITH CHECK (internal.user_has_website_access (website_id, 30));

CREATE POLICY view_collaborations ON internal.collab
  FOR SELECT
    USING (internal.user_has_website_access (website_id, 10));

CREATE POLICY insert_collaborations ON internal.collab
  FOR INSERT
    WITH CHECK (internal.user_has_website_access (website_id, 30, collaborator_permission_level => permission_level, collaborator_user_id => user_id));

CREATE POLICY update_collaborations ON internal.collab
  FOR UPDATE
    USING (internal.user_has_website_access (website_id, 30, collaborator_permission_level => permission_level, collaborator_user_id => user_id));

CREATE POLICY delete_collaborations ON internal.collab
  FOR DELETE
    USING (internal.user_has_website_access (website_id, 30, collaborator_permission_level => permission_level, collaborator_user_id => user_id));

-- migrate:down
DROP POLICY view_user ON internal.user;

DROP POLICY view_websites ON internal.website;

DROP POLICY delete_website ON internal.website;

DROP POLICY update_website ON internal.website;

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

DROP POLICY view_categories ON internal.docs_category;

DROP POLICY update_category ON internal.docs_category;

DROP POLICY delete_category ON internal.docs_category;

DROP POLICY insert_category ON internal.docs_category;

DROP POLICY view_footer ON internal.footer;

DROP POLICY update_footer ON internal.footer;

DROP POLICY insert_legal_information ON internal.legal_information;

DROP POLICY delete_legal_information ON internal.legal_information;

DROP POLICY update_legal_information ON internal.legal_information;

DROP POLICY view_legal_information ON internal.legal_information;

DROP POLICY view_collaborations ON internal.collab;

DROP POLICY insert_collaborations ON internal.collab;

DROP POLICY update_collaborations ON internal.collab;

DROP POLICY delete_collaborations ON internal.collab;

DROP FUNCTION internal.user_has_website_access (UUID, INTEGER, INTEGER, UUID, UUID, BOOLEAN);

ALTER TABLE internal.user DISABLE ROW LEVEL SECURITY;

ALTER TABLE internal.website DISABLE ROW LEVEL SECURITY;

ALTER TABLE internal.media DISABLE ROW LEVEL SECURITY;

ALTER TABLE internal.settings DISABLE ROW LEVEL SECURITY;

ALTER TABLE internal.header DISABLE ROW LEVEL SECURITY;

ALTER TABLE internal.home DISABLE ROW LEVEL SECURITY;

ALTER TABLE internal.article DISABLE ROW LEVEL SECURITY;

ALTER TABLE internal.docs_category DISABLE ROW LEVEL SECURITY;

ALTER TABLE internal.footer DISABLE ROW LEVEL SECURITY;

ALTER TABLE internal.legal_information DISABLE ROW LEVEL SECURITY;

ALTER TABLE internal.collab DISABLE ROW LEVEL SECURITY;

