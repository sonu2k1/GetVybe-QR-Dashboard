'use client';

import React, { useEffect, useState } from 'react';
import { IconTrophy, IconLoader, IconRefresh, IconAward } from '@tabler/icons-react';
import { LeaderboardEntry } from '@/types';

interface LeaderboardTableProps {
  huntId: string;
  adminSecret: string;
  refreshTrigger: number;
}

export default function LeaderboardTable({ huntId, adminSecret, refreshTrigger }: LeaderboardTableProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchLeaderboard = async () => {
    try {
      setError('');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (adminSecret) {
        headers['x-admin-secret'] = adminSecret;
      }

      const res = await fetch(`/api/hunts/${huntId}/leaderboard`, {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch leaderboard');
      }

      const data = await res.json();
      setEntries(data || []);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [huntId, refreshTrigger]);

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return {
          row: 'bg-amber-100/40 border-amber-200 text-amber-800 hover:bg-amber-100/60',
          badge: 'bg-amber-200 text-amber-700 border-amber-300',
        };
      case 1:
        return {
          row: 'bg-slate-100/40 border-slate-200 text-slate-800 hover:bg-slate-100/60',
          badge: 'bg-slate-200 text-slate-650 border-slate-300',
        };
      case 2:
        return {
          row: 'bg-orange-100/40 border-orange-200 text-orange-850 hover:bg-orange-100/60',
          badge: 'bg-orange-200 text-orange-700 border-orange-300',
        };
      default:
        return {
          row: 'bg-white border-[#F4EBE3] hover:bg-slate-50/50 text-slate-700',
          badge: 'bg-slate-100 text-slate-500 border-slate-200',
        };
    }
  };

  return (
    <div className="bg-white border border-[#F4EBE3] rounded-[2rem] p-6 shadow-sm shadow-slate-100/50 flex flex-col h-[500px]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#F4EBE3]">
        <div className="flex items-center gap-2">
          <IconTrophy className="w-5 h-5 text-indigo-500" />
          <h3 className="font-black text-slate-800 text-xs tracking-wider uppercase">Rankings & Leaderboard</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span>Updated {lastUpdated.toLocaleTimeString()}</span>
          <button 
            onClick={fetchLeaderboard}
            className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-400 hover:text-slate-600"
            title="Refresh Leaderboard"
          >
            <IconRefresh className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Leaderboard Entries */}
      <div className="flex-grow overflow-y-auto pr-1 space-y-3.5 custom-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center flex-col gap-2 text-slate-400 text-sm">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Calculating scores...
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-xs text-red-500 text-center px-4 bg-red-500/5 rounded-xl border border-red-500/10">
            {error}
          </div>
        ) : entries.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col text-slate-400 text-sm text-center py-12">
            <IconTrophy className="w-8 h-8 text-slate-350 mb-2 stroke-[1.5]" />
            No rank entries yet
            <p className="text-xs text-slate-450 mt-1 font-sans">Scores will build once players scan ACTIVE checkpoints.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => {
              const style = getRankStyle(index);
              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center justify-between p-3.5 border rounded-2xl transition-all duration-200 ${style.row}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs font-black border ${style.badge}`}>
                      {index <= 2 ? (
                        <IconAward className="w-4.5 h-4.5" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800 select-all">
                      {entry.user_id}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scans</div>
                      <div className="text-xs font-bold text-slate-600 font-mono">{entry.scan_count}</div>
                    </div>
                    
                    <div className="text-right min-w-[70px]">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Points</div>
                      <div className="text-sm font-extrabold text-indigo-650 font-mono">{entry.total_points} VP</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
