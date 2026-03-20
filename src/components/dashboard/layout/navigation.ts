import {
  IconBell,
  IconLayoutDashboard,
  IconSettings,
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
    label: "Settings",
    href: "/dashboard/settings",
    icon: IconSettings,
    isActive: (pathname: string) => pathname.startsWith("/dashboard/settings"),
  },
];
