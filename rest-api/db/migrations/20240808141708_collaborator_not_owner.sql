-- migrate:up
CREATE FUNCTION internal.check_user_not_website_owner ()
  RETURNS TRIGGER
  AS $$
BEGIN
  IF EXISTS (
    SELECT
      1
    FROM
      internal.website
    WHERE
      id = NEW.website_id
      AND user_id = NEW.user_id) THEN
  RAISE foreign_key_violation
  USING message = 'User cannot be added as a collaborator to their own website';
END IF;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE CONSTRAINT TRIGGER check_user_not_website_owner
  AFTER INSERT ON internal.collab
  FOR EACH ROW
  EXECUTE FUNCTION internal.check_user_not_website_owner ();

-- migrate:down
DROP TRIGGER check_user_not_website_owner ON internal.collab;

DROP FUNCTION internal.check_user_not_website_owner ();

