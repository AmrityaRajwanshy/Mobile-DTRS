'use client';

import React, { useState } from 'react';
import {
  Train,
  Radio,
  Clock,
  ArrowRight,
  Zap,
  Compass,
  Landmark,
  ShieldCheck,
  Search,
  CheckCircle2,
  Navigation,
  Activity,
  Layers,
  Sparkles,
  MapPin,
  Gauge,
} from 'lucide-react';
import { TrainInfo, PredictionResult, RailRadarMatchResponse } from '@/types';

interface HomePageProps {
  onStartTrackAndPredict: (trainNo: string) => void;
  isLoading: boolean;
  selectedTrainNo: string;
  trainInfo: TrainInfo | null;
  predictionResult: PredictionResult | null;
  railRadarData: RailRadarMatchResponse | null;
  onNavigateTab: (tab: 'home' | 'engine' | 'railradar' | 'corridors' | 'borders') => void;
  onOpenStep: (step: 1 | 2 | 3 | 4) => void;
}

const FEATURED_TRAINS = [
  { no: '12001', name: 'NDLS Shatabdi Exp', tier: 'T1', route: 'NDLS ↔ BPL' },
  { no: '12919', name: 'Malwa Superfast', tier: 'T2', route: 'DADN ↔ SVDK' },
  { no: '12952', name: 'Tejas Rajdhani Exp', tier: 'T1', route: 'NDLS ↔ MMCT' },
  { no: '22348', name: 'Vande Bharat Express', tier: 'T1', route: 'PNBE ↔ HWH' },
  { no: '02024', name: 'PNBE-HWH Special', tier: 'T2', route: 'PNBE ↔ HWH' },
];

