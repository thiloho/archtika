-- migrate:up
CREATE FUNCTION internal.check_user_not_website_owner ()
  RETURNS TRIGGER
  AS $$
BEGIN
  IF (EXISTS (
    SELECT
      1
    FROM
      internal.website AS w
    WHERE
      w.id = NEW.website_id AND w.user_id = NEW.user_id)) THEN
    RAISE foreign_key_violation
    USING message = 'User cannot be added as a collaborator to their own website';
  END IF;
    RETURN NULL;
END;
$$
LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER check_user_not_website_owner
  AFTER INSERT ON internal.collab
  FOR EACH ROW
  EXECUTE FUNCTION internal.check_user_not_website_owner ();

-- migrate:down
