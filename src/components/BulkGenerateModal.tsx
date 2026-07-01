'use client';

import React, { useState } from 'react';
import { IconX, IconLoader, IconQrcode } from '@tabler/icons-react';

interface BulkGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { count: number; labelPrefix: string }) => Promise<void>;
}

export default function BulkGenerateModal({ isOpen, onClose, onSubmit }: BulkGenerateModalProps) {
  const [count, setCount] = useState(5);
  const [labelPrefix, setLabelPrefix] = useState('Checkpoint');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (count <= 0) {
      setError('Count must be greater than zero');
      return;
    }
    if (count > 100) {
      setError('Max bulk generation count is capped at 100 to ensure performance');
      return;
    }
    if (!labelPrefix.trim()) {
      setError('Label prefix is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        count,
        labelPrefix: labelPrefix.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to bulk generate QR codes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-md bg-white border border-[#F4EBE3] rounded-[2rem] overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F4EBE3] bg-[#FFFBF7]/40">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <IconQrcode className="w-5 h-5 text-indigo-500" />
            Bulk Generate Checkpoints
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs bg-red-500/5 border border-red-500/20 text-red-500 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Number of QRs to generate
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
              className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors font-mono font-bold"
              required
            />
            <span className="text-[10px] text-slate-450 block mt-1.5">Recommended: max 100 codes at a time.</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Label Prefix
            </label>
            <input
              type="text"
              value={labelPrefix}
              onChange={(e) => setLabelPrefix(e.target.value)}
              placeholder="e.g. Checkpoint"
              className="w-full px-4 py-2.5 bg-[#FFFBF7] border border-[#F4EBE3] focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-350"
              required
            />
            <span className="text-[10px] text-slate-450 block mt-1.5">Codes will be generated as &quot;Prefix 1&quot;, &quot;Prefix 2&quot; etc.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F4EBE3] mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-slate-450 hover:text-slate-650 disabled:opacity-50 transition-colors"
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
                  Generating...
                </>
              ) : (
                'Generate Checkpoints'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
