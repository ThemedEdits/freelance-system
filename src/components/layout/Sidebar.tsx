"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  CalendarClock,
  Bell,
  Settings,
  Palette,
  Globe,
  Code2,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  unreadNotificationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  unreadNotificationsCount = 0,
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: <LayoutDashboard size={16} />,
    },
    {
      label: "Clients",
      href: "/clients",
      icon: <Users size={16} />,
    },
    {
      label: "Projects & Posts",
      href: "/projects",
      icon: <Briefcase size={16} />,
    },
    {
      label: "Monthly Cycles",
      href: "/cycles",
      icon: <CalendarClock size={16} />,
    },
    {
      label: "Invoices",
      href: "/invoices",
      icon: <FileText size={16} />,
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: <Bell size={16} />,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings size={16} />,
    },
  ];

  const serviceCategories = [
    {
      name: "Graphic Design",
      href: "/clients?category=graphic_design",
      icon: <Palette size={13} className="text-zinc-400" />,
    },
    {
      name: "Web Development",
      href: "/clients?category=web_development",
      icon: <Globe size={13} className="text-zinc-400" />,
    },
    {
      name: "Software Clients",
      href: "/clients?category=software_engineering",
      icon: <Code2 size={13} className="text-zinc-400" />,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-black border-r border-white/10 z-30 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-zinc-950 border border-white/15 shrink-0 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Themed Edits Logo"
            width={32}
            height={32}
            className="object-contain p-0.5"
            priority
          />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-semibold text-white tracking-tight leading-none">
            Themed Edits
          </span>
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mt-1">
            Client Hub
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
            Main Menu
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "text-white bg-zinc-900 border border-white/15"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={
                        isActive ? "text-white" : "text-zinc-400"
                      }
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-white text-black">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Divisions / Services */}
        <div>
          <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
            Services Division
          </span>
          <div className="space-y-1">
            {serviceCategories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-white/5 hover:border-white/10 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  {cat.icon}
                  <span>{cat.name}</span>
                </div>
                <ChevronRight
                  size={12}
                  className="text-zinc-400"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>


    </aside>
  );
};
