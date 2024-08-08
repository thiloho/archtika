-- migrate:up
CREATE EXTENSION pgcrypto;

CREATE EXTENSION pgjwt;

CREATE FUNCTION internal.check_role_exists ()
  RETURNS TRIGGER
  AS $$
BEGIN
  IF NOT EXISTS (
    SELECT
      1
    FROM
      pg_roles AS r
    WHERE
      r.rolname = NEW.role) THEN
  RAISE foreign_key_violation
  USING message = 'Unknown database role: ' || NEW.role;
  RETURN NULL;
END IF;
  RETURN NEW;
END
$$
LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER ensure_user_role_exists
  AFTER INSERT OR UPDATE ON internal.user
  FOR EACH ROW
  EXECUTE FUNCTION internal.check_role_exists ();

CREATE FUNCTION internal.encrypt_pass ()
  RETURNS TRIGGER
  AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.password_hash != OLD.password_hash THEN
    NEW.password_hash = CRYPT(NEW.password_hash, GEN_SALT('bf'));
  END IF;
  RETURN NEW;
END
$$
LANGUAGE plpgsql;

CREATE TRIGGER encrypt_pass
  BEFORE INSERT OR UPDATE ON internal.user
  FOR EACH ROW
  EXECUTE FUNCTION internal.encrypt_pass ();

CREATE FUNCTION internal.user_role (username TEXT, PASSWORD TEXT)
  RETURNS NAME
  AS $$
BEGIN
  RETURN (
    SELECT
      ROLE
    FROM
      internal.user AS u
    WHERE
      u.username = user_role.username
      AND u.password_hash = CRYPT(user_role.password, u.password_hash));
END;
$$
LANGUAGE plpgsql;

CREATE FUNCTION api.register (username TEXT, PASSWORD TEXT, OUT user_id UUID)
AS $$
DECLARE
  _username_length_min CONSTANT INT := 3;
  _username_length_max CONSTANT INT := 16;
  _password_length_min CONSTANT INT := 12;
  _password_length_max CONSTANT INT := 128;
BEGIN
  IF LENGTH(register.username)
    NOT BETWEEN _username_length_min AND _username_length_max THEN
    RAISE string_data_length_mismatch
    USING message = FORMAT('Username must be between %s and %s characters long', _username_length_min, _username_length_max);
  END IF;
    IF EXISTS (
      SELECT
        1
      FROM
        internal.user AS u
      WHERE
        u.username = register.username) THEN
    RAISE unique_violation
    USING message = 'Username is already taken';
  END IF;
    IF LENGTH(register.password)
      NOT BETWEEN _password_length_min AND _password_length_max THEN
      RAISE string_data_length_mismatch
      USING message = FORMAT('Password must be between %s and %s characters long', _password_length_min, _password_length_max);
    END IF;
      IF register.password !~ '[a-z]' THEN
        RAISE invalid_parameter_value
        USING message = 'Password must contain at least one lowercase letter';
      END IF;
        IF register.password !~ '[A-Z]' THEN
          RAISE invalid_parameter_value
          USING message = 'Password must contain at least one uppercase letter';
        END IF;
          IF register.password !~ '[0-9]' THEN
            RAISE invalid_parameter_value
            USING message = 'Password must contain at least one number';
          END IF;
            IF register.password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
              RAISE invalid_parameter_value
              USING message = 'Password must contain at least one special character';
            END IF;
              INSERT INTO internal.user (username, password_hash)
                VALUES (register.username, register.password)
              RETURNING
                id INTO user_id;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE FUNCTION api.login (username TEXT, PASSWORD TEXT, OUT token TEXT)
AS $$
DECLARE
  _role NAME;
  _user_id UUID;
  _exp INTEGER;
BEGIN
  SELECT
    internal.user_role (login.username, login.password) INTO _role;
  IF _role IS NULL THEN
    RAISE invalid_password
    USING message = 'Invalid username or password';
  END IF;
    SELECT
      id INTO _user_id
    FROM
      internal.user AS u
    WHERE
      u.username = login.username;
    _exp := EXTRACT(EPOCH FROM CLOCK_TIMESTAMP())::INTEGER + 86400;
    SELECT
      SIGN(JSON_BUILD_OBJECT('role', _role, 'user_id', _user_id, 'username', login.username, 'exp', _exp), CURRENT_SETTING('app.jwt_secret')) INTO token;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE FUNCTION api.delete_account (PASSWORD TEXT, OUT was_deleted BOOLEAN)
AS $$
DECLARE
  _username TEXT := CURRENT_SETTING('request.jwt.claims', TRUE)::JSON ->> 'username';
  _role NAME;
BEGIN
  SELECT
    internal.user_role (_username, delete_account.password) INTO _role;
  IF _role IS NULL THEN
    RAISE invalid_password
    USING message = 'Invalid password';
  END IF;
    DELETE FROM internal.user AS u
    WHERE u.username = _username;
    was_deleted := TRUE;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION api.register (TEXT, TEXT) TO anon;

GRANT EXECUTE ON FUNCTION api.login (TEXT, TEXT) TO anon;

-- migrate:down
DROP FUNCTION api.register (TEXT, TEXT);

DROP FUNCTION api.login (TEXT, TEXT);

DROP FUNCTION api.delete_account (TEXT);

DROP FUNCTION internal.user_role (TEXT, TEXT);

DROP TRIGGER encrypt_pass ON internal.user;

DROP FUNCTION internal.encrypt_pass ();

DROP TRIGGER ensure_user_role_exists ON internal.user;

DROP FUNCTION internal.check_role_exists ();

DROP EXTENSION pgjwt;

DROP EXTENSION pgcrypto;

