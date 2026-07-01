'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconPlus, IconLoader, IconCalendar, IconQrcode, IconCompass, IconChevronRight, IconMapPin, IconTrash } from '@tabler/icons-react';
import HuntModal from '@/components/HuntModal';
import ViewHuntQrsModal from '@/components/qr/ViewHuntQrsModal';
import { Hunt } from '@/types';

interface HuntsPageClientProps {
  adminSecret: string;
}

export default function HuntsPageClient({ adminSecret }: HuntsPageClientProps) {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrsModalOpen, setQrsModalOpen] = useState(false);
  const [activeHuntIdForQrs, setActiveHuntIdForQrs] = useState('');
  const [activeHuntNameForQrs, setActiveHuntNameForQrs] = useState('');

  const handleViewQrs = (huntId: string, huntName: string) => {
    setActiveHuntIdForQrs(huntId);
    setActiveHuntNameForQrs(huntName);
    setQrsModalOpen(true);
  };

  const handleDeleteHunt = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete hunt "${name}"? This will permanently delete all its checkpoints and scan records.`)) {
      return;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (adminSecret) {
        headers['x-admin-secret'] = adminSecret;
      }

      const res = await fetch(`/api/hunts/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete hunt');
      }

      fetchHunts();
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting the hunt');
    }
  };

  const fetchHunts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (adminSecret) {
        headers['x-admin-secret'] = adminSecret;
      }

      const res = await fetch('/api/hunts', {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch hunts');
      }

      const data = await res.json();
      setHunts(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while loading hunts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHunts();
  }, [adminSecret]);

  const handleCreateHuntSuccess = () => {
    fetchHunts();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ACTIVE
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            DRAFT
          </span>
        );
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activeCount = hunts.filter((h) => h.status === 'ACTIVE').length;
  const draftCount = hunts.filter((h) => h.status === 'DRAFT').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title & Top Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Treasure Hunts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, configure, and monitor live status of game zones.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-[#5E52FA] hover:bg-[#5045e4] text-white border border-[#483ec7] shadow-[0_4px_0_0_#483ec7] active:translate-y-[4px] active:shadow-none transition-all duration-75"
        >
          <IconPlus className="w-4 h-4" />
          Create Hunt
        </button>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-3xl bg-white border border-[#F4EBE3] shadow-sm shadow-slate-100/50">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Hunts</div>
          <div className="text-3xl font-black text-slate-900 mt-1">{hunts.length}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-[#F4EBE3] shadow-sm shadow-slate-100/50">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Hunts</div>
          <div className="text-3xl font-black text-emerald-600 mt-1">{activeCount}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-[#F4EBE3] shadow-sm shadow-slate-100/50">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Draft Hunts</div>
          <div className="text-3xl font-black text-amber-500 mt-1">{draftCount}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-[#F4EBE3] shadow-sm shadow-slate-100/50">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Checkpoints</div>
          <div className="text-3xl font-black text-indigo-600 mt-1">
            {hunts.reduce((acc, h) => acc + (h.qr_codes_count || 0), 0)}
          </div>
        </div>
      </div>

      {/* Main List Area */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
          <IconLoader className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm font-semibold">Fetching hunts...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-600 text-sm">
          {error}
        </div>
      ) : hunts.length === 0 ? (
        <div className="p-12 text-center rounded-[2rem] bg-white border border-[#F4EBE3] max-w-lg mx-auto py-16 shadow-sm">
          <IconCompass className="w-12 h-12 text-slate-350 mx-auto mb-4 stroke-[1.5]" />
          <h3 className="font-bold text-lg text-slate-800">No Hunts Created</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Get started by creating your very first custom treasure hunt game.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-[#5E52FA] hover:bg-[#5045e4] text-white border border-[#483ec7] shadow-[0_4px_0_0_#483ec7] active:translate-y-[4px] active:shadow-none transition-all duration-75"
          >
            <IconPlus className="w-4 h-4" />
            Create Your First Hunt
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {hunts.map((hunt) => (
            <div
              key={hunt.id}
              className="group rounded-[2rem] bg-white border border-[#F4EBE3] p-7 flex flex-col justify-between gap-6 shadow-sm shadow-slate-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <div className="space-y-4">
                {/* Small Header Label */}
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">
                  GAME ZONE CAMPAIGN
                </span>
                
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-extrabold text-2xl text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[280px]">
                    {hunt.name}
                  </h3>
                  {getStatusBadge(hunt.status)}
                </div>

                {/* Sub-panel (matching the stick figure icon layout in passport) */}
                <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-[#F4EBE3] space-y-3">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <IconCalendar className="w-4 h-4 text-indigo-500" />
                    {hunt.start_at || hunt.end_at ? (
                      <span className="font-medium">
                        {hunt.start_at ? formatDate(hunt.start_at) : 'Immediate'} 
                        <span className="text-slate-400 mx-1.5">→</span> 
                        {hunt.end_at ? formatDate(hunt.end_at) : 'Ongoing'}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Permanent game zone (no date constraints)</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <IconQrcode className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium"><strong className="text-slate-800">{hunt.qr_codes_count || 0}</strong> QR checkpoints configured</span>
                  </div>
                </div>
              </div>

              {/* Pill Button CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-[#F4EBE3] mt-auto gap-3 flex-wrap">
                <span className="text-xs text-slate-400 font-mono select-all truncate max-w-[100px] hidden sm:inline">
                  ID: {hunt.id.substring(0, 8)}...
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteHunt(hunt.id, hunt.name)}
                    className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-[0_3px_0_0_#FECACA] active:translate-y-[3px] active:shadow-none rounded-full transition-all duration-75"
                    title="Delete Hunt"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewQrs(hunt.id, hunt.name)}
                    className="flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-[#F4EBE3] shadow-[0_3px_0_0_#F4EBE3] active:translate-y-[3px] active:shadow-none px-3.5 py-2.5 rounded-full transition-all duration-75"
                  >
                    <IconQrcode className="w-4 h-4 text-indigo-650" />
                    View QRs
                  </button>
                  <Link
                    href={`/dashboard/hunts/${hunt.id}`}
                    className="flex items-center gap-1.5 text-xs font-black bg-slate-900 hover:bg-indigo-600 text-white border border-slate-950 shadow-[0_3px_0_0_rgba(15,23,42,0.15)] active:translate-y-[3px] active:shadow-none px-4 py-2 rounded-full transition-all duration-75"
                  >
                    Configure
                    <IconChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal dialogs */}
      <HuntModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateHuntSuccess}
        adminSecret={adminSecret}
      />

      <ViewHuntQrsModal
        isOpen={qrsModalOpen}
        onClose={() => setQrsModalOpen(false)}
        huntId={activeHuntIdForQrs}
        huntName={activeHuntNameForQrs}
        adminSecret={adminSecret}
      />
    </div>
  );
}
