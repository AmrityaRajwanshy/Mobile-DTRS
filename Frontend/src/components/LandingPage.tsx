'use client';

import React, { useState } from 'react';
import {
  Train,
  Radio,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  Lock,
  Sparkles,
  MapPin,
  Gauge,
  Sliders,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { TrainInfo, PredictionResult, RailRadarMatchResponse, OperationalCases } from '@/types';
import { DelayReasonsCard } from './DelayReasonsCard';

interface LandingPageProps {
  onStartTrackAndPredict: (trainNo: string) => void;
  isLoading: boolean;
  selectedTrainNo: string;
  trainInfo: TrainInfo | null;
  predictionResult: PredictionResult | null;
  railRadarData: RailRadarMatchResponse | null;
  cases: OperationalCases;
  isLocked: boolean;
  onUnlockConditions: () => void;
  onNavigateTab: (tab: 'home' | 'engine' | 'railradar' | 'amenities' | 'borders' | 'corridors') => void;
  onOpenStep: (step: 1 | 2 | 3 | 4) => void;
}

const FEATURED_TRAINS = [
  { no: '12001', name: 'NDLS Shatabdi Exp', tier: 'T1', route: 'NDLS ↔ BPL' },
  { no: '12919', name: 'Malwa Superfast', tier: 'T2', route: 'DADN ↔ SVDK' },
  { no: '12952', name: 'Tejas Rajdhani Exp', tier: 'T1', route: 'NDLS ↔ MMCT' },
  { no: '22348', name: 'Vande Bharat Express', tier: 'T1', route: 'PNBE ↔ HWH' },
  { no: '02024', name: 'PNBE-HWH Special', tier: 'T2', route: 'PNBE ↔ HWH' },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartTrackAndPredict,
  isLoading,
  selectedTrainNo,
  trainInfo,
  predictionResult,
  railRadarData,
  cases,
  isLocked,
  onUnlockConditions,
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
    <div className="space-y-4 pb-6">
      {/* 1. Official DTRS Landing Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-irctc-blue to-indigo-950 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden border border-white/10">
        {/* Ambient background decoration */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Train className="w-56 h-56 text-white" />
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-irctc-orange/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="bg-irctc-orange text-white text-[9.5px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              CRIS DYNAMIC REGULATION
            </span>
            <span className="text-[10.5px] text-blue-200 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Real-Time Telemetry &bull; Timetable Baseline Sync
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            DTRS
          </h1>
          <p className="text-xs sm:text-sm font-bold text-amber-300 mt-0.5">
            Dynamic Train Rescheduling System
          </p>
          <p className="text-xs text-blue-100/90 font-medium mt-1.5 leading-relaxed max-w-md">
            Automated live location tracking, locked baseline regulation conditions, and 5-stage compound delay mitigation for Indian Railways.
          </p>

          {/* Interactive Workflow Diagram Banner */}
          <div className="mt-4 pt-3.5 border-t border-white/15">
            <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-300 block mb-2">
              System Workflow Pipeline:
            </span>
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
                <span className="text-[9px] uppercase font-bold text-amber-300 block">Step 1</span>
                <span className="text-xs font-black block mt-0.5">Enter Train #</span>
                <span className="text-[9.5px] text-blue-200 block">5-digit IR lookup</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
                <span className="text-[9px] uppercase font-bold text-emerald-300 block">Step 2</span>
                <span className="text-xs font-black block mt-0.5">Auto-Fetch GPS</span>
                <span className="text-[9.5px] text-blue-200 block">Current station &amp; speed</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
                <span className="text-[9px] uppercase font-bold text-sky-300 block">Step 3</span>
                <span className="text-xs font-black block mt-0.5">Identification of Delay Factors</span>
                <span className="text-[9.5px] text-blue-200 block">Weather,Speed and Restriction</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
                <span className="text-[9px] uppercase font-bold text-rose-300 block">Step 4</span>
                <span className="text-xs font-black block mt-0.5">Estimated ETA</span>
                <span className="text-[9.5px] text-blue-200 block">Root causes &amp; Final ETA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Train Input: Enter Train Number & Auto-Calculate */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-irctc-orange flex items-center justify-center font-black">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 leading-tight">
                Live Train Lookup &amp; Regulation Analysis
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                Auto-fetches current station, locks baseline conditions &amp; projects ETA
              </p>
            </div>
          </div>
          <span className="text-[9.5px] font-mono font-black bg-blue-50 text-irctc-blue px-2.5 py-0.5 rounded-full border border-blue-200">
            DTRS ENGINE
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleTrackSubmit} className="space-y-3">
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

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading || !trainQuery.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-irctc-orange via-orange-500 to-amber-500 hover:from-irctc-orange-dark hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Radio className={`w-4 h-4 text-amber-100 ${isLoading ? 'animate-spin' : 'animate-pulse'}`} />
            <span>
              {isLoading
                ? 'FETCHING LIVE LOCATION & CALCULATING ETA...'
                : 'TRACK TRAIN & SHOW ESTIMATED ETA →'}
            </span>
          </button>
        </form>

        {/* Quick Featured Train Chips */}
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Quick Featured Indian Railways Trains:
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

      {/* 3. Output Stage: Current Location, Estimated ETA, and Locked Conditions */}
      {trainInfo && (
        <div className="space-y-3.5">
          {/* Active Train Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-3.5 sm:p-5 shadow-lg border border-slate-800 space-y-3 w-full min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="text-[11px] sm:text-xs font-black uppercase text-emerald-300 tracking-wide">
                  CURRENT TRAIN TELEMETRY
                </span>
              </div>
              <span className="text-[9px] sm:text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15 shrink-0">
                Working Timetable Sync
              </span>
            </div>

            {/* Train Info & Predicted ETA */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-irctc-orange text-white shadow-2xs shrink-0">
                  {trainInfo.train_no}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white/15 text-white shrink-0">
                  {trainInfo.train_tier?.replace(/_/g, ' ')}
                </span>
                {trainInfo.relevant_corridor_slug && (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30 shrink-0">
                    {trainInfo.relevant_corridor_slug.replace(/_/g, ' ')}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                  {trainInfo.train_name}
                </h3>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  <span className="font-semibold text-slate-200">{trainInfo.source_station}</span> →{' '}
                  <span className="font-semibold text-slate-200">{trainInfo.destination_station}</span>
                  <span className="text-slate-500 mx-1.5">&bull;</span>
                  <span>{trainInfo.total_distance_km.toFixed(0)} km</span>
                  <span className="text-slate-500 mx-1.5">&bull;</span>
                  <span>{trainInfo.total_halts} Halts</span>
                </p>
              </div>

              {/* Full-Width Predicted ETA Highlight Banner */}
              {predictionResult && (
                <div className="bg-white/10 rounded-2xl p-2.5 sm:p-3 border border-white/15 flex items-center justify-between gap-2 shadow-inner">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase font-bold text-amber-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-300 shrink-0" />
                      Predicted ETA
                    </span>
                    <span className="text-sm sm:text-base font-mono font-black text-white tracking-tight block mt-0.5 truncate">
                      {predictionResult.math_resolution.Predicted_ETA}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md inline-block uppercase tracking-wider shadow-sm ${
                        predictionResult.math_resolution.Arrival_Status === 'LATE'
                          ? 'bg-rose-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {predictionResult.math_resolution.Arrival_Status === 'LATE' ? 'MODERATE DELAY' : 'ON TIME'}
                    </span>
                    <span className="text-[9px] font-mono text-blue-200/80 block mt-0.5">
                      Net Delay: ~+{Math.round(predictionResult.math_resolution.NetDelay || 0)}m
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Current Location Fetched Banner */}
            {railRadarData?.railradar_raw && (
              <div className="bg-white/10 rounded-2xl p-2.5 sm:p-3 border border-white/15 text-xs space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="flex items-center gap-1 font-bold text-slate-300 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-irctc-orange shrink-0" />
                    Auto-Fetched Current Location:
                  </span>
                  <span className="font-extrabold text-white text-xs">
                    {railRadarData.railradar_raw.currentLocation?.stationName || railRadarData.railradar_raw.currentLocation?.stationCode || railRadarData.railradar_raw.status || 'Active On Route'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1 pt-1.5 border-t border-white/10">
                  <span className="flex items-center gap-1 font-bold text-slate-300 text-[11px]">
                    <Gauge className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    Speed &amp; Section Status:
                  </span>
                  <span className="font-mono font-bold text-white text-xs">
                    {typeof railRadarData.railradar_raw.currentLocation?.speedKmh === 'number'
                      ? `${railRadarData.railradar_raw.currentLocation.speedKmh} km/h`
                      : 'Running Speed'}{' '}
                    <span className="text-slate-400 mx-1">&bull;</span>{' '}
                    <span className="text-amber-300 font-extrabold">
                      {(railRadarData.railradar_raw.delayMinutes || 0) > 0 ? `+${railRadarData.railradar_raw.delayMinutes}m delay` : 'Right Time'}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Locked Conditions Chips Banner */}
            <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10 text-xs space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="text-[9.5px] uppercase font-bold text-amber-300 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-300 shrink-0" />
                  Locked Moderate Delay Profile
                </span>
                <span className="text-[8.5px] font-mono text-slate-400 font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/10 shrink-0">
                  CRIS REGULATION
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/10">
                  Weather: {cases.weather?.replace(/_/g, ' ') || 'Fog'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/10">
                  TSR: {cases.tsr_level?.replace(/_/g, ' ') || 'Minor'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/10">
                  Block: Preceding Delayed
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/10">
                  Crossing: Minor Hold
                </span>
              </div>
            </div>

            {/* Dual Actions: Open Engine or Schedule */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onNavigateTab('engine');
                  onOpenStep(1);
                }}
                className="py-2.5 px-2 sm:px-3 rounded-xl bg-irctc-blue hover:bg-irctc-blue-dark text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow-sm active:scale-98 transition-all cursor-pointer text-center leading-tight"
              >
                <span>Open 1st Page (Engine)</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigateTab('engine');
                  onOpenStep(4);
                }}
                className="py-2.5 px-2 sm:px-3 rounded-xl bg-irctc-orange hover:bg-irctc-orange-dark text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow-sm active:scale-98 transition-all cursor-pointer text-center leading-tight"
              >
                <span>Complete ETA Schedule</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>

          {/* 4. Dedicated Reasons for Delay Card */}
          <DelayReasonsCard
            predictionResult={predictionResult}
            cases={cases}
            isLocked={isLocked}
            sectionDelayMins={15}
            onUnlock={() => {
              onNavigateTab('engine');
              onOpenStep(2);
            }}
            onViewAmenities={() => onNavigateTab('amenities')}
          />
        </div>
      )}
    </div>
  );
};
