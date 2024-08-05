-- migrate:up
ALTER TABLE internal.collab ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_collaborations ON internal.collab
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.collab.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY insert_collaborations ON internal.collab
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.collab.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY update_collaborations ON internal.collab
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.collab.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

CREATE POLICY delete_collaborations ON internal.collab
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM internal.website
    WHERE internal.website.id = internal.collab.website_id
    AND internal.website.owner_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
  )
);

-- migrate:down
DROP POLICY view_collaborations ON internal.collab;
DROP POLICY insert_collaborations ON internal.collab;
DROP POLICY update_collaborations ON internal.collab;
DROP POLICY delete_collaborations ON internal.collab;

ALTER TABLE internal.collab DISABLE ROW LEVEL SECURITY;