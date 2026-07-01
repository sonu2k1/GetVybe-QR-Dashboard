'use client';

import React, { useState } from 'react';
import { IconX, IconQrcode, IconCompass, IconLoader, IconCopy, IconCheck, IconDownload, IconPlus } from '@tabler/icons-react';
import { QrCode } from '@/types/qr';

interface GenerateQRModalProps {
  huntId: string;
  onSuccess: (qr: QrCode) => void;
  isOpen: boolean;
  onClose: () => void;
  adminSecret?: string;
}

export default function GenerateQRModal({
  huntId,
  onSuccess,
  isOpen,
  onClose,
  adminSecret = '',
}: GenerateQRModalProps) {
  const [label, setLabel] = useState('');
  const [points, setPoints] = useState(10);
  const [sequenceOrder, setSequenceOrder] = useState('');
  const [maxScans, setMaxScans] = useState('');
  const [clueTitle, setClueTitle] = useState('');
  const [clueText, setClueText] = useState('');
  const [clueImageUrl, setClueImageUrl] = useState('');
  const [geoLock, setGeoLock] = useState(false);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  // Status flags
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{ qr: QrCode; qrImageBase64: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('Label is a required field');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessData(null);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (adminSecret) {
        headers['x-admin-secret'] = adminSecret;
      }

      const payload = {
        huntId,
        label: label.trim(),
        points: parseInt(String(points), 10) || 10,
        sequenceOrder: sequenceOrder ? parseInt(sequenceOrder, 10) : null,
        maxScans: maxScans ? parseInt(maxScans, 10) : null,
        cluePayload: {
          title: clueTitle.trim(),
          text: clueText.trim(),
          imageUrl: clueImageUrl.trim() || '',
        },
        locationLat: geoLock && lat ? parseFloat(lat) : null,
        locationLng: geoLock && lng ? parseFloat(lng) : null,
      };

      const res = await fetch('/api/qr/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate QR Checkpoint');
      }

      setSuccessData(data);
      onSuccess(data.qr);
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!successData) return;
    const scanBaseUrl = process.env.NEXT_PUBLIC_SCAN_BASE_URL || `${window.location.origin}/scan`;
    const url = `${scanBaseUrl}/${successData.qr.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!successData) return;
    const link = document.createElement('a');
    link.href = successData.qrImageBase64;
    link.download = `${label.replace(/\s+/g, '_')}-${successData.qr.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setLabel('');
    setPoints(10);
    setSequenceOrder('');
    setMaxScans('');
    setClueTitle('');
    setClueText('');
    setClueImageUrl('');
    setGeoLock(false);
    setLat('');
    setLng('');
    setError('');
    setSuccessData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-xl bg-white border border-[#F4EBE3] rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F4EBE3] bg-[#FFFBF7]/40 flex-shrink-0">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <IconQrcode className="w-5 h-5 text-[#5E52FA]" />
            Generate Checkpoint QR
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form / Success Screen Area */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {error && (
            <div className="p-3.5 text-xs bg-red-500/5 border border-red-500/20 text-red-500 rounded-2xl">
              {error}
            </div>
          )}

          {!successData ? (
            /* Input Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Checkpoint Label *
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Secret Fountain"
                    className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Points *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={points}
                      onChange={(e) => setPoints(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Sequence
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={sequenceOrder}
                      onChange={(e) => setSequenceOrder(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Max Scans (Leave empty for unlimited)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxScans}
                    onChange={(e) => setMaxScans(e.target.value)}
                    placeholder="Unlimited"
                    className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors font-mono"
                  />
                </div>

                <div className="flex flex-col justify-end pb-1.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-600 h-[46px]">
                    <input
                      type="checkbox"
                      checked={geoLock}
                      onChange={(e) => setGeoLock(e.target.checked)}
                      className="w-4.5 h-4.5 rounded text-[#5E52FA] bg-white border-[#F4EBE3] focus:ring-[#5E52FA]"
                    />
                    Enable Geo-Lock Check
                  </label>
                </div>
              </div>

              {/* Geo Lock Coordinates Inputs */}
              {geoLock && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-[#FFFBF7] border border-[#F4EBE3] rounded-2xl animate-in slide-in-from-top-3 duration-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="e.g. 40.7128"
                      className="w-full px-3.5 py-2 bg-white border border-[#F4EBE3] rounded-xl text-xs text-slate-800 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="e.g. -74.0060"
                      className="w-full px-3.5 py-2 bg-white border border-[#F4EBE3] rounded-xl text-xs text-slate-800 outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Clue Metadata */}
              <div className="space-y-4 pt-3 border-t border-[#F4EBE3]">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                  Player Clue Settings
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Clue Title
                  </label>
                  <input
                    type="text"
                    value={clueTitle}
                    onChange={(e) => setClueTitle(e.target.value)}
                    placeholder="e.g. The Red Door Clue"
                    className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Clue Text / Description
                  </label>
                  <textarea
                    value={clueText}
                    onChange={(e) => setClueText(e.target.value)}
                    placeholder="e.g. Climb the stone steps and inspect the door handle..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Clue Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={clueImageUrl}
                    onChange={(e) => setClueImageUrl(e.target.value)}
                    placeholder="https://example.com/clue.jpg"
                    className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#F4EBE3] mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-semibold text-slate-450 hover:text-slate-600 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-[#5E52FA] hover:bg-[#5045e4] text-white border border-[#483ec7] shadow-[0_4px_0_0_#483ec7] active:translate-y-[4px] active:shadow-none disabled:opacity-50 transition-all duration-75"
                >
                  {loading ? (
                    <>
                      <IconLoader className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate QR'
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Success Preview Screen */
            <div className="flex flex-col items-center text-center space-y-6 py-4 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center">
                <IconCheck className="w-6 h-6 stroke-[3]" />
              </div>
              
              <div>
                <h3 className="text-xl font-black text-slate-900">QR Checkpoint Created!</h3>
                <p className="text-xs text-slate-500 mt-1">Successfully saved to the Supabase database.</p>
              </div>

              {/* QR Image Preview Box */}
              <div className="bg-white border border-[#F4EBE3] rounded-2xl shadow-lg p-4 max-w-[240px] flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={successData.qrImageBase64}
                  alt={successData.qr.label}
                  className="w-44 h-44 object-contain"
                />
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">CODE:</span>
                  <span className="font-mono text-xs font-bold bg-slate-100 text-indigo-650 px-2.5 py-1 rounded">
                    {successData.qr.code}
                  </span>
                </div>
              </div>

              {/* Scan URL copy section */}
              <div className="w-full max-w-sm space-y-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                  RESOLVING REDIRECT URL
                </span>
                
                <div className="flex items-center gap-2 bg-[#FFFBF7] border border-[#F4EBE3] p-2.5 rounded-2xl">
                  <span className="flex-grow text-left text-xs text-slate-500 font-mono truncate select-all">
                    {`${process.env.NEXT_PUBLIC_SCAN_BASE_URL || window.location.origin + '/scan'}/${successData.qr.code}`}
                  </span>
                  
                  <button
                    onClick={handleCopyLink}
                    className="p-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-indigo-600 border border-[#F4EBE3] rounded-xl transition-colors"
                    title="Copy redirect URL"
                  >
                    {copied ? (
                      <IconCheck className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <IconCopy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Success Footer Buttons */}
              <div className="flex items-center justify-center gap-3 pt-6 border-t border-[#F4EBE3] w-full">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-[#F4EBE3] shadow-[0_4px_0_0_#F4EBE3] active:translate-y-[4px] active:shadow-none transition-all duration-75"
                >
                  <IconPlus className="w-4 h-4" />
                  Generate Another
                </button>
                
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-5 py-3 rounded-2xl text-xs font-bold bg-[#5E52FA] hover:bg-[#5045e4] text-white border border-[#483ec7] shadow-[0_4px_0_0_#483ec7] active:translate-y-[4px] active:shadow-none transition-all duration-75"
                >
                  <IconDownload className="w-4 h-4" />
                  Download QR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
