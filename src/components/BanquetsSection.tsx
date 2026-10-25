import React, { useState } from 'react';
import { Users, Sparkles, Music, Car, HeartHandshake, CheckCircle2, Send } from 'lucide-react';

interface BanquetsSectionProps {
  onInquire: () => void;
}

export const BanquetsSection: React.FC<BanquetsSectionProps> = ({ onInquire }) => {
  const [guestCount, setGuestCount] = useState<number>(500);
  const [eventType, setEventType] = useState<string>('Wedding & Reception');
  const [inquirySent, setInquirySent] = useState<boolean>(false);

  const calculateEstimate = () => {
    // Rough per-guest baseline in INR for Tonk luxury venue + catering
    const ratePerGuest = eventType === 'Wedding & Reception' ? 1200 : 850;
    return guestCount * ratePerGuest;
  };

  const handleQuickInquire = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => {
      onInquire();
    }, 1200);
  };

  return (
    <section id="banquets" className="py-24 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-semibold tracking-widest text-[#d4af37] uppercase">
          Destination Celebrations
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-cinzel font-bold text-white mt-2">
          Royal Banquets & Wedding Lawns
        </h2>
        <p className="text-sm md:text-base text-slate-300 mt-4 leading-relaxed font-light">
          Tonk's most sought-after royal wedding destination. From intimate Sangeet ceremonies by the reflection pool to grand 2,500+ guest wedding spectacles under fairy-lit Rajasthan night skies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Venue 1: Sheetal Royal Green Lawns */}
        <div className="p-8 rounded-2xl bg-[#111522] border border-white/10 hover:border-[#d4af37]/40 transition-all flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between text-xs text-[#d4af37] font-semibold mb-3">
              <span>OUTDOOR LAWN</span>
              <span className="font-mono tabular-nums">2,500+ Capacity</span>
            </div>
            <h3 className="text-2xl font-cinzel font-bold text-white mb-2">
              Sheetal Royal Green Lawns
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Expansive manicured Bermuda grass lawn framed by royal palm trees, illuminated stone fountains, and an elevated royal Mandap stage backdrop.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300 border-t border-white/5 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                <span>35,000 sq.ft unobstructed event lawn</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                <span>Heavy-duty three-phase silent generator backup</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                <span>Dedicated Baraat procession entryway from highway</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                <span>Full fairy-light and chandelier canopy ready</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10">
            <button
              onClick={onInquire}
              className="w-full py-2.5 text-xs font-semibold text-black bg-[#d4af37] hover:bg-[#e6c150] rounded-xl transition-colors"
            >
              Inquire for Wedding Dates
            </button>
          </div>
        </div>

        {/* Venue 2: Sheetal Grand Ballroom */}
        <div className="p-8 rounded-2xl bg-[#111522] border border-white/10 hover:border-[#d4af37]/40 transition-all flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between text-xs text-[#d4af37] font-semibold mb-3">
              <span>INDOOR ROYAL HALL</span>
              <span className="font-mono tabular-nums">800+ Capacity</span>
            </div>
            <h3 className="text-2xl font-cinzel font-bold text-white mb-2">
              The Grand Sheetal Ballroom
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Pillar-free luxury banquet hall featuring acoustic gold-trimmed walls, Belgian crystal chandeliers, and multi-zone climate control.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300 border-t border-white/5 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                <span>10,000 sq.ft pillar-free ballroom</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                <span>Integrated JBL line-array audio & stage rigging</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                <span>Two luxury air-conditioned bridal green rooms</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                <span>Live live-streaming & 4K LED projection setups</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10">
            <button
              onClick={onInquire}
              className="w-full py-2.5 text-xs font-semibold text-black bg-[#d4af37] hover:bg-[#e6c150] rounded-xl transition-colors"
            >
              Inquire for Grand Ballroom
            </button>
          </div>
        </div>

        {/* Venue 3: Interactive Event Estimator Card */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1a1727] via-[#121625] to-[#0c101a] border border-[#d4af37]/30 shadow-2xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider block mb-2">
              Instant Event Estimator
            </span>
            <h3 className="text-xl font-cinzel font-bold text-white mb-4">
              Plan Your Celebration
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-[#181d2e] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="Wedding & Reception">Wedding & Grand Reception</option>
                  <option value="Sangeet & Mehendi Night">Sangeet & Mehendi Night</option>
                  <option value="Corporate Conference">Corporate Conference / Seminar</option>
                  <option value="Anniversary / Family Gala">Anniversary / Royal Family Gala</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Expected Guests</span>
                  <span className="font-mono font-bold text-[#d4af37] tabular-nums">{guestCount} Guests</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2500"
                  step="50"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full accent-[#d4af37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>100</span>
                  <span>1,000</span>
                  <span>2,500+</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[11px] text-slate-400 block">Estimated Package Value:</span>
                <div className="text-2xl font-bold font-mono text-[#d4af37] tabular-nums">
                  ₹{calculateEstimate().toLocaleString('en-IN')}*
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Includes venue hire, curated royal buffet catering, and standard lighting.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            {inquirySent ? (
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs text-center font-medium">
                Inquiry request noted! Opening detailed form...
              </div>
            ) : (
              <button
                onClick={handleQuickInquire}
                className="w-full py-2.5 text-xs font-bold text-black bg-[#d4af37] hover:bg-[#e6c150] rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request Custom Banquet Proposal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
