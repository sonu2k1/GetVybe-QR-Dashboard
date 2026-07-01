'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  IconCompass, 
  IconCircleCheck, 
  IconAlertTriangle, 
  IconClock, 
  IconLoader, 
  IconTrophy, 
  IconChevronRight, 
  IconUser, 
  IconMapPin, 
  IconAward 
} from '@tabler/icons-react';
import { createBrowserClient } from '@/lib/supabase';
import { CluePayload, QrCode } from '@/types';

// Fun username generator
const ADJECTIVES = ['Misty', 'Deep', 'Aqua', 'Solar', 'Flame', 'Crimson', 'Sage', 'Silver', 'Golden', 'Vibrant'];
const NOUNS = ['Pulse', 'Dew', 'Vibe', 'Quest', 'Spark', 'Phoenix', 'Ranger', 'Path', 'Echo', 'Horizon'];
const SUFFIXES = ['Alpha', 'Star', 'Finder', 'Runner', 'Gamer', 'Hunter', 'Vybe'];

function generateFunUsername() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const suff = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  return `${adj}${noun}${suff}`;
}

export default function ScanPageClient({ code }: { code: string }) {
  const [userId, setUserId] = useState('');
  const [qrCode, setQrCode] = useState<any | null>(null);
  const [hunt, setHunt] = useState<any | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'clue' | 'leaderboard'>('clue');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');

  const supabase = createBrowserClient();

  // Load player ID & fetch QR details
  useEffect(() => {
    // 1. Initialize username
    let storedId = localStorage.getItem('vybe_player_user_id');
    if (!storedId) {
      storedId = generateFunUsername();
      localStorage.setItem('vybe_player_user_id', storedId);
    }
    setUserId(storedId);
    setUsernameInput(storedId);

    // 2. Fetch Checkpoint Details
    const fetchCheckpoint = async () => {
      try {
        setLoading(true);
        setError('');

        const { data, error: fetchError } = await supabase
          .from('qr_codes')
          .select('*, hunts(*)')
          .eq('code', code)
          .single();

        if (fetchError || !data) {
          throw new Error('This QR Code could not be resolved. Please verify the code.');
        }

        setQrCode(data);
        setHunt(data.hunts);

        // Check if player has already successfully scanned this checkpoint
        const { data: scanData } = await supabase
          .from('scans')
          .select('id, result')
          .eq('qr_id', data.id)
          .eq('user_id', storedId)
          .eq('result', 'SUCCESS')
          .limit(1);

        if (scanData && scanData.length > 0) {
          setScanResult('SUCCESS');
        }
      } catch (err: any) {
        setError(err.message || 'Error loading checkpoint details');
      } finally {
        setLoading(false);
      }
    };

    fetchCheckpoint();
  }, [code]);

  // Fetch leaderboard statistics directly from database scans
  const fetchLeaderboard = async () => {
    if (!qrCode) return;
    try {
      // Fetch scans matching this hunt's codes
      const { data, error: lbError } = await supabase
        .from('scans')
        .select('user_id, result, qr_codes!inner(hunt_id, points)')
        .eq('qr_codes.hunt_id', qrCode.hunt_id)
        .eq('result', 'SUCCESS');

      if (lbError) throw lbError;

      const scores: Record<string, { user_id: string; total_points: number; scan_count: number }> = {};
      (data || []).forEach((scan: any) => {
        const uId = scan.user_id;
        const pts = scan.qr_codes?.points ?? 0;
        if (!scores[uId]) {
          scores[uId] = { user_id: uId, total_points: 0, scan_count: 0 };
        }
        scores[uId].total_points += pts;
        scores[uId].scan_count += 1;
      });

      const sorted = Object.values(scores).sort((a, b) => b.total_points - a.total_points);
      setLeaderboard(sorted);
    } catch (err) {
      console.warn('Error fetching leaderboard for player:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab, qrCode]);

  // Handle claiming points (POST /api/scan/[code])
  const handleClaimPoints = async () => {
    if (!userId.trim()) return;
    try {
      setSubmitting(true);
      setError('');

      const res = await fetch(`/api/scan/${code}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId.trim(),
          deviceMeta: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.reason || data.error || 'Failed to claim checkpoint');
      }

      setScanResult(data.result);
      if (data.result === 'SUCCESS') {
        // Trigger a points increment refresh locally
        setQrCode((prev: any) => prev ? { ...prev, scan_count: prev.scan_count + 1 } : null);
      }
    } catch (err: any) {
      setError(err.message || 'Scan validation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle player username update
  const saveUsername = () => {
    const trimmed = usernameInput.trim();
    if (trimmed) {
      setUserId(trimmed);
      localStorage.setItem('vybe_player_user_id', trimmed);
      setIsEditingUsername(false);
      // Reset scan result state to let database re-validate duplicate scan for new user name
      setScanResult(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-grid-pattern text-slate-800 flex flex-col items-center justify-center gap-3">
        <IconLoader className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-bold text-slate-600">Resolving Checkpoint...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid-pattern text-slate-800 px-4 py-8 flex items-center justify-center font-sans">
      
      {/* Background decoration elements */}
      <div className="absolute top-8 left-4 opacity-30 pointer-events-none">
        <svg width="40" height="24" fill="none" viewBox="0 0 45 28">
          <path d="M12 20C12 15.58 15.58 12 20 12C21.1 12 22.2 12.2 23.2 12.6C24.8 7.5 29.6 4 35.2 4C42.2 4 48 9.7 48 16.7C48 23.7 42.2 29.5 35.2 29.5H12C7.5 29.5 4 25.9 4 21.5C4 17 7.5 13.5 12 13.5V20Z" fill="#CBB6FC" stroke="#9B80F8" />
        </svg>
      </div>

      <div className="absolute bottom-12 right-6 opacity-30 pointer-events-none">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path d="M12 2L14.8 8.6L22 9.2L16.5 14L18.2 21L12 17.3L5.8 21L7.5 14L2 9.2L9.2 8.6L12 2Z" fill="#FFE59E" stroke="#FFC93F" />
        </svg>
      </div>

      {/* Main card grid container */}
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-300">
        
        {/* ================= CARD 1: VYBE PASSPORT ================= */}
        <div className="bg-white border border-[#F4EBE3] rounded-[2rem] p-6 shadow-md shadow-slate-100/50 relative overflow-hidden">
          
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-2">
            VYBE PASSPORT
          </span>

          <div className="flex justify-between items-start gap-4">
            
            {/* Player details */}
            <div className="flex-grow space-y-3">
              {isEditingUsername ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-[#FFFBF7] border border-[#F4EBE3] rounded-xl outline-none text-slate-800"
                    maxLength={20}
                  />
                  <button
                    onClick={saveUsername}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                    {userId}
                  </h2>
                  <button 
                    onClick={() => setIsEditingUsername(true)}
                    className="text-[10px] text-slate-400 font-bold hover:text-indigo-600 mt-0.5 underline block"
                  >
                    Change username
                  </button>
                </div>
              )}

              {/* Pill badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-slate-900 text-white">
                  PLAYER
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF2E6] text-amber-600 border border-amber-200">
                  <IconMapPin className="w-3 h-3 text-red-500" />
                  {qrCode?.label || 'Earth'}
                </span>
              </div>
            </div>

            {/* Avatar Capsule Card (Matching reference drawing) */}
            <div className="flex-shrink-0 w-16 h-20 border border-[#F4EBE3] bg-[#FFFBF7] rounded-2xl flex items-center justify-center">
              <svg width="28" height="42" viewBox="0 0 28 42" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#5E52FA" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="14" cy="8" r="4.5" />
                <path d="M14 12.5V26M14 16.5L6 14.5M14 16.5L22 13M14 26L7 38.5M14 26L21 38.5" />
              </svg>
            </div>
          </div>

          {/* Achievement strip panel */}
          <div className="mt-5 p-3 rounded-2xl bg-[#FFFBF7] border border-[#F4EBE3] flex items-center justify-around gap-1.5">
            {/* Display collected badges */}
            <div className="w-8 h-8 rounded-full border border-indigo-100 bg-white flex items-center justify-center text-indigo-500" title="Start">
              🚀
            </div>
            <div className="w-8 h-8 rounded-full border border-indigo-100 bg-white flex items-center justify-center text-indigo-500" title="Compass">
              🧩
            </div>
            <div className="w-8 h-8 rounded-full border border-indigo-100 bg-white flex items-center justify-center text-indigo-500" title="Points">
              💎
            </div>
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-indigo-500 ${scanResult ? 'border-amber-200 bg-white' : 'border-dashed border-slate-200 opacity-20'}`} title="Current Checkpoint">
              📍
            </div>
            <div className="w-8 h-8 rounded-full border border-dashed border-slate-200 opacity-20 flex items-center justify-center text-indigo-500" title="Level Complete">
              🏆
            </div>
          </div>
        </div>

        {/* ================= TAB BUTTON BAR ================= */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FFF2E6]/60 border border-[#F4EBE3] rounded-2xl shadow-inner">
          <button
            onClick={() => setActiveTab('clue')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === 'clue' ? 'bg-white text-slate-900 shadow-sm border border-[#F4EBE3]' : 'text-slate-500 hover:text-slate-800'}`}
          >
            📅 Active Clue
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === 'leaderboard' ? 'bg-white text-slate-900 shadow-sm border border-[#F4EBE3]' : 'text-slate-500 hover:text-slate-800'}`}
          >
            🔮 Scoreboard
          </button>
        </div>

        {/* ================= TAB CONTENT 1: CLUE REVEAL ================= */}
        {activeTab === 'clue' && (
          <div className="space-y-6">
            
            {/* Wallet points banner card */}
            <div className="bg-gradient-to-r from-[#9B80F8] to-[#5E52FA] border border-[#5E52FA]/25 rounded-[2rem] p-6 text-white shadow-lg shadow-indigo-600/10 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">
                  VYBE POINTS WALLET
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-white/20 border border-white/20 uppercase">
                  LEVEL 4
                </span>
              </div>

              <div>
                <h3 className="text-3xl font-black font-mono">
                  {scanResult ? `+${qrCode?.points || 10}` : '0'} <span className="text-xl font-normal">VP</span>
                </h3>
                <span className="text-[10px] text-indigo-200 block mt-1 font-bold">
                  {scanResult ? 'CLAIMED AT CHECKPOINT' : 'SCAN COMPASS PENDING'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] text-indigo-100 font-bold uppercase tracking-wide">
                  <span>Progress to Level 5</span>
                  <span>{scanResult ? qrCode?.points || 10 : 0} / 150 VP</span>
                </div>
                <div className="w-full h-1.5 bg-black/15 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-500" 
                    style={{ width: scanResult ? `${Math.min(100, ((qrCode?.points || 10) / 150) * 100)}%` : '0%' }}
                  />
                </div>
              </div>
            </div>

            {/* Daily Momentum / Checkpoint Clue details */}
            <div className="bg-white border border-[#F4EBE3] rounded-[2rem] p-6 shadow-md shadow-slate-100/50 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                  DAILY MOMENTUM
                </span>
                {scanResult === 'SUCCESS' && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-600 border border-emerald-200">
                    🔥 Claimed
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-800">
                  {qrCode?.clue_payload?.title || 'Reveal Checkpoint Clue'}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                  {qrCode?.clue_payload?.text || 'Scan details will appear once claimed.'}
                </p>
              </div>

              {/* Optional Clue Image */}
              {qrCode?.clue_payload?.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCode.clue_payload.imageUrl}
                  alt="Clue Illustration"
                  className="w-full h-44 object-cover rounded-2xl border border-[#F4EBE3] shadow-sm"
                />
              )}

              {/* Form Action buttons */}
              {error && (
                <div className="p-3 text-xs bg-red-500/5 border border-red-500/10 text-red-500 rounded-xl">
                  {error}
                </div>
              )}

              <div className="pt-3 border-t border-[#F4EBE3]">
                {!scanResult ? (
                  <button
                    onClick={handleClaimPoints}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-black text-sm bg-[#5E52FA] hover:bg-[#5045e4] text-white border border-[#483ec7] shadow-[0_4px_0_0_#483ec7] active:translate-y-[4px] active:shadow-none disabled:opacity-50 transition-all duration-75"
                  >
                    {submitting ? (
                      <>
                        <IconLoader className="w-4 h-4 animate-spin" />
                        Logging Checkpoint...
                      </>
                    ) : (
                      'Claim Checkpoint Points'
                    )}
                  </button>
                ) : (
                  <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center text-xs font-bold text-emerald-600 flex items-center justify-center gap-2">
                    <IconCircleCheck className="w-5 h-5" />
                    Checkpoint successfully logged!
                  </div>
                )}
              </div>
            </div>

            {/* Campaign info footer */}
            <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-[#F4EBE3] text-center text-xs text-slate-450">
              Hunt: <strong className="text-slate-800">{hunt?.name || 'Treasure Quest'}</strong> 
              {hunt?.status === 'COMPLETED' && ' (Completed)'}
            </div>
          </div>
        )}

        {/* ================= TAB CONTENT 2: SCOREBOARD ================= */}
        {activeTab === 'leaderboard' && (
          <div className="bg-white border border-[#F4EBE3] rounded-[2rem] p-6 shadow-md shadow-slate-100/50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4EBE3]">
              <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase">Scoreboard</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Players Ranked</span>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
              {leaderboard.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  <IconTrophy className="w-8 h-8 text-slate-350 mx-auto mb-2 stroke-[1.5]" />
                  No rankings registered. Be the first!
                </div>
              ) : (
                leaderboard.map((entry, index) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center justify-between p-3 border border-[#F4EBE3] rounded-2xl transition-all ${entry.user_id === userId ? 'bg-indigo-50/20 border-indigo-200' : 'bg-[#FFFBF7]/40'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${index === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' : index === 1 ? 'bg-slate-150 text-slate-650' : 'bg-slate-100 text-slate-450'}`}>
                        {index + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800 max-w-[150px] truncate select-all">
                        {entry.user_id}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="text-[8px] text-slate-400 font-black uppercase">Scans</div>
                        <span className="font-mono text-xs font-bold text-slate-600">{entry.scan_count}</span>
                      </div>
                      <div className="min-w-[60px]">
                        <div className="text-[8px] text-slate-400 font-black uppercase">Points</div>
                        <span className="font-mono text-xs font-extrabold text-indigo-650">{entry.total_points} VP</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
