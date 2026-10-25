import React, { useState } from 'react';
import { CameraPreset, LightingMode, Hotspot } from './ThreeHotelCanvas';
import { hotelAudio } from './AudioSynthesizer';
import { 
  Compass, 
  Sun, 
  Moon, 
  Sunset, 
  Sparkles, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp, 
  Eye,
  Info,
  X
} from 'lucide-react';

interface ThreeControlDockProps {
  cameraPreset: CameraPreset;
  onCameraChange: (preset: CameraPreset) => void;
  lightingMode: LightingMode;
  onLightingChange: (mode: LightingMode) => void;
  petalsActive: boolean;
  onTogglePetals: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  activeHotspot: Hotspot | null;
  onCloseHotspot: () => void;
  onBookNow: () => void;
}

export const ThreeControlDock: React.FC<ThreeControlDockProps> = ({
  cameraPreset,
  onCameraChange,
  lightingMode,
  onLightingChange,
  petalsActive,
  onTogglePetals,
  autoRotate,
  onToggleAutoRotate,
  activeHotspot,
  onCloseHotspot,
  onBookNow,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(hotelAudio.getStatus());

  const handleAudioToggle = () => {
    const playing = hotelAudio.toggle();
    setIsAudioPlaying(playing);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-[min(960px,94vw)] flex flex-col items-center select-none pointer-events-auto">
      {/* Active 3D Hotspot Inspector Card (if user clicked a 3D hotspot in scene) */}
      {activeHotspot && !isCollapsed && (
        <div className="w-full mb-3 p-4 rounded-xl bg-[#0f131da6] backdrop-blur-md border border-[#d4af37]/40 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-2 text-left">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] tracking-widest text-[#d4af37] uppercase font-semibold">
                {activeHotspot.category}
              </div>
              <h4 className="text-lg font-cinzel font-semibold text-white mt-0.5">
                {activeHotspot.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {activeHotspot.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onBookNow}
                className="px-3 py-1.5 text-xs font-semibold text-black bg-[#d4af37] hover:bg-[#e6c150] rounded-lg transition-colors whitespace-nowrap"
              >
                Book Experience
              </button>
              <button
                onClick={onCloseHotspot}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close hotspot detail"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapse / Expand Cinema Drawer Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mb-2 px-3 py-1 text-xs font-medium tracking-wide text-slate-300 hover:text-white bg-[#0e111a]/85 hover:bg-[#1a2030] border border-white/10 rounded-full shadow-md backdrop-blur-sm transition-all flex items-center gap-1.5"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Show 3D Palace Controls</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Hide Controls (Zen View)</span>
          </>
        )}
      </button>

      {/* Unified Bottom Control Dock */}
      <div
        className={`w-full transition-all duration-300 ease-out origin-bottom ${
          isCollapsed ? 'opacity-0 scale-95 pointer-events-none h-0 overflow-hidden' : 'opacity-100 scale-100'
        }`}
      >
        <div className="w-full p-2 md:p-2.5 rounded-2xl bg-[#0c101cd6] backdrop-blur-md border border-white/15 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Group 1: Camera Perspectives */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            <span className="hidden sm:inline-block px-2 text-[10px] tracking-wider text-[#d4af37] font-semibold uppercase">
              Views
            </span>
            <button
              onClick={() => onCameraChange('facade')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                cameraPreset === 'facade'
                  ? 'bg-[#d4af37] text-black shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Palace Facade
            </button>
            <button
              onClick={() => onCameraChange('pool')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                cameraPreset === 'pool'
                  ? 'bg-[#d4af37] text-black shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Lotus Pool
            </button>
            <button
              onClick={() => onCameraChange('chattri')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                cameraPreset === 'chattri'
                  ? 'bg-[#d4af37] text-black shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Roof Chattri
            </button>
            <button
              onClick={() => onCameraChange('suites')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                cameraPreset === 'suites'
                  ? 'bg-[#d4af37] text-black shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Jharokha Suites
            </button>
          </div>

          {/* Group 2: Lighting & Day/Night Mode */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            <span className="hidden md:inline-block px-2 text-[10px] tracking-wider text-[#d4af37] font-semibold uppercase">
              Ambiance
            </span>
            <button
              onClick={() => onLightingChange('twilight')}
              title="Golden Twilight"
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                lightingMode === 'twilight'
                  ? 'bg-[#d4af37] text-black font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sunset className="w-3.5 h-3.5" />
              <span>Twilight</span>
            </button>
            <button
              onClick={() => onLightingChange('night')}
              title="Royal Starlight"
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                lightingMode === 'night'
                  ? 'bg-[#d4af37] text-black font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Starlight</span>
            </button>
            <button
              onClick={() => onLightingChange('day')}
              title="Desert Sun"
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                lightingMode === 'day'
                  ? 'bg-[#d4af37] text-black font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Sunlit</span>
            </button>
          </div>

          {/* Group 3: Interactive Toggles (Petals, Auto-Rotate, Audio) */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Flower Petals Breeze */}
            <button
              onClick={onTogglePetals}
              title="Toggle floating marigold & rose petals"
              className={`p-2 rounded-xl border transition-colors ${
                petalsActive
                  ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                  : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Auto-Rotation */}
            <button
              onClick={onToggleAutoRotate}
              title="Toggle 360° auto spin"
              className={`p-2 rounded-xl border transition-colors ${
                autoRotate
                  ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                  : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Procedural Royal Sitar / Ambience Soundscape */}
            <button
              onClick={handleAudioToggle}
              title={isAudioPlaying ? 'Mute royal palace soundscape' : 'Play procedural royal palace soundscape'}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 font-medium transition-colors ${
                isAudioPlaying
                  ? 'bg-[#d4af37] text-black border-[#d4af37]'
                  : 'bg-black/30 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{isAudioPlaying ? 'Mute Sound' : 'Play Music'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
