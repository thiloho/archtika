-- migrate:up
CREATE VIEW api.user
WITH (security_invoker = on)
AS
SELECT id, username
FROM internal.user;

CREATE VIEW api.website
WITH (security_invoker = on)
AS
SELECT *
FROM internal.website;

CREATE VIEW api.media
WITH (security_invoker = on)
AS
SELECT *
FROM internal.media;

CREATE VIEW api.settings
WITH (security_invoker = on)
AS
SELECT *
FROM internal.settings;

CREATE VIEW api.header
WITH (security_invoker = on)
AS
SELECT *
FROM internal.header;

CREATE view api.home
WITH (security_invoker = on)
AS
SELECT *
FROM internal.home;

CREATE VIEW api.article
WITH (security_invoker = on)
AS
SELECT *
FROM internal.article;

CREATE VIEW api.footer
WITH (security_invoker = on)
AS
SELECT *
FROM internal.footer;

CREATE VIEW api.collab
WITH (security_invoker = on)
AS
SELECT *
FROM internal.collab;

CREATE VIEW api.change_log
WITH (security_invoker = on)
AS
SELECT *
FROM internal.change_log;

CREATE FUNCTION
api.create_website(content_type VARCHAR(10), title VARCHAR(50), OUT website_id UUID) AS $$
DECLARE
  _website_id UUID;
BEGIN
  INSERT INTO internal.website (content_type, title)
  VALUES (create_website.content_type, create_website.title)
  RETURNING id INTO _website_id;

  INSERT INTO internal.settings (website_id)
  VALUES (_website_id);

  INSERT INTO internal.header (website_id, logo_text)
  VALUES (_website_id, 'archtika ' || create_website.content_type);

  INSERT INTO internal.home (website_id, main_content)
  VALUES
    (_website_id, '## Main content comes in here');

  INSERT INTO internal.article (website_id, title, meta_description, meta_author, main_content)
  VALUES
    (_website_id, 'First article', 'This is the first sample article', 'Author Name', '## First article'),
    (_website_id, 'Second article', 'This is the second sample article', 'Author Name', '## Second article');

  INSERT INTO internal.footer (website_id, additional_text)
  VALUES (_website_id, 'This website was created with archtika'); 

  website_id := _website_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION api.create_website(VARCHAR(10), VARCHAR(50)) TO authenticated_user;


-- Security invoker only works on views if the user has access to the underlying table
GRANT SELECT ON internal.user TO authenticated_user;
GRANT SELECT ON api.user TO authenticated_user;
GRANT SELECT, UPDATE, DELETE ON internal.website TO authenticated_user;
GRANT SELECT, UPDATE, DELETE ON api.website TO authenticated_user;
GRANT SELECT, INSERT ON internal.media TO authenticated_user;
GRANT SELECT, INSERT ON api.media TO authenticated_user;
GRANT SELECT, UPDATE ON internal.settings TO authenticated_user;
GRANT SELECT, UPDATE ON api.settings TO authenticated_user;
GRANT SELECT, UPDATE ON internal.header TO authenticated_user;
GRANT SELECT, UPDATE ON api.header TO authenticated_user;
GRANT SELECT, UPDATE ON internal.home TO authenticated_user;
GRANT SELECT, UPDATE ON api.home TO authenticated_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON internal.article TO authenticated_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.article TO authenticated_user;
GRANT SELECT, UPDATE ON internal.footer TO authenticated_user;
GRANT SELECT, UPDATE ON api.footer TO authenticated_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON internal.collab TO authenticated_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.collab TO authenticated_user;
GRANT SELECT ON internal.change_log TO authenticated_user;
GRANT SELECT ON api.change_log TO authenticated_user; 

-- migrate:down
REVOKE SELECT ON internal.user FROM authenticated_user;
REVOKE SELECT, UPDATE, DELETE ON internal.website FROM authenticated_user;
REVOKE SELECT, INSERT ON internal.media FROM authenticated_user;
REVOKE SELECT, UPDATE ON internal.settings FROM authenticated_user;
REVOKE SELECT, UPDATE ON internal.header FROM authenticated_user;
REVOKE SELECT, INSERT, UPDATE, DELETE ON internal.article FROM authenticated_user;
REVOKE SELECT, UPDATE ON internal.footer FROM authenticated_user;
REVOKE SELECT, INSERT, UPDATE, DELETE ON internal.collab FROM authenticated_user;
REVOKE SELECT ON internal.change_log FROM authenticated_user;

DROP FUNCTION api.create_website(VARCHAR(10), VARCHAR(50));

DROP VIEW api.change_log;
DROP VIEW api.collab;
DROP VIEW api.footer;
DROP VIEW api.home;
DROP VIEW api.article;
DROP VIEW api.header;
DROP VIEW api.settings;
DROP VIEW api.media;
DROP VIEW api.website;
DROP VIEW api.user;