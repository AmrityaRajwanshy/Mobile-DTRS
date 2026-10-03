'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hotel,
  BedDouble,
  Coffee,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Star,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Info,
  Sparkles,
  ChevronRight,
  Bath,
  Wifi,
  Navigation,
  Compass,
  Luggage,
  Sparkle,
  ChevronDown,
  Filter,
  X,
} from 'lucide-react';
import { StationAmenityItem, TrainInfo, PredictionResult, AmenityCategory } from '@/types';
import {
  CURATED_STATION_AMENITIES,
  POPULAR_TRAIN_PRESETS,
  getAmenitiesForStation
} from '@/data/stationAmenitiesData';

interface StationAmenitiesExplorerProps {
  selectedTrainNo?: string;
  trainInfo?: TrainInfo | null;
  predictionResult?: PredictionResult | null;
  onSelectTrain?: (trainNo: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const StationAmenitiesExplorer: React.FC<StationAmenitiesExplorerProps> = ({
  selectedTrainNo = '12001',
  trainInfo,
  predictionResult,
  onSelectTrain,
  onNavigateTab
}) => {
  const [activeTrainNo, setActiveTrainNo] = useState<string>(selectedTrainNo || '12001');
  const [inputTrainNo, setInputTrainNo] = useState<string>(selectedTrainNo || '12001');
  const [selectedStationCode, setSelectedStationCode] = useState<string>('NDLS');
  const [activeCategory, setActiveCategory] = useState<AmenityCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFacilityModal, setSelectedFacilityModal] = useState<StationAmenityItem | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!selectedFacilityModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedFacilityModal(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFacilityModal]);

  // Sync with prop when parent changes
  useEffect(() => {
    if (selectedTrainNo && selectedTrainNo !== activeTrainNo) {
      setActiveTrainNo(selectedTrainNo);
      setInputTrainNo(selectedTrainNo);
    }
  }, [selectedTrainNo]);

  // Determine current active train preset or dynamically parsed stops
  const currentPreset = useMemo(() => {
    const found = POPULAR_TRAIN_PRESETS.find(
      (p) => p.train_no === activeTrainNo || p.train_no === activeTrainNo.padStart(5, '0')
    );
    if (found) return found;

    // Fallback: If trainInfo has stations, build a preset on the fly!
    if (trainInfo && trainInfo.stations && trainInfo.stations.length > 0) {
      return {
        train_no: activeTrainNo,
        train_name: trainInfo.train_name || `Express #${activeTrainNo}`,
        route_summary: `${trainInfo.source_station} → ${trainInfo.destination_station}`,
        stations: trainInfo.stations.map((st) => ({
          code: st.station_code,
          name: st.station_name,
          isJunction: st.station_name.toLowerCase().includes('jn') || st.station_name.toLowerCase().includes('junction'),
          km: Math.round(st.dist_km),
          haltMins: 2
        }))
      };
    }

    // Default to 12001
    return POPULAR_TRAIN_PRESETS[0];
  }, [activeTrainNo, trainInfo]);

  // Set default station to first major junction or first station in the list
  useEffect(() => {
    if (currentPreset && currentPreset.stations.length > 0) {
      const currentCodeExists = currentPreset.stations.some((s) => s.code === selectedStationCode);
      if (!currentCodeExists) {
        // Pick first junction or first station
        const firstJn = currentPreset.stations.find((s) => s.isJunction);
        setSelectedStationCode(firstJn ? firstJn.code : currentPreset.stations[0].code);
      }
    }
  }, [currentPreset, selectedStationCode]);

  // Selected station metadata
  const currentStationMeta = useMemo(() => {
    return (
      currentPreset.stations.find((s) => s.code === selectedStationCode) || {
        code: selectedStationCode,
        name: selectedStationCode,
        isJunction: true,
        km: 0,
        haltMins: 5
      }
    );
  }, [currentPreset, selectedStationCode]);

