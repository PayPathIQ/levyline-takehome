<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Levyline take-home

The brief is in `README.md` and the business rules are in `PRODUCT_RULES.md`. Read both before starting.

- UI: Tailwind v4 and shadcn/ui (Radix, "nova" preset). Components live in `src/components/ui/`; add more with `npx shadcn@latest add <name>`.
- Routes: `src/lib/nav.ts` drives both the sidebar and the overview page. Each page starts with `<PageHeader>`.
- Database: Postgres through `src/lib/db.ts`. There's no schema yet; it goes in `migrations/`.
- Email: send through `sendEmail()` and read replies with `getReceivedEmail()` in `src/lib/email.ts`. Don't modify that file.
- Check your work with `npm run typecheck`.
