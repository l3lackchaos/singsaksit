import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'สิ่งศักดิ์สิทธิ์ — ศูนย์รวมพระเครื่อง',
    short_name: 'สิ่งศักดิ์สิทธิ์',
    description: 'ร้านพระเครื่องออนไลน์ ชำระเงินปลอดภัย ติดตามสถานะเรียลไทม์',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf7f2',
    theme_color: '#9a6a2f',
    lang: 'th',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
