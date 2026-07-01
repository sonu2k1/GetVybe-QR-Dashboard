'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { 
  IconArrowLeft, 
  IconPlus, 
  IconQrcode, 
  IconPrinter, 
  IconEdit, 
  IconDownload, 
  IconLoader, 
  IconAlertTriangle, 
  IconCalendar, 
  IconLayoutGrid, 
  IconActivity, 
  IconTrophy,
  IconTrash
} from '@tabler/icons-react';
import { createBrowserClient } from '@/lib/supabase';
import QrFormModal from '@/components/QrFormModal';
import BulkGenerateModal from '@/components/BulkGenerateModal';
import ScanFeed from '@/components/ScanFeed';
import LeaderboardTable from '@/components/LeaderboardTable';
import { Hunt, QrCode } from '@/types';

interface HuntDetailsClientProps {
  huntId: string;
  adminSecret: string;
}

export default function HuntDetailsClient({ huntId, adminSecret }: HuntDetailsClientProps) {
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedQr, setSelectedQr] = useState<QrCode | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'checkpoints' | 'leaderboard' | 'scans'>('checkpoints');
  const [refreshKey, setRefreshKey] = useState(0);

  const supabase = createBrowserClient();

  const fetchHuntAndQrs = async () => {
    try {
      setLoading(true);
      setError('');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (adminSecret) {
        headers['x-admin-secret'] = adminSecret;
      }

      // Fetch hunt details via Server API
      const resHunt = await fetch(`/api/hunts/${huntId}`, {
        method: 'GET',
        headers,
      });

      if (!resHunt.ok) {
        throw new Error('This hunt campaign does not exist or has been deleted.');
      }

      const huntData = await resHunt.json();
      setHunt(huntData);

      // Fetch checkpoints
      const resQrs = await fetch(`/api/qr?huntId=${huntId}`, {
        method: 'GET',
        headers,
      });

      if (!resQrs.ok) {
        const errorData = await resQrs.json();
        throw new Error(errorData.error || 'Failed to fetch QR codes');
      }

      const qrData = await resQrs.json();
      setQrCodes(qrData || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred loading hunt checkpoints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHuntAndQrs();
    
    const interval = setInterval(async () => {
      try {
        const headers: Record<string, string> = {};
        if (adminSecret) headers['x-admin-secret'] = adminSecret;
        const res = await fetch(`/api/qr?huntId=${huntId}`, { headers });
        if (res.ok) {
          const qrData = await res.json();
          setQrCodes(qrData || []);
        }
      } catch (err) {
        console.warn('Silent polling of scan counts failed:', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [huntId, adminSecret]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (adminSecret) {
        headers['x-admin-secret'] = adminSecret;
      }

      const res = await fetch(`/api/hunts/${huntId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      setHunt((prev) => prev ? { ...prev, status: newStatus as any } : null);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleToggleActive = async (qrId: string, currentStatus: boolean) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminSecret) headers['x-admin-secret'] = adminSecret;

      const res = await fetch(`/api/qr/${qrId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to toggle status');
      }

      setQrCodes((prev) =>
        prev.map((qr) => (qr.id === qrId ? { ...qr, is_active: !currentStatus } : qr))
      );
    } catch (err: any) {
      alert(`Error updating checkpoint: ${err.message}`);
    }
  };

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

      setQrCodes((prev) => prev.filter((qr) => qr.id !== qrId));
    } catch (err: any) {
      alert(`Error deleting checkpoint: ${err.message}`);
    }
  };

  const handleQrSubmit = async (formData: any) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (adminSecret) headers['x-admin-secret'] = adminSecret;

    if (selectedQr) {
      const res = await fetch(`/api/qr/${selectedQr.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update checkpoint');
      }
    } else {
      const res = await fetch('/api/qr', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...formData,
          huntId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create checkpoint');
      }
    }

    await fetchHuntAndQrs();
    setRefreshKey((prev) => prev + 1);
  };

  const handleBulkSubmit = async (formData: { count: number; labelPrefix: string }) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (adminSecret) headers['x-admin-secret'] = adminSecret;

    const res = await fetch('/api/qr/bulk', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...formData,
        huntId,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to bulk generate');
    }

    await fetchHuntAndQrs();
    setRefreshKey((prev) => prev + 1);
  };

  const handleDownloadQr = async (code: string, label: string) => {
    try {
      const scanBaseUrl = process.env.NEXT_PUBLIC_SCAN_BASE_URL || `${window.location.origin}/scan`;
      const scanUrl = `${scanBaseUrl}/${code}`;
      const dataUrl = await QRCode.toDataURL(scanUrl, { width: 400, margin: 2 });
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${label.replace(/\s+/g, '_')}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(`Could not download QR Code: ${err.message}`);
    }
  };

  const openAddModal = () => {
    setSelectedQr(undefined);
    setIsQrModalOpen(true);
  };

  const openEditModal = (qr: QrCode) => {
    setSelectedQr(qr);
    setIsQrModalOpen(true);
  };

  if (loading && !hunt) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
        <IconLoader className="w-8 h-8 animate-spin text-indigo-500" />
        <span>Loading hunt settings...</span>
      </div>
    );
  }

  if (error || !hunt) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/hunts" className="flex items-center gap-1.5 text-xs text-indigo-500 hover:underline">
          <IconArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
        </Link>
        <div className="p-5 rounded-3xl bg-red-500/5 border border-red-500/20 text-red-500 text-sm shadow-sm">
          {error || 'Hunt configuration not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/hunts" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors">
          <IconArrowLeft className="w-4 h-4 text-indigo-500" />
          Back to Hunts
        </Link>
        <Link
          href={`/dashboard/hunts/${huntId}/print`}
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-full bg-slate-900 hover:bg-indigo-600 text-white shadow-sm transition-all duration-200"
        >
          <IconPrinter className="w-4 h-4" />
          Export Print Sheet
        </Link>
      </div>

      {/* Main Header Panel */}
      <div className="p-6 rounded-[2rem] bg-white border border-[#F4EBE3] shadow-sm shadow-slate-100/50 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">
              HUNT SETUP ZONE
            </span>
            <h1 className="text-2xl font-black text-slate-900">{hunt.name}</h1>
            <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-500 bg-[#FFFBF7] border border-[#F4EBE3] px-3.5 py-1.5 rounded-xl w-fit">
              <IconCalendar className="w-4 h-4 text-indigo-500" />
              {hunt.start_at || hunt.end_at ? (
                <span className="font-semibold">
                  {hunt.start_at ? new Date(hunt.start_at).toLocaleString() : 'Immediate'} 
                  <span className="mx-2 text-slate-350">→</span> 
                  {hunt.end_at ? new Date(hunt.end_at).toLocaleString() : 'Ongoing'}
                </span>
              ) : (
                <span className="font-semibold">Permanent game zone (no date constraints)</span>
              )}
            </div>
          </div>

          {/* Status Select Box */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
            <select
              value={hunt.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-slate-100 border border-slate-200 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none cursor-pointer transition-colors"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Checkpoints list) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <IconQrcode className="w-5 h-5 text-indigo-500" />
              Checkpoints ({qrCodes.length})
            </h3>
            
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="text-xs font-bold px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-[#F4EBE3] shadow-[0_4px_0_0_#F4EBE3] active:translate-y-[4px] active:shadow-none transition-all duration-75"
              >
                Bulk Generate
              </button>
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-3 rounded-2xl bg-[#5E52FA] hover:bg-[#5045e4] text-white border border-[#483ec7] shadow-[0_4px_0_0_#483ec7] active:translate-y-[4px] active:shadow-none transition-all duration-75"
              >
                <IconPlus className="w-3.5 h-3.5" />
                Add Checkpoint
              </button>
            </div>
          </div>

          {/* Checkpoint table card */}
          <div className="bg-white border border-[#F4EBE3] rounded-[2rem] overflow-hidden shadow-sm shadow-slate-100/50">
            {qrCodes.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                <IconQrcode className="w-8 h-8 text-slate-350 mx-auto mb-2 stroke-[1.5]" />
                No checkpoints generated yet.
                <div className="text-xs text-slate-400 mt-1">Add checkpoints singly or generate them in batches.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#F4EBE3] text-[10px] text-slate-400 uppercase font-black tracking-widest bg-[#FFFBF7]/40">
                      <th className="py-4 px-5 text-center">Seq</th>
                      <th className="py-4 px-5">Checkpoint Label</th>
                      <th className="py-4 px-5">Code</th>
                      <th className="py-4 px-5 text-center">Points</th>
                      <th className="py-4 px-5 text-center">Scans/Max</th>
                      <th className="py-4 px-5 text-center">Active</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EBE3]/60 text-xs text-slate-700">
                    {qrCodes.map((qr) => (
                      <tr key={qr.id} className="hover:bg-[#FFFBF7]/30 transition-colors">
                        <td className="py-4 px-5 text-center text-slate-400 font-mono">
                          {qr.sequence_order !== null ? qr.sequence_order : '—'}
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-800">
                          {qr.label}
                        </td>
                        <td className="py-4 px-5 font-mono text-indigo-600 font-bold select-all bg-indigo-50/15">
                          {qr.code}
                        </td>
                        <td className="py-4 px-5 text-center font-bold text-slate-700 font-mono">
                          {qr.points}
                        </td>
                        <td className="py-4 px-5 text-center font-mono">
                          <span className={`${qr.max_scans && qr.scan_count >= qr.max_scans ? 'text-red-500 font-bold' : 'text-slate-700'}`}>
                            {qr.scan_count}
                          </span>
                          <span className="text-slate-400 mx-0.5">/</span>
                          <span className="text-slate-500">{qr.max_scans !== null ? qr.max_scans : '∞'}</span>
                        </td>
                        <td className="py-4 px-5 text-center">
                          {/* Toggle switch */}
                          <button
                            onClick={() => handleToggleActive(qr.id, qr.is_active)}
                            className={`relative inline-flex h-5.5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${qr.is_active ? 'bg-indigo-600' : 'bg-slate-200'}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${qr.is_active ? 'translate-x-4.5' : 'translate-x-0'}`}
                            />
                          </button>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => handleDeleteQr(qr.id, qr.label)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-650 transition-colors"
                              title="Delete Checkpoint"
                            >
                              <IconTrash className="w-4.5 h-4.5 text-red-600" />
                            </button>
                            <button
                              onClick={() => openEditModal(qr)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="Edit Details"
                            >
                              <IconEdit className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => handleDownloadQr(qr.code, qr.label)}
                              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                              title="Download QR"
                            >
                              <IconDownload className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Feeds & Leaderboard (Styled similar to the reference tab-bar) */}
        <div className="space-y-6">
          
          {/* Tab Selector (Pill format matching the image) */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#FFF2E6]/60 border border-[#F4EBE3] rounded-2xl shadow-inner">
            <button
              onClick={() => setActiveTab('checkpoints')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === 'checkpoints' ? 'bg-white text-slate-900 shadow-sm border border-[#F4EBE3]' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <IconLayoutGrid className="w-4 h-4 text-indigo-500" />
              My Day
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === 'leaderboard' ? 'bg-white text-slate-900 shadow-sm border border-[#F4EBE3]' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <IconTrophy className="w-4 h-4 text-indigo-500" />
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('scans')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === 'scans' ? 'bg-white text-slate-900 shadow-sm border border-[#F4EBE3]' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <IconActivity className="w-4 h-4 text-indigo-500" />
              Scan Feed
            </button>
          </div>

          {/* Tab contents */}
          {activeTab === 'checkpoints' && (
            <div className="bg-white border border-[#F4EBE3] rounded-[2rem] p-6 shadow-sm shadow-slate-100/50 space-y-4">
              <h4 className="font-black text-slate-800 text-xs tracking-wider uppercase border-b border-[#F4EBE3] pb-3">Hunt Info Summary</h4>
              
              <div className="space-y-4 text-xs text-slate-500">
                <div className="flex justify-between border-b border-[#F4EBE3]/50 pb-2">
                  <span>Game status</span>
                  <span className="font-bold text-slate-800">{hunt.status}</span>
                </div>
                <div className="flex justify-between border-b border-[#F4EBE3]/50 pb-2">
                  <span>Total Checkpoints</span>
                  <span className="font-bold text-slate-800">{qrCodes.length} checkpoints</span>
                </div>
                <div className="flex justify-between border-b border-[#F4EBE3]/50 pb-2">
                  <span>Available Points Pool</span>
                  <span className="font-extrabold text-indigo-600 font-mono">{qrCodes.reduce((sum, q) => sum + q.points, 0)} VP</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-[#F4EBE3]/50 pb-2">
                  <span>Scan Resolution Link</span>
                  <span className="text-[10px] text-indigo-500 underline font-mono select-all truncate mt-1">
                    {process.env.NEXT_PUBLIC_SCAN_BASE_URL || `${window.location.origin}/scan`}
                  </span>
                </div>
                
                <div className="bg-[#FFFBF7] p-4 rounded-2xl border border-[#F4EBE3] text-[11px] leading-relaxed text-slate-600">
                  <span className="text-indigo-600 font-bold block mb-1 flex items-center gap-1.5">
                    <IconAlertTriangle className="w-4 h-4" /> Quick Rules Guide
                  </span>
                  Players hit PWA scans which check sequence limits, expiration windows, and unique scan records. Use the Print sheet to place physical QR markers.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardTable
              huntId={huntId}
              adminSecret={adminSecret}
              refreshTrigger={refreshKey}
            />
          )}

          {activeTab === 'scans' && (
            <ScanFeed
              huntId={huntId}
              refreshTrigger={refreshKey}
            />
          )}
        </div>
      </div>

      <QrFormModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onSubmit={handleQrSubmit}
        qrCode={selectedQr}
      />

      <BulkGenerateModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSubmit={handleBulkSubmit}
      />
    </div>
  );
}
