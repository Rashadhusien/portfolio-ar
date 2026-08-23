"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPricingPackage, updatePricingPackage, deletePricingPackage, setPopularPackage, createPricingFeature, updatePricingFeature, deletePricingFeature } from "@/lib/actions/pricing.actions";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { Trash2, Edit, Plus, Star, Crown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export function PricingManager({ initialPackages }: { initialPackages: any[] }) {
  const [packages, setPackages] = useState(initialPackages);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("isPopular", String(isPopular));
    fd.set("isVisible", String(isVisible));
    const res = editing ? await updatePricingPackage(editing.id, fd) : await createPricingPackage(fd);
    if (res.error) toast.error(res.error); else { toast.success(res.success); window.location.reload(); }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><div className="flex justify-between items-center"><CardTitle>الباقات ({packages.length})</CardTitle>
          <Dialog open={open} onOpenChange={(v)=>{setOpen(v); if(!v){setEditing(null); setIsPopular(false); setIsVisible(true);}}}>
            <DialogTrigger asChild><Button onClick={()=>{setEditing(null);}}><Plus className="h-4 w-4 ml-1"/>إضافة باقة</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>{editing ? "تعديل باقة" : "إضافة باقة"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2"><Label>الاسم</Label><Input name="name" defaultValue={editing?.name} required /></div>
                <div className="space-y-2"><Label>الوصف</Label><Textarea name="description" defaultValue={editing?.description} required rows={2} /></div>
                <div className="space-y-2"><Label>السعر (جنيه)</Label><Input name="price" type="number" defaultValue={editing?.price ?? 0} required /></div>
                <div className="space-y-2"><Label>الترتيب</Label><Input name="displayOrder" type="number" defaultValue={editing?.displayOrder ?? 0} /></div>
                <div className="flex gap-4"><div className="flex items-center gap-2"><Switch checked={isPopular} onCheckedChange={setIsPopular} id="pop"/><Label htmlFor="pop">الأكثر شهرة ⭐</Label></div><div className="flex items-center gap-2"><Switch checked={isVisible} onCheckedChange={setIsVisible} id="vis"/><Label htmlFor="vis">ظاهر</Label></div></div>
                <Button type="submit">{editing ? "تحديث" : "إضافة"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div></CardHeader>
        <CardContent><div className="grid gap-4">
          {packages.map((pkg:any)=>(
            <Card key={pkg.id} className={pkg.isPopular ? "border-accent border-2" : ""}>
              <CardHeader><div className="flex justify-between">
                <div><CardTitle className="flex gap-2 items-center">{pkg.name} {pkg.isPopular && <Crown className="h-4 w-4 text-yellow-500"/>}</CardTitle><p className="text-sm text-muted-foreground">{pkg.description} • {pkg.price} جنيه • #{pkg.displayOrder} {pkg.isVisible ? "" : "🚫"}</p></div>
                <div className="flex gap-2">
                  {!pkg.isPopular && <Button variant="outline" size="sm" onClick={async()=>{const r=await setPopularPackage(pkg.id); if(r.error) toast.error(r.error); else {toast.success(r.success); window.location.reload();}}}><Star className="h-4 w-4"/></Button>}
                  <Button variant="outline" size="sm" onClick={()=>{setEditing(pkg); setIsPopular(pkg.isPopular); setIsVisible(pkg.isVisible); setOpen(true);}}><Edit className="h-4 w-4"/></Button>
                  <ConfirmDialog trigger={<Button variant="destructive" size="sm"><Trash2 className="h-4 w-4"/></Button>} title="حذف الباقة" description={`حذف ${pkg.name}؟ سيتم حذف الميزات أيضا`} onConfirm={async()=>{const r=await deletePricingPackage(pkg.id); if(r.error) toast.error(r.error); else {toast.success(r.success); setPackages(packages.filter((x:any)=>x.id!==pkg.id));}}} />
                </div>
              </div></CardHeader>
              <CardContent><FeaturesManager pkg={pkg} /></CardContent>
            </Card>
          ))}
          {packages.length===0 && <p className="text-center text-muted-foreground py-8">لا توجد باقات</p>}
        </div></CardContent>
      </Card>
    </div>
  );
}

function FeaturesManager({ pkg }: { pkg: any }) {
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const features = pkg.features ?? [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = editing ? await updatePricingFeature(editing.id, fd) : await createPricingFeature(pkg.id, fd);
    if (res.error) toast.error(res.error); else { toast.success(res.success); window.location.reload(); }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center"><p className="font-medium text-sm">المميزات ({features.length})</p>
        <Dialog open={open} onOpenChange={(v)=>{setOpen(v); if(!v) setEditing(null);}}>
          <DialogTrigger asChild><Button size="sm" variant="outline" onClick={()=>setEditing(null)}><Plus className="h-3 w-3 ml-1"/>ميزة</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>{editing ? "تعديل ميزة" : "إضافة ميزة"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>النص</Label><Input name="feature" defaultValue={editing?.feature} required /></div>
              <div className="space-y-2"><Label>الترتيب</Label><Input name="displayOrder" type="number" defaultValue={editing?.displayOrder ?? 0} /></div>
              <Button type="submit">{editing ? "تحديث" : "إضافة"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <ul className="space-y-1">
        {features.map((f:any)=>(
          <li key={f.id} className="flex justify-between items-center p-2 bg-secondary/20 rounded text-sm">
            <span>✓ {f.feature} <span className="text-xs text-muted-foreground">#{f.displayOrder}</span></span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={()=>{setEditing(f); setOpen(true);}}><Edit className="h-3 w-3"/></Button>
              <ConfirmDialog trigger={<Button variant="ghost" size="sm"><Trash2 className="h-3 w-3"/></Button>} title="حذف الميزة" description={f.feature} onConfirm={async()=>{const r=await deletePricingFeature(f.id); if(r.error) toast.error(r.error); else {toast.success(r.success); window.location.reload();}}} />
            </div>
          </li>
        ))}
        {features.length===0 && <p className="text-xs text-muted-foreground">لا توجد مميزات</p>}
      </ul>
    </div>
  );
}
