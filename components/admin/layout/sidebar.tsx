"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { adminLinks } from "@/lib/data";
import Link from "next/link";

import { Menu } from "lucide-react";

export default function AdminSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>القائمة</SheetTitle>
        </SheetHeader>
        {adminLinks.map((link) => (
          <SheetClose key={link.href} asChild>
            <Button
              variant="ghost"
              asChild
              className="w-full justify-start p-6"
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          </SheetClose>
        ))}

        <SheetFooter>
          <SheetClose asChild>
            <Button asChild>
              <Link href="/">رجوع الي الموقع</Link>
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
