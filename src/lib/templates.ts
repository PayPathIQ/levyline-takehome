import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// Loads the starter email templates from /templates. Each file starts with a
// "Subject:" line, then a blank line, then the body. Placeholders look like
// {{owner_first_name}} and can appear in the subject too. Feel free to move
// templates into the database.
export type EmailTemplate = {
  id: string;
  subject: string;
  body: string;
  placeholders: string[];
};

const TEMPLATES_DIR = path.join(process.cwd(), "templates");

export async function listTemplates(): Promise<EmailTemplate[]> {
  const files = (await readdir(TEMPLATES_DIR)).filter((f) => f.endsWith(".md"));
  return Promise.all(
    files.sort().map(async (file) => {
      const raw = await readFile(path.join(TEMPLATES_DIR, file), "utf8");
      const [firstLine, ...rest] = raw.split("\n");
      const subject = firstLine.replace(/^Subject:\s*/, "").trim();
      const body = rest.join("\n").trim();
      const placeholders = [
        ...new Set([...raw.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1])),
      ];
      return { id: file.replace(/\.md$/, ""), subject, body, placeholders };
    }),
  );
}
