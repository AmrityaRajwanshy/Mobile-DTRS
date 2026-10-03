'use client';

import React from 'react';
import {
  AlertTriangle,
  CloudFog,
  Sliders,
  ShieldCheck,
  Clock,
  Lock,
  GitBranch,
  Gauge,
  Activity,
  CheckCircle2,
  TrendingDown,
  Info,
  Hotel,
  ArrowRight,
} from 'lucide-react';
import { PredictionResult, OperationalCases } from '@/types';

interface DelayReasonsCardProps {
  predictionResult: PredictionResult | null;
  cases: OperationalCases;
  isLocked: boolean;
  sectionDelayMins?: number;
  onUnlock?: () => void;
  onViewAmenities?: () => void;
}

export const DelayReasonsCard: React.FC<DelayReasonsCardProps> = ({
  predictionResult,
  cases,
  isLocked,
  sectionDelayMins = 15,
  onUnlock,
  onViewAmenities,
}) => {
  if (!predictionResult) return null;

  const netDelay = Number(predictionResult.math_resolution?.NetDelay) || 0;
  const grossDelay = Number(predictionResult.math_resolution?.grossDelay) || 0;
  const absorbedEA = Number(predictionResult.math_resolution?.Absorbed_by_EA) || 0;
  const isLate = predictionResult.math_resolution?.Arrival_Status === 'LATE';

  // Construct structured delay reasons based on locked default moderate cases
  const reasonsList = [
    {
      id: 'weather',
      title: 'Atmospheric Visibility (Weather: Fog)',
      impactMinutes: 8.0,
      description: 'Moderate dense fog restriction limits maximum permissible speed to 60 km/h under automatic signaling rules.',
      icon: CloudFog,
      badge: 'Visibility Restriction',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      id: 'block',
      title: 'Block Section Headway Spacing',
      impactMinutes: 6.0,
      description: 'Preceding delayed train in the automated block section enforces safe braking interval and yellow aspect cruising.',
      icon: Activity,
      badge: 'Signal Headway Buffer',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    },
    {
      id: 'tsr',
      title: 'Temporary Speed Restriction (TSR: Minor)',
      impactMinutes: 5.0,
      description: 'Active engineering caution order along the track segment requires controlled speed reduction.',
      icon: Gauge,
      badge: 'Caution Order',
      badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    },
    {
      id: 'crossing',
      title: 'Junction Crossing Conflict (Precedence Hold)',
      impactMinutes: 8.0,
      description: 'Single/double track crossing conflict holding the loop line for route clearance.',
      icon: GitBranch,
      badge: 'Loop Wait',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    },
    {
      id: 'section',
      title: 'Track Section Shock Injection',
      impactMinutes: sectionDelayMins,
      description: `Operational moderate section delay (+${sectionDelayMins}m) auto-factored into the segment runtime.`,
      icon: Sliders,
      badge: 'Operational Shock',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
      {/* Top Title & Lock Indicator */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 leading-tight">
              Reasons for Delay
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              Auto-considered under default moderate delay profile
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Lock className="w-3 h-3 text-amber-600" />
            <span>Default Conditions Locked</span>
          </span>
          {onUnlock && (
            <button
              type="button"
              onClick={onUnlock}
              className="text-[10px] text-irctc-blue hover:underline font-bold"
            >
              Modify
            </button>
          )}
        </div>
      </div>

      {/* Summary Stat Box */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-2xl border border-slate-200/80 text-center">
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Gross Delay Shock</span>
          <span className="text-sm font-mono font-black text-rose-600">
            +{grossDelay > 0 ? grossDelay.toFixed(1) : (27.0).toFixed(1)}m
          </span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Slack Absorbed (EA)</span>
          <span className="text-sm font-mono font-black text-emerald-600">
            -{absorbedEA > 0 ? absorbedEA.toFixed(1) : (6.3).toFixed(1)}m
          </span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Net Estimated Delay</span>
          <span className={`text-sm font-mono font-black ${isLate ? 'text-amber-600' : 'text-emerald-600'}`}>
            +{netDelay > 0 ? netDelay.toFixed(1) : (20.7).toFixed(1)}m
          </span>
        </div>
      </div>

      {/* Itemized Reasons List */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block pl-1">
          Identified Delay Components &amp; Root Causes:
        </span>

        <div className="space-y-2">
          {reasonsList.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.id}
                className="p-3 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200/80 transition-colors flex items-start gap-2.5"
              >
                <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-slate-700 shadow-2xs">
                  <Icon className="w-3.5 h-3.5 text-irctc-blue" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {reason.title}
                    </span>
                    <span className="text-[10.5px] font-mono font-black text-rose-600 shrink-0">
                      +{reason.impactMinutes.toFixed(1)}m
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-snug">
                    {reason.description}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${reason.badgeColor}`}>
                      {reason.badge}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slack Recovery & Mitigation Note */}
      <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-[11px] space-y-1">
        <div className="flex items-center gap-1.5 font-black text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Timetable Slack (EA) Mitigation Action</span>
        </div>
        <p className="text-slate-600 leading-relaxed text-[10.5px]">
          The train timetable incorporates scheduled buffer allowance. Out of the raw delay shock, the system recovers approximately {absorbedEA > 0 ? absorbedEA.toFixed(1) : '6.3'} minutes through sectional engineering slack, limiting final terminal arrival delay to +{netDelay > 0 ? netDelay.toFixed(1) : '20.7'} minutes.
        </p>
      </div>

      {/* Passenger Stay & Restroom Assistance Button */}
      {onViewAmenities && (
        <button
          type="button"
          onClick={onViewAmenities}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-sm transition-all active:scale-98 cursor-pointer border border-blue-600/40"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-400/20 flex items-center justify-center">
              <Hotel className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="text-left">
              <span className="block leading-tight text-[11.5px]">Train Delayed? Find Nearby Stays</span>
              <span className="text-[9.5px] text-blue-200/80 font-normal">IRCTC Retiring Rooms, Lounges & Lodges</span>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
        </button>
      )}
    </div>
  );
};
