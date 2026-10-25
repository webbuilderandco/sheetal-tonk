import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, ClipboardList } from 'lucide-react';

interface FooterProps {
  onOpenReceptionLog?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenReceptionLog }) => {
  return (
    <footer id="contact" className="bg-[#080a10] border-t border-white/10 pt-16 pb-12 px-6 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        {/* Column 1: Brand & Legacy */}
        <div className="space-y-4">
          <div className="text-xl font-cinzel font-bold text-[#d4af37]">
            HOTEL SHEETAL TONK
          </div>
          <p className="text-slate-300 leading-relaxed font-light">
            Tonk’s landmark royal retreat celebrating the enduring Nawabi architecture, imperial suites, monumental wedding lawns, and legendary Rajasthani hospitality.
          </p>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
            <span>Government Approved Heritage Hospitality Partner</span>
          </div>
        </div>

        {/* Column 2: Location & Highway Proximity */}
        <div className="space-y-3">
          <h4 className="text-white font-cinzel font-semibold text-sm uppercase tracking-wider text-[#d4af37]">
            Address & Connectivity
          </h4>
          <div className="space-y-2 text-slate-300">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <span>
                National Highway 52 (Jaipur–Kota Road), Near Civil Lines Circle, Tonk, Rajasthan 304001, India
              </span>
            </div>
            <div className="pt-2 text-[11px] text-slate-400 space-y-1">
              <div>Jaipur Airport: 95 km (1h 45m)</div>
              <div>Ranthambore / Sawai Madhopur: 68 km (1h 15m)</div>
              <div>Kota Junction: 135 km (2h 10m)</div>
            </div>
          </div>
        </div>

        {/* Column 3: Contact & Concierge */}
        <div className="space-y-3">
          <h4 className="text-white font-cinzel font-semibold text-sm uppercase tracking-wider text-[#d4af37]">
            Direct Concierge Desk
          </h4>
          <div className="space-y-2.5 text-slate-300">
            <a
              href="tel:+911432244555"
              className="flex items-center gap-2 hover:text-[#d4af37] transition-colors font-mono"
            >
              <Phone className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span>+91 1432 244555 / 244666</span>
            </a>
            <a
              href="https://wa.me/919829000000"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-[#d4af37] transition-colors"
            >
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-[9px]">W</span>
              <span>WhatsApp Booking Desk: +91 98290 00000</span>
            </a>
            <a
              href="mailto:reservations@hotelsheetaltonk.com"
              className="flex items-center gap-2 hover:text-[#d4af37] transition-colors"
            >
              <Mail className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span>reservations@hotelsheetaltonk.com</span>
            </a>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Front Desk & Room Service: 24 Hours Open</span>
            </div>
          </div>
        </div>

        {/* Column 4: Quick Navigation */}
        <div className="space-y-3">
          <h4 className="text-white font-cinzel font-semibold text-sm uppercase tracking-wider text-[#d4af37]">
            Palace Directory
          </h4>
          <ul className="space-y-1.5 text-slate-300">
            <li>
              <a href="#suites" className="hover:text-[#d4af37] transition-colors">
                Suites, Jharokhas & Villas
              </a>
            </li>
            <li>
              <a href="#dining" className="hover:text-[#d4af37] transition-colors">
                The Sunehri Rasoi Dining
              </a>
            </li>
            <li>
              <a href="#banquets" className="hover:text-[#d4af37] transition-colors">
                Destination Wedding Lawns
              </a>
            </li>

            <li>
              <a href="#" className="hover:text-[#d4af37] transition-colors">
                Photo Gallery & Virtual 3D Tour
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright & Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
        <div>
          © {new Date().getFullYear()} Hotel Sheetal Tonk. All Rights Reserved. City of Nawabs, Rajasthan.
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {onOpenReceptionLog && (
            <button
              onClick={onOpenReceptionLog}
              className="text-[#d4af37] hover:text-white transition-colors flex items-center gap-1 font-semibold cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin & Staff Login</span>
            </button>
          )}

          <span aria-hidden="true">·</span>
          <span>Privacy Policy</span>
          <span aria-hidden="true">·</span>
          <span>Terms of Stay</span>
        </div>
      </div>
    </footer>
  );
};
