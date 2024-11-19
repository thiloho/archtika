import { dev } from "$app/environment";

export const API_BASE_PREFIX = dev
  ? "http://localhost:3000"
  : `${process.env.ORIGIN ? `${process.env.ORIGIN}/api` : "http://localhost:3000"}`;

export const REGISTRATION_IS_DISABLED = dev
  ? false
  : process.env.REGISTRATION_IS_DISABLED
    ? JSON.parse(process.env.REGISTRATION_IS_DISABLED)
    : false;

export const apiRequest = async (
  customFetch: typeof fetch,
  url: string,
  method: "HEAD" | "GET" | "POST" | "PATCH" | "DELETE",
  options: {
    headers?: Record<string, string>;
    body?: any;
    successMessage?: string;
    returnData?: boolean;
    noJSONTransform?: boolean;
  } = {
    headers: {},
    body: undefined,
    successMessage: "Operation was successful",
    returnData: false,
    noJSONTransform: false
  }
) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  const response = await customFetch(url, {
    method,
    headers,
    ...(!["HEAD", "GET", "DELETE"].includes(method) && {
      body: options.body instanceof ArrayBuffer ? options.body : JSON.stringify(options.body)
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    return { success: false, message: errorData.message };
  }

  if (options.returnData) {
    return {
      success: true,
      message: options.successMessage,
      data: method === "HEAD" || options.noJSONTransform ? response : await response.json()
    };
  }

  return { success: true, message: options.successMessage };
};
