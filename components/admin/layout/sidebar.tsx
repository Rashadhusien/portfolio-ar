"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  User,
  MessageSquare,
  Share2,
  Briefcase,
  FolderOpen,
  CreditCard,
  Home,
  Info,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

const adminLinks = [
  { label: "الرئيسية", href: "/admin", icon: LayoutDashboard },
  { label: "إعدادات الموقع", href: "/admin/settings", icon: Settings },
  { label: "معلومات التواصل", href: "/admin/contact", icon: MessageSquare },
  { label: "القسم الرئيسي", href: "/admin/hero", icon: Home },
  { label: "عني", href: "/admin/about", icon: Info },
  { label: "الخدمات", href: "/admin/services", icon: Briefcase },
  { label: "أعمالي السابقة", href: "/admin/works", icon: FolderOpen },
  { label: "الأسعار", href: "/admin/pricing", icon: CreditCard },
  { label: "روابط التواصل", href: "/admin/social", icon: Share2 },
  { label: "تغيير كلمة المرور", href: "/admin/settings/password", icon: User },
];

export default function AdminSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 right-0 z-50 w-64 border-l bg-card transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile close button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">القائمة</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
              <span>رجوع للموقع</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
