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
      {/* Top Mobile Bar - sticky top */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-black border-b border-white/10 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-black border border-white/15 shrink-0 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Themed Edits"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">
            Themed Edits
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white" />
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-200 hover:text-white transition-colors"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Slide-in Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="absolute top-0 bottom-0 left-0 w-72 bg-black border-r border-white/10 p-5 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-black border border-white/15 flex items-center justify-center">
                      <Image
                        src="/logo.png"
                        alt="Themed Edits"
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    </div>
                    <span className="font-bold text-white text-sm">
                      Themed Edits
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close menu"
                    className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-white/10"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-5 space-y-1">
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
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-white text-black font-semibold"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== null && (
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${
                              isActive
                                ? "bg-black text-white"
                                : "bg-white text-black"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] text-zinc-400">
                  Themed Edits Client Management • PKR
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
