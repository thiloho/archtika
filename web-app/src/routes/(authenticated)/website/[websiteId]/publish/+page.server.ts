import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

export const load = async ({ parent }) => {
  const { website } = await parent();

  return {
    website
  };
};

export const actions = {
  publishWebsite: async ({ fetch }) => {
    console.log("test");
  }
};

const generateWebsiteOutput = async () => {};
