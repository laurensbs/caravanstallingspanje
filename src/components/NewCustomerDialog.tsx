'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Drawer from './Drawer';
import { Input, Button } from './ui';
import type { CustomerLite } from './CustomerPicker';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (customer: CustomerLite) => void;
  /** Initiële zoekterm — als naam of email pre-fillen. */
  initialQuery?: string;
}

const empty = {
  name: '', email: '', phone: '', mobile: '',
  address: '', city: '', postal_code: '', country: 'ES',
  vat_number: '', notes: '',
};

export default function NewCustomerDialog({ open, onClose, onCreated, initialQuery }: Props) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Pre-fill: als de zoekterm een email is → email-veld; anders naam.
    if (initialQuery && initialQuery.includes('@')) {
      setForm({ ...empty, email: initialQuery });
    } else if (initialQuery) {
      setForm({ ...empty, name: initialQuery });
    } else {
      setForm(empty);
    }
  }, [open, initialQuery]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Could not create customer');
        return;
      }
      if (data.alreadyExisted) {
        toast.success('Existing customer linked');
      } else if (data.holdedSource === 'created') {
        toast.success('Customer created and pushed to Holded');
      } else if (data.holdedSource === 'matched-email' || data.holdedSource === 'matched-phone') {
        toast.success('Customer created and linked to existing Holded contact');
      } else if (data.holdedSource === 'no-key') {
        toast.error('Customer created — Holded API key missing on the server.');
      } else {
        toast.error(`Customer created — Holded sync failed: ${data.holdedSyncError || 'unknown error'}`);
      }
      if (!data.customer || typeof data.customer.id !== 'number') {
        toast.error('Unexpected server response — please refresh the page.');
        console.error('[new-customer] missing customer in response:', data);
        return;
      }
      onCreated(data.customer);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title="New customer" subtitle="We first search in Holded and link an existing contact. Otherwise we create a new one." width={560}>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <Input label="VAT number" value={form.vat_number} onChange={(e) => setForm({ ...form, vat_number: e.target.value })} />
        </div>
        <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <div className="grid grid-cols-3 gap-3">
          <Input label="Postal code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-text mb-1.5">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors"
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create'}</Button>
        </div>
      </form>
    </Drawer>
  );
}
