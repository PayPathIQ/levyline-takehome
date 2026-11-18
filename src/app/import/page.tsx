import { FileUpIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { TodoPlaceholder } from "@/components/todo-placeholder";

export default function Page() {
  return (
    <>
      <PageHeader title="Import" description="Owners and receivables from a CSV" />
      <main className="flex flex-1 items-center justify-center p-6">
        <TodoPlaceholder
          icon={FileUpIcon}
          phase="Part 1"
          title="Import"
          description="Part 1 in the README. Rules 1 to 4 in PRODUCT_RULES.md apply."
          file="src/app/import/page.tsx"
          todo={[
            "Upload a CSV and map its columns to your fields",
            "Preview before saving: created, updated, tidied and skipped (with reasons)",
            "Suggest rows that look like the same owner; staff confirm the merge",
            "Flag owners with no usable email",
            "Re-importing updates, never duplicates, and keeps staff edits",
            "List units missing from a new file; staff choose whether to archive",
            "Download skipped rows as a CSV with the reason",
          ]}
        />
      </main>
    </>
  );
}
