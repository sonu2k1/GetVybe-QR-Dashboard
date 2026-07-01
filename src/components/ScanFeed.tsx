'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { IconActivity, IconDeviceDesktop, IconCircleCheck, IconAlertTriangle, IconClock, IconCircleX, IconRefresh } from '@tabler/icons-react';

interface ScanFeedProps {
  huntId: string;
  refreshTrigger: number;
}

export default function ScanFeed({ huntId, refreshTrigger }: ScanFeedProps) {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchScans = async () => {
    try {
      const supabase = createBrowserClient();
      
      const { data, error: fetchError } = await supabase
        .from('scans')
        .select('id, user_id, result, scanned_at, device_meta, qr_codes!inner(id, label, hunt_id)')
        .eq('qr_codes.hunt_id', huntId)
        .order('scanned_at', { ascending: false })
        .limit(15);

      if (fetchError) {
        throw fetchError;
      }

      setScans(data || []);
      setLastUpdated(new Date());
      setError('');
    } catch (err: any) {
      console.error('Error fetching scan feed:', err);
      setError(err.message || 'Failed to load scan activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
    
    const interval = setInterval(() => {
      fetchScans();
    }, 10000);

    return () => clearInterval(interval);
  }, [huntId, refreshTrigger]);

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'SUCCESS':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <IconCircleCheck className="w-3.5 h-3.5" />
            SUCCESS
          </span>
        );
      case 'DUPLICATE':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <IconAlertTriangle className="w-3.5 h-3.5" />
            DUPLICATE
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20">
            <IconClock className="w-3.5 h-3.5" />
            EXPIRED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200">
            <IconCircleX className="w-3.5 h-3.5" />
            INVALID
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#F4EBE3] rounded-[2rem] p-6 shadow-sm shadow-slate-100/50 flex flex-col h-[500px]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F4EBE3]">
        <div className="flex items-center gap-2">
          <IconActivity className="w-5 h-5 text-indigo-500 animate-pulse" />
          <h3 className="font-black text-slate-800 text-xs tracking-wider uppercase">Live Scan Feed</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span>Updated {lastUpdated.toLocaleTimeString()}</span>
          <button 
            onClick={fetchScans}
            className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-400 hover:text-slate-650"
            title="Refresh Scan Feed"
          >
            <IconRefresh className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Feed Area */}
      <div className="flex-grow overflow-y-auto pr-1 space-y-3.5 custom-scrollbar">
        {loading && scans.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col gap-2 text-slate-400 text-sm">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Loading scan history...
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-xs text-red-500 text-center px-4 bg-red-500/5 rounded-xl border border-red-500/10">
            {error}
          </div>
        ) : scans.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col text-slate-400 text-sm text-center py-12">
            <IconActivity className="w-8 h-8 text-slate-350 mb-2 stroke-[1.5]" />
            No scans recorded yet
            <p className="text-xs text-slate-450 mt-1">Ready to display scan events in real-time.</p>
          </div>
        ) : (
          scans.map((scan) => (
            <div
              key={scan.id}
              className="p-3.5 bg-[#FFFBF7] hover:bg-slate-50 border border-[#F4EBE3] rounded-2xl transition-all duration-200 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 truncate max-w-[170px]">
                  Player: <span className="text-indigo-650 font-mono select-all text-xs">{scan.user_id}</span>
                </span>
                {getResultBadge(scan.result)}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Checkpoint: <span className="text-slate-800 font-bold">{scan.qr_codes?.label || 'Unknown'}</span>
                </span>
                <span className="text-slate-400 text-[10px]">
                  {new Date(scan.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              {scan.device_meta && Object.keys(scan.device_meta).length > 0 && (
                <div className="flex items-center gap-1.5 text-[9px] text-slate-400 bg-white px-2 py-1.5 rounded-xl border border-[#F4EBE3] font-mono truncate">
                  <IconDeviceDesktop className="w-3.5 h-3.5 text-slate-450 flex-shrink-0" />
                  <span className="truncate">
                    {scan.device_meta.userAgent || scan.device_meta.os || JSON.stringify(scan.device_meta)}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
