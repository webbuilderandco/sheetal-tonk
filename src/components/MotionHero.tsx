import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { hotelAudio } from './AudioSynthesizer';
import { 
  Sparkles, 
  MapPin, 
  Star, 
  CalendarCheck, 
  Sun, 
  Sunset, 
  Moon, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Check, 
  Compass,
  Building2,
  UtensilsCrossed,
  PartyPopper,
  BedDouble
} from 'lucide-react';

interface MotionHeroProps {
  onOpenBooking: (roomOrEvent?: string) => void;
  onExploreRooms: () => void;
}

interface BuildingHotspot {
  id: string;
  label: string;
  category: string;
  desc: string;
  xPercent: number; // percentage from left
  yPercent: number; // percentage from top
  icon: React.ReactNode;
}

const REAL_HOTEL_HOTSPOTS: BuildingHotspot[] = [
  {
    id: 'signboard',
    label: 'Rooftop Landmark Sign',
    category: 'NH-52 Identification',
    desc: 'High-visibility "HOTEL SHEETAL TONK" rooftop signboard visible from the Jaipur-Kota National Highway.',
    xPercent: 52,
    yPercent: 18,
    icon: <Building2 className="w-3.5 h-3.5" />,
  },
  {
    id: 'rooms',
    label: 'Deluxe AC Guest Chambers',
    category: 'Accommodation Wing',
    desc: 'Air-conditioned executive and family rooms with modern amenities, soundproof windows, and private baths.',
    xPercent: 42,
    yPercent: 35,
    icon: <BedDouble className="w-3.5 h-3.5" />,
  },
  {
    id: 'restaurant',
    label: 'Panoramic Glass Restaurant',
    category: 'Dining & Banquets',
    desc: 'Spacious ground and mezzanine glass-front restaurant serving pure desi ghee Rajasthani and North Indian dishes.',
    xPercent: 62,
    yPercent: 58,
    icon: <UtensilsCrossed className="w-3.5 h-3.5" />,
  },
  {
    id: 'lawn',
    label: 'Marriage & Celebration Lawn',
    category: 'Event Grounds',
    desc: 'Lush open-air green lawn with festive red drapery, DJ stage setup, and capacity for 1,500+ wedding guests.',
    xPercent: 12,
    yPercent: 70,
    icon: <PartyPopper className="w-3.5 h-3.5" />,
  },
];

