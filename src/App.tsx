/**
 * Hotel Sheetal Tonk - Hero Website with Motion Graphics & Floating 3D Food Experience
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MotionHero } from './components/MotionHero';
import { ThreeFoodCanvas } from './components/ThreeFoodCanvas';
import { BookingBar } from './components/BookingBar';
import { SuitesSection } from './components/SuitesSection';
import { DiningSection } from './components/DiningSection';
import { BanquetsSection } from './components/BanquetsSection';
import { BookingModal } from './components/BookingModal';
import { AdminBookingsDrawer } from './components/AdminBookingsDrawer';
import { Footer } from './components/Footer';
import { 
  Building2, 
  UtensilsCrossed, 
  PartyPopper, 
  MapPin, 
  Clock, 
  Car, 
  Wifi, 
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  // Floating 3D Food State
  const [isFoodActive, setIsFoodActive] = useState<boolean>(true);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isAdminLogOpen, setIsAdminLogOpen] = useState<boolean>(false);
  const [selectedSuite, setSelectedSuite] = useState<string>('Super Deluxe AC Room');
  const [bookingDates, setBookingDates] = useState<{
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }>({});

  const handleOpenBooking = (suiteOrEventName?: string) => {
    if (suiteOrEventName) setSelectedSuite(suiteOrEventName);
    setIsBookingOpen(true);
  };

  const handleAvailabilityCheck = (data: {
    checkIn: string;
    checkOut: string;
    roomType: string;
    guests: number;
  }) => {
    setSelectedSuite(data.roomType);
    setBookingDates({
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guests: data.guests,
    });
    setIsBookingOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#090b12] text-[#eceae5] selection:bg-[#d4af37] selection:text-black">
      {/* Scroll-Driven Floating 3D Dual-Sided Pizza (Visible 360° Front & Back) */}
      <ThreeFoodCanvas enabled={isFoodActive} />

      {/* Floating 3D Pizza Active Control Badge */}
      <div className="fixed bottom-5 left-5 z-40 select-none">
        <button
          onClick={() => setIsFoodActive(!isFoodActive)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold border shadow-2xl backdrop-blur-md transition-all ${
            isFoodActive
              ? 'bg-[#181e2e]/95 border-[#d4af37]/60 text-[#d4af37] hover:bg-[#20273c]'
              : 'bg-black/75 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Toggle floating 3D pizza"
        >
          <span>🍕</span>
          <span>{isFoodActive ? 'Floating 3D Pizza (360° Front & Back)' : '3D Pizza Paused'}</span>
        </button>
      </div>

      {/* 1. Global Navigation Bar */}
      <Navbar 
        onOpenBooking={() => handleOpenBooking()} 
        onOpenReceptionLog={() => setIsAdminLogOpen(true)}
      />

      {/* 2. MOTION GRAPHICS HERO SECTION (Authentic Sheetal Hotel Exterior) */}
      <MotionHero
        onOpenBooking={handleOpenBooking}
        onExploreRooms={() => scrollToSection('suites')}
      />

      {/* 3. QUICK BOOKING AVAILABILITY BAR */}
      <div id="booking-bar">
        <BookingBar onCheckAvailability={handleAvailabilityCheck} />
      </div>

      {/* 4. MOTION GRAPHICS HIGHLIGHTS & KEY AMENITIES STRIP */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="p-5 rounded-2xl bg-[#111624] border border-white/5 hover:border-[#d4af37]/30 transition-all text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold font-mono text-white block">AC Rooms</span>
            <span className="text-xs text-slate-300 font-medium block mt-1">Super Deluxe & Executive</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Split AC · 24/7 Hot Water</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-5 rounded-2xl bg-[#111624] border border-white/5 hover:border-[#d4af37]/30 transition-all text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center mx-auto mb-3">
              <PartyPopper className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold font-mono text-white block">Party Lawn</span>
            <span className="text-xs text-slate-300 font-medium block mt-1">Weddings & Receptions</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Up to 2,000+ Guests</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="p-5 rounded-2xl bg-[#111624] border border-white/5 hover:border-[#d4af37]/30 transition-all text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center mx-auto mb-3">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold font-mono text-white block">Glass Dining</span>
            <span className="text-xs text-slate-300 font-medium block mt-1">Pure Desi Ghee Cuisine</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Family & Highway Travelers</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-5 rounded-2xl bg-[#111624] border border-white/5 hover:border-[#d4af37]/30 transition-all text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center mx-auto mb-3">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold font-mono text-white block">NH-52 Access</span>
            <span className="text-xs text-slate-300 font-medium block mt-1">Jaipur–Kota Corridor</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Large Secured Parking Bay</span>
          </motion.div>
        </div>
      </section>

      {/* 5. ROOMS & EXECUTIVE SUITES SECTION */}
      <SuitesSection
        onBookSuite={(suiteName) => handleOpenBooking(suiteName)}
      />

      {/* 6. ROYAL DINING: THE GLASS RESTAURANT & LAWN CATERING */}
      <DiningSection onReserveTable={() => handleOpenBooking('Restaurant Table Reservation')} />

      {/* 7. CELEBRATIONS, MARRIAGES & BANQUET LAWNS */}
      <BanquetsSection onInquire={() => handleOpenBooking('Sheetal Marriage Lawn Booking')} />

      {/* 8. GLOBAL FOOTER */}
      <Footer onOpenReceptionLog={() => setIsAdminLogOpen(true)} />

      {/* 10. INTERACTIVE RESERVATION DRAWER MODAL */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialRoom={selectedSuite}
        initialCheckIn={bookingDates.checkIn}
        initialCheckOut={bookingDates.checkOut}
        initialGuests={bookingDates.guests}
      />

      {/* 11. HOTEL RECEPTION DESK LOG (Owner & Manager View) */}
      <AdminBookingsDrawer
        isOpen={isAdminLogOpen}
        onClose={() => setIsAdminLogOpen(false)}
      />
    </div>
  );
}
