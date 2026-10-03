'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Zap, Radio, Hotel, Landmark } from 'lucide-react';

export type NavTabType = 'home' | 'engine' | 'railradar' | 'amenities' | 'borders' | 'corridors';

interface MobileBottomNavProps {
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  hasPrediction?: boolean;
  isLiveTracking?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  hasPrediction = false,
  isLiveTracking = false,
}) => {
  const tabs = [
    {
      id: 'home' as NavTabType,
      label: 'Home',
      shortLabel: 'Home',
      icon: Home,
    },
    {
      id: 'engine' as NavTabType,
      label: 'Delay Engine',
      shortLabel: 'Engine',
      icon: Zap,
      badge: hasPrediction ? 'Ready' : undefined,
    },
    {
      id: 'railradar' as NavTabType,
      label: 'Live Telemetry',
      shortLabel: 'Radar',
      icon: Radio,
      badge: isLiveTracking ? 'Live' : undefined,
    },
    {
      id: 'amenities' as NavTabType,
      label: 'Station Amenities',
      shortLabel: 'Amenities',
      icon: Hotel,
      badge: 'Stays',
    },
    /* {
      id: 'borders' as NavTabType,
      label: 'State Borders',
      shortLabel: 'Borders',
      icon: Landmark,
      badge: '29',
    }, */
  ];

  return (
    <nav
      className="w-full bg-white/98 backdrop-blur-xl border-t border-slate-200/80 px-2 py-2 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.05)]"
      aria-label="Mobile Navigation Bar"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 select-none cursor-pointer ${
                isActive
                  ? 'text-irctc-blue font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              {/* Active Tab Background Pill */}
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-indicator"
                  className="absolute inset-0 bg-blue-50/90 rounded-2xl border border-blue-200/60"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}

              {/* Icon with relative badge */}
              <div className="relative z-10 flex items-center justify-center w-6 h-6">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-irctc-blue' : 'text-slate-500'
                  } ${tab.id === 'railradar' && isLiveTracking ? 'animate-pulse text-irctc-orange' : ''}`}
                />

                {/* Badge if present */}
                {tab.badge && (
                  <span
                    className={`absolute -top-1.5 -right-3 text-[9px] font-black px-1.5 py-0.2 rounded-full leading-tight shadow-2xs ${
                      tab.badge === 'Live'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : tab.badge === 'Ready'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="relative z-10 text-[10.5px] mt-1 tracking-tight leading-none">
                {tab.shortLabel}
              </span>

              {/* Tiny bottom active dot */}
              {isActive && (
                <span className="relative z-10 w-1 h-1 rounded-full bg-irctc-orange mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
