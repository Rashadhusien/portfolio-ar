import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

async function logout() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}

export default async function AdminPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Welcome back, {session.user?.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p>
                <strong>Email:</strong> {session.user?.email}
              </p>
              <p>
                <strong>Role:</strong> {session.user?.role}
              </p>
            </div>
            <form action={logout}>
              <Button type="submit">Logout</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
