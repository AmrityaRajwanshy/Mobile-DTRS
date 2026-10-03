'use client';

import React, { useState } from 'react';
import {
  Clock,
  TrendingUp,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  Gauge,
  FileText,
  Database,
  AlertTriangle,
  MapPin,
  Zap,
  FastForward,
  GitBranch,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PredictionResult } from '@/types';

interface ResultsDashboardProps {
  result: PredictionResult | null;
  isLoading: boolean;
}

const toFixedVal = (val: any, decimals = 1): string => {
  const num = typeof val === 'number' ? val : parseFloat(String(val || 0));
  return isNaN(num) ? '0.0' : num.toFixed(decimals);
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  isLoading,
}) => {
  const [showAllStations, setShowAllStations] = useState<boolean>(false);

  if (!result && isLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-irctc-blue border-t-irctc-orange rounded-full animate-spin mb-3" />
        <h3 className="text-sm font-extrabold text-irctc-blue">
          Evaluating 5-Stage Delay Derivation...
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Evaluating timetable slack, safe headway, and single-track conflicts.
        </p>
      </div>
    );
  }

  if (!result) return null;

  const isLate = result.math_resolution.Arrival_Status === 'LATE';
  const seg = result.segment_breakdown;
  const netDelayMins = Number(result.math_resolution?.NetDelay) || 0;

  return (
    <div className={`space-y-3.5 transition-opacity duration-200 ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
      {/* 1. Mobile Boarding Pass / Result Header Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs relative overflow-hidden">
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-irctc-blue via-irctc-orange to-irctc-blue animate-pulse" />
        )}

        {/* Top Badges & Status */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md bg-irctc-blue text-white">
              {result.train_no}
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {result.train_tier}
            </span>
            <span className="text-[10px] font-bold text-irctc-orange bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
              {result.relevant_corridor_slug}
            </span>
          </div>

          <div
            className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wide flex items-center gap-1.5 shrink-0 ${
              isLate
                ? 'bg-rose-50 text-rose-700 border border-rose-300'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLate ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'}`} />
            <span>{isLate ? 'LATE ARRIVAL' : 'ON TIME'}</span>
          </div>
        </div>

        {/* Train Name */}
        <h2 className="text-base font-black text-slate-900 leading-tight mb-2">
          {result.train_name}
        </h2>

        {/* Hero ETA Card */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-md mb-3">
          <div className="flex items-center justify-between text-blue-200 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider">Predicted Destination ETA</span>
            <span className="text-[11px] font-mono">
              Sched: {result.math_resolution.ScheduledDestinationArrival}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-mono font-black tracking-tight text-white">
              {result.math_resolution.Predicted_ETA} <span className="text-xs font-sans font-bold text-amber-300">IST</span>
            </div>
            <div className="text-right">
              <span className={`text-sm font-mono font-black ${isLate ? 'text-rose-400' : 'text-emerald-400'}`}>
                {netDelayMins > 0 ? `+${toFixedVal(netDelayMins)}m` : '±0.0m'}
              </span>
              <span className="text-[10px] text-slate-300 block font-sans">Net Delay</span>
            </div>
          </div>
        </div>

        {/* Route Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 block">From</span>
            <span className="font-extrabold text-slate-800 truncate block">{result.source_station}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 block">To</span>
            <span className="font-extrabold text-slate-800 truncate block">{result.destination_station}</span>
          </div>
        </div>

        {/* Hop Callout if present */}
        {seg && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-black text-irctc-blue text-[11px]">
                HOP: {seg.treta_segment_number}
              </span>
              <span className={`text-[9.5px] font-black px-1.5 py-0.2 rounded ${seg.is_border_crossing ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900'}`}>
                {seg.is_border_crossing ? 'Border Crossing' : 'Intra-State'}
              </span>
            </div>
            <div className="font-bold text-sky-950 text-[11px] truncate">
              {seg.from_station} → {seg.to_station} ({seg.segment_distance_km} km)
            </div>
          </div>
        )}
      </div>

      {/* 2. Mobile KPI Cards (2 Columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* Primary Delay */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
            Primary Delay (PD)
          </span>
          <span className="text-lg font-mono font-black text-rose-600">
            +{toFixedVal(result.primary_breakdown?.PrimaryDelay)}m
          </span>
          <span className="text-[9.5px] text-slate-400 block mt-0.5">
            {result.d_inherited_cascade && result.d_inherited_cascade > 0 ? 'Inherited + Physical' : 'Physical Shocks'}
          </span>
        </div>

        {/* Cascade Shocks */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
            Cascade Shocks (CD)
          </span>
          <span className="text-lg font-mono font-black text-amber-600">
            +{toFixedVal(result.cascade_breakdown?.CascadeDelay)}m
          </span>
          <span className="text-[9.5px] text-slate-400 block mt-0.5">Headway &amp; Line Hold</span>
        </div>

        {/* Gross Delay */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
            Gross Shock (GD)
          </span>
          <span className="text-lg font-mono font-black text-slate-800">
            {toFixedVal(result.math_resolution?.grossDelay)}m
          </span>
          <span className="text-[9.5px] text-slate-400 block mt-0.5">PD + CD Total</span>
        </div>

        {/* Speed Cover-up */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5 flex items-center justify-center gap-1">
            <FastForward className="w-3 h-3 text-emerald-600" />
            <span>MPS Cover-up</span>
          </span>
          <span className="text-lg font-mono font-black text-emerald-700">
            {(result.math_resolution?.speedup_recovered_mins ?? 0) > 0
              ? `-${toFixedVal(result.math_resolution?.speedup_recovered_mins)}m`
              : '0.0m'}
          </span>
          <span className="text-[9.5px] text-emerald-600 block mt-0.5">Clear Track Recovery</span>
        </div>

        {/* Buffer Slack Absorbed */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-0.5">
            Slack Buffer (MEA)
          </span>
          <span className="text-lg font-mono font-black text-emerald-700">
            -{toFixedVal(result.math_resolution?.Absorbed_by_EA)}m
          </span>
          <span className="text-[9.5px] text-emerald-600/80 block mt-0.5">Absorbed from Slack</span>
        </div>

        {/* Final Net Delay */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
            Net Delay (ND)
          </span>
          <span className={`text-lg font-mono font-black ${netDelayMins > 5.0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {toFixedVal(netDelayMins)}m
          </span>
          <span className="text-[9.5px] text-slate-400 block mt-0.5">Destination Shock</span>
        </div>
      </div>

      {/* 3. Mobile 5-Stage Mathematical Derivation Cards */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <FileText className="w-4 h-4 text-irctc-blue" />
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
            5-Stage Mathematical Derivation Flow
          </h3>
        </div>

        <div className="space-y-2">
          {/* Stage 1 Card */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-xs px-1.5 py-0.5 rounded bg-irctc-blue text-white">
                  Stage 1
                </span>
                <span className="font-extrabold text-xs text-slate-900">Primary Shock (PD)</span>
              </div>
              <span className="font-mono font-black text-xs text-rose-600">
                +{toFixedVal(result.primary_breakdown?.PrimaryDelay)} mins
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              PD = D_inh + DW + DTS + DCP + DE
            </div>
            <div className="text-[11px] text-slate-600 leading-snug">
              {result.d_inherited_cascade && result.d_inherited_cascade > 0 && (
                <span className="inline-block bg-amber-100 text-amber-950 font-bold px-1.5 py-0.2 rounded text-[10px] mr-1">
                  Inherited: +{toFixedVal(result.d_inherited_cascade)}m
                </span>
              )}
              Weather: +{toFixedVal(result.primary_breakdown.d_weather)}m &bull; TSR: +{toFixedVal(result.primary_breakdown.d_tsr)}m &bull; ACP: +{toFixedVal(result.primary_breakdown.d_chain_pulling)}m &bull; Engine: +{toFixedVal(result.primary_breakdown.d_engine_failure)}m
            </div>
          </div>

          {/* Stage 2 Card */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-xs px-1.5 py-0.5 rounded bg-irctc-blue text-white">
                  Stage 2
                </span>
                <span className="font-extrabold text-xs text-slate-900">Cascading Shocks (CD)</span>
              </div>
              <span className="font-mono font-black text-xs text-amber-600">
                +{toFixedVal(result.cascade_breakdown?.CascadeDelay)} mins
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              CD = DH + DCR + DPL + DCW
            </div>
            <div className="text-[11px] text-slate-600 leading-snug">
              Headway: +{toFixedVal(result.cascade_breakdown.d_headway)}m &bull; Crossing: +{toFixedVal(result.cascade_breakdown.d_crossing)}m &bull; Platform: +{toFixedVal(result.cascade_breakdown.d_platform_hold)}m &bull; Crew: +{toFixedVal(result.cascade_breakdown.d_crew)}m
            </div>
          </div>

          {/* Stage 3 Card */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-xs px-1.5 py-0.5 rounded bg-irctc-blue text-white">
                  Stage 3
                </span>
                <span className="font-extrabold text-xs text-slate-900">Gross Disturbance (GD)</span>
              </div>
              <span className="font-mono font-black text-xs text-slate-900">
                {toFixedVal(result.math_resolution?.grossDelay)} mins
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              GD = PD + CD (Combined Physical &amp; Cascade Shocks)
            </div>
          </div>

          {/* Stage 4 Card */}
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-xs px-1.5 py-0.5 rounded bg-emerald-700 text-white">
                  Stage 4
                </span>
                <span className="font-extrabold text-xs text-emerald-950">Buffer Absorbed (MEA)</span>
              </div>
              <span className="font-mono font-black text-xs text-emerald-700">
                -{toFixedVal(result.math_resolution?.Absorbed_by_EA)} mins
              </span>
            </div>
            <div className="text-[10px] font-mono text-emerald-700">
              MEA = min(GD &times; RR, 0.20 &times; EA) &bull; Working Slack: {toFixedVal(result.EA_allotted_mins)}m
            </div>
          </div>

          {/* Stage 5 Card */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-xs px-1.5 py-0.5 rounded bg-irctc-blue text-white">
                  Stage 5
                </span>
                <span className="font-extrabold text-xs text-irctc-blue">Net Delay (ND) &amp; Clock ETA</span>
              </div>
              <span className="font-mono font-black text-xs text-irctc-blue">
                {result.math_resolution.Predicted_ETA} IST
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              ND = max(0, GD - MEA) = {toFixedVal(result.math_resolution?.NetDelay)}m unabsorbed
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mobile Station Stop Progression List */}
      {result.ahead_stations && result.ahead_stations.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-irctc-orange" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                Station Arrival ETAs &amp; Slack Spread
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-bold">
              {result.ahead_stations.length} Stops
            </span>
          </div>

          {/* Stations List */}
          <div className="space-y-2">
            {(showAllStations ? result.ahead_stations : result.ahead_stations.slice(0, 5)).map((stn, idx) => {
              const isLateStop = stn.status === 'LATE' || (!stn.delay_absorbed && stn.net_delay_mins > 5.0);
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs ${
                    stn.is_origin
                      ? 'bg-amber-50/90 border-amber-300'
                      : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                        {stn.seq}
                      </span>
                      <span className="font-mono font-black text-irctc-blue text-xs">
                        {stn.station_code}
                      </span>
                      <span className="font-bold text-slate-800 text-xs truncate max-w-[150px]">
                        {stn.station_name}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                        isLateStop
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {isLateStop ? `+${stn.net_delay_mins.toFixed(0)}m` : 'ON TIME'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                    <span className="font-mono">Sched: {stn.scheduled_arr}</span>
                    <span className="font-mono font-extrabold text-slate-900">
                      ETA: {stn.predicted_arrival}
                    </span>
                  </div>
                </div>
              );
            })}

            {result.ahead_stations.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllStations((prev) => !prev)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>{showAllStations ? 'Show Fewer Stops ▲' : `View All ${result.ahead_stations.length} Stops ▼`}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. Downstream Cascading Chain Cards */}
      {result.cascaded_delays?.cascading_chain && result.cascaded_delays.cascading_chain.length > 0 && (
        <div className="bg-rose-50/80 border border-rose-300 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-rose-200">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-black text-rose-950 uppercase tracking-wide">
                Cascading Downstream Train Chain
              </h3>
            </div>
            <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
              {result.cascaded_delays.cascading_chain.length} Trains Affected
            </span>
          </div>

          <div className="space-y-2">
            {result.cascaded_delays.cascading_chain.map((node, nIdx) => (
              <div key={nIdx} className="bg-white p-3 rounded-xl border border-rose-200 shadow-2xs text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-irctc-blue">
                    #{node.train_no} &bull; {node.train_name}
                  </span>
                  <span className="font-mono font-black text-rose-600">
                    +{node.delay_mins.toFixed(1)}m
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Conflict: <strong className="text-slate-700">{node.impact}</strong></span>
                  <span className="text-rose-700 font-bold">{node.propagated_eta_impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
