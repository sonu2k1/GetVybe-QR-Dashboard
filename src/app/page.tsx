import React from 'react';
import Link from 'next/link';
import { IconCompass, IconMapPin, IconQrcode, IconDeviceMobile } from '@tabler/icons-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <IconCompass className="w-6 h-6 animate-spin-slow" style={{ color: '#5E52FA' }} />
          </div>
          <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-white via-slate-100 to-indigo-400 bg-clip-text text-transparent">
            VybeTreasure
          </span>
        </div>
        <Link
          href="/dashboard/hunts"
          className="text-sm font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 hover:shadow-[0_0_20px_rgba(94,82,250,0.4)] transition-all duration-300"
        >
          Open Dashboard
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto text-center px-6 py-12 flex flex-col items-center justify-center flex-grow z-10">
        <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 mb-6 tracking-wide uppercase">
          Next-Gen Treasure Hunt QR Engine
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-tight">
          Create & Manage Real-World Adventures
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          Generate custom, sequence-tracked QR codes, configure hidden clues, set custom point weights, and monitor live scans with real-time analytics.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-12">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm text-left">
            <div className="p-3 bg-indigo-600/10 text-indigo-400 w-fit rounded-xl border border-indigo-500/20 mb-4">
              <IconMapPin className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-200 mb-2">Create Hunts</h3>
            <p className="text-sm text-slate-400 leading-normal">
              Organize multiple treasure hunt stages with draft, active, and completed statuses.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm text-left">
            <div className="p-3 bg-indigo-600/10 text-indigo-400 w-fit rounded-xl border border-indigo-500/20 mb-4">
              <IconQrcode className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-200 mb-2">Smart QR Codes</h3>
            <p className="text-sm text-slate-400 leading-normal">
              Single & bulk generation, sequence validation, location tagging, and scan limits.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm text-left">
            <div className="p-3 bg-indigo-600/10 text-indigo-400 w-fit rounded-xl border border-indigo-500/20 mb-4">
              <IconDeviceMobile className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-200 mb-2">Live Activity</h3>
            <p className="text-sm text-slate-400 leading-normal">
              Real-time polling of players' scans, duplicate protection, and automatic leaderboards.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            href="/dashboard/hunts"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(94,82,250,0.3)] hover:shadow-[0_0_35px_rgba(94,82,250,0.5)] border border-indigo-500/50 hover:-translate-y-0.5 transition-all duration-300 text-center"
          >
            Launch Admin Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-600 border-t border-slate-900 z-10">
        <p>© {new Date().getFullYear()} Vybe Treasure. All rights reserved.</p>
      </footer>
    </div>
  );
}
