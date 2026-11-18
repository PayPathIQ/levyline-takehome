import { UserIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { TodoPlaceholder } from "@/components/todo-placeholder";

export default async function Page({
  params,
}: {
  params: Promise<{ ownerId: string }>;
}) {
  const { ownerId } = await params;
  return (
    <>
      <PageHeader title="Owner" description={`Owner ${ownerId}`} />
      <main className="flex flex-1 items-center justify-center p-6">
        <TodoPlaceholder
          icon={UserIcon}
          phase="Part 2"
          title="Owner page"
          description="Part 2 in the README. Rules 5 to 7 and 11 to 16 apply."
          file="src/app/owners/[ownerId]/page.tsx"
          todo={[
            "Header: contact details and status badges",
            "Overview: balance per Client and a receivables breakdown",
            "Conversation: email the owner and see their replies, like a chat",
            "Timeline: everything that has happened, newest first",
            "Actions: commitment, dispute, do not contact, pause or resume automation",
          ]}
        />
      </main>
    </>
  );
}
