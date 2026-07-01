import React from 'react';
import HuntsPageClient from './HuntsPageClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Hunts Dashboard - Vybe Treasure Hunt',
  description: 'Manage treasure hunt games, statuses, and QR code sequences.',
};

export default async function HuntsPage() {
  const adminSecret = process.env.ADMIN_SECRET || '';
  return <HuntsPageClient adminSecret={adminSecret} />;
}
