import React from 'react';
import PrintPageClient from './PrintPageClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Print Sheet - Vybe Treasure Hunt',
  description: 'Printable sheets for generated QR checkpoints.',
};

export default function PrintPage({ params }: { params: { id: string } }) {
  return <PrintPageClient huntId={params.id} />;
}
