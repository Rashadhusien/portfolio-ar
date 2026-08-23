import { getSocialLinks } from "@/lib/actions/social.actions";
import { SocialManager } from "@/components/admin/social/social-manager";

export default async function SocialPage() {
  const links = await getSocialLinks();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">روابط التواصل</h1>
        <p className="text-muted-foreground">تيك توك، انستغرام، يوتيوب، بينترست... مع أيقونات Cloudinary</p>
      </div>
      <SocialManager initialLinks={links} />
    </div>
  );
}
