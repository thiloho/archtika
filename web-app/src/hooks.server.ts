import { redirect } from "@sveltejs/kit";

export const handle = async ({ event, resolve }) => {
  const userData = await event.fetch("http://localhost:3000/account", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${event.cookies.get("session_token")}`,
      Accept: "application/vnd.pgrst.object+json"
    }
  });

  if (!userData.ok && !["/login", "/register"].includes(event.url.pathname)) {
    throw redirect(303, "/login");
  }

  if (userData.ok) {
    if (["/login", "/register"].includes(event.url.pathname)) {
      throw redirect(303, "/");
    }

    const user = await userData.json();

    event.locals.user = user;
  }

  return await resolve(event);
};
