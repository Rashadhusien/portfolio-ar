"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { createScrollReveal } from "@/lib/gsap";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Zap } from "lucide-react";
import { siteSettings } from "@/lib/data";
import Image from "next/image";
import emailjs from "@emailjs/browser";

export function Contact() {
  const container = useRef<HTMLElement>(null);
  const { socialLinks } = siteSettings;
  // Hardcoded for now as they are not in siteSettings specifically but passed as props in original.
  // Using sensible defaults or if we had them in data.ts.
  // Actually, let's stick to the visual static content as requested.
  const email = "berrydeniz0@gmail.com";
  const whatsapp = "+201150153088";
  const title = "تواصل معي";

  useGSAP(
    () => {
      createScrollReveal(".contact-card", container);
    },
    { scope: container },
  );

  const form = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.current) return;

    setLoading(true);

    emailjs
      .sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        form.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      )
      .then(
        (result) => {
          console.log(result.text);
          setSuccess(true);
          setLoading(false);
          form.current?.reset();
        },
        (error) => {
          console.log(error.text);
          setLoading(false);
        },
      );
  };

  return (
    <section id="contact" ref={container} className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance text-center">
            {title}
          </h2>
          <div className="flex justify-center">
            <div className="w-12 h-1 bg-accent rounded-full"></div>
          </div>
        </div>
        {/* Contact options grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Email card */}
          <div className="contact-card p-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-border hover:border-accent transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <Mail className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                البريد الإلكتروني
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              أرسلي لي بريد إلكتروني بخصوص التعاون والاستفسارات
            </p>
            <a href={`mailto:${email}`}>
              <Button variant="outline" className="w-full  bg-gray-50">
                <Mail className="w-4 h-4 ml-2" />
                {email}
              </Button>
            </a>
          </div>

          {/* WhatsApp card */}
          <div className="contact-card p-8 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border border-border hover:border-accent transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">واتساب</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              تواصل مباشرة عبر واتساب للحصول على إجابة سريعة
            </p>
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full">
                <MessageCircle className="w-4 h-4 ml-2" />
                01150153088
              </Button>
            </a>
          </div>
        </div>

        {/* Quick contact form note */}
        <div className="mt-12 p-8 bg-secondary/10 rounded-lg border border-secondary/20 text-center">
          <p className="text-foreground font-semibold mb-2">
            أو املأي النموذج أدناه
          </p>
          <p className="text-muted-foreground mb-6">
            وسأتواصل معك في أقرب وقت ممكن
          </p>
          <form
            ref={form}
            onSubmit={sendEmail}
            className="space-y-4 max-w-md mx-auto"
          >
            <input
              type="text"
              name="name"
              placeholder="اسمك"
              required
              className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-accent focus:outline-none transition-colors"
            />

            <input
              type="email"
              name="email"
              placeholder="بريدك الإلكتروني"
              required
              className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-accent focus:outline-none transition-colors"
            />

            <textarea
              name="message"
              placeholder="رسالتك"
              rows={4}
              required
              className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-accent focus:outline-none transition-colors resize-none"
            />

            <button
              type="submit"
              className="bg-primary text-white w-full p-2 rounded hover:bg-primary/80 transition"
              disabled={loading}
            >
              {loading ? "جاري الارسال..." : "إرسال الرسالة"}
            </button>

            {success && (
              <p className="text-green-500 text-center">
                رسالتك تم إرسالها بنجاح!
              </p>
            )}
          </form>
        </div>
        {/* Social media links */}
        <div className=" mt-12 contact-card p-8 bg-background rounded-lg border border-border">
          <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            تابعيني على وسائل التواصل
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.platform}
                href={social.url}
                className="p-6 rounded-lg bg-gradient-to-br from-background to-card border border-border hover:border-accent transition-all hover:shadow-md text-center"
              >
                <div className="text-3xl mb-2">
                  {/* Simple mapping for icons based on platform name for now, or just generic */}
                  <Image
                    src={social.icon}
                    alt={social.platform}
                    width={48}
                    height={48}
                    className=" mx-auto rounded-2xl shadow-2xl w-[48px] h-[48px]"
                    priority
                  />
                </div>
                <p className="font-semibold text-xl text-foreground">
                  {social.platform}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
