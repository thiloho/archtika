-- migrate:up
CREATE DOMAIN "*/*" AS bytea;

CREATE FUNCTION api.upload_file (BYTEA, OUT file_id UUID)
AS $$
DECLARE
  _headers JSON := CURRENT_SETTING('request.headers', TRUE)::JSON;
  _website_id UUID := (_headers ->> 'x-website-id')::UUID;
  _mimetype TEXT := _headers ->> 'x-mimetype';
  _original_filename TEXT := _headers ->> 'x-original-filename';
  _allowed_mimetypes TEXT[] := ARRAY['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp'];
  _max_file_size INT := 5 * 1024 * 1024;
BEGIN
  IF OCTET_LENGTH($1) = 0 THEN
    RAISE invalid_parameter_value
    USING message = 'No file data was provided';
  END IF;
    IF _mimetype IS NULL OR _mimetype NOT IN (
      SELECT
        UNNEST(_allowed_mimetypes)) THEN
      RAISE invalid_parameter_value
      USING message = 'Invalid MIME type. Allowed types are: png, svg, jpg, webp';
    END IF;
      IF OCTET_LENGTH($1) > _max_file_size THEN
        RAISE program_limit_exceeded
        USING message = FORMAT('File size exceeds the maximum limit of %s MB', _max_file_size / (1024 * 1024));
      END IF;
        INSERT INTO internal.media (website_id, blob, mimetype, original_name)
          VALUES (_website_id, $1, _mimetype, _original_filename)
        RETURNING
          id INTO file_id;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE FUNCTION api.retrieve_file (id UUID)
  RETURNS "*/*"
  AS $$
DECLARE
  _headers TEXT;
  _blob BYTEA;
BEGIN
  SELECT
    FORMAT('[{ "Content-Type": "%s" },'
    '{ "Content-Disposition": "inline; filename=\"%s\"" },'
    '{ "Cache-Control": "max-age=259200" }]', m.mimetype, m.original_name)
  FROM
    internal.media m
  WHERE
    m.id = retrieve_file.id INTO _headers;
  PERFORM
    SET_CONFIG('response.headers', _headers, TRUE);
  SELECT
    m.blob
  FROM
    internal.media m
  WHERE
    m.id = retrieve_file.id INTO _blob;
  IF FOUND THEN
    RETURN _blob;
  ELSE
    RAISE invalid_parameter_value
    USING message = 'Invalid file id';
  END IF;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION api.upload_file (BYTEA) TO authenticated_user;

GRANT EXECUTE ON FUNCTION api.retrieve_file (UUID) TO authenticated_user;

-- migrate:down
DROP FUNCTION api.upload_file (BYTEA);

DROP FUNCTION api.retrieve_file (UUID);

DROP DOMAIN "*/*";

