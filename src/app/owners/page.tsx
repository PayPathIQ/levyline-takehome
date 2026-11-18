import { UsersIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { TodoPlaceholder } from "@/components/todo-placeholder";

export default function Page() {
  return (
    <>
      <PageHeader title="Owners" description="Everyone who owes a service charge" />
      <main className="flex flex-1 items-center justify-center p-6">
        <TodoPlaceholder
          icon={UsersIcon}
          phase="Part 2"
          title="Owners"
          description="Part 2 in the README."
          file="src/app/owners/page.tsx"
          todo={[
            "One row per owner: balance, status, developments, units, email, phone, last message",
            "Search, and sort by balance or last message",
            "Filter by status or missing contact details",
            "Each row opens /owners/[ownerId]",
          ]}
        />
      </main>
    </>
  );
}
