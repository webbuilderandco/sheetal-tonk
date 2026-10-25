import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Check, 
  Calendar, 
  Users, 
  Phone, 
  Mail, 
  User, 
  ShieldCheck, 
  Download, 
  Sparkles,
  Send,
  MessageSquare,
  Cloud,
  CheckCircle2
} from 'lucide-react';
import { saveBookingToCloud, type BookingRecord } from '../lib/bookingsService';



interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoom?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialRoom = 'Super Deluxe AC Room',
  initialCheckIn = '',
  initialCheckOut = '',
  initialGuests = 2,
}) => {
  const [activeTab, setActiveTab] = useState<'room' | 'banquet' | 'dining'>('room');

  // Hotel Contact for receiving bookings (reads customized number if updated)
  const HOTEL_WHATSAPP_NUMBER = localStorage.getItem('sheetal_hotel_whatsapp') || '919829000000';

  // Dates
  const today = new Date().toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState(initialCheckIn || today);
  const [checkOut, setCheckOut] = useState(initialCheckOut || today);
  const [roomType, setRoomType] = useState(initialRoom);
  const [guests, setGuests] = useState(initialGuests);

  // Add-ons
  const [addons, setAddons] = useState<{ [key: string]: boolean }>({
    breakfast: true,
    airportTransfer: false,
    poolsideDinner: false,
    heritageTour: false,
  });

  // Guest Contact Form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialRequest: '',
  });

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [lastBookingData, setLastBookingData] = useState<BookingRecord | null>(null);

  if (!isOpen) return null;

  // Pricing Logic
  const getRoomPrice = (r: string) => {
    switch (r) {
      case 'The Nawabi Presidential Suite': return 6499;
      case 'Celebration & Bridal Suite': return 5299;
      case 'Executive Family Suite': return 4499;
      case 'Super Deluxe AC Room': return 2899;
      case 'Standard Deluxe AC Room': return 1999;
      default: return 2899;
    }
  };

  const calculateDays = () => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
    return isNaN(diff) ? 1 : diff;
  };

  const nights = calculateDays();
  const roomBasePrice = getRoomPrice(roomType) * nights;
  const addonsTotal =
    (addons.breakfast ? 250 * guests * nights : 0) +
    (addons.airportTransfer ? 1800 : 0) +
    (addons.poolsideDinner ? 1200 : 0) +
    (addons.heritageTour ? 800 : 0);
  const tax = Math.round((roomBasePrice + addonsTotal) * 0.12);
  const totalAmount = roomBasePrice + addonsTotal + tax;

  // Format WhatsApp Message for Hotel Desk
  const generateWhatsAppMessage = (ref: string) => {
    return encodeURIComponent(
      `*🏨 New Room Booking Request — Hotel Sheetal Tonk*\n` +
      `--------------------------------\n` +
      `*Booking Ref:* ${ref}\n` +
      `*Guest Name:* ${formData.name || 'Not Provided'}\n` +
      `*Contact:* ${formData.phone || 'Not Provided'}\n` +
      `*Email:* ${formData.email || 'N/A'}\n` +
      `*Category:* ${roomType}\n` +
      `*Check-In:* ${checkIn}\n` +
      `*Check-Out:* ${checkOut} (${nights} night${nights > 1 ? 's' : ''})\n` +
      `*Guests:* ${guests}\n` +
      `*Total Tariff:* ₹${totalAmount.toLocaleString('en-IN')}\n` +
      (formData.specialRequest ? `*Note:* ${formData.specialRequest}\n` : '') +
      `--------------------------------\n` +
      `Please confirm availability from Hotel Sheetal Tonk front desk.`
    );
  };

  const sendToWhatsApp = (ref: string) => {
    const msg = generateWhatsAppMessage(ref);
    window.open(`https://wa.me/${HOTEL_WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `HST-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRef(ref);

    const record: BookingRecord = {
      ref,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      roomType,
      checkIn,
      checkOut,
      nights,
      guests,
      totalAmount,
      specialRequest: formData.specialRequest,
      createdAt: new Date().toLocaleString(),
      status: 'Confirmed',
    };

    setLastBookingData(record);

    // Persist to Cloud Database (Firestore) and localStorage fallback
    saveBookingToCloud(record).catch((err) => {
      console.warn('Background cloud sync warning:', err);
    });

    setIsConfirmed(true);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#e5c05c', '#ffffff', '#22c55e'],
      });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0f131f] border border-[#d4af37]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#d4af37]">
              HOTEL SHEETAL TONK · ONLINE RESERVATION
            </span>
            <h3 className="text-xl font-cinzel font-bold text-white mt-0.5">
              {isConfirmed ? 'Reservation Confirmed' : 'Reserve Room / Banquet'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {isConfirmed ? (
            /* Confirmation Screen */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-2xl font-cinzel font-bold text-white">
                  Booking Successful!
                </h4>
                <p className="text-sm text-slate-300 mt-1">
                  Thank you, <strong className="text-white">{formData.name || 'Valued Guest'}</strong>! Your booking at Hotel Sheetal Tonk has been logged.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium mt-2.5">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Saved to Cloud Database (Firestore)</span>
                </div>
              </div>

              {/* Booking Summary Box */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-black/50 border border-white/10 text-left space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Voucher Ref:</span>
                  <span className="text-[#d4af37] font-bold">{bookingRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Guest Name:</span>
                  <span className="text-white">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile Phone:</span>
                  <span className="text-white">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Room Category:</span>
                  <span className="text-white truncate max-w-[200px]">{roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Check-in / Out:</span>
                  <span className="text-white">{checkIn} to {checkOut} ({nights} nights)</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-sm">
                  <span className="text-slate-300">Total Payable:</span>
                  <span className="text-[#d4af37]">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Direct WhatsApp Send Action for Hotel Owner & Guest */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 max-w-md mx-auto space-y-2">
                <span className="text-[11px] text-emerald-200 block font-medium">
                  📲 Send this booking directly to Hotel Sheetal WhatsApp Desk:
                </span>
                <button
                  type="button"
                  onClick={() => sendToWhatsApp(bookingRef)}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send to Hotel WhatsApp (+91 98290 00000)</span>
                </button>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-[#d4af37] hover:bg-[#e6c150] text-black font-semibold rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Reservation Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tab Selector */}
              <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('room')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                    activeTab === 'room' ? 'bg-[#d4af37] text-black font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Rooms & Suites
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('banquet')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                    activeTab === 'banquet' ? 'bg-[#d4af37] text-black font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Wedding Lawn
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('dining')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                    activeTab === 'dining' ? 'bg-[#d4af37] text-black font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Glass Restaurant
                </button>
              </div>

              {/* Room Selection Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Room Category</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full bg-[#161a29] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="Super Deluxe AC Room">Super Deluxe AC Room (₹2,899)</option>
                    <option value="Executive Family Suite">Executive Family Suite (₹4,499)</option>
                    <option value="Standard Deluxe AC Room">Standard Deluxe AC Room (₹1,999)</option>
                    <option value="Celebration & Bridal Suite">Celebration & Bridal Suite (₹5,299)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Number of Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full bg-[#161a29] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value={1}>1 Guest (Single)</option>
                    <option value={2}>2 Guests (Double)</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests (Family)</option>
                  </select>
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Check-in Date</label>
                  <input
                    type="date"
                    value={checkIn}
                    min={today}
                    required
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-[#161a29] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Check-out Date</label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    required
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-[#161a29] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Add-ons */}
              <div className="space-y-2">
                <span className="block text-[#d4af37] font-semibold uppercase tracking-wider text-[11px]">
                  Hotel Sheetal Add-on Services
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-black/30 border border-white/5 cursor-pointer hover:border-white/20">
                    <input
                      type="checkbox"
                      checked={addons.breakfast}
                      onChange={(e) => setAddons({ ...addons, breakfast: e.target.checked })}
                      className="accent-[#d4af37]"
                    />
                    <div>
                      <span className="block text-white font-medium">Pure Desi Ghee Breakfast</span>
                      <span className="text-[10px] text-slate-400 font-mono">+₹250 / guest / day</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-black/30 border border-white/5 cursor-pointer hover:border-white/20">
                    <input
                      type="checkbox"
                      checked={addons.airportTransfer}
                      onChange={(e) => setAddons({ ...addons, airportTransfer: e.target.checked })}
                      className="accent-[#d4af37]"
                    />
                    <div>
                      <span className="block text-white font-medium">Jaipur Airport / Station Taxi</span>
                      <span className="text-[10px] text-slate-400 font-mono">+₹1,800 one-way</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Guest Details */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <span className="block text-white font-semibold">Your Contact Details (For Hotel Confirmation)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#161a29] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Mobile / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98290 XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#161a29] border border-white/10 rounded-lg p-2 text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Special Request (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Late check-in at 11 PM, extra mattress"
                    value={formData.specialRequest}
                    onChange={(e) => setFormData({ ...formData, specialRequest: e.target.value })}
                    className="w-full bg-[#161a29] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Price Breakdown Footer */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Room Charge ({nights} {nights === 1 ? 'night' : 'nights'}):</span>
                  <span>₹{roomBasePrice.toLocaleString('en-IN')}</span>
                </div>
                {addonsTotal > 0 && (
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Add-ons:</span>
                    <span>₹{addonsTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>GST & Taxes (12%):</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white border-t border-white/10 pt-2">
                  <span>Total Amount:</span>
                  <span className="text-[#d4af37]">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#d4af37] hover:bg-[#e6c150] text-black font-bold text-sm rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm Reservation & Generate Voucher</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
