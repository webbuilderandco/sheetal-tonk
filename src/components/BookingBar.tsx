import React, { useState } from 'react';
import { Calendar, Users, BedDouble, ArrowRight, ShieldCheck } from 'lucide-react';

interface BookingBarProps {
  onCheckAvailability: (bookingData: {
    checkIn: string;
    checkOut: string;
    roomType: string;
    guests: number;
  }) => void;
}

export const BookingBar: React.FC<BookingBarProps> = ({ onCheckAvailability }) => {
  // Default dates: tomorrow and day after tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDay = new Date(tomorrow);
  nextDay.setDate(nextDay.getDate() + 2);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(formatDate(tomorrow));
  const [checkOut, setCheckOut] = useState(formatDate(nextDay));
  const [roomType, setRoomType] = useState('Maharaja Presidential Suite');
  const [guests, setGuests] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckAvailability({
      checkIn,
      checkOut,
      roomType,
      guests,
    });
  };

  return (
    <div className="relative z-30 max-w-6xl mx-auto px-6 -mt-8">
      <div className="bg-[#111522] border border-[#d4af37]/30 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-md">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          
          {/* Check-In */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Check-in Date</span>
            </label>
            <input
              type="date"
              value={checkIn}
              min={formatDate(today)}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-[#181e30] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors"
            />
          </div>

          {/* Check-Out */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Check-out Date</span>
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-[#181e30] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors"
            />
          </div>

          {/* Room Category */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <BedDouble className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Room Category</span>
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full bg-[#181e30] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors"
            >
              <option value="Maharaja Presidential Suite">Maharaja Presidential Suite</option>
              <option value="Heritage Executive Suite">Heritage Executive Suite</option>
              <option value="Royal Deluxe Courtyard">Royal Deluxe Courtyard</option>
              <option value="Family Garden Villa">Family Garden Villa</option>
            </select>
          </div>

          {/* Guests */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Users className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Guests</span>
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-[#181e30] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors"
            >
              <option value={1}>1 Guest (Single)</option>
              <option value={2}>2 Guests (Couple)</option>
              <option value={3}>3 Guests</option>
              <option value={4}>4 Guests (Family)</option>
              <option value={5}>5+ Guests (Suite / Group)</option>
            </select>
          </div>

          {/* Action Button */}
          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#d4af37] hover:bg-[#e6c150] text-black font-semibold text-sm rounded-lg transition-colors shadow-lg"
            >
              <span>Check Rates</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quiet Trust Bar */}
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
            <span>Guaranteed Best Highway Rate & Free Cancellation 24h prior</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Special Nawabi Welcome Drink</span>
            <span aria-hidden="true">·</span>
            <span>Complimentary High-Speed Wi-Fi</span>
            <span aria-hidden="true">·</span>
            <span>Free On-Site Valet Parking</span>
          </div>
        </div>
      </div>
    </div>
  );
};
