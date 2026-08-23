"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateAboutContent, createAboutFeature, updateAboutFeature, deleteAboutFeature, createAboutStat, updateAboutStat, deleteAboutStat } from "@/lib/actions/about.actions";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { Trash2, Edit, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export function AboutManager({ initialContent, initialFeatures, initialStats }: any) {
  const [content, setContent] = useState(initialContent ?? { title: "", content: "" });
  const [loading, setLoading] = useState(false);

  async function handleContentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const res = await updateAboutContent(fd);
    setLoading(false);
    if (res.error) toast.error(res.error); else toast.success(res.success);
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>محتوى عني</CardTitle><CardDescription>العنوان والنص الرئيسي</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleContentSubmit} className="space-y-4">
            <div className="space-y-2"><Label>العنوان</Label><Input name="title" defaultValue={content.title} required /></div>
            <div className="space-y-2"><Label>المحتوى</Label><Textarea name="content" defaultValue={content.content} rows={6} required /></div>
            <Button type="submit" disabled={loading}>{loading ? "جاري الحفظ..." : "حفظ المحتوى"}</Button>
          </form>
        </CardContent>
      </Card>

      <FeaturesManager features={initialFeatures} />
      <StatsManager stats={initialStats} />
    </div>
  );
}

function FeaturesManager({ features }: { features: any[] }) {
  const [items, setItems] = useState(features);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = editing ? await updateAboutFeature(editing.id, fd) : await createAboutFeature(fd);
    if (res.error) toast.error(res.error); else { toast.success(res.success); window.location.reload(); }
  }

  return (
    <Card>
      <CardHeader><div className="flex justify-between items-center"><CardTitle>المميزات</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" onClick={()=>setEditing(null)}><Plus className="h-4 w-4 ml-1"/>إضافة</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>{editing ? "تعديل ميزة" : "إضافة ميزة"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>النص</Label><Input name="feature" defaultValue={editing?.feature} required /></div>
              <div className="space-y-2"><Label>الترتيب</Label><Input name="displayOrder" type="number" defaultValue={editing?.displayOrder ?? 0} /></div>
              <Button type="submit">{editing ? "تحديث" : "إضافة"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div></CardHeader>
      <CardContent><div className="space-y-2">
        {items.map((f: any) => (
          <div key={f.id} className="flex justify-between items-center p-3 border rounded-lg">
            <span>{f.feature} <span className="text-xs text-muted-foreground">#{f.displayOrder}</span></span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={()=>{setEditing(f); setOpen(true);}}><Edit className="h-4 w-4"/></Button>
              <ConfirmDialog trigger={<Button variant="destructive" size="sm"><Trash2 className="h-4 w-4"/></Button>} title="حذف الميزة" description="هل أنت متأكد؟" onConfirm={async()=>{const r=await deleteAboutFeature(f.id); if(r.error) toast.error(r.error); else {toast.success(r.success); setItems(items.filter((x:any)=>x.id!==f.id));}}} />
            </div>
          </div>
        ))}
        {items.length===0 && <p className="text-center text-muted-foreground py-4">لا توجد مميزات</p>}
      </div></CardContent>
    </Card>
  );
}

function StatsManager({ stats }: { stats: any[] }) {
  const [items, setItems] = useState(stats);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // handle checkbox isVisible
    const isVisible = (e.currentTarget.querySelector('#isVisible') as HTMLInputElement)?.checked;
    fd.set("isVisible", String(isVisible));
    const res = editing ? await updateAboutStat(editing.id, fd) : await createAboutStat(fd);
    if (res.error) toast.error(res.error); else { toast.success(res.success); window.location.reload(); }
  }

  return (
    <Card>
      <CardHeader><div className="flex justify-between items-center"><CardTitle>الإحصائيات</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" onClick={()=>setEditing(null)}><Plus className="h-4 w-4 ml-1"/>إضافة</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>{editing ? "تعديل إحصائية" : "إضافة إحصائية"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>المنصة</Label><Input name="title" defaultValue={editing?.title} required /></div>
              <div className="space-y-2"><Label>المتابعين</Label><Input name="followers" defaultValue={editing?.followers} required placeholder="مثال: 7K+" /></div>
              <div className="space-y-2"><Label>الترتيب</Label><Input name="displayOrder" type="number" defaultValue={editing?.displayOrder ?? 0} /></div>
              <div className="flex items-center gap-2"><Switch id="isVisible" defaultChecked={editing?.isVisible ?? true} /><Label htmlFor="isVisible">ظاهر</Label></div>
              <Button type="submit">{editing ? "تحديث" : "إضافة"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div></CardHeader>
      <CardContent><div className="space-y-2">
        {items.map((s: any) => (
          <div key={s.id} className="flex justify-between items-center p-3 border rounded-lg">
            <span>{s.title} - <b className="text-accent">{s.followers}</b> {s.isVisible ? "👁️" : "🚫"}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={()=>{setEditing(s); setOpen(true);}}><Edit className="h-4 w-4"/></Button>
              <ConfirmDialog trigger={<Button variant="destructive" size="sm"><Trash2 className="h-4 w-4"/></Button>} title="حذف الإحصائية" description="هل أنت متأكد؟" onConfirm={async()=>{const r=await deleteAboutStat(s.id); if(r.error) toast.error(r.error); else {toast.success(r.success); setItems(items.filter((x:any)=>x.id!==s.id));}}} />
            </div>
          </div>
        ))}
        {items.length===0 && <p className="text-center text-muted-foreground py-4">لا توجد إحصائيات</p>}
      </div></CardContent>
    </Card>
  );
}
