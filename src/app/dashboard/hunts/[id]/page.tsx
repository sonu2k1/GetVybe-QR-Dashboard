import React from 'react';
import HuntDetailsClient from './HuntDetailsClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Hunt Detail - Vybe Treasure Hunt',
  description: 'Manage QR codes, view leaderboard rankings, and watch live scan feeds.',
};

export default async function HuntDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const adminSecret = process.env.ADMIN_SECRET || '';
  return <HuntDetailsClient huntId={params.id} adminSecret={adminSecret} />;
}
