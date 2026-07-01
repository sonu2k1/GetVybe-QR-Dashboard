'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { IconX, IconLoader, IconQrcode, IconDownload, IconTrash } from '@tabler/icons-react';

interface ViewHuntQrsModalProps {
  isOpen: boolean;
  onClose: () => void;
  huntId: string;
  huntName: string;
  adminSecret?: string;
}

export default function ViewHuntQrsModal({
  isOpen,
  onClose,
  huntId,
  huntName,
  adminSecret = '',
}: ViewHuntQrsModalProps) {
  const [qrs, setQrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrImages, setQrImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchQrs = async () => {
      if (!isOpen || !huntId) return;

      try {
        setLoading(true);
        setError('');
        setQrs([]);
        setQrImages({});

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (adminSecret) {
          headers['x-admin-secret'] = adminSecret;
        }

        const res = await fetch(`/api/qr?huntId=${huntId}`, {
          method: 'GET',
          headers,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to fetch checkpoints');
        }

        const data = await res.json();
        setQrs(data || []);

        // Rebuild URLs and generate QR base64 images client-side
        const scanBaseUrl = process.env.NEXT_PUBLIC_SCAN_BASE_URL || `${window.location.origin}/scan`;
        const imageMap: Record<string, string> = {};

        await Promise.all(
          (data || []).map(async (qr: any) => {
            const scanUrl = `${scanBaseUrl}/${qr.code}`;
            const dataUrl = await QRCode.toDataURL(scanUrl, { width: 250, margin: 1 });
            imageMap[qr.id] = dataUrl;
          })
        );

        setQrImages(imageMap);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred loading checkpoints');
      } finally {
        setLoading(false);
      }
    };

    fetchQrs();
  }, [isOpen, huntId, adminSecret]);

  if (!isOpen) return null;

  const handleDeleteQr = async (qrId: string, label: string) => {
    if (!confirm(`Are you sure you want to delete the checkpoint "${label}"?`)) {
      return;
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminSecret) headers['x-admin-secret'] = adminSecret;

      const res = await fetch(`/api/qr/${qrId}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete checkpoint');
      }

      setQrs((prev) => prev.filter((qr) => qr.id !== qrId));
    } catch (err: any) {
      alert(`Error deleting checkpoint: ${err.message}`);
    }
  };

  const handleDownload = (qr: any) => {
    const dataUrl = qrImages[qr.id];
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${huntName.replace(/\s+/g, '_')}-${qr.label.replace(/\s+/g, '_')}-${qr.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-2xl bg-white border border-[#F4EBE3] rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F4EBE3] bg-[#FFFBF7]/40 flex-shrink-0">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <IconQrcode className="w-5 h-5 text-[#5E52FA]" />
              Checkpoints QRs - {huntName}
            </h3>
            <p className="text-xs text-slate-450 mt-1">Quick preview and download checkpoints configured in this hunt</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-450">
              <IconLoader className="w-8 h-8 animate-spin text-indigo-500" />
              <span className="text-sm font-semibold">Loading checkpoint details...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-505/5 border border-red-500/10 text-red-500 text-xs rounded-2xl">
              {error}
            </div>
          ) : qrs.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              <IconQrcode className="w-10 h-10 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
              No checkpoints exist for this hunt
              <p className="text-xs text-slate-400 mt-1">Enter the hunt configuration page to create checkpoints.</p>
            </div>
          ) : (
            <div className={qrs.length === 1 ? "flex justify-center w-full py-2" : "grid grid-cols-1 sm:grid-cols-2 gap-6"}>
              {qrs.map((qr) => (
                <div 
                  key={qr.id}
                  className={`bg-[#FFFBF7]/60 border border-[#F4EBE3] p-6 rounded-3xl flex flex-col items-center justify-between text-center gap-4 ${qrs.length === 1 ? 'w-full max-w-sm' : ''}`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 px-3 py-1 rounded-full font-mono">
                      Seq {qr.sequence_order || '—'}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase font-mono">
                      +{qr.points} VP
                    </span>
                  </div>

                  {/* QR Image Box */}
                  <div className="bg-white border border-[#F4EBE3] p-4 rounded-2xl max-w-[150px] aspect-square flex items-center justify-center shadow-sm">
                    {qrImages[qr.id] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={qrImages[qr.id]}
                        alt={qr.label}
                        className="w-28 h-28 object-contain"
                      />
                    ) : (
                      <div className="w-28 h-28 flex items-center justify-center">
                        <IconLoader className="w-5 h-5 animate-spin text-indigo-500" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 w-full">
                    <h4 className="font-extrabold text-sm text-slate-800 truncate px-1">
                      {qr.label}
                    </h4>
                    
                    <div className="flex items-center justify-center gap-1.5 text-[10px]">
                      <span className="text-slate-400 font-bold uppercase">CODE:</span>
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {qr.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 w-full">
                    <button
                      onClick={() => handleDeleteQr(qr.id, qr.label)}
                      className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-[0_3px_0_0_#FECACA] active:translate-y-[3px] active:shadow-none rounded-xl transition-all duration-75 flex-shrink-0"
                      title="Delete Checkpoint"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(qr)}
                      disabled={!qrImages[qr.id]}
                      className="flex-grow flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-[#5E52FA] hover:bg-[#5045e4] text-white border border-[#483ec7] shadow-[0_3px_0_0_#483ec7] active:translate-y-[3px] active:shadow-none transition-all duration-75"
                    >
                      <IconDownload className="w-4 h-4" />
                      Download PNG
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F4EBE3] bg-[#FFFBF7]/40 flex items-center justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
