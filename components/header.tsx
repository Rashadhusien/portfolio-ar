"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { navLinks } from "@/lib/data";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export function Header({ brandName }: { brandName?: string }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const displayBrand = brandName || "Books With Arwa";

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-lg"
          : "bg-background/80 backdrop-blur-md border-b border-border/30",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative">
              <span className="font-bold text-xl md:text-2xl text-foreground group-hover:text-accent transition-colors duration-300">
                {displayBrand}
              </span>
              <div className="absolute -bottom-1 right-0 w-0 h-0.5 bg-gradient-to-l from-accent to-primary group-hover:w-full transition-all duration-300" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {session && (
              <Link
                href="/admin"
                className="relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm group"
              >
                إدارة الموقع
                <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
              </Link>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm group"
              >
                {link.label}
                <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors duration-200"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="border-t border-border/50 bg-background/95 backdrop-blur-lg">
          <div className="px-4 py-6 space-y-2">
            {session && (
              <Link
                href="/admin"
                className="flex items-center justify-between px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-all duration-200 group"
                onClick={() => setIsOpen(false)}
              >
                <span className="font-medium">إدارة الموقع</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
              </Link>
            )}
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-all duration-200"
                onClick={() => setIsOpen(false)}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
