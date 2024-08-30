-- migrate:up
ALTER TABLE internal.article
  ALTER COLUMN publication_date DROP NOT NULL;

-- migrate:down
ALTER TABLE internal.article
  ALTER COLUMN publication_date SET NOT NULL;

