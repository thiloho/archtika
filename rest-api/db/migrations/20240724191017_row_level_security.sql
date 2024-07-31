-- migrate:up
ALTER TABLE internal.user ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.cms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.cms_header ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.cms_home ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.cms_article ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.cms_footer ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_own_user ON internal.user
FOR SELECT
USING (id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID);

CREATE POLICY view_own_projects ON internal.cms_content
FOR SELECT
USING (owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID);

CREATE POLICY update_own_project ON internal.cms_content
FOR UPDATE
USING (owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID);

CREATE POLICY delete_own_project ON internal.cms_content
FOR DELETE
USING (owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID);


CREATE POLICY view_own_media ON internal.cms_media
FOR SELECT
USING (user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID);

CREATE POLICY insert_own_media ON internal.cms_media
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM internal.cms_content
    WHERE internal.cms_content.id = internal.cms_media.content_id
    AND internal.cms_content.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);


CREATE POLICY view_own_settings ON internal.cms_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM internal.cms_content
    WHERE internal.cms_content.id = internal.cms_settings.content_id
    AND internal.cms_content.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY update_own_settings ON internal.cms_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM internal.cms_content
    WHERE internal.cms_content.id = internal.cms_settings.content_id
    AND internal.cms_content.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);


CREATE POLICY view_own_header ON internal.cms_header
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM internal.cms_content
    WHERE internal.cms_content.id = internal.cms_header.content_id
    AND internal.cms_content.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY update_own_header ON internal.cms_header
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM internal.cms_content
    WHERE internal.cms_content.id = internal.cms_header.content_id
    AND internal.cms_content.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);


CREATE POLICY view_own_home ON internal.cms_home
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM internal.cms_content
    WHERE internal.cms_content.id = internal.cms_home.content_id
    AND internal.cms_content.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY update_own_home ON internal.cms_home
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM internal.cms_content
    WHERE internal.cms_content.id = internal.cms_home.content_id
    AND internal.cms_content.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);


CREATE POLICY view_own_articles ON internal.cms_article
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM internal.cms_content
    WHERE internal.cms_content.id = internal.cms_article.content_id
    AND internal.cms_content.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY update_own_article ON internal.cms_article
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM internal.cms_content
    WHERE internal.cms_content.id = internal.cms_article.content_id
    AND internal.cms_content.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY delete_own_article ON internal.cms_article
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM internal.cms_content
    WHERE internal.cms_content.id = internal.cms_article.content_id
    AND internal.cms_content.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY insert_own_article ON internal.cms_article
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM internal.cms_content
    WHERE internal.cms_content.id = internal.cms_article.content_id
    AND internal.cms_content.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);


CREATE POLICY view_own_footer ON internal.cms_footer
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM internal.cms_content
    WHERE internal.cms_content.id = internal.cms_footer.content_id
    AND internal.cms_content.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY update_own_footer ON internal.cms_footer
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM internal.cms_content
    WHERE internal.cms_content.id = internal.cms_footer.content_id
    AND internal.cms_content.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);


-- migrate:down
DROP POLICY view_own_user ON internal.user;
DROP POLICY view_own_projects ON internal.cms_content;
DROP POLICY delete_own_project ON internal.cms_content;
DROP POLICY update_own_project ON internal.cms_content;
DROP POLICY view_own_media ON internal.cms_media;
DROP POLICY insert_own_media ON internal.cms_media;
DROP POLICY view_own_settings ON internal.cms_settings;
DROP POLICY update_own_settings ON internal.cms_settings;
DROP POLICY view_own_header ON internal.cms_header;
DROP POLICY update_own_header ON internal.cms_header;
DROP POLICY view_own_home ON internal.cms_home;
DROP POLICY update_own_home ON internal.cms_home;
DROP POLICY view_own_articles ON internal.cms_article;
DROP POLICY update_own_article ON internal.cms_article;
DROP POLICY delete_own_article ON internal.cms_article;
DROP POLICY insert_own_article ON internal.cms_article;
DROP POLICY view_own_footer ON internal.cms_footer;
DROP POLICY update_own_footer ON internal.cms_footer;

ALTER TABLE internal.user DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.cms_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.cms_media DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.cms_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.cms_header DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.cms_home DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.cms_article DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.cms_footer DISABLE ROW LEVEL SECURITY;