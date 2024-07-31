-- migrate:up
CREATE VIEW api.user
WITH (security_invoker = on)
AS
SELECT id, username
FROM internal.user;

CREATE VIEW api.cms_content
WITH (security_invoker = on)
AS
SELECT *
FROM internal.cms_content;

CREATE VIEW api.cms_media
WITH (security_invoker = on)
AS
SELECT *
FROM internal.cms_media;

CREATE VIEW api.cms_settings
WITH (security_invoker = on)
AS
SELECT *
FROM internal.cms_settings;

CREATE VIEW api.cms_header
WITH (security_invoker = on)
AS
SELECT *
FROM internal.cms_header;

CREATE view api.cms_home
WITH (security_invoker = on)
AS
SELECT *
FROM internal.cms_home;

CREATE VIEW api.cms_article
WITH (security_invoker = on)
AS
SELECT *
FROM internal.cms_article;

CREATE VIEW api.cms_footer
WITH (security_invoker = on)
AS
SELECT *
FROM internal.cms_footer;

CREATE VIEW api.cms_collab
WITH (security_invoker = on)
AS
SELECT *
FROM internal.cms_collab;

CREATE VIEW api.cms_change_log
WITH (security_invoker = on)
AS
SELECT *
FROM internal.cms_change_log;

CREATE FUNCTION
api.create_project(content_type VARCHAR(10), project_name VARCHAR(50), OUT content_id UUID) AS $$
DECLARE
  _content_id UUID;
BEGIN
  INSERT INTO internal.cms_content (content_type, project_name)
  VALUES (create_project.content_type, create_project.project_name)
  RETURNING id INTO _content_id;

  INSERT INTO internal.cms_settings (content_id)
  VALUES (_content_id);

  INSERT INTO internal.cms_header (content_id, logo_text)
  VALUES (_content_id, 'archtika ' || create_project.content_type);

  INSERT INTO internal.cms_home (content_id, main_content)
  VALUES
    (_content_id, '## Main content comes in here');

  INSERT INTO internal.cms_article (content_id, title, meta_description, meta_author, main_content)
  VALUES
    (_content_id, 'First article', 'This is the first sample article', 'Author Name', '## First article'),
    (_content_id, 'Second article', 'This is the second sample article', 'Author Name', '## Second article');

  INSERT INTO internal.cms_footer (content_id, additional_text)
  VALUES (_content_id, 'This website was created with archtika'); 

  content_id := _content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION api.create_project(VARCHAR(10), VARCHAR(50)) TO authenticated_user;


-- Security invoker only works on views if the user has access to the underlying table
GRANT SELECT ON internal.user TO authenticated_user;
GRANT SELECT ON api.user TO authenticated_user;
GRANT SELECT, UPDATE, DELETE ON internal.cms_content TO authenticated_user;
GRANT SELECT, UPDATE, DELETE ON api.cms_content TO authenticated_user;
GRANT SELECT, INSERT ON internal.cms_media TO authenticated_user;
GRANT SELECT, INSERT ON api.cms_media TO authenticated_user;
GRANT SELECT, UPDATE ON internal.cms_settings TO authenticated_user;
GRANT SELECT, UPDATE ON api.cms_settings TO authenticated_user;
GRANT SELECT, UPDATE ON internal.cms_header TO authenticated_user;
GRANT SELECT, UPDATE ON api.cms_header TO authenticated_user;
GRANT SELECT, UPDATE ON internal.cms_home TO authenticated_user;
GRANT SELECT, UPDATE ON api.cms_home TO authenticated_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON internal.cms_article TO authenticated_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.cms_article TO authenticated_user;
GRANT SELECT, UPDATE ON internal.cms_footer TO authenticated_user;
GRANT SELECT, UPDATE ON api.cms_footer TO authenticated_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON internal.cms_collab TO authenticated_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.cms_collab TO authenticated_user;
GRANT SELECT ON internal.cms_change_log TO authenticated_user;
GRANT SELECT ON api.cms_change_log TO authenticated_user; 

-- migrate:down
REVOKE SELECT ON internal.user FROM authenticated_user;
REVOKE SELECT, UPDATE, DELETE ON internal.cms_content FROM authenticated_user;
REVOKE SELECT, INSERT ON internal.cms_media FROM authenticated_user;
REVOKE SELECT, UPDATE ON internal.cms_settings FROM authenticated_user;
REVOKE SELECT, UPDATE ON internal.cms_header FROM authenticated_user;
REVOKE SELECT, INSERT, UPDATE, DELETE ON internal.cms_article FROM authenticated_user;
REVOKE SELECT, UPDATE ON internal.cms_footer FROM authenticated_user;
REVOKE SELECT, INSERT, UPDATE, DELETE ON internal.cms_collab FROM authenticated_user;
REVOKE SELECT ON internal.cms_change_log FROM authenticated_user;

DROP FUNCTION api.create_project(VARCHAR(10), VARCHAR(50));

DROP VIEW api.cms_change_log;
DROP VIEW api.cms_collab;
DROP VIEW api.cms_footer;
DROP VIEW api.cms_home;
DROP VIEW api.cms_article;
DROP VIEW api.cms_header;
DROP VIEW api.cms_settings;
DROP VIEW api.cms_media;
DROP VIEW api.cms_content;
DROP VIEW api.user;