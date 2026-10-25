import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, CalendarCheck, ClipboardList, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenReceptionLog?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking, onOpenReceptionLog }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0b0c10]/95 backdrop-blur-md border-b border-white/10 py-3 shadow-xl'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#"
          className="text-lg md:text-xl font-cinzel font-bold tracking-wider text-[#d4af37] whitespace-nowrap shrink-0 hover:text-white transition-colors"
        >
          HOTEL SHEETAL TONK
        </a>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a
            href="#suites"
            className="hover:text-[#d4af37] transition-colors whitespace-nowrap shrink-0"
          >
            Suites & Villas
          </a>
          <a
            href="#dining"
            className="hover:text-[#d4af37] transition-colors whitespace-nowrap shrink-0"
          >
            Royal Dining
          </a>
          <a
            href="#banquets"
            className="hover:text-[#d4af37] transition-colors whitespace-nowrap shrink-0"
          >
            Banquets & Lawns
          </a>

          <a
            href="#contact"
            className="hover:text-[#d4af37] transition-colors whitespace-nowrap shrink-0"
          >
            Location & Contact
          </a>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:+911432244555"
            className="hidden lg:flex items-center gap-1.5 text-xs text-slate-300 hover:text-[#d4af37] transition-colors font-mono tabular-nums whitespace-nowrap shrink-0 mr-1"
          >
            <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>+91 1432 244555</span>
          </a>

          {/* Admin Login & Desk Log Button */}
          {onOpenReceptionLog && (
            <button
              onClick={onOpenReceptionLog}
              title="Admin & Reception Desk Login (Manage Bookings, WhatsApp & Excel)"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#d4af37] bg-[#d4af37]/15 hover:bg-[#d4af37]/25 border border-[#d4af37]/40 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Admin / Desk Login</span>
            </button>
          )}



          <button
            onClick={onOpenBooking}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-[#d4af37] hover:bg-[#e6c150] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-lg"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Reserve Stay</span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d101a] border-b border-white/10 px-6 py-5 transition-all">
          <nav className="flex flex-col gap-4 text-sm font-medium text-slate-200">
            <a
              href="#suites"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#d4af37] transition-colors py-1"
            >
              Suites & Villas
            </a>
            <a
              href="#dining"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#d4af37] transition-colors py-1"
            >
              Royal Dining
            </a>
            <a
              href="#banquets"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#d4af37] transition-colors py-1"
            >
              Banquets & Lawns
            </a>

            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#d4af37] transition-colors py-1"
            >
              Location & Contact
            </a>

            {onOpenReceptionLog && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenReceptionLog();
                }}
                className="py-2.5 px-3 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-xs font-semibold flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin & Reception Portal Login</span>
              </button>
            )}

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <a href="tel:+911432244555" className="text-xs text-slate-300 font-mono">
                +91 1432 244555
              </a>
              <span className="text-xs text-[#d4af37]">Tonk, Rajasthan</span>
            </div>

          </nav>
        </div>
      )}
    </header>
  );
};
