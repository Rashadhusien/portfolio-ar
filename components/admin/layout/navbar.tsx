"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth.actions";
import { Menu, X, LogOut, User } from "lucide-react";

export default function AdminNavbar({
  onMenuToggle,
}: {
  onMenuToggle: () => void;
}) {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile menu button */}
        <button
          onClick={() => {
            setIsMobileMenuOpen(!isMobileMenuOpen);
            onMenuToggle();
          }}
          className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold">لوحة التحكم</h1>
            <p className="text-xs text-muted-foreground">
              {session?.user?.name}
            </p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-lg font-bold">لوحة التحكم</h1>
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{session?.user?.name}</span>
          </div>
          <form action={logout}>
            <Button variant="outline" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </form>
        </div>

        {/* Mobile menu button for logout */}
        <div className="lg:hidden">
          <form action={logout}>
            <Button variant="ghost" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">تسجيل الخروج</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile info bar */}
      <div className="lg:hidden border-t bg-accent/50 px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{session?.user?.name}</span>
        </div>
      </div>
    </nav>
  );
}
