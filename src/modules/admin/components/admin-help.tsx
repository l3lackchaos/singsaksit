import * as React from 'react';
import { Info } from 'lucide-react';

/**
 * Collapsible help panel shown at the top of each back-office page. Explains what
 * adding/editing on the page does and what the customer-facing result looks like,
 * with a small illustrative preview (CSS mock, no external assets).
 */
export function AdminHelp({
  what,
  preview,
  previewLabel = 'ตัวอย่างผลลัพธ์',
}: {
  what: React.ReactNode;
  preview?: React.ReactNode;
  previewLabel?: string;
}) {
  return (
    <details
      open
      className="rounded-lg border border-primary/20 bg-primary/[0.04] [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm font-medium">
        <Info className="h-4 w-4 text-primary" />
        คำอธิบาย &amp; ตัวอย่าง
        <span className="ml-auto text-xs font-normal text-muted-foreground">ย่อ/ขยาย</span>
      </summary>
      <div className="grid gap-5 border-t border-primary/15 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="space-y-1.5 text-sm leading-relaxed text-foreground/80">{what}</div>
        {preview && (
          <figure className="shrink-0 sm:w-72">
            {preview}
            <figcaption className="mt-1.5 text-center text-xs text-muted-foreground">
              {previewLabel}
            </figcaption>
          </figure>
        )}
      </div>
    </details>
  );
}

