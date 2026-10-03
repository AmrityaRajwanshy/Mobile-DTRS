'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Train,
  Database,
  RefreshCw,
  Zap,
  RotateCcw,
  Wifi,
  Signal,
  Battery,
  ShieldCheck,
  X,
  Sliders,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { DbSimulationStatus, TrainInfo } from '@/types';

export type NavTabType = 'home' | 'engine' | 'railradar' | 'amenities' | 'borders' | 'corridors';

interface HeaderProps {
  onComputeClick: () => void;
  dbStatus: DbSimulationStatus | null;
  onRefreshDbStatus: () => void;
  activeTab?: NavTabType;
  onSelectTab?: (tab: NavTabType) => void;
  trainInfo?: TrainInfo | null;
  selectedTrainNo?: string;
  onSearchSelect?: (trainNo: string) => void;
  onResetDb?: () => void;
  isResetting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onComputeClick,
  dbStatus,
  onRefreshDbStatus,
  activeTab = 'home',
  onSelectTab,
  trainInfo,
  selectedTrainNo,
  onSearchSelect,
  onResetDb,
  isResetting = false,
}) => {
  const [mobileTime, setMobileTime] = useState<string>('');
  const [fullIstTime, setFullIstTime] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showStatusSheet) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowStatusSheet(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showStatusSheet]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      };
      const fullOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: 'short',
      };
      setMobileTime(new Intl.DateTimeFormat('en-IN', options).format(now));
      setFullIstTime(new Intl.DateTimeFormat('en-IN', fullOptions).format(now) + ' IST');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefreshDbStatus();
    setTimeout(() => setIsRefreshing(false), 700);
  };

  return (
    <header className="w-full sticky top-0 z-30 bg-slate-900 text-white shadow-md">
      {/* 1. iOS / Android Native Mobile Status Bar */}
      <div className="pt-safe px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-300 border-b border-slate-800/80 select-none">
        {/* Left: Clock */}
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-white text-xs tracking-tight">{mobileTime || '23:30'}</span>
          <span className="text-[9px] text-slate-400 font-normal">IST</span>
        </div>

        {/* Center: Dynamic Island cutout pill on mobile */}
        <div className="w-16 h-3 bg-black rounded-full border border-slate-700/60 shadow-inner flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
          <span className="text-[7px] text-slate-400 font-sans tracking-widest uppercase">DTRS</span>
        </div>

        {/* Right: Phone hardware icons */}
        <div className="flex items-center gap-2 text-slate-300">
          <Signal className="w-3 h-3 text-slate-200" />
          <Wifi className="w-3 h-3 text-slate-200" />
          <div className="flex items-center gap-0.5">
            <span className="text-[9px] font-sans font-bold">98%</span>
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* 2. Official Mobile App Bar */}
      <div className="bg-irctc-blue px-3.5 py-2.5 flex items-center justify-between border-b border-irctc-blue-dark shadow-sm">
        {/* Brand Section (Tappable to go to Home) */}
        <button
          type="button"
          onClick={() => onSelectTab && onSelectTab('home')}
          className="flex items-center gap-2.5 text-left cursor-pointer active:scale-98 transition-transform"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm border border-irctc-orange shrink-0">
            <div className="w-full h-full rounded-full bg-irctc-blue flex flex-col items-center justify-center text-white">
              <Train className="w-3.5 h-3.5 text-irctc-orange" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-white leading-tight">
                DTRS SYSTEM
              </span>
              <span className="bg-irctc-orange text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                REGULATION
              </span>
            </div>
            <p className="text-[9.5px] text-blue-200/90 font-medium leading-none">
              Dynamic Train Rescheduling
            </p>
          </div>
        </button>

        {/* Quick Actions (Right) */}
        <div className="flex items-center gap-1.5">
          {/* DB Status Button (Opens Sheet) */}
          <button
            type="button"
            onClick={() => setShowStatusSheet(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-extrabold border transition-all cursor-pointer ${
              dbStatus?.is_pristine
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/60'
                : 'bg-amber-950/40 text-amber-300 border-amber-500/50 hover:bg-amber-900/60'
            }`}
            title="View Database Status"
          >
            <Database className="w-3 h-3 text-emerald-400" />
            <span>{dbStatus?.is_pristine ? 'BASELINE' : `SIM (${dbStatus?.modifications_count || 0})`}</span>
          </button>

          {/* Quick Compute Button */}
          <button
            type="button"
            onClick={onComputeClick}
            className="flex items-center gap-1 rounded-full bg-irctc-orange hover:bg-irctc-orange-dark text-white font-extrabold text-xs px-3 py-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
            <span>ETA</span>
          </button>
        </div>
      </div>

      {/* 3. Mobile Active Train Context Sub-Bar */}
      {trainInfo && (
        <div className="bg-slate-800/95 px-3 py-1.5 border-b border-slate-700/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-irctc-blue text-white shrink-0 border border-blue-400/40">
              {trainInfo.train_no}
            </span>
            <div className="truncate text-slate-200 font-bold text-[11px]">
              {trainInfo.train_name}
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono shrink-0 ml-2">
            <span>{trainInfo.source_station}</span>
            <ArrowRight className="w-3 h-3 text-irctc-orange" />
            <span>{trainInfo.destination_station}</span>
          </div>
        </div>
      )}

      {/* 4. Bottom Sheet Modal: Database Simulation & Sync Status (Portaled to document.body to prevent nav clipping) */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showStatusSheet && (
            <div
              className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 select-none"
              onClick={() => setShowStatusSheet(false)}
            >
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 pb-6 sm:pb-5 shadow-2xl border border-slate-200 text-slate-900 select-text"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-irctc-blue" />
                    <h3 className="text-base font-extrabold text-irctc-blue">
                      CRIS Database Sandbox Status
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowStatusSheet(false)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500 font-medium">Database State:</span>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          dbStatus?.is_pristine
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {dbStatus?.is_pristine
                          ? 'ACTIVE BASELINE (Pristine)'
                          : `SIMULATION ACTIVE (${dbStatus?.modifications_count || 0} MODS)`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      {dbStatus?.is_pristine
                        ? 'Connected directly to pristine working timetable baseline (WIN.db).'
                        : 'Running in isolated what-if simulation sandbox (WIN_SIMULATION.db).'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        IST Clock
                      </span>
                      <span className="font-mono font-bold text-slate-800 text-[11px]">
                        {fullIstTime || 'Syncing...'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Sync Status
                      </span>
                      <span className="font-bold text-emerald-700 text-[11px] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Live Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleRefreshClick}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh DB</span>
                  </button>

                  {onResetDb && (
                    <button
                      type="button"
                      onClick={() => {
                        onResetDb();
                        setShowStatusSheet(false);
                      }}
                      disabled={isResetting}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                      <span>Restore Baseline</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
};
