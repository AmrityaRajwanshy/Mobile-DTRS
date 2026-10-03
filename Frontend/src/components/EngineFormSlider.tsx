'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Train,
  Sliders,
  Route,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Zap,
  Radio,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Clock,
} from 'lucide-react';
import { TrainSearch } from './TrainSearch';
import { RailRadarTracker } from './RailRadarTracker';
import { OperationalControls } from './OperationalControls';
import { SegmentationControls } from './SegmentationControls';
import { MultiSegmentCircumstances } from './MultiSegmentCircumstances';
import { ResultsDashboard } from './ResultsDashboard';
import { DelayExplanation } from './DelayExplanation';
import { CascadedDelays } from './CascadedDelays';
import { DelayReasonsCard } from './DelayReasonsCard';
import {
  TrainInfo,
  OperationalCases,
  RouteSegment,
  DbSimulationStatus,
  RailRadarMatchResponse,
  PredictionResult,
  StationCircumstance,
} from '@/types';

export type StepIndex = 1 | 2 | 3 | 4;

interface EngineFormSliderProps {
  selectedTrainNo: string;
  trainInfo: TrainInfo | null;
  onSelectTrain: (trainNo: string) => void;
  isLoading: boolean;
  onTrackRailRadar: (trainNo: string, sectionDelay?: number, customSegment?: string, speedupRecovery?: number, multiInjections?: StationCircumstance[]) => void;
  railRadarData: RailRadarMatchResponse | null;
  isTrackingRailRadar: boolean;
  isFrozen: boolean;
  onToggleFreeze: () => void;
  cases: OperationalCases;
  onChangeCase: (field: keyof OperationalCases, value: string) => void;
  onResetCases: () => void;
  onApplyPreset: (presetName: string) => void;
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
  onCalculate: () => void;
  predictionResult: PredictionResult | null;
  currentStep?: StepIndex;
  onStepChange?: (step: StepIndex) => void;
  sectionDelayMins?: number;
  onUpdateSectionDelay?: (mins: number, segNo?: string) => void;
  speedupRecoveryMins?: number;
  onUpdateSpeedupRecovery?: (mins: number) => void;
  multiStationInjections?: StationCircumstance[];
  onUpdateMultiStationInjections?: (injections: StationCircumstance[]) => void;
}

