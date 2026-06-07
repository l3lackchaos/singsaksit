import type { Metadata } from 'next';
import { Mail, Phone, MessageCircle, Facebook, Clock } from 'lucide-react';
import { getSetting } from '@/lib/settings';
import { loadSettings } from '@/modules/settings/load';
import { ContactForm } from '@/modules/contact/components/contact-form';

export const metadata: Metadata = {
  title: 'ติดต่อเรา',
  description:
    'สอบถามเรื่องพระเครื่อง การเช่าบูชา การชำระเงิน หรือการจัดส่ง ติดต่อทีมงานได้หลายช่องทาง',
};

export default async function ContactPage() {
  await loadSettings();
  const email = getSetting('contact.email');
  const phone = getSetting('contact.phone');
  const lineId = getSetting('contact.lineId');
  const facebookUrl = getSetting('contact.facebookUrl');
  const hours = getSetting('contact.hours');

  const channels = [
    email && {
      icon: Mail,
      label: 'อีเมล',
      value: email,
      href: `mailto:${email}`,
    },
    phone && {
      icon: Phone,
      label: 'โทรศัพท์',
      value: phone,
      href: `tel:${phone.replace(/[^+\d]/g, '')}`,
    },
    lineId && {
      icon: MessageCircle,
      label: 'LINE',
      value: lineId,
      href: `https://line.me/R/ti/p/${encodeURIComponent(lineId)}`,
    },
    facebookUrl && {
      icon: Facebook,
      label: 'Facebook',
      value: 'เพจของเรา',
      href: facebookUrl,
    },
  ].filter(Boolean) as Array<{
    icon: typeof Mail;
    label: string;
    value: string;
    href: string;
  }>;

  return (
    <section className="border-b">
      <div className="container py-[clamp(3rem,7vw,6rem)]">
        <div className="max-w-2xl">
          <h1 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-bold leading-tight">
            ติดต่อเรา
          </h1>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            มีคำถามเรื่องพระเครื่อง การเช่าบูชา การชำระเงิน หรือการจัดส่ง
            ส่งข้อความถึงเราได้โดยตรง ทีมงานยินดีดูแลทุกคำถาม
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Channels · a clean list, not boxed cards. Hours always shows. */}
          <div>
            <h2 className="font-display text-xl font-semibold">ช่องทางติดต่อ</h2>
            {channels.length > 0 ? (
              <ul className="mt-6 divide-y divide-border">
                {channels.map((c) => (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      target={c.href.startsWith('http') ? '_blank' : undefined}
                      rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="group flex items-center gap-4 py-4 transition-colors hover:text-primary"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <c.icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm text-muted-foreground">{c.label}</span>
                        <span className="font-medium">{c.value}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-muted-foreground">
                กรอกแบบฟอร์มด้านขวาเพื่อส่งข้อความถึงเรา แล้วเราจะติดต่อกลับโดยเร็วที่สุด
              </p>
            )}

            {hours && (
              <div className="mt-8 flex items-center gap-4 border-t pt-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Clock className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm text-muted-foreground">เวลาทำการ</span>
                  <span className="font-medium">{hours}</span>
                </span>
              </div>
            )}
          </div>

          {/* Form */}
          <div>
            <h2 className="sr-only">ส่งข้อความถึงเรา</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
