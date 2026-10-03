'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header, NavTabType } from '@/components/Header';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { CorridorsExplorer } from '@/components/CorridorsExplorer';
// import { StateBordersExplorer } from '@/components/StateBordersExplorer';
import { EngineFormSlider } from '@/components/EngineFormSlider';
import { RailRadarTracker } from '@/components/RailRadarTracker';
import { LandingPage } from '@/components/LandingPage';
import { StationAmenitiesExplorer } from '@/components/StationAmenitiesExplorer';
import {
  TrainInfo,
  OperationalCases,
  RouteSegment,
  PredictionResult,
  DbSimulationStatus,
  RailRadarMatchResponse,
  StationCircumstance,
} from '@/types';
import { Smartphone, Maximize2, Minimize2 } from 'lucide-react';

const DEFAULT_LOCKED_MODERATE_CASES: OperationalCases = {
  train_tier: 'T1_PREMIUM',
  weather: 'Fog',
  tsr_level: 'Minor',
  priority_congestion: 'Medium',
  treta_block_occupancy: 'Preceding_Delayed_Minor',
  crossing_conflict: 'Minor_Crossing_Wait',
  alarm_chain_pulling: '0_Events',
  engine_failure: 'Nominal',
  terminal_platform_hold: 'Platform_Available',
  crew_duty_status: 'Duty_Valid',
  treta_segment_number: '',
};

