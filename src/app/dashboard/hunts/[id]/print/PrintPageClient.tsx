'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { IconLoader, IconPrinter } from '@tabler/icons-react';

interface PrintQrItem {
  id: string;
  label: string;
  code: string;
  points: number;
  qrDataUrl: string;
}

export default function PrintPageClient({ huntId }: { huntId: string }) {
  const [items, setItems] = useState<PrintQrItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadQrImages = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`/api/qr?huntId=${huntId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch checkpoints for print layout');
        }

        const data = await res.json();
        const scanBaseUrl = process.env.NEXT_PUBLIC_SCAN_BASE_URL || `${window.location.origin}/scan`;
        
        const formattedItems = await Promise.all(
          (data || []).map(async (qr: any) => {
            const scanUrl = `${scanBaseUrl}/${qr.code}`;
            const qrDataUrl = await QRCode.toDataURL(scanUrl, {
              width: 300,
              margin: 1,
              color: {
                dark: '#000000',
                light: '#ffffff',
              },
            });

            return {
              id: qr.id,
              label: qr.label,
              code: qr.code,
              points: qr.points,
              qrDataUrl,
            };
          })
        );

        setItems(formattedItems);
        setLoading(false);

        // Auto trigger window.print() once images are loaded
        setTimeout(() => {
          window.print();
        }, 1000);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to render print sheet');
        setLoading(false);
      }
    };

    if (huntId) {
      loadQrImages();
    }
  }, [huntId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-3">
        <IconLoader className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-semibold">Generating print layout sheets...</span>
        <span className="text-xs text-slate-500">The print dialog will open automatically.</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 max-w-md">
          <p className="font-bold mb-2">Print Layout Error</p>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-8 font-sans print:p-0">
      {/* Visual notification visible only on screen */}
      <div className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <IconPrinter className="w-4 h-4 text-indigo-600" />
          <span>Generating printing grid. If the print dialog didn&apos;t open, click &quot;Print Sheet&quot; below.</span>
        </div>
        <button
          onClick={() => window.print()}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          Print Sheet
        </button>
      </div>

      {/* 3-Column Print Grid */}
      <div className="grid grid-cols-3 gap-6 print:gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-slate-300 rounded-xl p-4 flex flex-col items-center justify-between text-center bg-white page-break-inside-avoid min-h-[220px]"
          >
            {/* Checkpoint Name */}
            <div className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5 w-full truncate">
              {item.label}
            </div>

            {/* QR Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.qrDataUrl}
              alt={item.label}
              className="w-32 h-32 object-contain my-3"
            />

            {/* Checkpoint points & code details */}
            <div className="w-full flex items-center justify-between text-[10px] text-slate-600 font-mono pt-1.5 border-t border-slate-200">
              <span className="font-bold">CODE: {item.code}</span>
              <span className="font-black text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded">
                +{item.points} PTS
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Styles for printing layout */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
