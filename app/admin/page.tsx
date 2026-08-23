import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  services,
  previousWorks,
  pricingPackages,
  socialLinks,
} from "@/lib/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  Briefcase,
  FolderOpen,
  CreditCard,
  Share2,
  Settings,
  MessageSquare,
  Home,
  Info,
  User,
} from "lucide-react";

export default async function AdminPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  // Get dashboard stats
  const servicesCount = await db.query.services.findMany();
  const worksCount = await db.query.previousWorks.findMany();
  const packagesCount = await db.query.pricingPackages.findMany();
  const socialCount = await db.query.socialLinks.findMany();

  const quickLinks = [
    {
      title: "إعدادات الموقع",
      href: "/admin/settings",
      icon: Settings,
      color: "text-blue-500",
    },
    {
      title: "معلومات التواصل",
      href: "/admin/contact",
      icon: MessageSquare,
      color: "text-green-500",
    },
    {
      title: "القسم الرئيسي",
      href: "/admin/hero",
      icon: Home,
      color: "text-purple-500",
    },
    {
      title: "عني",
      href: "/admin/about",
      icon: Info,
      color: "text-orange-500",
    },
    {
      title: "الخدمات",
      href: "/admin/services",
      icon: Briefcase,
      color: "text-pink-500",
    },
    {
      title: "أعمالي السابقة",
      href: "/admin/works",
      icon: FolderOpen,
      color: "text-indigo-500",
    },
    {
      title: "الأسعار",
      href: "/admin/pricing",
      icon: CreditCard,
      color: "text-yellow-500",
    },
    {
      title: "روابط التواصل",
      href: "/admin/social",
      icon: Share2,
      color: "text-red-500",
    },
    {
      title: "تغيير كلمة المرور",
      href: "/admin/settings/password",
      icon: User,
      color: "text-gray-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          مرحباً، {session.user?.name} 👋
        </h1>
        <p className="text-muted-foreground">إليك نظرة عامة على موقعك</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الخدمات</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servicesCount.length}</div>
            <p className="text-xs text-muted-foreground">خدمة متاحة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              أعمالي السابقة
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{worksCount.length}</div>
            <p className="text-xs text-muted-foreground">عمل معروض</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">باقات الأسعار</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packagesCount.length}</div>
            <p className="text-xs text-muted-foreground">باقة متاحة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">روابط التواصل</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{socialCount.length}</div>
            <p className="text-xs text-muted-foreground">منصة متصلة</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>وصول سريع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Icon className={`h-5 w-5 ${link.color}`} />
                  <span className="font-medium">{link.title}</span>
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات الجلسة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">البريد الإلكتروني:</span>
              <span className="font-medium">{session.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الدور:</span>
              <span className="font-medium">{session.user?.role}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
