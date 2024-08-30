import { dev } from "$app/environment";

export const API_BASE_PREFIX = dev
  ? "http://localhost:3000"
  : `${process.env.ORIGIN ? `${process.env.ORIGIN}/api` : "http://localhost:3000"}`;
