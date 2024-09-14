import { redirect } from "@sveltejs/kit";
import { API_BASE_PREFIX } from "$lib/server/utils";
import type { User } from "$lib/db-schema";

export const handle = async ({ event, resolve }) => {
  if (!event.url.pathname.startsWith("/api/")) {
    const userData = await event.fetch(`${API_BASE_PREFIX}/account`, {
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

      const user: User = await userData.json();

      event.locals.user = user;
    }
  }

  return await resolve(event);
};
