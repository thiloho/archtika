-- migrate:up
ALTER TABLE internal.article
  ALTER COLUMN publication_date DROP NOT NULL;

-- migrate:down
UPDATE
  internal.article
SET
  publication_date = CURRENT_DATE
WHERE
  publication_date IS NULL;

ALTER TABLE internal.article
  ALTER COLUMN publication_date SET NOT NULL;