export const HomePage: React.FC<HomePageProps> = ({
  onStartTrackAndPredict,
  isLoading,
  selectedTrainNo,
  trainInfo,
  predictionResult,
  railRadarData,
  onNavigateTab,
  onOpenStep,
}) => {
  const [trainQuery, setTrainQuery] = useState<string>(selectedTrainNo || '12001');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trainQuery.trim()) {
      onStartTrackAndPredict(trainQuery.trim());
    }
  };

  const handlePickTrain = (no: string) => {
    setTrainQuery(no);
    onStartTrackAndPredict(no);
  };

  const isLive = Boolean(railRadarData?.railradar_raw?.isLive);

  return (
    <div className="space-y-3.5 pb-4">
      {/* 1. DTRS Hero Banner */}
      <div className="bg-gradient-to-br from-irctc-blue via-indigo-900 to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        {/* Subtle background train tracks effect */}
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <Train className="w-48 h-48 text-white" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-irctc-orange text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              CRIS DYNAMIC REGULATION
            </span>
            <span className="text-[10px] text-blue-200 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Live Timetable Integrated
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
            DTRS SYSTEM
          </h1>
          <p className="text-xs text-blue-100/90 font-medium mt-1 leading-relaxed max-w-sm">
            Dynamic Train Rescheduling &amp; Compound Delay Engine. Track real-time GPS telemetry, auto-freeze ground truth, and calculate high-precision 5-Stage ETA schedules.
          </p>

          {/* 3-Step Flow Pipeline Pills */}
          <div className="mt-3 pt-3 border-t border-white/15 grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <span className="text-[9px] uppercase font-bold text-amber-300 block">Step 1</span>
              <span className="text-[11px] font-black block mt-0.5">Track Train</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <span className="text-[9px] uppercase font-bold text-emerald-300 block">Step 2</span>
              <span className="text-[11px] font-black block mt-0.5">Live Location</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <span className="text-[9px] uppercase font-bold text-sky-300 block">Step 3</span>
              <span className="text-[11px] font-black block mt-0.5">Estimated ETA</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Action: Track Train -> Auto Fetch Live Location -> Show Estimated ETA Schedule */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-irctc-orange flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 leading-tight">
                Live Train Tracking &amp; ETA Engine
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                Auto-fetches ground truth GPS &amp; computes schedule
              </p>
            </div>
          </div>
          <span className="text-[9px] font-mono font-black bg-blue-50 text-irctc-blue px-2 py-0.5 rounded-full border border-blue-200">
            DTRS FLOW
          </span>
        </div>

        {/* Train Search Input Form */}
        <form onSubmit={handleTrackSubmit} className="space-y-2.5">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={trainQuery}
              onChange={(e) => setTrainQuery(e.target.value)}
              placeholder="Enter Train Number (e.g. 12001, 12919, 12952)..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-irctc-blue focus:bg-white rounded-2xl py-3 pl-10 pr-24 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-irctc-blue/15 transition-all shadow-inner"
            />
            <span className="absolute right-3 text-[10px] font-mono text-slate-400 font-bold uppercase">
              5 Digits
            </span>
          </div>

          {/* Big CTA: Track Train -> Auto Fetch Live Location -> Estimated ETA */}
          <button
            type="submit"
            disabled={isLoading || !trainQuery.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-irctc-orange via-orange-500 to-amber-500 hover:from-irctc-orange-dark hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Radio className={`w-4 h-4 text-amber-100 ${isLoading ? 'animate-spin' : 'animate-pulse'}`} />
            <span>
              {isLoading
                ? 'FETCHING LIVE LOCATION & ESTIMATING ETA...'
                : 'TRACK TRAIN & AUTO-FETCH LIVE ETA SCHEDULE →'}
            </span>
          </button>
        </form>

        {/* Quick Featured Train Chips */}
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Quick Featured Trains:
          </span>
          <div className="no-scrollbar overflow-x-auto flex gap-1.5 pb-1">
            {FEATURED_TRAINS.map((t) => (
              <button
                key={t.no}
                type="button"
                onClick={() => handlePickTrain(t.no)}
                className={`shrink-0 text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all border active:scale-95 flex items-center gap-1 cursor-pointer ${
                  selectedTrainNo === t.no
                    ? 'bg-irctc-blue text-white border-irctc-blue shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span className="font-mono">{t.no}</span>
                <span className="font-normal text-[11px] opacity-90 truncate max-w-[100px]">
                  {t.name.split(' ')[0]}
                </span>
                <span className="text-[9px] font-black px-1 rounded bg-slate-200 text-slate-700">
                  {t.tier}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Active Train Live Card (If train already selected/tracked) */}
      {trainInfo && (
        <div className="bg-gradient-to-br from-emerald-50/90 via-slate-50 to-blue-50/70 border border-emerald-200 rounded-3xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200/70">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-black uppercase text-emerald-900 tracking-wide">
                ACTIVE REGULATED TRAIN
              </span>
            </div>
            {isLive ? (
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                Live GPS Connected
              </span>
            ) : (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Working Timetable Sync
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-irctc-blue text-white">
                  {trainInfo.train_no}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {trainInfo.train_tier}
                </span>
                <span className="text-[10px] font-bold text-irctc-orange bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                  {trainInfo.relevant_corridor_slug}
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                {trainInfo.train_name}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {trainInfo.source_station} → {trainInfo.destination_station} &bull; {trainInfo.total_distance_km.toFixed(0)} km &bull; {trainInfo.total_halts} Halts
              </p>
            </div>

            {predictionResult && (
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Predicted ETA</span>
                <span className="text-base font-mono font-black text-irctc-blue">
                  {predictionResult.math_resolution.Predicted_ETA}
                </span>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded block mt-0.5 ${
                    predictionResult.math_resolution.Arrival_Status === 'LATE'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {predictionResult.math_resolution.Arrival_Status === 'LATE' ? 'LATE' : 'ON TIME'}
                </span>
              </div>
            )}
          </div>

          {/* Live GPS Telemetry Status Strip */}
          {railRadarData?.railradar_raw && (
            <div className="bg-white/80 rounded-2xl p-2.5 border border-emerald-200/80 text-[11px] space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1 font-bold text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-irctc-orange" />
                  Live Location:
                </span>
                <span className="font-extrabold text-slate-900 truncate max-w-[200px]">
                  {railRadarData.railradar_raw.currentLocation?.stationName || railRadarData.railradar_raw.currentLocation?.stationCode || railRadarData.railradar_raw.status || 'Active On Section'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1 font-bold text-slate-500">
                  <Gauge className="w-3.5 h-3.5 text-sky-600" />
                  Live Speed &amp; Delay:
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {typeof railRadarData.railradar_raw.currentLocation?.speedKmh === 'number'
                    ? `${railRadarData.railradar_raw.currentLocation.speedKmh} km/h`
                    : 'Running Speed'} &bull;{' '}
                  <span className={(railRadarData.railradar_raw.delayMinutes || 0) > 0 ? 'text-rose-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>
                    {(railRadarData.railradar_raw.delayMinutes || 0) > 0 ? `+${railRadarData.railradar_raw.delayMinutes}m delay` : 'Right Time'}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Quick Actions to Open 1st Page (Engine) or Step 4 Schedule */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onNavigateTab('engine');
                onOpenStep(1);
              }}
              className="py-2.5 px-3 rounded-xl bg-irctc-blue hover:bg-irctc-blue-dark text-white font-bold text-[11.5px] flex items-center justify-center gap-1 shadow-xs active:scale-98 transition-all cursor-pointer"
            >
              <span>Open 1st Page</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigateTab('engine');
                onOpenStep(4);
              }}
              className="py-2.5 px-3 rounded-xl bg-irctc-orange hover:bg-irctc-orange-dark text-white font-bold text-[11.5px] flex items-center justify-center gap-1 shadow-xs active:scale-98 transition-all cursor-pointer"
            >
              <span>ETA Schedule</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 4. DTRS System Core Module Tiles */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block pl-1">
          DTRS System Modules:
        </span>

        <div className="grid grid-cols-2 gap-2">
          {/* Tile 1: Delay Engine */}
          <button
            type="button"
            onClick={() => onNavigateTab('engine')}
            className="p-3 bg-white rounded-2xl border border-slate-200 text-left hover:border-irctc-blue transition-all active:scale-98 shadow-2xs group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-irctc-blue flex items-center justify-center mb-2 group-hover:bg-irctc-blue group-hover:text-white transition-colors">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-tight">
              Delay Engine
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
              4-Step wizard with 10 cascade conditions
            </p>
          </button>

          {/* Tile 2: Live Radar */}
          <button
            type="button"
            onClick={() => onNavigateTab('railradar')}
            className="p-3 bg-white rounded-2xl border border-slate-200 text-left hover:border-irctc-orange transition-all active:scale-98 shadow-2xs group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-irctc-orange flex items-center justify-center mb-2 group-hover:bg-irctc-orange group-hover:text-white transition-colors">
              <Radio className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-tight">
              Live GPS Radar
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
              Ground truth telemetry &amp; live GPS lock
            </p>
          </button>

          {/* Tile 3: Corridors */}
          <button
            type="button"
            onClick={() => onNavigateTab('corridors')}
            className="p-3 bg-white rounded-2xl border border-slate-200 text-left hover:border-emerald-600 transition-all active:scale-98 shadow-2xs group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Compass className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-tight">
              National Corridors
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
              7 Golden Quad arterial trunk routes
            </p>
          </button>

          {/* Tile 4: Borders (Commented Out) */}
          {/* <button
            type="button"
            onClick={() => onNavigateTab('borders')}
            className="p-3 bg-white rounded-2xl border border-slate-200 text-left hover:border-purple-600 transition-all active:scale-98 shadow-2xs group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2 group-hover:bg-purple-700 group-hover:text-white transition-colors">
              <Landmark className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-tight">
              State Borders
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
              29 State territorial border catalog
            </p>
          </button> */}
        </div>
      </div>
    </div>
  );
};
