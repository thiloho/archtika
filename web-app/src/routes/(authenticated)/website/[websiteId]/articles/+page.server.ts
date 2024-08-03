export const load = async ({ params, fetch, cookies, url, parent }) => {
  const searchQuery = url.searchParams.get("article_search_query");
  const sortBy = url.searchParams.get("article_sort");

  const parameters = new URLSearchParams();

  const baseFetchUrl = `http://localhost:3000/article?website_id=eq.${params.websiteId}&select=id,title`;

  if (searchQuery) {
    parameters.append("title", `ilike.*${searchQuery}*`);
  }

  switch (sortBy) {
    case null:
    case "creation-time":
      parameters.append("order", "created_at.desc");
      break;
    case "last-modified":
      parameters.append("order", "last_modified_at.desc");
      break;
    case "title-a-to-z":
      parameters.append("order", "title.asc");
      break;
    case "title-z-to-a":
      parameters.append("order", "title.desc");
      break;
  }

  const constructedFetchUrl = `${baseFetchUrl}&${parameters.toString()}`;

  const totalArticlesData = await fetch(baseFetchUrl, {
    method: "HEAD",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Prefer: "count=exact"
    }
  });

  const totalArticleCount = Number(
    totalArticlesData.headers.get("content-range")?.split("/").at(-1)
  );

  const articlesData = await fetch(constructedFetchUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`
    }
  });

  const articles = await articlesData.json();
  const { website, home } = await parent();

  return {
    totalArticleCount,
    articles,
    website,
    home
  };
};

export const actions = {
  createArticle: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();

    const res = await fetch("http://localhost:3000/article", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        website_id: params.websiteId,
        title: data.get("title")
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully created article" };
  },
  deleteArticle: async ({ request, fetch, cookies }) => {
    const data = await request.formData();

    const res = await fetch(`http://localhost:3000/article?id=eq.${data.get("id")}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      }
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully deleted article" };
  }
};
