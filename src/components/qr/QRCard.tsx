'use client';

import React, { useState } from 'react';
import { IconDownload, IconLoader, IconQrcode, IconCompass, IconMapPin } from '@tabler/icons-react';
import { QrCode } from '@/types/qr';

interface QRCardProps {
  qr: QrCode;
  qrImageBase64?: string;
  adminSecret?: string;
  onToggleActive?: (id: string, current: boolean) => Promise<void>;
  onEditClick?: (qr: QrCode) => void;
}

export default function QRCard({
  qr,
  qrImageBase64 = '',
  adminSecret = '',
  onToggleActive,
  onEditClick,
}: QRCardProps) {
  const [imageBase64, setImageBase64] = useState<string>(qrImageBase64);
  const [loadingImage, setLoadingImage] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Lazy-load the QR image when needed
  const getQrImage = async (): Promise<string> => {
    if (imageBase64) return imageBase64;

    try {
      setLoadingImage(true);
      const res = await fetch(`/api/qr/${qr.id}/image`);
      if (!res.ok) throw new Error('Failed to fetch QR image');
      
      const data = await res.json();
      setImageBase64(data.qrImageBase64);
      return data.qrImageBase64;
    } catch (err) {
      console.error('Error fetching QR image:', err);
      return '';
    } finally {
      setLoadingImage(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const base64Data = await getQrImage();
      if (!base64Data) {
        alert('Could not download QR image. Please try again.');
        return;
      }

      const link = document.createElement('a');
      link.href = base64Data;
      link.download = `${qr.label.replace(/\s+/g, '_')}-${qr.code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="group bg-white border border-[#F4EBE3] rounded-[2rem] p-5 flex flex-col justify-between gap-4 shadow-sm shadow-slate-100/50 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
      
      {/* Upper Content Section */}
      <div className="space-y-4">
        
        {/* Header Label and Points Chip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${qr.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {qr.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-650 border border-indigo-100 font-mono">
            +{qr.points} VP
          </span>
        </div>

        {/* QR Preview or Placeholder */}
        <div className="relative aspect-square w-full bg-[#FFFBF7] border border-[#F4EBE3] rounded-2xl overflow-hidden flex items-center justify-center">
          {imageBase64 ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageBase64}
              alt={qr.label}
              className="w-40 h-44 object-contain p-2"
            />
          ) : (
            <button
              onClick={getQrImage}
              disabled={loadingImage}
              className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-indigo-600 transition-colors duration-200"
            >
              {loadingImage ? (
                <IconLoader className="w-8 h-8 animate-spin text-[#5E52FA]" />
              ) : (
                <>
                  <IconQrcode className="w-10 h-10 stroke-[1.5]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Load QR Preview</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Info Area */}
        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-800 text-sm truncate" title={qr.label}>
            {qr.label}
          </h4>
          
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>CODE: <strong className="text-slate-800 font-bold select-all">{qr.code}</strong></span>
            <span>
              Scans: <strong className="text-slate-700">{qr.scan_count}</strong>/{qr.max_scans || '∞'}
            </span>
          </div>
        </div>
      </div>

      {/* Button Action Bar */}
      <div className="pt-3.5 border-t border-[#F4EBE3] flex items-center justify-between mt-auto">
        <div className="flex gap-2">
          {onEditClick && (
            <button
              onClick={() => onEditClick(qr)}
              className="text-[10px] font-black bg-slate-100 hover:bg-slate-200 text-slate-600 px-3.5 py-2 rounded-xl transition-all duration-200"
            >
              Edit
            </button>
          )}
          {onToggleActive && (
            <button
              onClick={() => onToggleActive(qr.id, qr.is_active)}
              className={`text-[10px] font-black px-3.5 py-2 rounded-xl transition-all duration-200 ${qr.is_active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
            >
              {qr.is_active ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1 text-[10px] font-bold bg-[#5E52FA] hover:opacity-90 text-white border border-[#483ec7] shadow-[0_3px_0_0_#483ec7] active:translate-y-[3px] active:shadow-none px-3.5 py-2.5 rounded-xl transition-all duration-75"
        >
          {downloading ? (
            <IconLoader className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <IconDownload className="w-3.5 h-3.5" />
          )}
          Download
        </button>
      </div>
    </div>
  );
}
