'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Train, CheckCircle2, ChevronRight, MapPin, AlertTriangle, X, Sparkles } from 'lucide-react';
import { TrainSearchResult, TrainInfo } from '@/types';

interface TrainSearchProps {
  selectedTrainNo: string;
  trainInfo: TrainInfo | null;
  onSelectTrain: (trainNo: string) => void;
  isLoading: boolean;
}

const PRESET_TRAINS = [
  { no: '12001', name: 'Shatabdi Exp', tier: 'T1', corridor: 'DEL-MAS' },
  { no: '22348', name: 'Vande Bharat', tier: 'T1', corridor: 'DEL-HWH' },
  { no: '02024', name: 'PNBE HWH Spl', tier: 'T2', corridor: 'DEL-HWH' },
  { no: '12952', name: 'Tejas Rajdhani', tier: 'T1', corridor: 'DEL-MUM' },
  { no: '12951', name: 'Mumbai Rajdhani', tier: 'T1', corridor: 'DEL-MUM' },
  { no: '12302', name: 'Howrah Rajdhani', tier: 'T1', corridor: 'DEL-HWH' },
  { no: '12626', name: 'Kerala Exp', tier: 'T2', corridor: 'DEL-MAS' },
  { no: '12215', name: 'Garib Rath', tier: 'T2', corridor: 'DEL-MUM' },
  { no: '19019', name: 'Dehradun Exp', tier: 'T3', corridor: 'Northern' },
];

export const TrainSearch: React.FC<TrainSearchProps> = ({
  selectedTrainNo,
  trainInfo,
  onSelectTrain,
  isLoading,
}) => {
  const [query, setQuery] = useState<string>(selectedTrainNo);
  const [suggestions, setSuggestions] = useState<TrainSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedTrainNo && selectedTrainNo !== query) {
      setQuery(selectedTrainNo);
    }
  }, [selectedTrainNo]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data: TrainSearchResult[] = await res.json();
          setSuggestions(data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Failed to search trains:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (tNo: string) => {
    setQuery(tNo);
    setShowDropdown(false);
    onSelectTrain(tNo);
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-irctc-blue/10 flex items-center justify-center text-irctc-blue">
            <Train className="w-4 h-4 text-irctc-blue" />
          </div>
          <div>
            <h2 className="text-sm font-black text-irctc-blue">
              Train &amp; Timetable Lookup
            </h2>
            <p className="text-[10px] text-slate-500 font-medium">
              Auto-fetches Tier, Working Slack ($EA$) &amp; Route
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-blue-50 text-irctc-blue border border-blue-200 px-2 py-0.5 rounded-full font-bold">
          Step 1
        </span>
      </div>

      {/* Mobile Search Input */}
      <div className="relative mb-3" ref={dropdownRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 focus:border-irctc-blue focus:bg-white rounded-xl py-3 pl-10 pr-10 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-irctc-blue/15 transition-all shadow-inner"
            placeholder="Search train no / name (e.g. 12001, Shatabdi)..."
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              const cleaned = val.trim();
              if (cleaned.length === 5 && /^\d{5}$/.test(cleaned) && cleaned !== selectedTrainNo) {
                handleSelect(cleaned);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (suggestions.length > 0) {
                  handleSelect(suggestions[0].train_no);
                } else if (query.trim()) {
                  handleSelect(query.trim());
                }
              }
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
              className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : isSearching ? (
            <span className="absolute right-3.5 inline-block w-2 h-2 rounded-full bg-irctc-orange animate-ping" />
          ) : null}
        </div>

        {/* Autocomplete Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 max-h-64 overflow-y-auto divide-y divide-slate-100">
            {suggestions.map((train) => (
              <button
                key={train.train_no}
                type="button"
                onClick={() => handleSelect(train.train_no)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/60 active:bg-blue-100 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-irctc-blue text-xs bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      {train.train_no}
                    </span>
                    <span className="font-extrabold text-slate-900 text-xs truncate max-w-[170px]">
                      {train.train_name}
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                      {train.train_tier}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <span>{train.source}</span>
                    <span className="text-slate-300">→</span>
                    <span>{train.destination}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-irctc-orange font-bold">{train.corridor_slug}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-irctc-orange" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Horizontal Swipeable Quick Train Chips */}
      <div className="mb-3">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Quick Preset Trains
        </div>
        <div className="no-scrollbar overflow-x-auto flex gap-1.5 pb-1">
          {PRESET_TRAINS.map((preset) => {
            const isActive = selectedTrainNo === preset.no;
            return (
              <button
                key={preset.no}
                type="button"
                onClick={() => handleSelect(preset.no)}
                className={`shrink-0 text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all border cursor-pointer active:scale-95 flex items-center gap-1 ${
                  isActive
                    ? 'bg-irctc-blue text-white border-irctc-blue shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span className="font-mono">{preset.no}</span>
                <span className="font-normal text-[11px] opacity-90 truncate max-w-[90px]">
                  {preset.name.split(' ')[0]}
                </span>
                <span className={`text-[9px] font-black px-1 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {preset.tier}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Transit Boarding Pass Card */}
      {trainInfo && (
        <div className="bg-gradient-to-br from-blue-50/80 via-slate-50 to-emerald-50/50 border border-blue-200/90 rounded-2xl p-3.5 relative overflow-hidden shadow-2xs">
          <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-blue-100">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-irctc-blue text-white">
                  {trainInfo.train_no}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {trainInfo.train_tier}
                </span>
                <span className="text-[10px] font-extrabold text-irctc-orange bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                  {trainInfo.relevant_corridor_slug}
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                {trainInfo.train_name}
              </h3>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Synced</span>
            </div>
          </div>

          {/* Route origin → destination graphic */}
          <div className="grid grid-cols-2 gap-2 text-xs py-1">
            <div className="bg-white/90 p-2 rounded-xl border border-slate-200">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Origin</span>
              <span className="font-extrabold text-slate-800 truncate block">
                {trainInfo.source_station}
              </span>
            </div>
            <div className="bg-white/90 p-2 rounded-xl border border-slate-200">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Destination</span>
              <span className="font-extrabold text-slate-800 truncate block">
                {trainInfo.destination_station}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-1.5 mt-2 text-center text-xs">
            <div className="bg-white/90 p-1.5 rounded-xl border border-slate-200">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Distance</span>
              <span className="font-mono font-bold text-slate-800 text-[11px]">
                {trainInfo.total_distance_km.toFixed(0)} km
              </span>
            </div>
            <div className="bg-white/90 p-1.5 rounded-xl border border-slate-200">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Slack (EA)</span>
              <span className="font-mono font-black text-emerald-700 text-[11px]">
                {trainInfo.EA_allotted_mins.toFixed(0)}m
              </span>
            </div>
            <div className="bg-white/90 p-1.5 rounded-xl border border-slate-200">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Arrival</span>
              <span className="font-mono font-bold text-slate-800 text-[11px]">
                {trainInfo.scheduled_arrival}
              </span>
            </div>
          </div>

          {/* Pre-existing Cascaded Delay Notice if any */}
          {trainInfo?.inherited_delay_info?.has_inherited_delay && (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-100/90 border border-amber-300 text-xs flex items-center justify-between text-amber-950">
              <div className="flex items-center gap-1.5 font-bold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Inherited Shock Active:</span>
              </div>
              <span className="font-mono font-black text-rose-700 bg-white px-2 py-0.5 rounded border border-amber-300">
                +{trainInfo.inherited_delay_info.inherited_delay_mins.toFixed(1)}m
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
