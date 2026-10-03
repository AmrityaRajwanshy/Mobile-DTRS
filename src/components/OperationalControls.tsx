'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  RotateCcw,
  CloudSun,
  Compass,
  ShieldAlert,
  Lock,
  Zap,
  FastForward,
  MapPin,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  OperationalCases,
  TrainInfo,
  RouteSegment,
  StationCircumstance,
} from '@/types';

interface OperationalControlsProps {
  cases: OperationalCases;
  onChangeCase: (field: keyof OperationalCases, value: string) => void;
  onResetCases: () => void;
  onApplyPreset: (presetName: string) => void;
  isFrozen?: boolean;
  lockReason?: string;
  onToggleFreeze?: () => void;
  trainInfo?: TrainInfo | null;
  selectedTrainNo?: string;
  segments?: RouteSegment[];
  selectedSegment?: string;
  onChangeSegment?: (seg: string) => void;
  sectionDelayMins?: number;
  onUpdateSectionDelay?: (mins: number, segNo?: string) => void;
  speedupRecoveryMins?: number;
  onUpdateSpeedupRecovery?: (mins: number) => void;
  multiStationInjections?: StationCircumstance[];
  onUpdateMultiStationInjections?: (injections: StationCircumstance[]) => void;
}

const DISRUPTION_REASONS = [
  'Signal Clearance / Precedence Wait',
  'Temporary Speed Restriction (TSR) Caution Order',
  'Single-Track Crossing Precedence Hold',
  'Track & OHE Electrification Maintenance',
  'Alarm Chain Pulling (ACP) Event',
  'Locomotive Traction Tractive Drag',
];

const SUGGESTIONS: Record<string, Record<string, string>> = {
  train_tier: {
    T1_PREMIUM: '(Rajdhani / Shatabdi / Vande Bharat)',
    T2_SUPERFAST: '(Superfast / Mail Express)',
    T3_EXPRESS_PASSENGER: '(Express / Passenger / Suburban)',
    T3_EXPRESS: '(Express / Passenger / Suburban)',
  },
  weather: {
    Clear: 'Nominal • ±0.0 min',
    Fog: 'Dense Fog • ±35.0 mins',
    Heavy_Rain: 'Monsoon • ±12.0 mins',
    Thunderstorm: 'Storm Caution • ±18.0 mins',
    Snow: 'Freeze • ±22.0 mins',
  },
  tsr_level: {
    None: 'Permissible Speed • ±0m',
    Minor: '1-2 Caution Orders • ±8m',
    Major: 'Engineering Block • ±24m',
  },
  priority_congestion: {
    None: 'Free Track • 0.5x Headway',
    Low: 'Nominal • 1.0x Headway',
    High: 'Congested • 1.8x Headway',
  },
  treta_block_occupancy: {
    Track_Clear: 'Free Block • ±0m',
    Preceding_Delayed_Minor: 'Preceding Minor • ±5m',
    Preceding_Delayed_Moderate: 'Preceding Mod • ±10m',
    Preceding_Delayed_Severe: 'Preceding Severe • ±20m',
  },
  crossing_conflict: {
    Double_Quad_Track: 'Clear Priority • ±0m',
    Minor_Crossing_Wait: 'Loop Wait • ±8m',
    Major_Crossing_Wait: 'Main Precedence • ±25m',
  },
  alarm_chain_pulling: {
    '0_Events': 'Nominal • ±0m',
    '1_Event': '1 Event • ±15m',
    '2_Events': '2 Events • ±30m',
  },
  engine_failure: {
    Nominal: 'Full Traction • ±0m',
    Failure: 'Loco Snag • ±15m',
  },
  terminal_platform_hold: {
    Platform_Available: 'Clear Path • ±0m',
    Outer_Holding: 'Outer Signal • ±15m',
  },
  crew_duty_status: {
    Duty_Valid: 'Active Crew • ±0m',
    Duty_Exceeded: 'Duty Exceeded • ±45m Relief',
  },
};

