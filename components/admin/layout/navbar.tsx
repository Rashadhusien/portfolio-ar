"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth.actions";
import {
  Menu,
  X,
  LogOut,
  User,
  Search,
  Bell,
  ChevronDown,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminNavbar({
  onMenuToggle,
}: {
  onMenuToggle: () => void;
}) {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setNotificationsOpen(false);
      setProfileOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-lg"
          : "bg-background/80 backdrop-blur-md border-b border-border/30",
      )}
    >
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={() => {
            setIsMobileMenuOpen(!isMobileMenuOpen);
            onMenuToggle();
          }}
          className="lg:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors duration-200"
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <div className="relative">
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                لوحة التحكم
              </h1>
              <div className="absolute -bottom-1 right-0 w-0 h-0.5 bg-gradient-to-l from-accent to-primary transition-all duration-300 hover:w-full" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">أروى</p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-lg font-bold">لوحة التحكم</h1>
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Search button */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-primary/10 transition-colors duration-200"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">بحث</span>
          </Button>

          {/* User profile */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-primary/10 transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setProfileOpen(!profileOpen);
              }}
            >
              <User className="h-4 w-4" />
              <span className="hidden md:inline">لولو</span>
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            </Button>

            {/* Profile dropdown */}
            {profileOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg p-2 z-50">
                <div className="px-3 py-2 border-b border-border/50 mb-2">
                  <p className="font-medium text-sm">لولو</p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-primary/5 hover:text-foreground rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  الإعدادات
                </Link>
                <form action={logout}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    تسجيل الخروج
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Mobile actions */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Mobile search */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-primary/10 transition-colors duration-200"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Mobile notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-primary/10 transition-colors duration-200 relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Mobile logout */}
          <form action={logout}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-primary/10 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">تسجيل الخروج</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-lg px-4 py-3">
          <div className="container mx-auto">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث في لوحة التحكم..."
                className="w-full pr-10 pl-4 py-2 bg-primary/5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile info bar */}
      <div className="lg:hidden border-t border-border/50 bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-accent" />
          <span className="text-foreground font-medium">
            {session?.user?.name}
          </span>
        </div>
      </div>
    </nav>
  );
}
