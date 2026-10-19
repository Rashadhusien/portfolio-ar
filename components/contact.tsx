"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { MessageCircle } from "lucide-react";
import emailjs from "@emailjs/browser";
import { fadeIn } from "@/lib/gsap";
import { siteSettings as fallbackSettings } from "@/lib/data";

type ContactData = {
  email?: string;
  whatsapp?: string;
  socialLinks?: { platform: string; url: string; icon: string }[];
};

type Status = "idle" | "sending" | "success" | "error";

const FALLBACK_EMAIL = "berrydeniz0@gmail.com";
const FALLBACK_WHATSAPP = "+201150153088";

// "+201150153088" -> "01150153088" (local Egyptian format for display)
function displayPhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "");
  return digits.startsWith("+20") ? `0${digits.slice(3)}` : digits;
}

const fieldClass =
  "w-full rounded-[10px] border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function Contact({ data }: { data?: ContactData }) {
  const container = useRef<HTMLElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  const socialLinks = data?.socialLinks ?? fallbackSettings.socialLinks;
  const email = data?.email || FALLBACK_EMAIL;
  const whatsapp = data?.whatsapp || FALLBACK_WHATSAPP;

  useGSAP(() => {
    fadeIn(container, "[data-fade]");
  }, { scope: container });

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const el = form.current;
    if (!el) return;

    // Honeypot: real visitors never see or fill this field.
    if ((new FormData(el).get("company_website") as string)?.trim()) {
      setStatus("success");
      el.reset();
      return;
    }

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    if (!serviceId || !templateId || !publicKey) {
      console.error("[contact] EmailJS environment variables are missing");
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      await emailjs.sendForm(serviceId, templateId, el, { publicKey });
      setStatus("success");
      el.reset();
    } catch (error) {
      console.error("[contact] send failed", error);
      setStatus("error");
    }
  };

  return (
    <section id="contact" ref={container} className="section-space bg-card">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h2 className="type-h2">تواصل معي</h2>
          <p className="type-body mt-5 max-w-[30rem] text-muted-foreground">
            للتعاون في مراجعة كتاب أو حملة لدار نشر أو أي فكرة عن الكتب، راسليني
            وسأرد عليكِ في أقرب وقت.
          </p>

          <div className="mt-10 space-y-8" data-fade>
            <div>
              <p className="type-small text-muted-foreground">البريد الإلكتروني</p>
              <a
                href={`mailto:${email}`}
                className="mt-1 inline-block break-all font-display text-2xl font-bold text-foreground underline decoration-1 underline-offset-[0.35em] transition-[text-decoration-thickness] duration-200 hover:decoration-2 sm:text-3xl"
              >
                <bdi>{email}</bdi>
              </a>
            </div>

            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <MessageCircle aria-hidden="true" className="h-5 w-5" />
              واتساب <bdi dir="ltr">{displayPhone(whatsapp)}</bdi>
            </a>

            {socialLinks.length > 0 && (
              <div>
                <p className="type-small text-muted-foreground">تابعيني</p>
                <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
                  {socialLinks.map((social) => (
                    <li key={social.url}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center font-medium text-foreground underline decoration-transparent decoration-1 underline-offset-[0.3em] transition-[text-decoration-color] duration-200 hover:decoration-current"
                      >
                        {social.platform}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <form
            ref={form}
            onSubmit={sendEmail}
            className="rounded-[14px] bg-background p-6 sm:p-10"
            noValidate={false}
          >
            <h3 className="type-h3">أرسلي رسالة</h3>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="type-small font-medium">
                  الاسم
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  required
                  maxLength={100}
                  autoComplete="name"
                  className={`${fieldClass} mt-2`}
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="type-small font-medium">
                  البريد الإلكتروني
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                  dir="ltr"
                  className={`${fieldClass} mt-2 text-start`}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="contact-message" className="type-small font-medium">
                  رسالتك
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  maxLength={3000}
                  className={`${fieldClass} mt-2 resize-y`}
                />
              </div>
              {/* Honeypot (spam bots fill every field) */}
              <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="contact-company">Company website</label>
                <input id="contact-company" type="text" name="company_website" tabIndex={-1} autoComplete="off" />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
                {status === "sending" ? "جاري الإرسال…" : "إرسال الرسالة"}
              </button>
              <p role="status" aria-live="polite" className="type-small">
                {status === "success" && (
                  <span className="font-medium text-primary">
                    وصلت رسالتك، شكرًا لك! سأرد عليكِ قريبًا.
                  </span>
                )}
                {status === "error" && (
                  <span className="font-medium text-destructive">
                    تعذر إرسال الرسالة. حاولي مرة أخرى أو راسليني مباشرة على{" "}
                    <a href={`mailto:${email}`} className="underline underline-offset-4">
                      البريد الإلكتروني
                    </a>
                    .
                  </span>
                )}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
