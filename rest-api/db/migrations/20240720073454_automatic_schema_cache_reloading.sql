-- migrate:up
CREATE FUNCTION internal.pgrst_watch ()
  RETURNS EVENT_TRIGGER
  AS $$
BEGIN
  NOTIFY pgrst,
  'reload schema';
END;
$$
LANGUAGE plpgsql;

CREATE EVENT TRIGGER pgrst_watch ON ddl_command_end
  EXECUTE FUNCTION internal.pgrst_watch ();

-- migrate:down
DROP EVENT TRIGGER pgrst_watch;

DROP FUNCTION internal.pgrst_watch;

