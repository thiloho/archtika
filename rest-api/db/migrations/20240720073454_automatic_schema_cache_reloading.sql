-- migrate:up
CREATE FUNCTION pgrst_watch() RETURNS event_trigger AS $$
BEGIN
  NOTIFY pgrst, 'reload schema';
END;
$$ LANGUAGE plpgsql;

CREATE EVENT TRIGGER pgrst_watch
ON ddl_command_end
EXECUTE FUNCTION pgrst_watch();

-- migrate:down
DROP EVENT TRIGGER pgrst_watch;
DROP FUNCTION pgrst_watch();