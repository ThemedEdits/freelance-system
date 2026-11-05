"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Menu,
  X,
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
import { motion, AnimatePresence } from "framer-motion";

interface MobileNavProps {
  unreadNotificationsCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  unreadNotificationsCount = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/", icon: <LayoutDashboard size={18} /> },
    { label: "Clients", href: "/clients", icon: <Users size={18} /> },
    { label: "Projects & Posts", href: "/projects", icon: <Briefcase size={18} /> },
    { label: "Monthly Cycles", href: "/cycles", icon: <CalendarClock size={18} /> },
    { label: "Invoices", href: "/invoices", icon: <FileText size={18} /> },
    {
      label: "Notifications",
      href: "/notifications",
      icon: <Bell size={18} />,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    },
    { label: "Settings", href: "/settings", icon: <Settings size={18} /> },
  ];

  return (
    <>
      {/* Top Mobile Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#090d16]/95 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-white/[0.1] shrink-0">
            <Image
              src="/logo.png"
              alt="Themed Edits"
              width={32}
              height={32}
              className="object-contain p-0.5"
            />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">
            Themed Edits
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {unreadNotificationsCount > 0 && (
            <Link
              href="/notifications"
              className="relative p-2 rounded-lg bg-white/[0.04] text-slate-300 hover:text-white"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open mobile menu"
            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-200 hover:text-cyan-400 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Slide-in Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-[#0c121e] border-r border-white/[0.1] shadow-2xl flex flex-col z-50 p-5 overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-white/[0.1]">
                    <Image
                      src="/logo.png"
                      alt="Themed Edits"
                      width={32}
                      height={32}
                      className="object-contain p-0.5"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm block">
                      Themed Edits
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-cyan-400">
                      Client Hub
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.05]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="py-4 space-y-1 flex-1">
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "text-white bg-cyan-500/15 border border-cyan-500/30 font-semibold"
                          : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={isActive ? "text-cyan-400" : "text-slate-400"}
                        >
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== null && item.badge !== undefined && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-white/[0.08]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 px-2">
                    Divisions
                  </span>
                  <div className="space-y-1">
                    <Link
                      href="/clients?category=graphic_design"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs rounded-lg text-slate-300 hover:text-white bg-white/[0.02]"
                    >
                      <span className="flex items-center gap-2">
                        <Palette size={13} className="text-cyan-400" /> Graphic Design
                      </span>
                      <ChevronRight size={12} className="text-slate-500" />
                    </Link>
                    <Link
                      href="/clients?category=web_development"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs rounded-lg text-slate-300 hover:text-white bg-white/[0.02]"
                    >
                      <span className="flex items-center gap-2">
                        <Globe size={13} className="text-purple-400" /> Web Development
                      </span>
                      <ChevronRight size={12} className="text-slate-500" />
                    </Link>
                    <Link
                      href="/clients?category=software_engineering"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs rounded-lg text-slate-300 hover:text-white bg-white/[0.02]"
                    >
                      <span className="flex items-center gap-2">
                        <Code2 size={13} className="text-emerald-400" /> Software Clients
                      </span>
                      <ChevronRight size={12} className="text-slate-500" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Contact */}
              <div className="pt-4 border-t border-white/[0.08] text-xs text-slate-400">
                <p className="text-[11px] text-slate-500">Instagram: themed.edits.te</p>
                <p className="text-[11px] text-slate-500">WhatsApp: 03323954620</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
