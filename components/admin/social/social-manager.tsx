"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSocialLink, updateSocialLink, deleteSocialLink } from "@/lib/actions/social.actions";
import { MediaUpload } from "@/components/admin/shared/media-upload";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { Trash2, Edit, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";

export function SocialManager({ initialLinks }: { initialLinks: any[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [iconUrl, setIconUrl] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("iconUrl", iconUrl);
    fd.set("isVisible", String(isVisible));
    const res = editing ? await updateSocialLink(editing.id, fd) : await createSocialLink(fd);
    if (res.error) toast.error(res.error); else { toast.success(res.success); window.location.reload(); }
  }

  return (
    <Card>
      <CardHeader><div className="flex justify-between items-center"><CardTitle>روابط التواصل ({links.length})</CardTitle>
        <Dialog open={open} onOpenChange={(v)=>{setOpen(v); if(!v){setEditing(null); setIconUrl(""); setIsVisible(true);}}}>
          <DialogTrigger asChild><Button onClick={()=>{setEditing(null); setIconUrl("");}}><Plus className="h-4 w-4 ml-1"/>إضافة</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>{editing ? "تعديل رابط" : "إضافة رابط"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>المنصة</Label><Input name="platform" defaultValue={editing?.platform} required placeholder="TikTok" /></div>
              <div className="space-y-2"><Label>الرابط</Label><Input name="url" type="url" defaultValue={editing?.url} required placeholder="https://..." /></div>
              <div className="space-y-2"><Label>الأيقونة</Label>
                {iconUrl && <Image src={iconUrl} alt="icon" width={48} height={48} className="rounded border" />}
                <MediaUpload type="image" onUpload={setIconUrl} />
                <Input value={iconUrl} onChange={e=>setIconUrl(e.target.value)} placeholder="/tiktok.svg أو رابط Cloudinary" />
              </div>
              <div className="space-y-2"><Label>الترتيب</Label><Input name="displayOrder" type="number" defaultValue={editing?.displayOrder ?? 0} /></div>
              <div className="flex items-center gap-2"><Switch checked={isVisible} onCheckedChange={setIsVisible} id="soc-vis"/><Label htmlFor="soc-vis">ظاهر</Label></div>
              <Button type="submit">{editing ? "تحديث" : "إضافة"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div></CardHeader>
      <CardContent><div className="grid gap-3">
        {links.map((s:any)=>(
          <div key={s.id} className="flex justify-between items-center p-3 border rounded-lg">
            <div className="flex items-center gap-3"><Image src={s.iconUrl} alt={s.platform} width={32} height={32} className="rounded" /><div><p className="font-medium">{s.platform} {s.isVisible ? "" : "🚫"}</p><p className="text-xs text-muted-foreground">{s.url} • #{s.displayOrder}</p></div></div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={()=>{setEditing(s); setIconUrl(s.iconUrl); setIsVisible(s.isVisible); setOpen(true);}}><Edit className="h-4 w-4"/></Button>
              <ConfirmDialog trigger={<Button variant="destructive" size="sm"><Trash2 className="h-4 w-4"/></Button>} title="حذف الرابط" description={s.platform} onConfirm={async()=>{const r=await deleteSocialLink(s.id); if(r.error) toast.error(r.error); else {toast.success(r.success); setLinks(links.filter((x:any)=>x.id!==s.id));}}} />
            </div>
          </div>
        ))}
        {links.length===0 && <p className="text-center text-muted-foreground py-8">لا توجد روابط</p>}
      </div></CardContent>
    </Card>
  );
}
