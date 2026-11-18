import { WorkflowIcon } from "lucide-react";

import { AutomationCanvas } from "@/components/automation-canvas";
import { PageHeader } from "@/components/page-header";

export default function Page() {
  return (
    <>
      <PageHeader title="Automations" description="Design an email automation" />
      <main className="relative flex-1">
        <div className="absolute inset-0">
          <AutomationCanvas />
        </div>
        {/* Delete this hint once the canvas has nodes. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <div className="max-w-sm rounded-2xl border bg-card/90 p-6 text-center shadow-sm backdrop-blur">
            <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <WorkflowIcon className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold tracking-tight">
              An empty canvas
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              React Flow is wired up. Add Start and End, a step library (Send
              email, Wait, Branch), validation, saving, and a way to turn it
              on for owners. See Part 3 in the README.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