export const OperationalControls: React.FC<OperationalControlsProps> = ({
  cases,
  onChangeCase,
  onResetCases,
  onApplyPreset,
  isFrozen = false,
  lockReason,
  onToggleFreeze,
  trainInfo,
  selectedTrainNo,
  segments = [],
  selectedSegment = '',
  onChangeSegment,
  sectionDelayMins = 0,
  onUpdateSectionDelay,
  speedupRecoveryMins = 0,
  onUpdateSpeedupRecovery,
  multiStationInjections = [],
  onUpdateMultiStationInjections,
}) => {
  const effectiveTier = trainInfo?.train_tier || cases.train_tier || 'T1_PREMIUM';
  const tierAutoSpeedup = effectiveTier.startsWith('T1') ? 20 : effectiveTier.startsWith('T2') ? 15 : 10;

  const [localSelectedSeg, setLocalSelectedSeg] = useState<string>(selectedSegment || '');
  const [selectedReason, setSelectedReason] = useState<string>(DISRUPTION_REASONS[0]);
  const [localSectionDelay, setLocalSectionDelay] = useState<number>(sectionDelayMins || 0);
  const [localSpeedup, setLocalSpeedup] = useState<number>(speedupRecoveryMins || tierAutoSpeedup);

  const availableSegments =
    trainInfo?.segments && trainInfo.segments.length > 0
      ? trainInfo.segments
      : segments && segments.length > 0
      ? segments
      : [];

  useEffect(() => {
    if (selectedSegment) {
      setLocalSelectedSeg(selectedSegment);
    }
  }, [selectedSegment]);

  useEffect(() => {
    if (typeof sectionDelayMins === 'number') {
      setLocalSectionDelay(sectionDelayMins);
    }
  }, [sectionDelayMins]);

  useEffect(() => {
    setLocalSpeedup(tierAutoSpeedup);
    if (onUpdateSpeedupRecovery && speedupRecoveryMins !== tierAutoSpeedup) {
      onUpdateSpeedupRecovery(tierAutoSpeedup);
    }
  }, [tierAutoSpeedup, speedupRecoveryMins, onUpdateSpeedupRecovery]);

  useEffect(() => {
    if (trainInfo?.train_tier && cases.train_tier !== trainInfo.train_tier) {
      onChangeCase('train_tier', trainInfo.train_tier);
    }
  }, [trainInfo?.train_tier, cases.train_tier, onChangeCase]);

  const handleApplySectionDelay = (delayVal: number, segNo?: string) => {
    setLocalSectionDelay(delayVal);
    const targetSeg = segNo !== undefined ? segNo : localSelectedSeg;
    if (onUpdateSectionDelay) {
      onUpdateSectionDelay(delayVal, targetSeg);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-4">
      {/* Frozen Alert Banner */}
      {isFrozen && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-900 min-w-0">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="truncate font-semibold">
              Locked to live telemetry.
            </div>
          </div>
          {onToggleFreeze && (
            <button
              type="button"
              onClick={onToggleFreeze}
              className="text-[11px] px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold shrink-0 ml-2"
            >
              Unlock
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-irctc-blue/10 flex items-center justify-center text-irctc-blue">
            <Sliders className="w-4 h-4 text-irctc-blue" />
          </div>
          <div>
            <h2 className="text-sm font-black text-irctc-blue leading-tight">
              Operational Disturbances
            </h2>
            <span className="text-[10px] text-slate-500 font-medium">
              10 Cascade Disturbance Variables
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetCases}
          disabled={isFrozen}
          className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl font-bold hover:bg-slate-100 active:scale-95 disabled:opacity-50"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Mobile Swipeable Quick Scenario Preset Chips */}
      <div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Quick Scenario Presets</span>
        </div>
        <div className="no-scrollbar overflow-x-auto flex gap-1.5 pb-1">
          <button
            type="button"
            onClick={() => onApplyPreset('ideal')}
            className="shrink-0 text-xs px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold active:scale-95"
          >
            Clear Ideal (±0m)
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('fog')}
            className="shrink-0 text-xs px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 font-bold active:scale-95"
          >
            Severe Fog (±35m)
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('monsoon')}
            className="shrink-0 text-xs px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-300 font-bold active:scale-95"
          >
            Monsoon Rain
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('breakdown')}
            className="shrink-0 text-xs px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 font-bold active:scale-95"
          >
            Engine Fail + ACP
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('border')}
            className="shrink-0 text-xs px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-300 font-bold active:scale-95"
          >
            Border Congestion
          </button>
        </div>
      </div>

      {/* Group 1: Physical Disturbances */}
      <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-black text-irctc-blue">
          <CloudSun className="w-3.5 h-3.5 text-irctc-blue" />
          <span>Group 1: Track-Level Physical Disturbances (PD)</span>
        </div>

        {/* 1. Timetable Tier */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            1. Timetable Tier (Database Locked):
          </label>
          <div className="h-10 px-3 bg-white border border-slate-300 rounded-xl flex items-center justify-between">
            <span className="font-mono font-black text-xs text-slate-900 truncate">
              {effectiveTier}
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Official Tier
            </span>
          </div>
        </div>

        {/* 2. Weather */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            2. Weather Condition (DW):
          </label>
          <select
            className="irctc-select w-full h-10 text-xs font-semibold rounded-xl"
            disabled={isFrozen}
            value={cases.weather}
            onChange={(e) => onChangeCase('weather', e.target.value)}
          >
            <option value="Clear">Clear</option>
            <option value="Fog">Fog</option>
            <option value="Heavy_Rain">Heavy Rain</option>
            <option value="Thunderstorm">Thunderstorm</option>
            <option value="Snow">Snowfall</option>
          </select>
          <span className="text-[10px] text-irctc-blue font-bold mt-0.5 block">
            {SUGGESTIONS.weather[cases.weather]}
          </span>
        </div>

        {/* 3. TSR Level */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            3. Speed Restriction / TSR (DTS):
          </label>
          <select
            className="irctc-select w-full h-10 text-xs font-semibold rounded-xl"
            disabled={isFrozen}
            value={cases.tsr_level}
            onChange={(e) => onChangeCase('tsr_level', e.target.value)}
          >
            <option value="None">None</option>
            <option value="Minor">Minor TSR</option>
            <option value="Major">Major TSR</option>
          </select>
          <span className="text-[10px] text-irctc-blue font-bold mt-0.5 block">
            {SUGGESTIONS.tsr_level[cases.tsr_level]}
          </span>
        </div>
      </div>

      {/* Group 2: Signalling & Block Conflicts */}
      <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-black text-irctc-blue">
          <Compass className="w-3.5 h-3.5 text-irctc-blue" />
          <span>Group 2: Block Signalling &amp; Line Conflicts (CD)</span>
        </div>

        {/* 4. Priority Congestion */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            4. Priority Congestion:
          </label>
          <select
            className="irctc-select w-full h-10 text-xs font-semibold rounded-xl"
            disabled={isFrozen}
            value={cases.priority_congestion}
            onChange={(e) => onChangeCase('priority_congestion', e.target.value)}
          >
            <option value="None">None</option>
            <option value="Low">Low</option>
            <option value="High">High</option>
          </select>
          <span className="text-[10px] text-irctc-blue font-bold mt-0.5 block">
            {SUGGESTIONS.priority_congestion[cases.priority_congestion]}
          </span>
        </div>

        {/* 5. Block Occupancy */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            5. Block Occupancy:
          </label>
          <select
            className="irctc-select w-full h-10 text-xs font-semibold rounded-xl"
            disabled={isFrozen}
            value={cases.treta_block_occupancy}
            onChange={(e) => onChangeCase('treta_block_occupancy', e.target.value)}
          >
            <option value="Track_Clear">Track Clear</option>
            <option value="Preceding_Delayed_Minor">Preceding Delayed Minor</option>
            <option value="Preceding_Delayed_Moderate">Preceding Delayed Moderate</option>
            <option value="Preceding_Delayed_Severe">Preceding Delayed Severe</option>
          </select>
          <span className="text-[10px] text-irctc-blue font-bold mt-0.5 block">
            {SUGGESTIONS.treta_block_occupancy[cases.treta_block_occupancy]}
          </span>
        </div>

        {/* 6. Crossing Conflict */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            6. Crossing / Junction Conflict (DCR):
          </label>
          <select
            className="irctc-select w-full h-10 text-xs font-semibold rounded-xl"
            disabled={isFrozen}
            value={cases.crossing_conflict}
            onChange={(e) => onChangeCase('crossing_conflict', e.target.value)}
          >
            <option value="Double_Quad_Track">Double / Quad Track</option>
            <option value="Minor_Crossing_Wait">Minor Crossing Wait</option>
            <option value="Major_Crossing_Wait">Major Crossing Wait</option>
          </select>
          <span className="text-[10px] text-irctc-blue font-bold mt-0.5 block">
            {SUGGESTIONS.crossing_conflict[cases.crossing_conflict]}
          </span>
        </div>
      </div>

      {/* Group 3: Mechanical, Terminals & Crew */}
      <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-black text-irctc-blue">
          <ShieldAlert className="w-3.5 h-3.5 text-irctc-blue" />
          <span>Group 3: Incidents, Terminals &amp; Crew</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* 7. ACP */}
          <div>
            <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
              7. ACP (DCP):
            </label>
            <select
              className="irctc-select w-full h-9 text-xs rounded-xl"
              disabled={isFrozen}
              value={cases.alarm_chain_pulling}
              onChange={(e) => onChangeCase('alarm_chain_pulling', e.target.value)}
            >
              <option value="0_Events">0 Events</option>
              <option value="1_Event">1 Event</option>
              <option value="2_Events">2 Events</option>
            </select>
          </div>

          {/* 8. Engine Status */}
          <div>
            <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
              8. Loco Status:
            </label>
            <select
              className="irctc-select w-full h-9 text-xs rounded-xl"
              disabled={isFrozen}
              value={cases.engine_failure}
              onChange={(e) => onChangeCase('engine_failure', e.target.value)}
            >
              <option value="Nominal">Nominal</option>
              <option value="Failure">Failure</option>
            </select>
          </div>

          {/* 9. Platform Hold */}
          <div>
            <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
              9. Platform Hold:
            </label>
            <select
              className="irctc-select w-full h-9 text-xs rounded-xl"
              disabled={isFrozen}
              value={cases.terminal_platform_hold}
              onChange={(e) => onChangeCase('terminal_platform_hold', e.target.value)}
            >
              <option value="Platform_Available">Available</option>
              <option value="Outer_Holding">Outer Hold</option>
            </select>
          </div>

          {/* 10. Crew Duty */}
          <div>
            <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
              10. Crew Duty:
            </label>
            <select
              className="irctc-select w-full h-9 text-xs rounded-xl"
              disabled={isFrozen}
              value={cases.crew_duty_status}
              onChange={(e) => onChangeCase('crew_duty_status', e.target.value)}
            >
              <option value="Duty_Valid">Valid</option>
              <option value="Duty_Exceeded">Exceeded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Group 4: Section Delay Injection & Speedup Recovery */}
      <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-emerald-50/50 rounded-2xl p-3 border border-indigo-200/90 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
            <Zap className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Group 4: Inject Late Departure / Section Delay</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
            +{localSectionDelay}m
          </span>
        </div>

        {/* Target Hop Dropdown */}
        <div>
          <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
            Target Section / Hop:
          </label>
          <select
            className="irctc-select w-full h-10 text-xs font-semibold rounded-xl"
            value={localSelectedSeg}
            onChange={(e) => {
              const val = e.target.value;
              setLocalSelectedSeg(val);
              if (onChangeSegment) onChangeSegment(val);
            }}
          >
            <option value="">Whole Route / Auto-Detected</option>
            {availableSegments.map((seg) => (
              <option key={seg.treta_segment_number} value={seg.treta_segment_number}>
                {seg.from_station_name} → {seg.to_station_name} ({seg.segment_distance_km} km)
              </option>
            ))}
          </select>
        </div>

        {/* Quick Minute Chips */}
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Inject Shock Delay Minutes:
          </div>
          <div className="no-scrollbar overflow-x-auto flex gap-1.5 pb-1">
            {[0, 5, 10, 15, 30, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleApplySectionDelay(mins, localSelectedSeg)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-black transition-all border active:scale-95 ${
                  localSectionDelay === mins
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {mins === 0 ? '±0m Clear' : `+${mins}m`}
              </button>
            ))}
          </div>
        </div>

        {/* MPS Rate Auto-recovery display */}
        <div className="p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-950 font-semibold">
          <div className="flex items-center gap-1.5">
            <FastForward className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-[11px]">MPS Speed Recovery Rate:</span>
          </div>
          <span className="font-mono font-black text-emerald-900 bg-white px-2 py-0.5 rounded-lg border border-emerald-300">
            -{localSpeedup}m
          </span>
        </div>
      </div>
    </div>
  );
};
