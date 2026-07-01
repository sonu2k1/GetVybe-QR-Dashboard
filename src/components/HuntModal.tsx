'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  IconX, 
  IconCalendar, 
  IconLoader, 
  IconCheck, 
  IconCopy, 
  IconDownload, 
  IconAlertTriangle, 
  IconArrowRight 
} from '@tabler/icons-react';

interface HuntModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (hunt: any) => void;
  adminSecret?: string;
}

export default function HuntModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  adminSecret = ''
}: HuntModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Local state for QR Preview Screen
  const [successData, setSuccessData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Hunt name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const startAt = startDate ? new Date(startDate).toISOString() : null;
      const endAt = endDate ? new Date(endDate).toISOString() : null;

      if (startAt && endAt && new Date(startAt) > new Date(endAt)) {
        setError('Start date cannot be after end date');
        setLoading(false);
        return;
      }

      // API request inside modal
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (adminSecret) {
        headers['x-admin-secret'] = adminSecret;
      }

      const res = await fetch('/api/hunts', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: name.trim(),
          start_at: startAt,
          end_at: endAt,
          status: 'DRAFT',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create hunt');
      }

      // 1. Trigger background list refresh
      onSuccess(data.hunt);

      // 2. Set success preview state
      setSuccessData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to create hunt');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!successData || !successData.defaultQr) return;
    const scanBaseUrl = process.env.NEXT_PUBLIC_SCAN_BASE_URL || `${window.location.origin}/scan`;
    const url = `${scanBaseUrl}/${successData.defaultQr.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!successData || !successData.qrImageBase64 || !successData.defaultQr) return;
    const link = document.createElement('a');
    link.href = successData.qrImageBase64;
    link.download = `${name.replace(/\s+/g, '_')}-Clue1-${successData.defaultQr.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    // Reset forms & states
    setName('');
    setStartDate('');
    setEndDate('');
    setError('');
    setSuccessData(null);
    onClose();
  };

  const handleGoToHunt = () => {
    if (successData && successData.hunt) {
      const id = successData.hunt.id;
      handleClose();
      router.push(`/dashboard/hunts/${id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-md bg-white border border-[#F4EBE3] rounded-[2rem] overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F4EBE3] bg-[#FFFBF7]/40">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <IconCalendar className="w-5 h-5 text-indigo-500" />
            {successData ? "Hunt Created! Here's your first QR 🎉" : 'Create New Hunt'}
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {error && (
            <div className="p-3 text-xs bg-red-500/5 border border-red-500/20 text-red-500 rounded-xl mb-4">
              {error}
            </div>
          )}

          {!successData ? (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Hunt Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer Mystery Quest"
                  className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-350"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Start Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-xs text-slate-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-xs text-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F4EBE3] mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-semibold text-slate-450 hover:text-slate-600 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-[#5E52FA] hover:bg-[#5045e4] text-white border border-[#483ec7] shadow-[0_4px_0_0_#483ec7] active:translate-y-[4px] active:shadow-none disabled:opacity-50 transition-all duration-75"
                >
                  {loading ? (
                    <>
                      <IconLoader className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Hunt'
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Success QR Preview Screen */
            <div className="flex flex-col items-center text-center space-y-5 py-2 animate-in zoom-in-95 duration-200">
              {successData.qrError ? (
                /* QR Generation Warning */
                <div className="p-3 text-xs bg-amber-500/5 border border-amber-500/20 text-amber-600 rounded-2xl flex items-start gap-2 text-left w-full">
                  <IconAlertTriangle className="w-4.5 h-4.5 text-amber-500 flex-shrink-0" />
                  <span>
                    <strong>Warning:</strong> Hunt was created successfully, but the default QR code could not be automatically configured. You can generate checkpoints manually from the detail panel.
                  </span>
                </div>
              ) : (
                /* Normal Success Preview */
                <>
                  <div className="bg-white border border-[#F4EBE3] rounded-2xl shadow-lg p-4 max-w-[210px] flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={successData.qrImageBase64}
                      alt="Default QR checkpoint"
                      className="w-40 h-40 object-contain"
                    />
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">CODE:</span>
                      <span className="font-mono text-xs font-bold bg-slate-100 text-indigo-650 px-2 py-0.5 rounded">
                        {successData.defaultQr?.code}
                      </span>
                    </div>
                  </div>

                  <div className="w-full space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                      RESOLVING SCAN LINK
                    </span>
                    <div className="flex items-center gap-2 bg-[#FFFBF7] border border-[#F4EBE3] p-2 rounded-2xl">
                      <span className="flex-grow text-left text-xs text-slate-500 font-mono truncate select-all">
                        {`${process.env.NEXT_PUBLIC_SCAN_BASE_URL || window.location.origin + '/scan'}/${successData.defaultQr?.code}`}
                      </span>
                      <button
                        onClick={handleCopyLink}
                        className="p-1.5 bg-white hover:bg-slate-50 text-slate-500 hover:text-[#5E52FA] border border-[#F4EBE3] rounded-xl transition-colors"
                        title="Copy scan link"
                      >
                        {copied ? (
                          <IconCheck className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <IconCopy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 w-full pt-4 border-t border-[#F4EBE3]">
                {!successData.qrError && (
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold bg-[#5E52FA] hover:bg-[#5045e4] text-white border border-[#483ec7] shadow-[0_4px_0_0_#483ec7] active:translate-y-[4px] active:shadow-none transition-all duration-75"
                  >
                    <IconDownload className="w-4.5 h-4.5" />
                    Download QR Code
                  </button>
                )}

                <button
                  onClick={handleGoToHunt}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold bg-slate-900 hover:bg-indigo-650 text-white border border-slate-950 shadow-[0_4px_0_0_rgba(15,23,42,0.15)] active:translate-y-[4px] active:shadow-none transition-all duration-75"
                >
                  Go to Hunt Detail panel
                  <IconArrowRight className="w-4.5 h-4.5" />
                </button>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 text-xs font-bold text-slate-450 hover:text-slate-650 hover:underline transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
