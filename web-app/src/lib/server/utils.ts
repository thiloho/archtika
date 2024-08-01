import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { ALLOWED_MIME_TYPES } from "../utils";

export const handleFileUpload = async (
  file: File,
  contentId: string,
  userId: string,
  session_token: string | undefined,
  customFetch: typeof fetch
) => {
  if (file.size === 0) return undefined;

  const MAX_FILE_SIZE = 1024 * 1024;

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      message: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / 1024 / 1024} MB.`
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      message: "Invalid file type. JPEG, PNG, SVG and WEBP are allowed."
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = join(process.cwd(), "static", "user-uploads", userId);
  await mkdir(uploadDir, { recursive: true });

  const fileId = randomUUID();
  const fileExtension = extname(file.name);
  const filepath = join(uploadDir, `${fileId}${fileExtension}`);

  await writeFile(filepath, buffer);

  const relativePath = relative(join(process.cwd(), "static"), filepath);

  const res = await customFetch("http://localhost:3000/media", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session_token}`,
      Prefer: "return=representation",
      Accept: "application/vnd.pgrst.object+json"
    },
    body: JSON.stringify({
      website_id: contentId,
      user_id: userId,
      original_name: file.name,
      file_system_path: relativePath
    })
  });

  const response = await res.json();

  if (!res.ok) {
    return { success: false, message: response.message };
  }

  return { success: true, content: response.id };
};