export default function Home() {
  const [selectedTrainNo, setSelectedTrainNo] = useState<string>('12001');
  const [trainInfo, setTrainInfo] = useState<TrainInfo | null>(null);
  const [cases, setCases] = useState<OperationalCases>(DEFAULT_LOCKED_MODERATE_CASES);
  const [corridor, setCorridor] = useState<string>('ALL');
  const [borderCrossing, setBorderCrossing] = useState<string>('ALL');
  const [selectedSegment, setSelectedSegment] = useState<string>('');
  const [segments, setSegments] = useState<RouteSegment[]>([]);
  const [dbStatus, setDbStatus] = useState<DbSimulationStatus | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isSuccess: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<NavTabType>('home');
  const [railRadarData, setRailRadarData] = useState<RailRadarMatchResponse | null>(null);
  const [isFrozen, setIsFrozen] = useState<boolean>(true);
  const [isTrackingRailRadar, setIsTrackingRailRadar] = useState<boolean>(false);
  const [sliderStep, setSliderStep] = useState<1 | 2 | 3 | 4>(1);
  const [sectionDelayMins, setSectionDelayMins] = useState<number>(15);
  const [speedupRecoveryMins, setSpeedupRecoveryMins] = useState<number>(0);
  const [multiStationInjections, setMultiStationInjections] = useState<StationCircumstance[]>([]);
  const [isFramedView, setIsFramedView] = useState<boolean>(true);

  const showToast = (text: string, isSuccess: boolean = true) => {
    setToastMessage({ text, isSuccess });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleSelectCorridorFromExplorer = (corrSlug: string) => {
    handleChangeCorridor(corrSlug);
    setActiveTab('engine');
    showToast(`Corridor ${corrSlug} selected. Switched to Delay Engine.`, true);
  };

  // 1. Fetch DB Status
  const fetchDbStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/simulation/status');
      if (res.ok) {
        const data: DbSimulationStatus = await res.json();
        setDbStatus(data);
      }
    } catch (e) {
      console.warn('Failed to fetch DB status:', e);
    }
  }, []);

  // 2. Fetch Segments list
  const fetchSegments = useCallback(
    async (corr: string, crossing: string, tNo: string) => {
      try {
        const params = new URLSearchParams();
        if (corr && corr !== 'ALL') params.append('corridor_slug', corr);
        if (crossing !== 'ALL') params.append('is_border_crossing', crossing);
        if (tNo) params.append('train_no', tNo);
        params.append('limit', '300');

        const res = await fetch(`/api/segments?${params.toString()}`);
        if (res.ok) {
          const data: RouteSegment[] = await res.json();
          setSegments(data);
        }
      } catch (e) {
        console.error('Failed to fetch segments:', e);
      }
    },
    []
  );

  // 3. Predict Compound Delay
  const calculatePrediction = useCallback(
    async (
      currentCases: OperationalCases,
      tNo: string,
      segNo: string,
      secDelayOverride?: number,
      speedupOverride?: number,
      multiInjOverride?: StationCircumstance[]
    ) => {
      setIsLoading(true);
      try {
        const secMins = secDelayOverride !== undefined ? secDelayOverride : (currentCases.section_delay_mins ?? sectionDelayMins ?? 0);
        const speedup = speedupOverride !== undefined ? speedupOverride : speedupRecoveryMins;
        const multiInj = multiInjOverride !== undefined ? multiInjOverride : multiStationInjections;

        const params = new URLSearchParams({
          train_no: tNo,
          train_tier: currentCases.train_tier,
          weather: currentCases.weather,
          congestion: currentCases.priority_congestion,
          tsr: currentCases.tsr_level,
          treta_block_occupancy: currentCases.treta_block_occupancy,
          crossing_conflict: currentCases.crossing_conflict,
          chain_pulling: currentCases.alarm_chain_pulling,
          engine_failure: currentCases.engine_failure,
          terminal_platform_hold: currentCases.terminal_platform_hold,
          crew_duty_status: currentCases.crew_duty_status,
          section_delay_mins: String(secMins),
          speedup_recovery_mins: String(speedup),
        });

        if (segNo) {
          params.append('treta_segment_number', segNo);
        }
        if (multiInj && multiInj.length > 0) {
          params.append('multi_station_injections', JSON.stringify(multiInj));
        }

        const res = await fetch(`/api/predict?${params.toString()}`);
        if (res.ok) {
          const data: PredictionResult = await res.json();
          setPredictionResult(data);
        }
      } catch (e) {
        console.error('Prediction calculation failed:', e);
      } finally {
        setIsLoading(false);
      }
    },
    [sectionDelayMins, speedupRecoveryMins, multiStationInjections]
  );

  // 4. Select and Auto-Pickup Train
  const handleSelectTrain = useCallback(
    async (tNo: string, shouldCalculate: boolean = false) => {
      setSelectedTrainNo(tNo);
      setSelectedSegment('');
      setPredictionResult(null);
      try {
        const res = await fetch(`/api/train_info?train_no=${encodeURIComponent(tNo)}`);
        if (res.ok) {
          const data: TrainInfo = await res.json();
          if (!data.error) {
            const tier = data.train_tier || 'T1_PREMIUM';
            const autoSpeedup = typeof data.default_speedup_recovery_mins === 'number'
              ? data.default_speedup_recovery_mins
              : (tier.startsWith('T1') ? 20 : (tier.startsWith('T2') ? 15 : 10));
            setSpeedupRecoveryMins(autoSpeedup);

            const nextCases: OperationalCases = {
              ...DEFAULT_LOCKED_MODERATE_CASES,
              train_tier: tier,
              treta_segment_number: '',
            };
            setCases(nextCases);

            if (data.segments && data.segments.length > 0) {
              setSegments(data.segments);
              setCorridor(data.relevant_corridor_slug || 'ALL');
            } else {
              fetchSegments('ALL', 'ALL', tNo);
            }

            if (shouldCalculate) {
              calculatePrediction(nextCases, tNo, '', 15);
            }
          }
        }
      } catch (e) {
        console.error('Failed to auto-pickup train info:', e);
      }
    },
    [fetchSegments, calculatePrediction]
  );

  useEffect(() => {
    fetchDbStatus();
    handleSelectTrain('12001', true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExecuteCalculate = async () => {
    setActiveTab('engine');
    setSliderStep(4);
    await calculatePrediction(cases, selectedTrainNo, selectedSegment);
  };

  const handleChangeCase = (field: keyof OperationalCases, value: string) => {
    const updated = { ...cases, [field]: value };
    setCases(updated);
    if (sliderStep === 4) {
      calculatePrediction(updated, selectedTrainNo, selectedSegment);
    }
  };

  const handleChangeCorridor = (newCorridor: string) => {
    setCorridor(newCorridor);
    fetchSegments(newCorridor, borderCrossing, selectedTrainNo);
  };

  const handleChangeBorderCrossing = (newCrossing: string) => {
    setBorderCrossing(newCrossing);
    fetchSegments(corridor, newCrossing, selectedTrainNo);
  };

  const handleChangeSegment = (segNum: string) => {
    setSelectedSegment(segNum);
    const updatedCases = { ...cases, treta_segment_number: segNum };
    setCases(updatedCases);
    if (sliderStep === 4) {
      calculatePrediction(updatedCases, selectedTrainNo, segNum);
    }
  };

  const handleResetCases = () => {
    const reset = {
      ...DEFAULT_LOCKED_MODERATE_CASES,
      train_tier: trainInfo?.train_tier || 'T1_PREMIUM',
      treta_segment_number: selectedSegment,
    };
    setCases(reset);
    if (sliderStep === 4) {
      calculatePrediction(reset, selectedTrainNo, selectedSegment);
    }
    showToast('Reset disturbance cases to ideal baseline (±0m).', true);
  };

  const handleApplyPreset = (presetName: string) => {
    let presetCases: OperationalCases = {
      ...cases,
      train_tier: trainInfo?.train_tier || cases.train_tier,
    };

    switch (presetName) {
      case 'ideal':
        presetCases = {
          ...presetCases,
          weather: 'Clear',
          tsr_level: 'None',
          priority_congestion: 'None',
          treta_block_occupancy: 'Track_Clear',
          crossing_conflict: 'Double_Quad_Track',
          alarm_chain_pulling: '0_Events',
          engine_failure: 'Nominal',
          terminal_platform_hold: 'Platform_Available',
          crew_duty_status: 'Duty_Valid',
        };
        break;
      case 'fog':
        presetCases = {
          ...presetCases,
          weather: 'Fog',
          tsr_level: 'Minor',
          priority_congestion: 'High',
          treta_block_occupancy: 'Preceding_Delayed_Minor',
        };
        break;
      case 'monsoon':
        presetCases = {
          ...presetCases,
          weather: 'Heavy_Rain',
          crossing_conflict: 'Minor_Crossing_Wait',
          priority_congestion: 'Low',
          tsr_level: 'Minor',
        };
        break;
      case 'breakdown':
        presetCases = {
          ...presetCases,
          engine_failure: 'Failure',
          alarm_chain_pulling: '1_Event',
          treta_block_occupancy: 'Preceding_Delayed_Moderate',
        };
        break;
      case 'border':
        presetCases = {
          ...presetCases,
          priority_congestion: 'High',
          crew_duty_status: 'Duty_Exceeded',
          crossing_conflict: 'Major_Crossing_Wait',
        };
        break;
    }

    setCases(presetCases);
    if (sliderStep === 4) {
      calculatePrediction(presetCases, selectedTrainNo, selectedSegment);
    }
    showToast(`Applied preset: ${presetName.toUpperCase()}`, true);
  };

  const handleTrackRailRadar = async (
    trainNo: string,
    sectionDelay?: number,
    customSegment?: string,
    speedupRecovery?: number,
    multiInjections?: StationCircumstance[]
  ) => {
    setIsTrackingRailRadar(true);
    try {
      const secDelay = typeof sectionDelay === 'number' ? sectionDelay : sectionDelayMins;
      const targetSeg = customSegment !== undefined ? customSegment : selectedSegment;
      const speedup = typeof speedupRecovery === 'number' ? speedupRecovery : speedupRecoveryMins;
      const multiInj = multiInjections !== undefined ? multiInjections : multiStationInjections;

      const params = new URLSearchParams({
        train_no: trainNo,
        section_delay_mins: String(secDelay),
        speedup_recovery_mins: String(speedup),
      });
      if (targetSeg) {
        params.append('treta_segment_number', targetSeg);
      }
      if (multiInj && multiInj.length > 0) {
        params.append('multi_station_injections', JSON.stringify(multiInj));
      }

      const [resRailRadar, resTrainInfo] = await Promise.all([
        fetch(`/api/railradar/auto_fetch_and_freeze?${params.toString()}`),
        fetch(`/api/train_info?train_no=${encodeURIComponent(trainNo)}`)
      ]);

      if (!resRailRadar.ok) throw new Error('Failed to fetch live telemetry');
      const data: RailRadarMatchResponse = await resRailRadar.json();

      if (resTrainInfo.ok) {
        const infoData: TrainInfo = await resTrainInfo.json();
        if (!infoData.error) {
          setTrainInfo(infoData);
          if (infoData.segments && infoData.segments.length > 0) {
            setSegments(infoData.segments);
          }
          if (infoData.relevant_corridor_slug) {
            setCorridor(infoData.relevant_corridor_slug);
          }
          const tier = infoData.train_tier || 'T1_PREMIUM';
          setCases((prev) => ({
            ...prev,
            train_tier: tier,
          }));
          const autoSpeedup = typeof infoData.default_speedup_recovery_mins === 'number'
            ? infoData.default_speedup_recovery_mins
            : (tier.startsWith('T1') ? 20 : (tier.startsWith('T2') ? 15 : 10));
          setSpeedupRecoveryMins(autoSpeedup);
        }
      }

      setRailRadarData(data);
      const effectiveTrainNo = data.train_no || trainNo;
      setSelectedTrainNo(effectiveTrainNo);
      if (typeof sectionDelay === 'number') {
        setSectionDelayMins(sectionDelay);
      }
      if (typeof speedupRecovery === 'number') {
        setSpeedupRecoveryMins(speedupRecovery);
      }
      if (multiInjections !== undefined) {
        setMultiStationInjections(multiInjections);
      }

      if (data.frozen_controls) {
        setCorridor(data.frozen_controls.corridor);
        setBorderCrossing(data.frozen_controls.border_crossing);
        setSelectedSegment(data.frozen_controls.selected_segment);
        setCases(data.frozen_controls.cases);
      }

      if (data.prediction) {
        setPredictionResult(data.prediction);
      }

      const isLive = Boolean(data.railradar_raw?.isLive);
      setIsFrozen(isLive);
      fetchDbStatus();
      showToast(
        isLive
          ? `📡 Ground truth for ${data.train_name} synchronized!`
          : `ℹ️ Loaded Train ${data.train_no} (${data.train_name}).`,
        true
      );
    } catch (e: any) {
      showToast(e.message || 'Error tracking live location', false);
    } finally {
      setIsTrackingRailRadar(false);
    }
  };

  const handleUpdateSectionDelay = (mins: number, segNo?: string) => {
    const targetSeg = segNo !== undefined ? segNo : selectedSegment;
    setSectionDelayMins(mins);
    if (segNo !== undefined) setSelectedSegment(segNo);

    if (railRadarData) {
      handleTrackRailRadar(selectedTrainNo, mins, targetSeg, speedupRecoveryMins, multiStationInjections);
    } else {
      const updated = { ...cases, treta_segment_number: targetSeg, section_delay_mins: mins };
      setCases(updated);
      calculatePrediction(updated, selectedTrainNo, targetSeg, mins, speedupRecoveryMins, multiStationInjections);
    }
    showToast(`Injected +${mins}m delay on ${targetSeg || 'route hop'}.`, true);
  };

  const handleUpdateSpeedupRecovery = (mins: number) => {
    setSpeedupRecoveryMins(mins);
    if (railRadarData) {
      handleTrackRailRadar(selectedTrainNo, sectionDelayMins, selectedSegment, mins, multiStationInjections);
    } else {
      calculatePrediction(cases, selectedTrainNo, selectedSegment, sectionDelayMins, mins, multiStationInjections);
    }
    showToast(mins > 0 ? `Speed Recovery: -${mins}m cover-up.` : `Speed Recovery reset to 0m.`, true);
  };

  const handleUpdateMultiStationInjections = (injections: StationCircumstance[]) => {
    setMultiStationInjections(injections);
    if (railRadarData) {
      handleTrackRailRadar(selectedTrainNo, sectionDelayMins, selectedSegment, speedupRecoveryMins, injections);
    } else {
      calculatePrediction(cases, selectedTrainNo, selectedSegment, sectionDelayMins, speedupRecoveryMins, injections);
    }
    showToast(`Updated ${injections.length} segment circumstance injections.`, true);
  };

  const handleToggleFreeze = () => {
    const next = !isFrozen;
    setIsFrozen(next);
    showToast(
      next
        ? '🔒 Live ground truth re-frozen into controls.'
        : '🔓 Controls unlocked for manual testing.',
      true
    );
  };

  const handlePushToDb = async () => {
    if (!predictionResult) return;
    setIsPushing(true);
    try {
      const payload = {
        train_no: selectedTrainNo,
        treta_segment_number: selectedSegment || null,
        sim_proposed_delay: predictionResult.math_resolution?.NetDelay ?? 0,
        sim_new_eta: predictionResult.math_resolution?.Predicted_ETA ?? '',
        sim_status: predictionResult.math_resolution?.Arrival_Status ?? 'ON_TIME',
        user_notes: `Mobile Simulation Push: ${cases.weather} / TSR: ${cases.tsr_level}`,
      };

      const res = await fetch('/api/simulation/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(`Saved what-if scenario to Simulation Sandbox.`, true);
        fetchDbStatus();
      } else {
        showToast('Failed to push simulation to database.', false);
      }
    } catch (e) {
      showToast('Network error while pushing to simulation database.', false);
    } finally {
      setIsPushing(false);
    }
  };

  const handleResetDb = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/simulation/reset', { method: 'POST' });
      if (res.ok) {
        showToast('Restored Simulation Sandbox from Baseline Matrix.', true);
        fetchDbStatus();
        calculatePrediction(cases, selectedTrainNo, selectedSegment);
      } else {
        showToast('Failed to reset simulation database.', false);
      }
    } catch (e) {
      showToast('Network error while resetting simulation database.', false);
    } finally {
      setIsResetting(false);
    }
  };

  const handleStartTrackAndPredict = async (tNo: string) => {
    setIsLoading(true);
    try {
      // 1. Lock default moderate delay baseline conditions
      setIsFrozen(true);
      setSectionDelayMins(15);
      const moderateCases: OperationalCases = {
        ...DEFAULT_LOCKED_MODERATE_CASES,
        train_tier: trainInfo?.train_tier || 'T1_PREMIUM',
        treta_segment_number: selectedSegment,
      };
      setCases(moderateCases);

      // 2. Fetch current live location and compute ETA with moderate conditions
      await handleTrackRailRadar(tNo, 15);
      showToast(`Current location auto-fetched. Locked moderate delay baseline applied for Train ${tNo}!`, true);
    } catch (e: any) {
      showToast(e.message || 'Error tracking live train', false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start p-0 sm:p-4 font-sans text-slate-900 select-none">
      {/* Desktop Mode Switcher Banner (allows user on desktop to toggle phone frame vs expanded mobile view) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md mb-2 px-2 text-slate-400 text-xs">
        <div className="flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-irctc-orange" />
          <span className="font-semibold text-slate-300">DTRS System • Mobile Edition</span>
        </div>
        <button
          type="button"
          onClick={() => setIsFramedView((prev) => !prev)}
          className="flex items-center gap-1 hover:text-white transition-colors bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60"
        >
          {isFramedView ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          <span>{isFramedView ? 'Full Width' : 'Phone Frame'}</span>
        </button>
      </div>

      {/* Mobile App Container Shell */}
      <div
        className={`w-full bg-slate-50 h-[100dvh] sm:h-[880px] sm:max-h-[96vh] relative flex flex-col transition-all duration-300 ${
          isFramedView
            ? 'max-w-md sm:rounded-[44px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] sm:border-[8px] sm:border-slate-800 overflow-hidden'
            : 'max-w-2xl sm:rounded-3xl sm:border border-slate-700 overflow-hidden shadow-2xl'
        }`}
      >
        {/* Mobile Top Header (Status Bar + App Bar + Context Bar) */}
        <div className="shrink-0 relative z-30 w-full">
          <Header
            trainInfo={trainInfo}
            selectedTrainNo={selectedTrainNo}
            onSearchSelect={(tNo) => {
              handleSelectTrain(tNo, true);
              setActiveTab('engine');
              handleExecuteCalculate();
            }}
            dbStatus={dbStatus}
            onRefreshDbStatus={fetchDbStatus}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onComputeClick={handleExecuteCalculate}
            onResetDb={handleResetDb}
            isResetting={isResetting}
          />
        </div>

        {/* Mobile Main Body (Scrolls smoothly inside the phone frame) */}
        <main className="flex-1 w-full overflow-y-auto px-3.5 py-3 overscroll-contain">
          {/* Tab 0: DTRS Landing Page (Train Lookup -> Current Location -> Locked Moderate Conditions -> ETA & Delay Reasons) */}
          {activeTab === 'home' && (
            <LandingPage
              onStartTrackAndPredict={handleStartTrackAndPredict}
              isLoading={isLoading || isTrackingRailRadar}
              selectedTrainNo={selectedTrainNo}
              trainInfo={trainInfo}
              predictionResult={predictionResult}
              railRadarData={railRadarData}
              cases={cases}
              isLocked={isFrozen}
              onUnlockConditions={() => {
                setIsFrozen(false);
                showToast('Conditions unlocked for custom sandbox testing.', true);
              }}
              onNavigateTab={setActiveTab}
              onOpenStep={(step) => {
                setActiveTab('engine');
                setSliderStep(step);
              }}
            />
          )}

          {/* Tab 1: Delay Engine (4-Step Flow) */}
          {activeTab === 'engine' && (
            <EngineFormSlider
              selectedTrainNo={selectedTrainNo}
              trainInfo={trainInfo}
              onSelectTrain={(tNo) => handleSelectTrain(tNo, false)}
              isLoading={isLoading}
              onTrackRailRadar={handleTrackRailRadar}
              railRadarData={railRadarData}
              isTrackingRailRadar={isTrackingRailRadar}
              isFrozen={isFrozen}
              onToggleFreeze={handleToggleFreeze}
              cases={cases}
              onChangeCase={handleChangeCase}
              onResetCases={handleResetCases}
              onApplyPreset={handleApplyPreset}
              corridor={corridor}
              onChangeCorridor={handleChangeCorridor}
              borderCrossing={borderCrossing}
              onChangeBorderCrossing={handleChangeBorderCrossing}
              selectedSegment={selectedSegment}
              onChangeSegment={handleChangeSegment}
              segments={segments}
              dbStatus={dbStatus}
              onPushToDb={handlePushToDb}
              onResetDb={handleResetDb}
              isPushing={isPushing}
              isResetting={isResetting}
              toastMessage={toastMessage}
              onCalculate={handleExecuteCalculate}
              predictionResult={predictionResult}
              currentStep={sliderStep}
              onStepChange={setSliderStep}
              sectionDelayMins={sectionDelayMins}
              onUpdateSectionDelay={handleUpdateSectionDelay}
              speedupRecoveryMins={speedupRecoveryMins}
              onUpdateSpeedupRecovery={handleUpdateSpeedupRecovery}
              multiStationInjections={multiStationInjections}
              onUpdateMultiStationInjections={handleUpdateMultiStationInjections}
            />
          )}

          {/* Tab 2: RailRadar Live GPS Ground Truth */}
          {activeTab === 'railradar' && (
            <div className="space-y-3 pb-4">
              <RailRadarTracker
                selectedTrainNo={selectedTrainNo}
                onTrackTrain={handleTrackRailRadar}
                railRadarData={railRadarData}
                isLoading={isTrackingRailRadar}
                isFrozen={isFrozen}
                onToggleFreeze={handleToggleFreeze}
                trainInfo={trainInfo}
                segments={segments}
                selectedSegment={selectedSegment}
                onChangeSegment={handleChangeSegment}
                sectionDelayMins={sectionDelayMins}
                onUpdateSectionDelay={handleUpdateSectionDelay}
                speedupRecoveryMins={speedupRecoveryMins}
                onUpdateSpeedupRecovery={handleUpdateSpeedupRecovery}
                multiStationInjections={multiStationInjections}
                onUpdateMultiStationInjections={handleUpdateMultiStationInjections}
                onAdvanceToDisturbances={() => {
                  setActiveTab('engine');
                  setSliderStep(2);
                }}
              />
            </div>
          )}

          {/* Tab 3: Station Amenities, Lodges & Restrooms */}
          {(activeTab === 'amenities' || (activeTab as string) === 'corridors') && (
            <div className="pb-4">
              <StationAmenitiesExplorer
                selectedTrainNo={selectedTrainNo}
                trainInfo={trainInfo}
                predictionResult={predictionResult}
                onSelectTrain={(tNo) => handleSelectTrain(tNo, false)}
                onNavigateTab={setActiveTab}
              />
            </div>
          )}

          {/* Tab 4: State Borders Explorer (Commented Out) */}
          {/* {activeTab === 'borders' && (
            <div className="pb-4">
              <StateBordersExplorer />
            </div>
          )} */}
        </main>

        {/* Mobile Bottom Navigation Dock (Locked inside the canvas at bottom) */}
        <div className="shrink-0 relative z-20 w-full">
          <MobileBottomNav
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            hasPrediction={Boolean(predictionResult)}
            isLiveTracking={isTrackingRailRadar}
          />
        </div>
      </div>
    </div>
  );
}
