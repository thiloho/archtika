-- migrate:up
ALTER TABLE internal.user ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.website ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.header ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.home ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.article ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal.footer ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_own_user ON internal.user
FOR SELECT
USING (id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID);

CREATE POLICY view_own_websites ON internal.website
FOR SELECT
USING (owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID);

CREATE POLICY update_own_website ON internal.website
FOR UPDATE
USING (owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID);

CREATE POLICY delete_own_website ON internal.website
FOR DELETE
USING (owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID);


CREATE POLICY view_own_media ON internal.media
FOR SELECT
USING (user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID);

CREATE POLICY insert_own_media ON internal.media
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.media.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);


CREATE POLICY view_own_settings ON internal.settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.settings.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY update_own_settings ON internal.settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.settings.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);


CREATE POLICY view_own_header ON internal.header
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.header.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY update_own_header ON internal.header
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.header.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);


CREATE POLICY view_own_home ON internal.home
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.home.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY update_own_home ON internal.home
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.home.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);


CREATE POLICY view_own_articles ON internal.article
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.article.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY update_own_article ON internal.article
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.article.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY delete_own_article ON internal.article
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.article.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY insert_own_article ON internal.article
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.article.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);


CREATE POLICY view_own_footer ON internal.footer
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.footer.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY update_own_footer ON internal.footer
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.footer.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);


-- migrate:down
DROP POLICY view_own_user ON internal.user;
DROP POLICY view_own_websites ON internal.website;
DROP POLICY delete_own_website ON internal.website;
DROP POLICY update_own_website ON internal.website;
DROP POLICY view_own_media ON internal.media;
DROP POLICY insert_own_media ON internal.media;
DROP POLICY view_own_settings ON internal.settings;
DROP POLICY update_own_settings ON internal.settings;
DROP POLICY view_own_header ON internal.header;
DROP POLICY update_own_header ON internal.header;
DROP POLICY view_own_home ON internal.home;
DROP POLICY update_own_home ON internal.home;
DROP POLICY view_own_articles ON internal.article;
DROP POLICY update_own_article ON internal.article;
DROP POLICY delete_own_article ON internal.article;
DROP POLICY insert_own_article ON internal.article;
DROP POLICY view_own_footer ON internal.footer;
DROP POLICY update_own_footer ON internal.footer;

ALTER TABLE internal.user DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.website DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.media DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.header DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.home DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.article DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal.footer DISABLE ROW LEVEL SECURITY;