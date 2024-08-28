-- migrate:up
CREATE OR REPLACE VIEW api.website_overview WITH ( security_invoker = ON
) AS
SELECT
  w.id,
  w.user_id,
  w.content_type,
  w.title,
  s.accent_color_light_theme,
  s.accent_color_dark_theme,
  s.favicon_image,
  h.logo_type,
  h.logo_text,
  h.logo_image,
  ho.main_content,
  f.additional_text,
  (
    SELECT
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', a.id, 'title', a.title, 'meta_description', a.meta_description, 'meta_author', a.meta_author, 'cover_image', a.cover_image, 'publication_date', a.publication_date, 'main_content', a.main_content, 'created_at', a.created_at, 'last_modified_at', a.last_modified_at
)
)
    FROM
      internal.article a
    WHERE
      a.website_id = w.id
) AS articles,
  CASE WHEN w.content_type = 'Docs' THEN
  (
    SELECT
      JSON_OBJECT_AGG(
        COALESCE(
          category_name, 'Uncategorized'
), articles
)
    FROM (
      SELECT
        dc.category_name,
        dc.category_weight AS category_weight,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', a.id, 'title', a.title, 'meta_description', a.meta_description, 'meta_author', a.meta_author, 'cover_image', a.cover_image, 'publication_date', a.publication_date, 'main_content', a.main_content, 'created_at', a.created_at, 'last_modified_at', a.last_modified_at
)
) AS articles
      FROM
        internal.article a
      LEFT JOIN internal.docs_category dc ON a.category = dc.id
    WHERE
      a.website_id = w.id
    GROUP BY
      dc.id,
      dc.category_name,
      dc.category_weight
    ORDER BY
      category_weight DESC
) AS categorized_articles)
ELSE
  NULL
  END AS categorized_articles
FROM
  internal.website w
  JOIN internal.settings s ON w.id = s.website_id
  JOIN internal.header h ON w.id = h.website_id
  JOIN internal.home ho ON w.id = ho.website_id
  JOIN internal.footer f ON w.id = f.website_id;

GRANT SELECT ON api.website_overview TO authenticated_user;

-- migrate:down
DROP VIEW api.website_overview;

CREATE VIEW api.website_overview WITH ( security_invoker = ON
) AS
SELECT
  w.id,
  w.user_id,
  w.content_type,
  w.title,
  s.accent_color_light_theme,
  s.accent_color_dark_theme,
  s.favicon_image,
  h.logo_type,
  h.logo_text,
  h.logo_image,
  ho.main_content,
  f.additional_text,
  (
    SELECT
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'title', a.title, 'meta_description', a.meta_description, 'meta_author', a.meta_author, 'cover_image', a.cover_image, 'publication_date', a.publication_date, 'main_content', a.main_content
)
)
    FROM
      internal.article a
    WHERE
      a.website_id = w.id
) AS articles
FROM
  internal.website w
  JOIN internal.settings s ON w.id = s.website_id
  JOIN internal.header h ON w.id = h.website_id
  JOIN internal.home ho ON w.id = ho.website_id
  JOIN internal.footer f ON w.id = f.website_id;

