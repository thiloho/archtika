-- migrate:up
CREATE DOMAIN "*/*" AS bytea;

CREATE FUNCTION api.upload_file (BYTEA, OUT file_id UUID)
AS $$
DECLARE
  _headers JSON := CURRENT_SETTING('request.headers', TRUE)::JSON;
  _website_id UUID := (_headers ->> 'x-website-id')::UUID;
  _original_filename TEXT := _headers ->> 'x-original-filename';
  _allowed_mimetypes TEXT[] := ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'];
  _max_file_size BIGINT := 5 * 1024 * 1024;
  _has_access BOOLEAN;
  _mimetype TEXT;
BEGIN
  _has_access = internal.user_has_website_access (_website_id, 20);
  _mimetype := CASE WHEN SUBSTRING($1 FROM 1 FOR 8) = '\x89504E470D0A1A0A'::BYTEA THEN
    'image/png'
  WHEN SUBSTRING($1 FROM 1 FOR 3) = '\xFFD8FF'::BYTEA THEN
    'image/jpeg'
  WHEN SUBSTRING($1 FROM 1 FOR 4) = '\x52494646'::BYTEA
    AND SUBSTRING($1 FROM 9 FOR 4) = '\x57454250'::BYTEA THEN
    'image/webp'
  WHEN SUBSTRING($1 FROM 5 FOR 7) = '\x66747970617669'::BYTEA THEN
    'image/avif'
  WHEN SUBSTRING($1 FROM 1 FOR 6) = '\x474946383761'::BYTEA
    OR SUBSTRING($1 FROM 1 FOR 6) = '\x474946383961'::BYTEA THEN
    'image/gif'
  WHEN SUBSTRING($1 FROM 1 FOR 5) = '\x3C3F786D6C'::BYTEA
    OR SUBSTRING($1 FROM 1 FOR 4) = '\x3C737667'::BYTEA THEN
    'image/svg+xml'
  ELSE
    NULL
  END;
  IF OCTET_LENGTH($1) = 0 THEN
    RAISE invalid_parameter_value
    USING message = 'No file data was provided';
  ELSIF (_mimetype IS NULL
      OR _mimetype NOT IN (
        SELECT
          UNNEST(_allowed_mimetypes))) THEN
    RAISE invalid_parameter_value
    USING message = 'Invalid MIME type. Allowed types are: png, jpg, webp, avif, gif, svg';
  ELSIF OCTET_LENGTH($1) > _max_file_size THEN
    RAISE program_limit_exceeded
    USING message = FORMAT('File size exceeds the maximum limit of %s', PG_SIZE_PRETTY(_max_file_size));
  ELSE
    INSERT INTO internal.media (website_id, blob, mimetype, original_name)
      VALUES (_website_id, $1, _mimetype, _original_filename)
    RETURNING
      id INTO file_id;
  END IF;
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
    internal.media AS m
  WHERE
    m.id = retrieve_file.id INTO _headers;
  PERFORM
    SET_CONFIG('response.headers', _headers, TRUE);
  SELECT
    m.blob
  FROM
    internal.media AS m
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

GRANT EXECUTE ON FUNCTION api.upload_file TO authenticated_user;

GRANT EXECUTE ON FUNCTION api.retrieve_file TO anon;

GRANT EXECUTE ON FUNCTION api.retrieve_file TO authenticated_user;

-- migrate:down
DROP FUNCTION api.upload_file;

DROP FUNCTION api.retrieve_file;

DROP DOMAIN "*/*";

