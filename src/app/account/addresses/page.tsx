import type { Metadata } from 'next';
import { listAddresses } from '@/modules/account/address-repository';
import { AddressForm } from '@/modules/account/components/address-form';
import { AddressList } from '@/modules/account/components/address-list';

export const metadata: Metadata = { title: 'ที่อยู่จัดส่ง', robots: { index: false } };

export default async function AddressesPage() {
  const addresses = await listAddresses();
  return (
    <div className="container max-w-2xl space-y-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">ที่อยู่จัดส่ง</h1>
      <AddressList addresses={addresses} />
      <div>
        <h2 className="mb-3 font-semibold">เพิ่มที่อยู่ใหม่</h2>
        <AddressForm />
      </div>
    </div>
  );
}
