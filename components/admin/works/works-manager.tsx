"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createWork, updateWork, deleteWork } from "@/lib/actions/works.actions";
import { MediaUpload } from "@/components/admin/shared/media-upload";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { Trash2, Edit, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export function WorksManager({ initialWorks }: { initialWorks: any[] }) {
  const [works, setWorks] = useState(initialWorks);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("videoUrl", videoUrl);
    fd.set("isVisible", String(isVisible));
    const res = editing ? await updateWork(editing.id, fd) : await createWork(fd);
    if (res.error) toast.error(res.error); else { toast.success(res.success); window.location.reload(); }
  }

  return (
    <Card>
      <CardHeader><div className="flex justify-between items-center"><CardTitle>أعمالي السابقة ({works.length})</CardTitle>
        <Dialog open={open} onOpenChange={(v)=>{setOpen(v); if(!v){setEditing(null); setVideoUrl(""); setIsVisible(true);}}}>
          <DialogTrigger asChild><Button onClick={()=>{setEditing(null); setVideoUrl("");}}><Plus className="h-4 w-4 ml-1"/>إضافة عمل</Button></DialogTrigger>
          <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{editing ? "تعديل عمل" : "إضافة عمل"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>العنوان</Label><Input name="title" defaultValue={editing?.title} required /></div>
              <div className="space-y-2"><Label>الفيديو</Label>
                {videoUrl && <video src={videoUrl} className="w-full h-48 object-contain rounded border" controls muted />}
                <MediaUpload type="video" onUpload={setVideoUrl} />
                <Input name="videoUrl_display" value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="/videos/video1.mp4 أو رابط Cloudinary" />
                <p className="text-xs text-muted-foreground">يدعم رفع Cloudinary أو رابط مباشر</p>
              </div>
              <div className="space-y-2"><Label>وصف الفيديو (alt)</Label><Input name="videoAlt" defaultValue={editing?.videoAlt} required /></div>
              <div className="space-y-2"><Label>الرابط الخارجي</Label><Input name="externalSourceUrl" defaultValue={editing?.externalSourceUrl} required placeholder="https://tiktok.com/..." /></div>
              <div className="space-y-2"><Label>المنصة</Label><Input name="platform" defaultValue={editing?.platform ?? "TikTok"} required /></div>
              <div className="space-y-2"><Label>الترتيب</Label><Input name="displayOrder" type="number" defaultValue={editing?.displayOrder ?? 0} /></div>
              <div className="flex items-center gap-2"><Switch checked={isVisible} onCheckedChange={setIsVisible} id="work-vis"/><Label htmlFor="work-vis">ظاهر</Label></div>
              <Button type="submit">{editing ? "تحديث" : "إضافة"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div></CardHeader>
      <CardContent><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {works.map((w:any)=>(
          <div key={w.id} className="border rounded-lg overflow-hidden">
            <video src={w.videoUrl} className="w-full h-48 object-contain bg-black" muted />
            <div className="p-4 space-y-2">
              <p className="font-semibold">{w.title} {w.isVisible ? "" : "🚫"}</p>
              <p className="text-xs text-muted-foreground">{w.platform} • #{w.displayOrder}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={()=>{setEditing(w); setVideoUrl(w.videoUrl); setIsVisible(w.isVisible); setOpen(true);}}><Edit className="h-4 w-4"/></Button>
                <ConfirmDialog trigger={<Button variant="destructive" size="sm"><Trash2 className="h-4 w-4"/></Button>} title="حذف العمل" description={`حذف ${w.title}؟`} onConfirm={async()=>{const r=await deleteWork(w.id); if(r.error) toast.error(r.error); else {toast.success(r.success); setWorks(works.filter((x:any)=>x.id!==w.id));}}} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {works.length===0 && <p className="text-center text-muted-foreground py-8">لا توجد أعمال</p>}
      </CardContent>
    </Card>
  );
}
