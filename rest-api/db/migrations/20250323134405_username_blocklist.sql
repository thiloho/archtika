-- migrate:up
ALTER TABLE internal.user
  DROP CONSTRAINT username_not_blocked;

ALTER TABLE internal.user
  ADD CONSTRAINT username_not_blocked CHECK (LOWER(username) NOT IN ('admin', 'administrator', 'api', 'auth', 'blog', 'cdn', 'docs', 'help', 'login', 'logout', 'profile', 'preview', 'previews', 'register', 'settings', 'setup', 'signin', 'signup', 'support', 'test', 'www'));

-- migrate:down