  // Fetch raw amenities list for active station and calculate counts
  const rawStationAmenities = useMemo(() => {
    return getAmenitiesForStation(
      currentStationMeta.code,
      currentStationMeta.name,
      currentStationMeta.isJunction
    );
  }, [currentStationMeta]);

  const categoryCounts = useMemo(() => {
    return {
      all: rawStationAmenities.length,
      lodge: rawStationAmenities.filter((i) => i.category === 'lodge').length,
      retiring_room: rawStationAmenities.filter((i) => i.category === 'retiring_room').length,
      executive_lounge: rawStationAmenities.filter((i) => i.category === 'executive_lounge').length,
      restroom_waiting: rawStationAmenities.filter((i) => i.category === 'restroom_waiting').length,
    };
  }, [rawStationAmenities]);

  // Filter amenities list for the active station
  const stationAmenitiesList = useMemo(() => {
    return rawStationAmenities.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesFeatures = item.features.some((f) => f.toLowerCase().includes(q));
        const matchesSub = item.subCategoryTitle.toLowerCase().includes(q);
        const matchesLoc = item.locationDetails.toLowerCase().includes(q);
        return matchesName || matchesFeatures || matchesSub || matchesLoc;
      }
      return true;
    });
  }, [rawStationAmenities, activeCategory, searchQuery]);

  const handleTrainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTrainNo.trim()) {
      const clean = inputTrainNo.trim();
      setActiveTrainNo(clean);
      if (onSelectTrain) {
        onSelectTrain(clean);
      }
    }
  };

  const handleSelectPreset = (trainNo: string) => {
    setActiveTrainNo(trainNo);
    setInputTrainNo(trainNo);
    if (onSelectTrain) {
      onSelectTrain(trainNo);
    }
  };

  const triggerCallAction = (phone: string, facilityName: string) => {
    setActionNotice(`Connecting to ${facilityName} (${phone})...`);
    setTimeout(() => {
      setActionNotice(null);
    }, 3500);
  };

  // Estimated delay from prediction
  const netDelayMins = predictionResult ? Math.round(predictionResult.math_resolution.NetDelay) : 21;
  const isDelayed = netDelayMins > 0;

  return (
    <div className="space-y-3.5 pb-6 text-slate-800">
      {/* 1. Header Banner (High-Visibility Blue & White Theme) */}
      <div className="bg-gradient-to-r from-blue-700 via-irctc-blue to-blue-800 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden border border-blue-600">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
              <Hotel className="w-3 h-3 text-white" />
              Station Accommodations &amp; Restrooms
            </span>
            <span className="text-[10px] font-mono text-blue-100 bg-white/10 px-2 py-0.5 rounded-md font-bold">
              24/7 Transit Stays
            </span>
          </div>

          <h2 className="text-lg font-black tracking-tight text-white mt-2 leading-tight">
            Station Amenities &amp; Lodges
          </h2>
          <p className="text-xs text-blue-100 mt-1 leading-snug">
            Verified Lodges, IRCTC Retiring Rooms, Executive Lounges &amp; Sanitized Restrooms near railway stations to stay comfortably during train delays.
          </p>

          {/* Active Delay Advisory Banner */}
          {isDelayed && (
            <div className="mt-3 bg-white/15 border border-white/30 rounded-xl p-2.5 flex items-start gap-2.5 text-xs text-white">
              <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-200">
                  Train #{activeTrainNo} Delayed (~+{netDelayMins} mins):
                </span>{' '}
                <span className="text-blue-100 text-[11.5px]">
                  Rest slots, fresh-up showers, and quiet waiting rooms are available at upcoming stations below.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Train Number Selector & Quick Chips */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-irctc-blue" />
            Select or Enter Train Number:
          </label>
          <span className="text-[10px] font-mono font-bold text-irctc-blue bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            {currentPreset.train_name}
          </span>
        </div>

        {/* Train Dropdown Selector (Commented Out) */}
        {/* <div className="space-y-1">
          <label htmlFor="train-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Choose Train from Relevant Routes:
          </label>
          <div className="relative">
            <select
              id="train-select"
              value={activeTrainNo}
              onChange={(e) => {
                const val = e.target.value;
                setActiveTrainNo(val);
                setInputTrainNo(val);
                if (onSelectTrain) onSelectTrain(val);
              }}
              className="w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold appearance-none focus:outline-none focus:border-irctc-blue focus:ring-2 focus:ring-blue-100 cursor-pointer pr-9 shadow-2xs"
            >
              {POPULAR_TRAIN_PRESETS.map((p) => (
                <option key={p.train_no} value={p.train_no}>
                  Train #{p.train_no} — {p.train_name} ({p.route_summary})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
              <ChevronDown className="w-4 h-4 text-irctc-blue" />
            </div>
          </div>
        </div> */}

        {/* Train Input Form */}
        <form onSubmit={handleTrainSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputTrainNo}
            onChange={(e) => setInputTrainNo(e.target.value)}
            placeholder="Or enter any train: 12001, 12952, 22348"
            maxLength={6}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-irctc-blue focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            className="bg-irctc-blue hover:bg-irctc-blue-dark text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            Load
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Popular Trains Chips */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Popular Route Trains:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TRAIN_PRESETS.map((p) => {
              const isSelected = p.train_no === activeTrainNo;
              return (
                <button
                  key={p.train_no}
                  type="button"
                  onClick={() => handleSelectPreset(p.train_no)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-irctc-blue text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                  }`}
                >
                  {p.train_no}{' '}
                  <span className={`text-[10px] font-sans font-normal ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    ({p.train_name.split(' ')[0]})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Stations & Junctions Along Route Selector (Dropdown Only) */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="station-select" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-irctc-blue" />
            <span>Choose Station / Junction on Route:</span>
          </label>
          <span className="text-[10px] text-irctc-blue font-bold font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            {currentPreset.stations.length} Stops
          </span>
        </div>

        <div className="relative">
          <select
            id="station-select"
            value={selectedStationCode}
            onChange={(e) => setSelectedStationCode(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-irctc-blue rounded-xl px-3.5 py-2.5 text-xs font-bold appearance-none focus:outline-none focus:border-irctc-blue focus:ring-2 focus:ring-blue-100 cursor-pointer pr-9 shadow-2xs"
          >
            {currentPreset.stations.map((st) => (
              <option key={st.code} value={st.code}>
                {st.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-irctc-blue">
            <ChevronDown className="w-4 h-4 text-irctc-blue" />
          </div>
        </div>
      </div>

      {/* 4. Active Station Overview Banner (High-Visibility Blue & White Theme) */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border-2 border-blue-200 shadow-sm text-slate-900 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-mono font-bold bg-irctc-blue text-white px-2 py-0.5 rounded shadow-xs shrink-0">
                {currentStationMeta.code}
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                {currentStationMeta.name}
              </h3>
              {currentStationMeta.isJunction && (
                <span className="bg-blue-50 text-irctc-blue border border-blue-200 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  Major Junction
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-medium">
              <span>Route Distance: {currentStationMeta.km} km</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">Available Rest Facilities: {stationAmenitiesList.length}</span>
            </p>
          </div>

          <div className="text-right shrink-0 ml-auto">
            <span className="text-[9.5px] text-slate-400 uppercase tracking-wider block font-semibold leading-none mb-0.5">
              Delay Protocol
            </span>
            <span className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md inline-block">
              +{netDelayMins}m Regulated
            </span>
          </div>
        </div>

        {/* Category Dropdown Selector (Clean Blue & White) */}
        <div className="pt-2.5 border-t border-blue-100 space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="category-select" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-irctc-blue" />
              <span>Choose from Relevant Options:</span>
            </label>
            <span className="text-xs text-irctc-blue font-mono font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {stationAmenitiesList.length} Facilities
            </span>
          </div>

          <div className="relative">
            <select
              id="category-select"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value as AmenityCategory)}
              className="w-full bg-white text-slate-900 border-2 border-blue-200 hover:border-irctc-blue rounded-xl px-3.5 py-2.5 text-xs font-bold appearance-none focus:outline-none focus:border-irctc-blue focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-xs pr-9"
            >
              <option value="all">All Facilities &amp; Accommodations ({categoryCounts.all})</option>
              <option value="lodge">Nearby Lodges &amp; Transit Hotels ({categoryCounts.lodge})</option>
              <option value="retiring_room">IRCTC Retiring Rooms &amp; Dormitory Pods ({categoryCounts.retiring_room})</option>
              <option value="executive_lounge">Railway Executive Lounges ({categoryCounts.executive_lounge})</option>
              <option value="restroom_waiting">Sanitized Restrooms &amp; Waiting Halls ({categoryCounts.restroom_waiting})</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-irctc-blue">
              <ChevronDown className="w-4 h-4 text-irctc-blue" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 5. Amenities Cards List */}
      <div className="space-y-3">
        {stationAmenitiesList.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-xs space-y-2">
            <BedDouble className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No facilities matching filter</h4>
            <p className="text-xs text-slate-500">
              Try switching category or clearing the search query to see all options.
            </p>
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className="mt-2 text-xs font-bold text-irctc-blue underline"
            >
              Reset to All Facilities
            </button>
          </div>
        ) : (
          stationAmenitiesList.map((item) => {
            const isLodge = item.category === 'lodge';
            const isLounge = item.category === 'executive_lounge';
            const isRetiring = item.category === 'retiring_room';
            const isRestroom = item.category === 'restroom_waiting';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hover:shadow-md transition-shadow w-full min-w-0"
              >
                {/* Card Top Pill Bar */}
                <div className="bg-slate-50 px-3 sm:px-3.5 py-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    {isLodge && (
                      <span className="flex items-center gap-1 text-[9.5px] sm:text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                        <Hotel className="w-3 h-3 text-amber-700" /> Near-Station Lodge
                      </span>
                    )}
                    {isRetiring && (
                      <span className="flex items-center gap-1 text-[9.5px] sm:text-[10px] font-black uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200 shrink-0">
                        <BedDouble className="w-3 h-3 text-indigo-700" /> Retiring Rooms & Dorms
                      </span>
                    )}
                    {isLounge && (
                      <span className="flex items-center gap-1 text-[9.5px] sm:text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        <Coffee className="w-3 h-3 text-emerald-700" /> Executive Lounge
                      </span>
                    )}
                    {isRestroom && (
                      <span className="flex items-center gap-1 text-[9.5px] sm:text-[10px] font-black uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
                        <Bath className="w-3 h-3 text-blue-700" /> Restroom & Waiting Hall
                      </span>
                    )}
                    {item.verifiedBadge && (
                      <span className="text-[9px] sm:text-[9.5px] font-bold text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded shrink-0">
                        {item.verifiedBadge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs shrink-0 ml-auto">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.rating}</span>
                    <span className="text-[10px] text-slate-400">({item.reviewCount})</span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="p-3 sm:p-3.5 space-y-2.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                        {item.name}
                      </h4>
                      <div className="text-[11px] text-slate-600 flex items-start gap-1 mt-1 leading-snug">
                        <MapPin className="w-3.5 h-3.5 text-irctc-orange shrink-0 mt-0.5" />
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          <span className="font-bold text-slate-800">{item.distanceFromStation}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600 leading-tight">{item.locationDetails}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-auto">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block leading-none mb-0.5">
                        Transit Rate
                      </span>
                      <span className="text-[11px] sm:text-xs font-black text-irctc-blue bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg inline-block shadow-2xs">
                        {item.hourlyRate || item.pricing}
                      </span>
                    </div>
                  </div>

                  {/* Context Delay Fit */}
                  <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 flex items-start gap-1.5 text-xs text-slate-600">
                    <Info className="w-3.5 h-3.5 text-irctc-blue shrink-0 mt-0.5" />
                    <span className="text-[11px] sm:text-[11.5px] leading-snug">{item.delayFit}</span>
                  </div>

                  {/* Features Badges */}
                  <div className="flex flex-wrap gap-1">
                    {item.features.map((feat, fIdx) => (
                      <span
                        key={fIdx}
                        className="text-[10px] sm:text-[10.5px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200/60 leading-tight"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Booking / Details Footer */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="font-bold text-emerald-700 text-[11px]">
                        {item.bookingStatus}
                      </span>
                      {item.isOpen24x7 && (
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">(24/7 Front Desk)</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                      {item.contactPhone && (
                        <button
                          type="button"
                          onClick={() => triggerCallAction(item.contactPhone!, item.name)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          Call
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedFacilityModal(item)}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-irctc-blue hover:bg-irctc-blue-dark flex items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
                      >
                        <span>Details &amp; Rates</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. Emergency Railway Helpline & Station Master Card */}
      <div className="bg-slate-100 rounded-2xl p-3.5 border border-slate-200 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            Station Emergency & Passenger Assistance
          </span>
          <span className="text-[10px] font-bold text-slate-500 shrink-0">Toll-Free 24x7</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white p-2 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 block">RailMadad / Inquiry</span>
            <span className="font-mono font-black text-irctc-blue text-sm">139</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 block">RPF Passenger Security</span>
            <span className="font-mono font-black text-rose-600 text-sm">182 / 139</span>
          </div>
        </div>
      </div>

      {/* 7. Modal for Facility Details & Stay Rates (Portaled to document.body to prevent nav clipping) */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedFacilityModal && (
            <div
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
              onClick={() => setSelectedFacilityModal(null)}
            >
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto p-4 pb-6 sm:p-4 space-y-3.5 shadow-2xl border border-slate-200 select-text"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-irctc-blue bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {selectedFacilityModal.subCategoryTitle}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    {selectedFacilityModal.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFacilityModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Location & Station Distance */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <MapPin className="w-4 h-4 text-irctc-orange" />
                  <span>{selectedFacilityModal.distanceFromStation}</span>
                  <span className="text-slate-400 font-normal">({selectedFacilityModal.stationName})</span>
                </div>
                <p className="text-slate-600 pl-5.5">{selectedFacilityModal.locationDetails}</p>
                <div className="flex items-center gap-3 pl-5.5 pt-1 text-[11px] text-slate-500 font-medium">
                  <span>Rating: {selectedFacilityModal.rating} / 5</span>
                  <span>•</span>
                  <span>{selectedFacilityModal.isOpen24x7 ? 'Open 24 Hours' : 'Open 05:00 - 23:30'}</span>
                </div>
              </div>

              {/* Hourly Rates & Pricing */}
              <div className="border border-blue-100 bg-blue-50/70 p-3 rounded-2xl space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-irctc-blue block">
                  Transit Tariff & Stay Charges:
                </span>
                <p className="text-sm font-black text-slate-900">{selectedFacilityModal.pricing}</p>
                <p className="text-xs text-blue-900/80">
                  Special transit delay pricing valid for passengers holding confirmed or waitlisted Indian Railways tickets.
                </p>
              </div>

              {/* All Amenities list */}
              <div>
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                  Included Amenities & Facilities:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selectedFacilityModal.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-2 rounded-xl border border-slate-200/80 flex items-center gap-2 text-slate-700 font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex gap-2">
                {selectedFacilityModal.contactPhone && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerCallAction(selectedFacilityModal.contactPhone!, selectedFacilityModal.name);
                      setSelectedFacilityModal(null);
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Reception ({selectedFacilityModal.contactPhone})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActionNotice(`Walking directions to ${selectedFacilityModal.name} mapped.`);
                    setSelectedFacilityModal(null);
                    setTimeout(() => setActionNotice(null), 3000);
                  }}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Map
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </div>
  );
};
