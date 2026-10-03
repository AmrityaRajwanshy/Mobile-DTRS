'use client';

import React from 'react';
import { Route, Database, ArrowRight, Upload, RotateCw, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { RouteSegment, DbSimulationStatus } from '@/types';

interface SegmentationControlsProps {
  corridor: string;
  onChangeCorridor: (c: string) => void;
  borderCrossing: string;
  onChangeBorderCrossing: (bc: string) => void;
  selectedSegment: string;
  onChangeSegment: (seg: string) => void;
  segments: RouteSegment[];
  dbStatus: DbSimulationStatus | null;
  onPushToDb: () => void;
  onResetDb: () => void;
  isPushing: boolean;
  isResetting: boolean;
  toastMessage: { text: string; isSuccess: boolean } | null;
  isFrozen?: boolean;
  lockReason?: string;
}

export const SegmentationControls: React.FC<SegmentationControlsProps> = ({
  corridor,
  onChangeCorridor,
  borderCrossing,
  onChangeBorderCrossing,
  selectedSegment,
  onChangeSegment,
  segments,
  dbStatus,
  onPushToDb,
  onResetDb,
  isPushing,
  isResetting,
  toastMessage,
  isFrozen = false,
  lockReason,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Route className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-sm font-black text-irctc-blue leading-tight">
              Corridor Route &amp; Segmentation
            </h2>
            <span className="text-[10px] text-slate-500 font-medium">
              857 Route Hops &bull; 29 States
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
          Step 3
        </span>
      </div>

      {/* Target National Rail Corridor */}
      <div>
        <label className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
          <span>Target National Rail Corridor:</span>
          {isFrozen && (
            <span className="text-[9px] bg-indigo-100 text-indigo-800 font-black px-1.5 py-0.2 rounded border border-indigo-200">
              🔒 AUTO-FROZEN
            </span>
          )}
        </label>
        <select
          className="irctc-select w-full h-10 text-xs font-semibold rounded-xl"
          value={corridor}
          onChange={(e) => onChangeCorridor(e.target.value)}
          disabled={isFrozen}
        >
          <option value="ALL">All National &amp; Regional Corridors</option>
          <optgroup label="Golden Quadrilateral Trunk Corridors">
            <option value="DEL-MUM">DEL-MUM &bull; Delhi ↔ Mumbai</option>
            <option value="DEL-HWH">DEL-HWH &bull; Delhi ↔ Howrah</option>
            <option value="DEL-MAS">DEL-MAS &bull; Delhi ↔ Chennai</option>
            <option value="MUM-MAS">MUM-MAS &bull; Mumbai ↔ Chennai</option>
            <option value="MUM-HWH">MUM-HWH &bull; Mumbai ↔ Howrah</option>
            <option value="HWH-MAS">HWH-MAS &bull; Howrah ↔ Chennai</option>
            <option value="HWH-GHY">HWH-GHY &bull; Howrah ↔ Guwahati</option>
          </optgroup>
          <optgroup label="Regional Trunk Lines">
            <option value="DEL-JAT">DEL-JAT &bull; Delhi ↔ Jammu</option>
            <option value="MAS-BLR">MAS-BLR &bull; Chennai ↔ Bengaluru</option>
            <option value="MUM-ADI">MUM-ADI &bull; Mumbai ↔ Ahmedabad</option>
            <option value="HWH-PURI">HWH-PURI &bull; Howrah ↔ Puri</option>
            <option value="DEL-ASR">DEL-ASR &bull; Delhi ↔ Amritsar</option>
            <option value="ZONAL_FEEDER">ZONAL_FEEDER &bull; Feeder Network</option>
          </optgroup>
        </select>
      </div>

      {/* State Border Crossing Filter (Commented Out) */}
      {/* <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">
          State Border Traversal Filter:
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => onChangeBorderCrossing('ALL')}
            disabled={isFrozen}
            className={`py-2 px-1 text-xs rounded-xl font-bold transition-all border ${
              borderCrossing === 'ALL'
                ? 'bg-irctc-blue text-white border-irctc-blue shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Moves
          </button>
          <button
            type="button"
            onClick={() => onChangeBorderCrossing('0')}
            disabled={isFrozen}
            className={`py-2 px-1 text-xs rounded-xl font-bold transition-all border ${
              borderCrossing === '0'
                ? 'bg-irctc-blue text-white border-irctc-blue shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Intra-State
          </button>
          <button
            type="button"
            onClick={() => onChangeBorderCrossing('1')}
            disabled={isFrozen}
            className={`py-2 px-1 text-xs rounded-xl font-bold transition-all border ${
              borderCrossing === '1'
                ? 'bg-irctc-blue text-white border-irctc-blue shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Inter-State
          </button>
        </div>
      </div> */}

      {/* Specific Segment Hop Dropdown */}
      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">
          Select Route Hop (Segment Physics):
        </label>
        <select
          className="irctc-select w-full h-10 font-mono text-xs rounded-xl"
          value={selectedSegment}
          onChange={(e) => onChangeSegment(e.target.value)}
        >
          <option value="">
            -- Complete Route (Select specific hop) --
          </option>
          {segments.map((seg) => (
            <option key={seg.treta_segment_number} value={seg.treta_segment_number}>
              {seg.label ||
                `[${seg.treta_segment_number}] ${seg.from_station_name} → ${seg.to_station_name} (${seg.segment_distance_km} km)`}
            </option>
          ))}
        </select>
      </div>

      {/* Database Sandbox Integrity Card */}
      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Shield className="w-3.5 h-3.5 text-irctc-blue" />
            <span>Simulation Sandbox</span>
          </div>
          <span
            className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border ${
              !dbStatus || dbStatus.is_pristine
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            {!dbStatus || dbStatus.is_pristine ? 'BASELINE ACTIVE' : `SIM (${dbStatus?.modifications_count || 0})`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onPushToDb}
            disabled={isPushing}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-irctc-blue hover:bg-irctc-blue-dark text-white text-xs font-black shadow-xs active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-amber-300" />
            <span>{isPushing ? 'Saving...' : 'Push to Sim DB'}</span>
          </button>

          <button
            type="button"
            onClick={onResetDb}
            disabled={isResetting}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-bold shadow-2xs active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset Sandbox'}</span>
          </button>
        </div>
      </div>

      {/* Live Toast */}
      {toastMessage && (
        <div
          className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            toastMessage.isSuccess
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-rose-50 text-rose-800 border border-rose-300'
          }`}
        >
          {toastMessage.isSuccess ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
};
