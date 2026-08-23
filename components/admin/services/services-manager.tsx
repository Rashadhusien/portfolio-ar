"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createService,
  updateService,
  deleteService,
} from "@/lib/actions/services.actions";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { Trash2, Edit, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function ServicesManager({
  initialServices,
}: {
  initialServices: any[];
}) {
  const [services, setServices] = useState(initialServices);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [icon, setIcon] = useState("book");
  const [isVisible, setIsVisible] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("icon", icon);
    fd.set("isVisible", String(isVisible));
    const res = editing
      ? await updateService(editing.id, fd)
      : await createService(fd);
    if (res.error) toast.error(res.error);
    else {
      toast.success(res.success);
      window.location.reload();
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>الخدمات ({services.length})</CardTitle>
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) {
                setEditing(null);
                setIcon("book");
                setIsVisible(true);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditing(null);
                  setIcon("book");
                }}
              >
                <Plus className="h-4 w-4 ml-1" />
                إضافة خدمة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? "تعديل خدمة" : "إضافة خدمة"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>الاسم</Label>
                  <Input name="name" defaultValue={editing?.name} required />
                </div>
                <div className="space-y-2">
                  <Label>الوصف</Label>
                  <Textarea
                    name="description"
                    defaultValue={editing?.description}
                    required
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الأيقونة</Label>
                  <Select value={icon} onValueChange={setIcon}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book">book</SelectItem>
                      <SelectItem value="sparkles">sparkles</SelectItem>
                      <SelectItem value="camera">camera</SelectItem>
                      <SelectItem value="trending">trending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الترتيب</Label>
                  <Input
                    name="displayOrder"
                    type="number"
                    defaultValue={editing?.displayOrder ?? 0}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isVisible}
                    onCheckedChange={setIsVisible}
                    id="svc-vis"
                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input "
                  />
                  <Label htmlFor="svc-vis">ظاهر</Label>
                </div>
                <Button type="submit">{editing ? "تحديث" : "إضافة"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {services.map((s: any) => (
            <div
              key={s.id}
              className="flex justify-between items-center p-4 border rounded-lg"
            >
              <div>
                <p className="font-semibold">
                  {s.name} {s.isVisible ? "" : "🚫"}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({s.icon}) #{s.displayOrder}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(s);
                    setIcon(s.icon);
                    setIsVisible(s.isVisible);
                    setOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <ConfirmDialog
                  trigger={
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                  title="حذف الخدمة"
                  description={`حذف ${s.name}؟`}
                  onConfirm={async () => {
                    const r = await deleteService(s.id);
                    if (r.error) toast.error(r.error);
                    else {
                      toast.success(r.success);
                      setServices(services.filter((x: any) => x.id !== s.id));
                    }
                  }}
                />
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              لا توجد خدمات
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
