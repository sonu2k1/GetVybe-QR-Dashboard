import React from 'react';
import Link from 'next/link';
import { IconMapPin, IconCompass } from '@tabler/icons-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-grid-pattern text-slate-800 font-sans relative">
      
      {/* ================= BACKGROUND DOODLES (MATCHING REFERENCE IMAGE) ================= */}
      {/* Top Left Cloud */}
      <div className="absolute top-12 left-[4%] pointer-events-none opacity-40 animate-pulse duration-[6000ms]">
        <svg width="45" height="28" viewBox="0 0 45 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 20C12 15.5817 15.5817 12 20 12C21.1578 12 22.2599 12.2452 23.2547 12.6868C24.8967 7.57521 29.6469 4 35.25 4C42.2916 4 48 9.70837 48 16.75C48 23.7916 42.2916 29.5 35.25 29.5H12C7.58172 29.5 4 25.9183 4 21.5C4 17.0817 7.58172 13.5 12 13.5V20Z" fill="#CBB6FC" stroke="#9B80F8" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Gold Star (Top Left Area) */}
      <div className="absolute top-36 left-[12%] pointer-events-none opacity-45">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14.8 8.6L22 9.2L16.5 14L18.2 21L12 17.3L5.8 21L7.5 14L2 9.2L9.2 8.6L12 2Z" fill="#FFE59E" stroke="#FFC93F" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Blue Bicycle (Top Right Area) */}
      <div className="absolute top-28 right-[15%] pointer-events-none opacity-40">
        <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#4FB9FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="16" r="6" />
          <circle cx="28" cy="16" r="6" />
          <path d="M8 16L18 8L28 16M18 8V18M14 6H22M22 6L24 10" />
        </svg>
      </div>

      {/* Pink Location Pin (Middle Right Area) */}
      <div className="absolute top-72 right-[4%] pointer-events-none opacity-50">
        <svg width="18" height="26" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 1C4.02944 1 0 5.02944 0 10C0 16.5 9 25 9 25C9 25 18 16.5 18 10C18 5.02944 13.9706 1 9 1Z" fill="#FFA5C8" stroke="#FF5EA1" strokeWidth="1.5" />
          <circle cx="9" cy="10" r="3" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Green Tree (Bottom Left Area) */}
      <div className="absolute bottom-36 left-[3%] pointer-events-none opacity-45">
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 16H8V26H16V16H22L12 2Z" fill="#A5E2B9" stroke="#3CA966" strokeWidth="1.5" />
          <path d="M12 26V30" stroke="#3CA966" strokeWidth="2" />
        </svg>
      </div>

      {/* Waving blue stick figure (Bottom Right) */}
      <div className="absolute bottom-28 right-[5%] pointer-events-none opacity-45">
        <svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#37B5FF" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="20" cy="10" r="6" />
          <path d="M20 16V36M20 22L8 18M20 22L32 14M20 36L10 52M20 36L30 52" />
        </svg>
      </div>

      {/* Dotted path (Bottom Right) */}
      <div className="absolute bottom-48 right-[18%] pointer-events-none opacity-35">
        <svg width="45" height="30" viewBox="0 0 45 30" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#9B80F8" strokeWidth="2" strokeDasharray="3 3">
          <path d="M2 28C10 20 18 28 26 15C32 5 38 12 42 2" />
        </svg>
      </div>

      {/* ================= HEADER CONTROLS ================= */}
      <header className="sticky top-0 z-40 w-full px-4 py-4">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between bg-white/70 backdrop-blur-md border border-[#F4EBE3] rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-2xl border border-indigo-500/20 shadow-sm">
              <IconCompass className="w-6 h-6 animate-spin-slow" style={{ color: '#5E52FA' }} />
            </div>
            <Link href="/dashboard/hunts" className="flex items-center gap-1.5 font-bold text-xl tracking-tight text-slate-900">
              Vybe<span className="text-indigo-600">Treasure</span>
            </Link>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard/hunts"
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors duration-200"
            >
              <IconMapPin className="w-4 h-4 text-indigo-500" />
              Hunts
            </Link>
          </nav>
        </div>
      </header>

      {/* ================= WRAPPER CONTAINER ================= */}
      <main className="relative max-w-7xl mx-auto px-4 py-8 z-10 min-h-[calc(100vh-140px)]">
        {children}
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-[#F4EBE3] bg-white/20 backdrop-blur-xs relative z-10">
        <p>© {new Date().getFullYear()} Vybe Treasure Hunt QR Dashboard. Built with Next.js 14 and Supabase.</p>
      </footer>
    </div>
  );
}
