import React from 'react';
import ScanPageClient from './ScanPageClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Scan Checkpoint - Vybe Treasure Hunt',
  description: 'Resolve checkpoints, reveal clues, and log treasure hunt points.',
};

export default function ScanPage({ params }: { params: { code: string } }) {
  return <ScanPageClient code={params.code} />;
}