const STEPS_CONFIG = [
  {
    step: 1 as StepIndex,
    title: 'Train Lookup',
    shortTitle: '1. Train',
    description: 'Timetable & Slack',
    icon: Train,
  },
  {
    step: 2 as StepIndex,
    title: 'Disturbances',
    shortTitle: '2. Disturbances',
    description: '10 Shock Cases',
    icon: Sliders,
  },
  {
    step: 3 as StepIndex,
    title: 'Corridor Route',
    shortTitle: '3. Corridor',
    description: 'Hops & Sandbox',
    icon: Route,
  },
  {
    step: 4 as StepIndex,
    title: 'Delay Output',
    shortTitle: '4. Output',
    description: '5-Stage Derivation',
    icon: Sparkles,
  },
];

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export const EngineFormSlider: React.FC<EngineFormSliderProps> = ({
  selectedTrainNo,
  trainInfo,
  onSelectTrain,
  isLoading,
  onTrackRailRadar,
  railRadarData,
  isTrackingRailRadar,
  isFrozen,
  onToggleFreeze,
  cases,
  onChangeCase,
  onResetCases,
  onApplyPreset,
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
  onCalculate,
  predictionResult,
  currentStep: controlledStep,
  onStepChange,
  sectionDelayMins,
  onUpdateSectionDelay,
  speedupRecoveryMins,
  onUpdateSpeedupRecovery,
  multiStationInjections,
  onUpdateMultiStationInjections,
}) => {
  const [internalStep, setInternalStep] = useState<StepIndex>(1);
  const [direction, setDirection] = useState<number>(1);
  const [showLiveGps, setShowLiveGps] = useState<boolean>(false);
  const [autoAdvanceNotice, setAutoAdvanceNotice] = useState<string | null>(null);
  const [telemetryCountdown, setTelemetryCountdown] = useState<number | null>(null);
  const lastFetchedDataRef = useRef<any>(null);

  const activeStep: StepIndex = controlledStep !== undefined ? controlledStep : internalStep;

  const goToStep = (step: StepIndex) => {
    if (step === activeStep) return;
    setTelemetryCountdown(null);
    setDirection(step > activeStep ? 1 : -1);
    if (onStepChange) {
      onStepChange(step);
    } else {
      setInternalStep(step);
    }
    setAutoAdvanceNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (
      activeStep === 1 &&
      railRadarData &&
      railRadarData !== lastFetchedDataRef.current &&
      !isTrackingRailRadar
    ) {
      lastFetchedDataRef.current = railRadarData;
      setShowLiveGps(true);
      setTelemetryCountdown(6);
    }
  }, [railRadarData, isTrackingRailRadar, activeStep]);

  useEffect(() => {
    if (telemetryCountdown === null) return;

    if (telemetryCountdown <= 0) {
      setTelemetryCountdown(null);
      goToStep(2);
      return;
    }

    const timer = setTimeout(() => {
      setTelemetryCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [telemetryCountdown]);

  const nextStep = () => {
    if (activeStep < 4) {
      goToStep((activeStep + 1) as StepIndex);
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      goToStep((activeStep - 1) as StepIndex);
    }
  };

  const handleTrainSelectedWithSlider = (trainNo: string) => {
    onSelectTrain(trainNo);
    setAutoAdvanceNotice(`Train ${trainNo} picked! Moving to Step 2...`);
    const timer = setTimeout(() => {
      goToStep(2);
      setAutoAdvanceNotice(null);
    }, 600);
    return () => clearTimeout(timer);
  };

  const handleCalculateAndSlide = () => {
    onCalculate();
    goToStep(4);
  };

  return (
    <div className="w-full pb-4">
      {/* 1. Mobile Step Progress Tracker */}
      <div className="bg-white rounded-2xl p-3 mb-3 border border-slate-200/90 shadow-xs">
        {/* Progress Bar Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-irctc-blue text-white text-[11px] font-black flex items-center justify-center">
              {activeStep}
            </span>
            <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
              Step {activeStep} of 4: {STEPS_CONFIG[activeStep - 1].title}
            </span>
          </div>

          {predictionResult && (
            <button
              type="button"
              onClick={() => goToStep(4)}
              className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 active:scale-95"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>ETA Ready</span>
            </button>
          )}
        </div>

        {/* 4 Segment Step Tabs */}
        <div className="grid grid-cols-4 gap-1.5">
          {STEPS_CONFIG.map((s) => {
            const Icon = s.icon;
            const isActive = activeStep === s.step;
            const isCompleted =
              s.step === 1
                ? Boolean(trainInfo)
                : s.step === 2
                ? Boolean(cases.train_tier)
                : s.step === 3
                ? Boolean(selectedSegment || corridor)
                : Boolean(predictionResult);

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => goToStep(s.step)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-irctc-blue text-white border-irctc-blue shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : ''}`} />
                  <span className="text-[10px] font-black leading-none">{s.step}</span>
                </div>
                <span className="text-[9.5px] font-bold truncate max-w-full leading-tight">
                  {s.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Auto-advance notification */}
        {autoAdvanceNotice && (
          <div className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-between animate-pulse">
            <span>{autoAdvanceNotice}</span>
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="text-[10px] underline font-black"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* 2. Slide Content with Touch Padding */}
      <div className="w-full">
        <AnimatePresence mode="wait" custom={direction}>
          {/* Step 1: Train Search & Schedule Lookup */}
          {activeStep === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full space-y-3"
            >
              <TrainSearch
                selectedTrainNo={selectedTrainNo}
                trainInfo={trainInfo}
                onSelectTrain={handleTrainSelectedWithSlider}
                isLoading={isLoading}
              />

              {/* Optional RailRadar Telemetry Card */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs">
                <button
                  type="button"
                  onClick={() => setShowLiveGps((prev) => !prev)}
                  className="w-full flex items-center justify-between text-xs font-black text-irctc-blue cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-irctc-orange animate-pulse" />
                    <span>Live GPS Ground Truth Telemetry</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {showLiveGps ? 'Hide ▲' : 'Open ▼'}
                  </span>
                </button>

                {showLiveGps && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <RailRadarTracker
                      selectedTrainNo={selectedTrainNo}
                      onTrackTrain={onTrackRailRadar}
                      railRadarData={railRadarData}
                      isLoading={isTrackingRailRadar}
                      isFrozen={isFrozen}
                      onToggleFreeze={onToggleFreeze}
                      trainInfo={trainInfo}
                      segments={segments}
                      selectedSegment={selectedSegment}
                      onChangeSegment={onChangeSegment}
                      sectionDelayMins={sectionDelayMins}
                      onUpdateSectionDelay={onUpdateSectionDelay}
                      speedupRecoveryMins={speedupRecoveryMins}
                      onUpdateSpeedupRecovery={onUpdateSpeedupRecovery}
                      multiStationInjections={multiStationInjections}
                      onUpdateMultiStationInjections={onUpdateMultiStationInjections}
                      countdownSeconds={telemetryCountdown}
                      onAdvanceToDisturbances={() => goToStep(2)}
                      onCancelCountdown={() => setTelemetryCountdown(null)}
                    />
                  </div>
                )}
              </div>

              {/* Step 1 Estimated ETA Schedule & Derivation Quick Card */}
              {predictionResult && (
                <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-2xl p-4 shadow-sm border border-indigo-700/50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-300" />
                      <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                        Estimated ETA Schedule
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        predictionResult.math_resolution.Arrival_Status === 'LATE'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {predictionResult.math_resolution.Arrival_Status === 'LATE' ? 'DELAYED' : 'ON TIME'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-white/5 rounded-xl p-2.5 border border-white/10">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Scheduled Arrival</span>
                      <span className="text-sm font-mono font-bold text-slate-200">
                        {trainInfo?.scheduled_arrival || '--:--'}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                        {trainInfo?.destination_station || 'Dest Station'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-300 font-bold block">Predicted ETA</span>
                      <span className="text-base font-mono font-black text-white">
                        {predictionResult.math_resolution.Predicted_ETA}
                      </span>
                      <span className="text-[10px] font-bold text-rose-300 block">
                        Net Delay: +{predictionResult.math_resolution.NetDelay}m
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => goToStep(4)}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-irctc-orange to-amber-500 hover:from-irctc-orange-dark hover:to-amber-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer"
                  >
                    <span>View Complete 5-Stage Derivation Schedule (Step 4)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Operational Disturbance Matrix */}
          {activeStep === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full space-y-3"
            >
              <OperationalControls
                cases={cases}
                onChangeCase={onChangeCase}
                onResetCases={onResetCases}
                onApplyPreset={onApplyPreset}
                isFrozen={isFrozen}
                lockReason={railRadarData?.frozen_controls?.lock_reason}
                onToggleFreeze={onToggleFreeze}
                trainInfo={trainInfo}
                selectedTrainNo={selectedTrainNo}
                segments={segments}
                selectedSegment={selectedSegment}
                onChangeSegment={onChangeSegment}
                sectionDelayMins={sectionDelayMins}
                onUpdateSectionDelay={onUpdateSectionDelay}
                speedupRecoveryMins={speedupRecoveryMins}
                onUpdateSpeedupRecovery={onUpdateSpeedupRecovery}
                multiStationInjections={multiStationInjections}
                onUpdateMultiStationInjections={onUpdateMultiStationInjections}
              />
            </motion.div>
          )}

          {/* Step 3: Corridor Route & State Segmentation */}
          {activeStep === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full space-y-3"
            >
              <SegmentationControls
                corridor={corridor}
                onChangeCorridor={onChangeCorridor}
                borderCrossing={borderCrossing}
                onChangeBorderCrossing={onChangeBorderCrossing}
                selectedSegment={selectedSegment}
                onChangeSegment={onChangeSegment}
                segments={segments}
                dbStatus={dbStatus}
                onPushToDb={onPushToDb}
                onResetDb={onResetDb}
                isPushing={isPushing}
                isResetting={isResetting}
                toastMessage={toastMessage}
                isFrozen={isFrozen}
                lockReason={railRadarData?.frozen_controls?.lock_reason}
              />

              <MultiSegmentCircumstances
                trainInfo={trainInfo}
                segments={segments}
                multiStationInjections={multiStationInjections || []}
                onUpdateMultiStationInjections={onUpdateMultiStationInjections || (() => {})}
                isFrozen={isFrozen}
                lockReason={railRadarData?.frozen_controls?.lock_reason}
              />
            </motion.div>
          )}

          {/* Step 4: Simulation Output & Mathematical Derivation */}
          {activeStep === 4 && (
            <motion.div
              key="step-4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full space-y-3"
            >
              {/* Mobile Quick Action Top Bar */}
              <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Step 3</span>
                </button>

                <div className="text-[11px] font-mono font-black text-irctc-blue truncate">
                  Train {selectedTrainNo}
                </div>

                <button
                  type="button"
                  onClick={onCalculate}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-xs font-bold text-white bg-irctc-orange hover:bg-irctc-orange-dark px-3 py-1.5 rounded-xl shadow-xs disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Recalculate</span>
                </button>
              </div>

              {isLoading ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
                  <div className="w-10 h-10 mx-auto mb-3 border-4 border-irctc-blue border-t-transparent rounded-full animate-spin" />
                  <h3 className="text-sm font-extrabold text-irctc-blue mb-1">
                    Evaluating 5-Stage Delay Derivation...
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Cross-referencing timetable slack, headway, and conflicts for Train {selectedTrainNo}.
                  </p>
                </div>
              ) : predictionResult ? (
                <>
                  <ResultsDashboard result={predictionResult} isLoading={isLoading} />
                  <DelayReasonsCard
                    predictionResult={predictionResult}
                    cases={cases}
                    isLocked={isFrozen}
                    sectionDelayMins={sectionDelayMins || 15}
                    onUnlock={onToggleFreeze}
                  />
                  {/* <DelayExplanation explanation={predictionResult.explanation || null} /> */}
                  <CascadedDelays cascaded={predictionResult.cascaded_delays || null} />
                </>
              ) : (
                <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-xs">
                  <p className="text-xs font-bold text-slate-700 mb-3">
                    No output computed for Train {selectedTrainNo} yet.
                  </p>
                  <button
                    type="button"
                    onClick={onCalculate}
                    className="w-full py-3 rounded-xl bg-irctc-orange text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 text-amber-200" />
                    <span>Calculate Compound Delay Now</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Mobile Action Dock */}
      <div className="pt-4 pb-2">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-2.5 shadow-md flex items-center justify-between gap-2">
          {activeStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-1 py-2.5 px-3.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <span className="text-[11px] font-bold text-slate-400 pl-2">Step 1 of 4</span>
          )}

          {activeStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-irctc-blue hover:bg-irctc-blue-dark text-white font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span>Continue to Step {activeStep + 1}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : activeStep === 3 ? (
            <button
              type="button"
              onClick={handleCalculateAndSlide}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-irctc-orange to-amber-500 hover:from-irctc-orange-dark hover:to-orange-600 text-white font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            >
              <Zap className={`w-4 h-4 text-amber-200 fill-amber-200 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'CALCULATING...' : 'COMPUTE COMPOUND ETA'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-irctc-blue hover:bg-irctc-blue-dark text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Train className="w-4 h-4" />
              <span>Search Another Train</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