/** A small browser-window frame around mock content. */
export function MiniFrame({
  children,
  label,
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
      <div className="flex items-center gap-1 border-b bg-muted/60 px-2.5 py-1.5">
        <span className="h-2 w-2 rounded-full bg-destructive/40" />
        <span className="h-2 w-2 rounded-full bg-warning/50" />
        <span className="h-2 w-2 rounded-full bg-success/50" />
        {label && <span className="ml-2 truncate text-[10px] text-muted-foreground">{label}</span>}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

const tile = 'rounded bg-muted';

/* ---- Per-page preview mocks ----------------------------------------------- */

export function DashboardPreview() {
  return (
    <MiniFrame label="ภาพรวมร้าน">
      <div className="grid grid-cols-3 gap-2">
        {[
          { v: '฿42K', l: 'ยอดขาย' },
          { v: '18', l: 'ออเดอร์' },
          { v: '3', l: 'รอตรวจ' },
        ].map((s) => (
          <div key={s.l} className="rounded-md border p-2 text-center">
            <p className="text-sm font-bold text-primary">{s.v}</p>
            <p className="text-[9px] text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>
    </MiniFrame>
  );
}

export function HomepagePreview() {
  return (
    <MiniFrame label="หน้าแรก">
      <div className="space-y-2">
        <div className="rounded bg-secondary/60 p-2 text-center">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          <div className="mx-auto mt-1.5 h-2.5 w-24 rounded bg-foreground/70" />
          <div className="mx-auto mt-1 h-2.5 w-16 rounded bg-primary/70" />
          <div className="mx-auto mt-2 h-3 w-14 rounded bg-primary" />
        </div>
        <div className="relative h-12 overflow-hidden rounded bg-gradient-to-br from-secondary to-muted">
          <div className="absolute bottom-1 left-1.5">
            <span className="inline-block rounded-full bg-footer-accent px-1.5 text-[8px] text-footer">
              แนะนำ
            </span>
            <div className="mt-0.5 h-2 w-16 rounded bg-foreground/60" />
          </div>
        </div>
      </div>
    </MiniFrame>
  );
}

export function BannerPreview() {
  return (
    <MiniFrame label="หน้าแรก">
      <div className="space-y-1.5">
        <div className="rounded bg-primary px-2 py-1 text-center text-[9px] font-medium text-primary-foreground">
          ★ ข้อความประกาศ / โปรโมชัน
        </div>
        <div className={`h-3 w-full ${tile}`} />
        <div className="grid grid-cols-3 gap-1.5">
          <div className={`h-8 ${tile}`} />
          <div className={`h-8 ${tile}`} />
          <div className={`h-8 ${tile}`} />
        </div>
      </div>
    </MiniFrame>
  );
}

export function ProductPreview() {
  return (
    <MiniFrame label="หน้าร้าน">
      <div className="mx-auto w-28 overflow-hidden rounded-md border">
        <div className="flex h-16 items-center justify-center bg-gradient-to-br from-secondary to-muted text-lg font-bold text-primary/30">
          พระ
        </div>
        <div className="space-y-1 p-2">
          <div className="h-2 w-full rounded bg-foreground/60" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold">฿8,500</span>
            <span className="rounded-full bg-success/15 px-1 text-[8px] text-success">มี 3</span>
          </div>
        </div>
      </div>
    </MiniFrame>
  );
}

export function PaymentPreview() {
  return (
    <MiniFrame label="ตรวจสลิป">
      <div className="flex items-center gap-2">
        <div className="flex h-12 w-9 items-center justify-center rounded border bg-muted text-[8px] text-muted-foreground">
          สลิป
        </div>
        <div className="flex-1 space-y-1">
          <div className="h-2 w-16 rounded bg-foreground/60" />
          <div className="h-2 w-10 rounded bg-muted-foreground/30" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="rounded bg-success px-1.5 py-0.5 text-[8px] text-success-foreground">
            ยืนยัน
          </span>
          <span className="rounded bg-destructive px-1.5 py-0.5 text-[8px] text-destructive-foreground">
            ปฏิเสธ
          </span>
        </div>
      </div>
    </MiniFrame>
  );
}

export function OrderPreview() {
  return (
    <MiniFrame label="สถานะออเดอร์">
      <div className="flex items-center justify-between text-center text-[8px]">
        {['ชำระแล้ว', 'จัดส่ง', 'ถึงมือ'].map((s, i) => (
          <React.Fragment key={s}>
            <div className="space-y-1">
              <div
                className={`mx-auto h-3 w-3 rounded-full ${i === 0 ? 'bg-success' : 'bg-muted'}`}
              />
              <span className="text-muted-foreground">{s}</span>
            </div>
            {i < 2 && <div className="h-0.5 flex-1 bg-border" />}
          </React.Fragment>
        ))}
      </div>
    </MiniFrame>
  );
}

export function ReviewPreview() {
  return (
    <MiniFrame label="ใต้สินค้า">
      <div className="space-y-1">
        <div className="text-xs text-warning-emphasis">★★★★★</div>
        <div className="h-2 w-full rounded bg-foreground/50" />
        <div className="h-2 w-2/3 rounded bg-muted-foreground/30" />
        <span className="inline-block rounded-full bg-success/15 px-1.5 text-[8px] text-success">
          อนุมัติแล้ว
        </span>
      </div>
    </MiniFrame>
  );
}

export function CouponPreview() {
  return (
    <MiniFrame label="หน้าชำระเงิน">
      <div className="flex items-center justify-between rounded border border-dashed border-primary/50 bg-primary/5 px-2 py-1.5">
        <span className="text-[10px] font-bold tracking-wider text-primary">SAVE10</span>
        <span className="text-[9px] text-muted-foreground">ลด 10%</span>
      </div>
    </MiniFrame>
  );
}

export function PagePreview() {
  return (
    <MiniFrame label="/pages/วิธีสั่งซื้อ">
      <div className="space-y-1.5">
        <div className="h-2.5 w-20 rounded bg-foreground/70" />
        <div className="h-1.5 w-full rounded bg-muted-foreground/25" />
        <div className="h-1.5 w-full rounded bg-muted-foreground/25" />
        <div className="h-1.5 w-3/4 rounded bg-muted-foreground/25" />
      </div>
    </MiniFrame>
  );
}

export function EmailPreview() {
  return (
    <MiniFrame label="อีเมลถึงลูกค้า">
      <div className="space-y-1.5">
        <div className="flex items-center gap-1 border-b pb-1 text-[8px] text-muted-foreground">
          <span className="rounded bg-muted px-1">ถึง: ลูกค้า</span>
        </div>
        <div className="h-2.5 w-28 rounded bg-foreground/70" />
        <div className="h-1.5 w-full rounded bg-muted-foreground/25" />
        <div className="h-1.5 w-2/3 rounded bg-muted-foreground/25" />
      </div>
    </MiniFrame>
  );
}

export function LinkPreview() {
  return (
    <MiniFrame label="ลิงก์สั้น">
      <div className="space-y-1 text-[10px]">
        <p className="font-mono font-semibold text-primary">/s/promo</p>
        <p className="text-center text-muted-foreground">↓</p>
        <p className="truncate font-mono text-muted-foreground">singsaksit.../products?...</p>
      </div>
    </MiniFrame>
  );
}

export function UserPreview() {
  return (
    <MiniFrame label="ผู้ใช้">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-muted" />
        <div className="flex-1">
          <div className="h-2 w-16 rounded bg-foreground/60" />
        </div>
        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[8px] font-medium text-primary">
          ADMIN
        </span>
      </div>
    </MiniFrame>
  );
}

export function SettingsPreview() {
  return (
    <MiniFrame label="ทั้งเว็บ">
      <div className="space-y-2">
        {['แสดงสต็อก', 'เปิดคูปอง'].map((s) => (
          <div key={s} className="flex items-center justify-between">
            <span className="text-[9px] text-muted-foreground">{s}</span>
            <span className="flex h-3 w-6 items-center rounded-full bg-primary px-0.5">
              <span className="ml-auto h-2 w-2 rounded-full bg-white" />
            </span>
          </div>
        ))}
      </div>
    </MiniFrame>
  );
}
