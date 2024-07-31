export const actions = {
  default: async ({ request, cookies, fetch }) => {
    const data = await request.formData();

    const res = await fetch("http://localhost:3000/rpc/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.get("username"),
        password: data.get("password")
      })
    });

    const response = await res.json();

    if (!res.ok) {
      return { success: false, message: response.message };
    }

    cookies.set("session_token", response.token, { path: "/" });
    return { success: true };
  }
};
