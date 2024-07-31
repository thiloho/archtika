export const load = async ({ locals }) => {
  return {
    user: locals.user
  };
};

export const actions = {
  logout: async ({ cookies }) => {
    cookies.delete("session_token", { path: "/" });

    return { logout: { success: true } };
  },
  deleteAccount: async ({ request, fetch, cookies }) => {
    const data = await request.formData();

    const res = await fetch("http://localhost:3000/rpc/delete_account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        password: data.get("password")
      })
    });

    const response = await res.json();

    if (!res.ok) {
      return { deleteAccount: { success: false, message: response.message } };
    }

    cookies.delete("session_token", { path: "/" });
    return { deleteAccount: { success: true } };
  }
};
