'use client';

import React, { useState, useEffect } from 'react';
import { IconX, IconLoader, IconQrcode } from '@tabler/icons-react';

interface QrFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  qrCode?: any;
}

export default function QrFormModal({ isOpen, onClose, onSubmit, qrCode }: QrFormModalProps) {
  const [label, setLabel] = useState('');
  const [points, setPoints] = useState(10);
  const [clueTitle, setClueTitle] = useState('');
  const [clueText, setClueText] = useState('');
  const [clueImageUrl, setClueImageUrl] = useState('');
  const [sequenceOrder, setSequenceOrder] = useState('');
  const [maxScans, setMaxScans] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (qrCode) {
      setLabel(qrCode.label || '');
      setPoints(qrCode.points !== undefined ? qrCode.points : 10);
      setClueTitle(qrCode.clue_payload?.title || '');
      setClueText(qrCode.clue_payload?.text || '');
      setClueImageUrl(qrCode.clue_payload?.imageUrl || '');
      setSequenceOrder(qrCode.sequence_order !== null && qrCode.sequence_order !== undefined ? String(qrCode.sequence_order) : '');
      setMaxScans(qrCode.max_scans !== null && qrCode.max_scans !== undefined ? String(qrCode.max_scans) : '');
      setLat(qrCode.location_lat !== null && qrCode.location_lat !== undefined ? String(qrCode.location_lat) : '');
      setLng(qrCode.location_lng !== null && qrCode.location_lng !== undefined ? String(qrCode.location_lng) : '');
      setIsActive(qrCode.is_active !== undefined ? qrCode.is_active : true);
    } else {
      setLabel('');
      setPoints(10);
      setClueTitle('');
      setClueText('');
      setClueImageUrl('');
      setSequenceOrder('');
      setMaxScans('');
      setLat('');
      setLng('');
      setIsActive(true);
    }
  }, [qrCode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('Label is required');
      return;
    }
    if (!clueTitle.trim() || !clueText.trim()) {
      setError('Clue title and description are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const parsedSeq = sequenceOrder.trim() ? parseInt(sequenceOrder, 10) : null;
      const parsedMax = maxScans.trim() ? parseInt(maxScans, 10) : null;
      const parsedLat = lat.trim() ? parseFloat(lat) : null;
      const parsedLng = lng.trim() ? parseFloat(lng) : null;

      if (parsedSeq !== null && isNaN(parsedSeq)) {
        setError('Sequence order must be a number');
        setLoading(false);
        return;
      }
      if (parsedMax !== null && isNaN(parsedMax)) {
        setError('Max scans must be a number');
        setLoading(false);
        return;
      }
      if (parsedLat !== null && isNaN(parsedLat)) {
        setError('Latitude must be a valid float');
        setLoading(false);
        return;
      }
      if (parsedLng !== null && isNaN(parsedLng)) {
        setError('Longitude must be a valid float');
        setLoading(false);
        return;
      }

      const payload = {
        label: label.trim(),
        points: parseInt(String(points), 10) || 10,
        cluePayload: {
          title: clueTitle.trim(),
          text: clueText.trim(),
          imageUrl: clueImageUrl.trim() || undefined,
        },
        sequenceOrder: parsedSeq,
        maxScans: parsedMax,
        locationLat: parsedLat,
        locationLng: parsedLng,
        isActive,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit QR code details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      <div className="w-full max-w-lg bg-white border-l border-[#F4EBE3] h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F4EBE3] bg-[#FFFBF7]/40">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <IconQrcode className="w-5 h-5 text-indigo-500" />
              {qrCode ? 'Edit Checkpoint' : 'Add Checkpoint'}
            </h3>
            <p className="text-xs text-slate-450 mt-1">
              {qrCode ? `Configure values for QR: ${qrCode.code}` : 'Create a new location checkpoint QR'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 text-xs bg-red-500/5 border border-red-500/20 text-red-500 rounded-xl">
              {error}
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b border-[#F4EBE3] pb-2">
              1. Basic Checkpoint Info
            </h4>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Checkpoint Label *
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Ancient Oak Tree"
                className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-350"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Sequence Order (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={sequenceOrder}
                  onChange={(e) => setSequenceOrder(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-350 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clue Settings */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b border-[#F4EBE3] pb-2">
              2. Player Clue Settings
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Clue Title *
              </label>
              <input
                type="text"
                value={clueTitle}
                onChange={(e) => setClueTitle(e.target.value)}
                placeholder="e.g. The Whispering Tree"
                className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-350"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Clue Description *
              </label>
              <textarea
                value={clueText}
                onChange={(e) => setClueText(e.target.value)}
                placeholder="e.g. Look beneath the hollow root where moss grows on the northern side..."
                rows={3}
                className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-350 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Image URL (Optional)
              </label>
              <input
                type="url"
                value={clueImageUrl}
                onChange={(e) => setClueImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-350"
              />
            </div>
          </div>

          {/* Section 3: Coordinates & Limits */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b border-[#F4EBE3] pb-2">
              3. Limits & Location Coordinates
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Max Scans (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxScans}
                  onChange={(e) => setMaxScans(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-350 font-mono"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-600 h-[46px]">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-indigo-600 bg-white border-[#F4EBE3] focus:ring-indigo-500"
                  />
                  Checkpoint Active
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Latitude (Optional)
                </label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="e.g. 40.7128"
                  className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-350 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Longitude (Optional)
                </label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="e.g. -74.0060"
                  className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-350 font-mono"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F4EBE3] bg-[#FFFBF7]/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-slate-450 hover:text-slate-600 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-[#5E52FA] hover:bg-[#5045e4] text-white border border-[#483ec7] shadow-[0_4px_0_0_#483ec7] active:translate-y-[4px] active:shadow-none disabled:opacity-50 transition-all duration-75"
          >
            {loading ? (
              <>
                <IconLoader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              qrCode ? 'Save Changes' : 'Create Checkpoint'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
