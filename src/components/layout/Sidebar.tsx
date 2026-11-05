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
import { motion } from "framer-motion";

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
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: "Clients",
      href: "/clients",
      icon: <Users size={18} />,
    },
    {
      label: "Projects & Posts",
      href: "/projects",
      icon: <Briefcase size={18} />,
    },
    {
      label: "Monthly Cycles",
      href: "/cycles",
      icon: <CalendarClock size={18} />,
    },
    {
      label: "Invoices",
      href: "/invoices",
      icon: <FileText size={18} />,
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: <Bell size={18} />,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings size={18} />,
    },
  ];

  const serviceCategories = [
    {
      name: "Graphic Design",
      href: "/clients?category=graphic_design",
      icon: <Palette size={14} className="text-cyan-400" />,
      color: "border-cyan-500/20 text-cyan-300",
    },
    {
      name: "Web Development",
      href: "/clients?category=web_development",
      icon: <Globe size={14} className="text-purple-400" />,
      color: "border-purple-500/20 text-purple-300",
    },
    {
      name: "Software Clients",
      href: "/clients?category=software_engineering",
      icon: <Code2 size={14} className="text-emerald-400" />,
      color: "border-emerald-500/20 text-emerald-300",
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-[#090d16]/90 backdrop-blur-2xl border-r border-white/[0.08] z-30 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3.5 px-6 py-5 border-b border-white/[0.06]">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/[0.1] shadow-[0_0_15px_rgba(0,229,255,0.15)] shrink-0 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Themed Edits Logo"
            width={40}
            height={40}
            className="object-contain p-1"
            priority
          />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            Themed Edits
          </span>
          <span className="text-[11px] font-medium text-cyan-400 uppercase tracking-widest truncate">
            Client Hub
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
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
                  className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? "text-white bg-gradient-to-r from-cyan-500/15 to-blue-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.12)]"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        isActive
                          ? "text-cyan-400"
                          : "text-slate-400 group-hover:text-cyan-300"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow-[0_0_8px_rgba(244,63,94,0.5)]">
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_8px_#00E5FF]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Divisions / Services */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Services Division
          </span>
          <div className="space-y-1.5">
            {serviceCategories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] text-xs font-medium text-slate-300 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  {cat.icon}
                  <span>{cat.name}</span>
                </div>
                <ChevronRight
                  size={12}
                  className="text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/[0.06] bg-slate-950/40">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] text-slate-500">Design • Web • Code</span>
          <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            PKR
          </span>
        </div>
      </div>
    </aside>
  );
};
