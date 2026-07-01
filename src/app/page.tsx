import React from 'react';
import Link from 'next/link';
import { IconCompass, IconMapPin, IconQrcode, IconDeviceMobile, IconChevronRight } from '@tabler/icons-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-grid-pattern text-slate-800 font-sans flex flex-col justify-between relative overflow-hidden">
      
      {/* ================= BACKGROUND DOODLES (MATCHING DASHBOARD STYLING) ================= */}
      {/* Top Left Cloud */}
      <div className="absolute top-20 left-[4%] pointer-events-none opacity-40 animate-pulse duration-[6000ms] hidden lg:block">
        <svg width="45" height="28" viewBox="0 0 45 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 20C12 15.5817 15.5817 12 20 12C21.1578 12 22.2599 12.2452 23.2547 12.6868C24.8967 7.57521 29.6469 4 35.25 4C42.2916 4 48 9.70837 48 16.75C48 23.7916 42.2916 29.5 35.25 29.5H12C7.58172 29.5 4 25.9183 4 21.5C4 17.0817 7.58172 13.5 12 13.5V20Z" fill="#CBB6FC" stroke="#9B80F8" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Gold Star */}
      <div className="absolute top-48 left-[8%] pointer-events-none opacity-45 hidden md:block">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14.8 8.6L22 9.2L16.5 14L18.2 21L12 17.3L5.8 21L7.5 14L2 9.2L9.2 8.6L12 2Z" fill="#FFE59E" stroke="#FFC93F" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Blue Bicycle */}
      <div className="absolute top-28 right-[10%] pointer-events-none opacity-40 hidden md:block">
        <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#4FB9FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="16" r="6" />
          <circle cx="28" cy="16" r="6" />
          <path d="M8 16L18 8L28 16M18 8V18M14 6H22M22 6L24 10" />
        </svg>
      </div>

      {/* Pink Location Pin */}
      <div className="absolute top-[50%] right-[5%] pointer-events-none opacity-50 hidden lg:block">
        <svg width="18" height="26" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 1C4.02944 1 0 5.02944 0 10C0 16.5 9 25 9 25C9 25 18 16.5 18 10C18 5.02944 13.9706 1 9 1Z" fill="#FFA5C8" stroke="#FF5EA1" strokeWidth="1.5" />
          <circle cx="9" cy="10" r="3" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Green Tree */}
      <div className="absolute bottom-40 left-[4%] pointer-events-none opacity-45 hidden lg:block">
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 16H8V26H16V16H22L12 2Z" fill="#A5E2B9" stroke="#3CA966" strokeWidth="1.5" />
          <path d="M12 26V30" stroke="#3CA966" strokeWidth="2" />
        </svg>
      </div>

      {/* Waving blue stick figure */}
      <div className="absolute bottom-32 right-[4%] pointer-events-none opacity-45 hidden lg:block">
        <svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#37B5FF" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="20" cy="10" r="6" />
          <path d="M20 16V36M20 22L8 18M20 22L32 14M20 36L10 52M20 36L30 52" />
        </svg>
      </div>

      {/* Dotted path */}
      <div className="absolute bottom-60 right-[15%] pointer-events-none opacity-35 hidden md:block">
        <svg width="45" height="30" viewBox="0 0 45 30" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#9B80F8" strokeWidth="2" strokeDasharray="3 3">
          <path d="M2 28C10 20 18 28 26 15C32 5 38 12 42 2" />
        </svg>
      </div>

      {/* ================= HEADER (GLASS PANEL BAR) ================= */}
      <header className="w-full px-4 py-4 z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between bg-white/70 backdrop-blur-md border border-[#F4EBE3] rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-2xl border border-indigo-500/20 shadow-sm">
              <IconCompass className="w-6 h-6 animate-spin-slow" style={{ color: '#5E52FA' }} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Vybe<span className="text-indigo-600">Treasure</span>
            </span>
          </div>
          
          <Link
            href="/dashboard/hunts"
            className="flex items-center gap-1.5 text-xs font-bold bg-[#5E52FA] hover:bg-[#5045e4] text-white border border-[#483ec7] shadow-[0_3px_0_0_#483ec7] active:translate-y-[3px] active:shadow-none px-4 py-2.5 rounded-2xl transition-all duration-75"
          >
            Open Dashboard
          </Link>
        </div>
      </header>

      {/* ================= MAIN CONTENT HERO AREA ================= */}
      <main className="max-w-5xl mx-auto text-center px-6 py-10 flex flex-col items-center justify-center flex-grow z-10 space-y-8">
        
        {/* Stage Badge */}
        <span className="px-4 py-1.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-650 border border-indigo-100 tracking-wider uppercase shadow-sm">
          🚀 Next-Gen Treasure Hunt QR Engine
        </span>

        {/* Hero Headline */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1] max-w-3xl">
          Create & Manage Real-World Adventures
        </h1>
        
        {/* Hero Paragraph */}
        <p className="text-sm md:text-base text-slate-500 max-w-2xl leading-relaxed font-medium">
          Generate custom, sequence-tracked QR codes, configure hidden clues, set custom point weights, and monitor live scans with real-time analytics.
        </p>

        {/* Feature Cards Grid (Rounded White Collectibles) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl pt-4">
          
          {/* Card 1 */}
          <div className="bg-white border border-[#F4EBE3] rounded-[2rem] p-6 text-left shadow-sm shadow-slate-100/50 flex flex-col gap-4 transform hover:-translate-y-0.5 transition-all duration-300">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 w-fit shadow-xs">
              <IconMapPin className="w-6 h-6 text-[#5E52FA]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg text-slate-800">Create Hunts</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Organize multiple treasure hunt stages with draft, active, and completed statuses.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#F4EBE3] rounded-[2rem] p-6 text-left shadow-sm shadow-slate-100/50 flex flex-col gap-4 transform hover:-translate-y-0.5 transition-all duration-300">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 w-fit shadow-xs">
              <IconQrcode className="w-6 h-6 text-[#5E52FA]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg text-slate-800">Smart QR Codes</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Single & bulk generation, sequence validation, location tagging, and scan limits.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#F4EBE3] rounded-[2rem] p-6 text-left shadow-sm shadow-slate-100/50 flex flex-col gap-4 transform hover:-translate-y-0.5 transition-all duration-300">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 w-fit shadow-xs">
              <IconDeviceMobile className="w-6 h-6 text-[#5E52FA]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg text-slate-800">Live Activity</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Real-time polling of players' scans, duplicate protection, and automatic leaderboards.
              </p>
            </div>
          </div>

        </div>

        {/* 3D Call to Action Button */}
        <div className="pt-6 w-full flex justify-center">
          <Link
            href="/dashboard/hunts"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm bg-[#5E52FA] hover:bg-[#5045e4] text-white border border-[#483ec7] shadow-[0_4px_0_0_#483ec7] active:translate-y-[4px] active:shadow-none transition-all duration-75 text-center flex items-center justify-center gap-2"
          >
            Launch Admin Dashboard
            <IconChevronRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </div>

      </main>

      {/* ================= FOOTER ================= */}
      <footer className="w-full py-6 text-center text-xs text-slate-400 border-t border-[#F4EBE3] bg-white/20 backdrop-blur-xs relative z-10 flex-shrink-0">
        <p>© {new Date().getFullYear()} Vybe Treasure Hunt QR Engine. All rights reserved.</p>
      </footer>

    </div>
  );
}
