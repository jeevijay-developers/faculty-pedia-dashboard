import {
  BarChart3,
  BookOpen,
  FileText,
  IndianRupee,
  Megaphone,
  MessageSquare,
  MoreHorizontal,
  TestTube,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Shared navigation contract for the mobile shell.
 *
 * The desktop sidebar keeps its own `navigation` array in
 * `components/dashboard-sidebar.tsx` — deliberately untouched. This module
 * describes the same destinations reshaped for a 4-tab bottom bar, and is the
 * single source of truth for which routes belong to which tab.
 */

export interface NavLink {
  name: string;
  href: string;
}

export interface MobileTab {
  /** Stable id, also used as the active-tab key. */
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
  /**
   * Route prefixes this tab owns. Used to resolve the active tab, so that
   * e.g. /dashboard/questions correctly highlights "Test".
   */
  owns: string[];
  /** Rendered as in-page segmented tabs on the section landing page. */
  submenu?: NavLink[];
}

export interface MoreSection {
  name: string;
  href?: string;
  icon: LucideIcon;
  submenu?: NavLink[];
}

export const MORE_TAB_ID = "more";

/** The four primary destinations, in bottom-bar order. */
export const MOBILE_TABS: MobileTab[] = [
  {
    id: "home",
    name: "Home",
    href: "/dashboard",
    icon: BarChart3,
    owns: [],
  },
  {
    id: "courses",
    name: "Courses",
    href: "/dashboard/courses",
    icon: BookOpen,
    owns: ["/dashboard/courses"],
    submenu: [
      { name: "Live Courses", href: "/dashboard/courses/live" },
      { name: "Webinar", href: "/dashboard/courses/webinar" },
    ],
  },
  {
    id: "test",
    name: "Test",
    href: "/dashboard/test",
    icon: TestTube,
    owns: ["/dashboard/test", "/dashboard/questions", "/dashboard/test-series"],
    submenu: [
      { name: "Question Bank", href: "/dashboard/questions" },
      { name: "Test Bank", href: "/dashboard/test" },
      { name: "Test Series", href: "/dashboard/test-series" },
    ],
  },
  {
    id: "students",
    name: "Students",
    href: "/dashboard/students",
    icon: Users,
    owns: ["/dashboard/students"],
  },
];

/** Everything that did not earn a tab slot. */
export const MORE_SECTIONS: MoreSection[] = [
  {
    name: "Content",
    icon: FileText,
    submenu: [
      { name: "Study material", href: "/dashboard/content/study-material" },
      { name: "Videos", href: "/dashboard/content/videos" },
      { name: "Live Classes", href: "/dashboard/content/live-classes" },
      { name: "Post", href: "/dashboard/content/post" },
    ],
  },
  { name: "Revenue", href: "/dashboard/revenue", icon: IndianRupee },
  { name: "Messages", href: "/dashboard/messages", icon: Megaphone },
  { name: "Queries", href: "/dashboard/manage-queries", icon: MessageSquare },
];

export const MORE_TAB = {
  id: MORE_TAB_ID,
  name: "More",
  icon: MoreHorizontal,
} as const;

/**
 * Which bottom tab should light up for a given pathname.
 * Returns MORE_TAB_ID for anything living behind the More sheet.
 */
export function resolveActiveTab(pathname: string): string {
  if (pathname === "/dashboard") return "home";

  for (const tab of MOBILE_TABS) {
    if (tab.owns.some((prefix) => pathname.startsWith(prefix))) {
      return tab.id;
    }
  }

  return MORE_TAB_ID;
}

/** Human-readable title for the mobile top bar. */
export function resolvePageTitle(pathname: string): string {
  const all: NavLink[] = [
    { name: "Home", href: "/dashboard" },
    ...MOBILE_TABS.flatMap((tab) => [
      { name: tab.name, href: tab.href },
      ...(tab.submenu ?? []),
    ]),
    ...MORE_SECTIONS.flatMap((section) =>
      section.href
        ? [{ name: section.name, href: section.href }, ...(section.submenu ?? [])]
        : (section.submenu ?? [])
    ),
  ];

  const exact = all.find((link) => link.href === pathname);
  if (exact) return exact.name;

  const nested = all
    .filter((link) => link.href !== "/dashboard" && pathname.startsWith(link.href))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return nested?.name ?? "Dashboard";
}