export const MotionHero: React.FC<MotionHeroProps> = ({ onOpenBooking, onExploreRooms }) => {
  const [activeAmbiance, setActiveAmbiance] = useState<'day' | 'twilight' | 'night'>('twilight');
  const [activeHotspot, setActiveHotspot] = useState<BuildingHotspot | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(hotelAudio.getStatus());

  // Mouse Parallax coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleAudioToggle = () => {
    const status = hotelAudio.toggle();
    setIsPlayingAudio(status);
  };

  // Color filters and motion ambiance
  const getFilterStyle = () => {
    switch (activeAmbiance) {
      case 'twilight':
        return 'sepia-[0.25] saturate-[1.3] hue-rotate-[-10deg] brightness-[0.98] contrast-[1.08]';
      case 'night':
        return 'brightness-[0.72] contrast-[1.25] saturate-[0.85] hue-rotate-[195deg]';
      case 'day':
      default:
        return 'saturate-[1.1] contrast-[1.05] brightness-[1.02]';
    }
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[92vh] pt-24 pb-16 px-6 overflow-hidden flex flex-col justify-center bg-[#090b12]"
    >
      {/* Dynamic Animated Motion Graphic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated Radial Gradients */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: activeAmbiance === 'twilight' ? [0.25, 0.4, 0.25] : [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[120px] ${
            activeAmbiance === 'twilight'
              ? 'bg-[#d4af37]/30'
              : activeAmbiance === 'night'
              ? 'bg-[#1e3a8a]/35'
              : 'bg-[#f59e0b]/20'
          }`}
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-32 -right-32 w-[650px] h-[650px] rounded-full bg-[#c5a059]/20 blur-[140px]"
        />

        {/* Motion Graphic Floating Sacred Mandala Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] opacity-[0.035] text-[#d4af37]"
        >
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
            <circle cx="50" cy="50" r="48" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="38" />
            <circle cx="50" cy="50" r="28" strokeDasharray="2 2" />
            <polygon points="50,2 62,38 98,50 62,62 50,98 38,62 2,50 38,38" />
            <polygon points="50,14 59,41 86,50 59,59 50,86 41,59 14,50 41,41" />
          </svg>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Kinetic Typography & Actions (5 cols) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 space-y-6"
        >
          {/* Animated Kicker Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161c2d] border border-[#d4af37]/30 text-xs font-medium text-[#d4af37] shadow-inner">
            <motion.span
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </motion.span>
            <span className="tracking-wide">Highway Landmark · Tonk, Rajasthan</span>
          </div>

          {/* Kinetic Main Headline */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-cinzel font-bold text-white tracking-tight leading-[1.08]">
              HOTEL
              <span className="block text-[#d4af37] drop-shadow-sm">
                SHEETAL
              </span>
              <span className="block text-2xl sm:text-3xl font-light text-slate-300 font-sans tracking-wide">
                TONK, RAJASTHAN
              </span>
            </h1>
          </div>

          {/* Subtext with Authentic Proximity */}
          <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed max-w-lg">
            Experience comfortable highway hospitality at Hotel Sheetal Tonk. Featuring AC deluxe suites, spacious multi-cuisine restaurant, and grand open-air celebration lawns on Jaipur–Kota Highway NH-52.
          </p>

          {/* Trust Metrics Pill Strip */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-slate-200">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <span className="font-bold text-white font-mono">4.7</span>
              <span className="text-slate-400 font-mono">(1,200+ Reviews)</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Jaipur-Kota NH-52</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenBooking()}
              className="px-6 py-3 bg-[#d4af37] hover:bg-[#e6c150] text-black font-bold text-xs md:text-sm rounded-xl transition-colors shadow-lg flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book Your Stay Now</span>
            </motion.button>

            <button
              onClick={onExploreRooms}
              className="px-5 py-3 bg-[#131929] hover:bg-[#1a233a] text-white text-xs md:text-sm font-medium rounded-xl border border-white/10 transition-colors"
            >
              View Room Tariffs
            </button>
          </div>

          {/* Ambiance Switcher & Audio Controls */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mr-1">
                Ambiance:
              </span>
              <button
                onClick={() => setActiveAmbiance('day')}
                className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  activeAmbiance === 'day'
                    ? 'bg-[#d4af37] text-black font-semibold'
                    : 'bg-black/40 text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Day</span>
              </button>
              <button
                onClick={() => setActiveAmbiance('twilight')}
                className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  activeAmbiance === 'twilight'
                    ? 'bg-[#d4af37] text-black font-semibold'
                    : 'bg-black/40 text-slate-400 hover:text-white'
                }`}
              >
                <Sunset className="w-3 h-3" />
                <span>Sunset</span>
              </button>
              <button
                onClick={() => setActiveAmbiance('night')}
                className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  activeAmbiance === 'night'
                    ? 'bg-[#d4af37] text-black font-semibold'
                    : 'bg-black/40 text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Night</span>
              </button>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={handleAudioToggle}
              className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors border ${
                isPlayingAudio
                  ? 'bg-[#d4af37] text-black border-[#d4af37] font-semibold'
                  : 'bg-black/40 text-slate-300 border-white/10 hover:text-white'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Rajasthani Ambience</span>
                  {/* Motion Equalizer Bars */}
                  <span className="flex items-center gap-0.5 ml-1">
                    <motion.span
                      animate={{ height: ['4px', '12px', '4px'] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="w-0.5 bg-black rounded"
                    />
                    <motion.span
                      animate={{ height: ['8px', '16px', '6px'] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="w-0.5 bg-black rounded"
                    />
                    <motion.span
                      animate={{ height: ['4px', '10px', '4px'] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                      className="w-0.5 bg-black rounded"
                    />
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Palace Music</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Right Column: Real Sheetal Hotel Interactive Photo Showcase (7 cols) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 relative"
        >
          {/* Motion Graphics Border Frame */}
          <div className="relative rounded-3xl p-1.5 bg-gradient-to-br from-[#d4af37]/60 via-white/10 to-[#d4af37]/40 shadow-2xl overflow-hidden group">
            
            {/* Animated Light Sweep Beam */}
            <motion.div
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatDelay: 4,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none z-30"
            />

            {/* Container for Image with Parallax Shift */}
            <div className="relative rounded-[22px] overflow-hidden bg-[#0c101a] border border-white/10">
              
              {/* Hotel Photo Image with Ambiance Grading */}
              <motion.div
                animate={{
                  x: mousePos.x * 12,
                  y: mousePos.y * 12,
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className="relative overflow-hidden aspect-[16/10] sm:aspect-[16/9] w-full"
              >
                <img
                  src="/assets/aistudio/IMG_593e5e95-1a17-4dde-ada0-fdcb5130a302_8fac63e9.webp"
                  alt="Hotel Sheetal Tonk Rajasthan - Official Property Exterior on NH-52"
                  className={`w-full h-full object-cover transition-all duration-700 ${getFilterStyle()}`}
                />

                {/* Night Lighting Overlays on Building */}
                {activeAmbiance === 'night' && (
                  <>
                    {/* Glowing Hotel Sheetal Tonk Signboard Emissive Layer */}
                    <div className="absolute top-[16%] left-[48%] -translate-x-1/2 w-32 h-10 bg-cyan-400/20 blur-md rounded pointer-events-none" />
                    <div className="absolute top-[17%] left-[48%] -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-bold text-cyan-200 tracking-wider border border-cyan-300/40 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.8)] pointer-events-none">
                      HOTEL SHEETAL TONK
                    </div>

                    {/* Warm glowing window illuminations */}
                    <div className="absolute top-[32%] left-[40%] w-8 h-8 bg-amber-400/25 blur-sm rounded pointer-events-none" />
                    <div className="absolute top-[32%] left-[52%] w-8 h-8 bg-amber-400/25 blur-sm rounded pointer-events-none" />
                    <div className="absolute top-[52%] left-[36%] w-48 h-16 bg-amber-300/20 blur-md rounded pointer-events-none" />
                  </>
                )}

                {/* Twilight Golden Sunset Overlay */}
                {activeAmbiance === 'twilight' && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/20 via-orange-500/10 to-transparent pointer-events-none" />
                )}

                {/* Ambient Bottom Gradient Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
              </motion.div>

              {/* Interactive Motion Graphic Hotspot Pins overlaid directly on building features */}
              {REAL_HOTEL_HOTSPOTS.map((spot) => {
                const isSelected = activeHotspot?.id === spot.id;
                return (
                  <div
                    key={spot.id}
                    style={{
                      left: `${spot.xPercent}%`,
                      top: `${spot.yPercent}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                  >
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveHotspot(isSelected ? null : spot)}
                      className={`relative flex items-center justify-center p-2 rounded-full shadow-2xl transition-all ${
                        isSelected
                          ? 'bg-[#d4af37] text-black ring-4 ring-white/50 scale-110'
                          : 'bg-black/80 hover:bg-[#d4af37] text-white hover:text-black border border-white/30 backdrop-blur-md'
                      }`}
                      aria-label={`Highlight ${spot.label}`}
                    >
                      {spot.icon}
                      {/* Gentle Ripple Wave around hotspot pin */}
                      <span className="absolute inset-0 rounded-full border border-[#d4af37] animate-ping opacity-35 pointer-events-none" />
                    </motion.button>
                  </div>
                );
              })}

              {/* Top Banner Tag inside photo */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Real Property Exterior</span>
                </span>
              </div>

              {/* Bottom Feature Bar */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                <div className="px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-xs text-slate-200">
                  <span className="text-[#d4af37] font-semibold">Hotel Sheetal</span>
                  <span className="mx-1.5 text-slate-500">·</span>
                  <span>NH-52 Jaipur–Kota Highway, Tonk</span>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-[11px] text-slate-300">
                  <span>Click Pins to Explore Property</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Hotspot Motion Info Card */}
          <AnimatePresence>
            {activeHotspot && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 rounded-2xl bg-[#121626] border border-[#d4af37]/40 shadow-2xl text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider">
                      {activeHotspot.category}
                    </div>
                    <h4 className="text-base font-cinzel font-bold text-white">
                      {activeHotspot.label}
                    </h4>
                    <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                      {activeHotspot.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenBooking(activeHotspot.label)}
                    className="px-3.5 py-1.5 bg-[#d4af37] hover:bg-[#e6c150] text-black font-semibold text-xs rounded-lg transition-colors shrink-0"
                  >
                    Inquire Here
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
