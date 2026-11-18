import {
  FileUpIcon,
  UsersIcon,
  WorkflowIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  phase: string;
  description: string;
};

export type NavGroup = { label: string; items: NavItem[] };

// One place for the app's routes. The sidebar and the overview page both read
// from this, so add, rename or remove routes here.
export const navGroups: NavGroup[] = [
  {
    label: "Levyline",
    items: [
      {
        title: "Import",
        href: "/import",
        icon: FileUpIcon,
        phase: "Part 1",
        description: "Upload a CSV of owners and receivables, map and validate it.",
      },
      {
        title: "Owners",
        href: "/owners",
        icon: UsersIcon,
        phase: "Part 2",
        description:
          "Every owner and their balance. Open one to see their receivables, message them and record a commitment.",
      },
      {
        title: "Automations",
        href: "/automations",
        icon: WorkflowIcon,
        phase: "Part 3",
        description: "Design an email automation on a canvas.",
      },
    ],
  },
];

export const navItems = navGroups.flatMap((group) => group.items);
