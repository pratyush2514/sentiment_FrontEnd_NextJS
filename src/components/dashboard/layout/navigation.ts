import {
  IconBell,
  IconChecklist,
  IconLayoutDashboard,
  IconSettings,
  IconVideo,
  type Icon,
} from "@tabler/icons-react";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: Icon;
  isActive: (pathname: string) => boolean;
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: IconLayoutDashboard,
    isActive: (pathname: string) =>
      pathname === "/dashboard" || pathname.startsWith("/dashboard/channels"),
  },
  {
    label: "Alerts",
    href: "/dashboard/alerts",
    icon: IconBell,
    isActive: (pathname: string) => pathname.startsWith("/dashboard/alerts"),
  },
  {
    label: "Meetings",
    href: "/dashboard/meetings",
    icon: IconVideo,
    isActive: (pathname: string) => pathname.startsWith("/dashboard/meetings"),
  },
  {
    label: "Commitments",
    href: "/dashboard/commitments",
    icon: IconChecklist,
    isActive: (pathname: string) => pathname.startsWith("/dashboard/commitments"),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: IconSettings,
    isActive: (pathname: string) => pathname.startsWith("/dashboard/settings"),
  },
];
