'use client';

import React from 'react';
import { FileSearch, Activity, Network, ShieldCheck } from 'lucide-react';
import { ExplanationResponse } from '@/types';

interface DelayExplanationProps {
  explanation: ExplanationResponse | null;
}

export const DelayExplanation: React.FC<DelayExplanationProps> = ({ explanation }) => {
  if (!explanation) return null;

  const isLate = explanation.status === 'LATE';

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-irctc-blue/10 flex items-center justify-center text-irctc-blue">
            <FileSearch className="w-4 h-4 text-irctc-blue" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 leading-tight">
              Dispatch Narrative &amp; Physics Analysis
            </h2>
            <p className="text-[10px] text-slate-500 font-medium">
              Kinetic &amp; Network Precedence Evaluation
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
            isLate
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
          }`}
        >
          {explanation.status}
        </span>
      </div>

      {/* Kinetic Root Causes */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-black text-rose-700">
          <Activity className="w-3.5 h-3.5 text-rose-600" />
          <span>1. Kinetic &amp; Equipment Root Causes</span>
        </div>
        <ul className="text-xs text-slate-700 space-y-1 pl-4 list-disc">
          {explanation.primary_reasons.map((reason, idx) => (
            <li key={idx} className="leading-snug">
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Cascading Domino Shocks */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-700">
          <Network className="w-3.5 h-3.5 text-amber-600" />
          <span>2. Network Precedence &amp; Conflicts</span>
        </div>
        <ul className="text-xs text-slate-700 space-y-1 pl-4 list-disc">
          {explanation.cascade_reasons.map((reason, idx) => (
            <li key={idx} className="leading-snug">
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Buffer Recovery Directive */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>3. Timetable Recovery &amp; Dispatch Directive</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          {explanation.recovery_summary}
        </p>
        <div className="bg-white/90 border border-blue-200 rounded-lg p-2.5 text-xs text-irctc-blue font-bold">
          {explanation.dispatch_directive}
        </div>
      </div>
    </div>
  );
};
