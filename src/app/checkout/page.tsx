import type { Metadata } from 'next';
import { listAddresses } from '@/modules/account/address-repository';
import { CheckoutForm } from '@/modules/orders/components/checkout-form';

export const metadata: Metadata = { title: 'ชำระเงิน', robots: { index: false } };

export default async function CheckoutPage() {
  const savedAddresses = await listAddresses();
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold tracking-tight">ชำระเงิน</h1>
      <CheckoutForm savedAddresses={savedAddresses} />
    </div>
  );
}
