'use client';

import React from 'react';
import { Layers, AlertTriangle, Clock } from 'lucide-react';
import { CascadedDelays as CascadedDelaysType } from '@/types';

interface CascadedDelaysProps {
  cascaded: CascadedDelaysType | null;
}

export const CascadedDelays: React.FC<CascadedDelaysProps> = ({ cascaded }) => {
  if (!cascaded) return null;

  const count = cascaded.total_affected_trains;
  const totalMins = cascaded.cumulative_knock_on_mins;

  return (
    <div className="bg-white rounded-2xl p-4 border border-rose-200/90 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-rose-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
            <Layers className="w-4 h-4 text-rose-700" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 leading-tight">
              Cascaded Train Overlays
            </h2>
            <p className="text-[10px] text-slate-500 font-medium">
              Knock-on network ripple effect
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Cumulative</span>
          <span className="text-xs font-mono font-black text-rose-600">
            +{totalMins.toFixed(1)}m ({count} Trains)
          </span>
        </div>
      </div>

      {/* Overlaid Trains Mobile Card List */}
      <div className="space-y-2">
        {cascaded.overlaid_trains.length === 0 ? (
          <div className="py-4 text-center text-slate-500 text-xs italic bg-slate-50 rounded-xl border border-slate-200">
            No temporal train overlay conflicts detected under current conditions.
          </div>
        ) : (
          cascaded.overlaid_trains.map((train, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-irctc-blue text-xs">
                    {train.train_no}
                  </span>
                  <span className="font-extrabold text-slate-800 truncate max-w-[150px]">
                    {train.train_name}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                    {train.train_tier}
                  </span>
                </div>
                <span className="font-mono font-black text-rose-600 text-xs">
                  +{train.transmitted_delay_mins.toFixed(1)}m
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="truncate max-w-[180px]">
                  {train.station_section || train.segment_hop || 'Corridor Hop'}
                </span>
                <span className="font-mono flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {train.scheduled_window}
                </span>
              </div>

              <div className="text-[10px] font-semibold text-rose-900 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                {train.conflict_type}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
