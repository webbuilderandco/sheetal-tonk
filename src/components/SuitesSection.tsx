import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Maximize2, Users, Bed, Check, ArrowRight } from 'lucide-react';

interface Suite {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  area: string;
  capacity: string;
  bed: string;
  view: string;
  features: string[];
  gradientTheme: string;
}

const SUITES_DATA: Suite[] = [
  {
    id: 'super-deluxe-ac',
    name: 'Super Deluxe AC Room',
    subtitle: 'Spacious climate-controlled room with modern king bed, high-speed Wi-Fi, and highway view',
    price: 2899,
    originalPrice: 3800,
    area: '340 sq.ft',
    capacity: '2 Adults, 1 Child',
    bed: 'King Size Bed',
    view: 'Highway & Front Garden View',
    features: [
      'Split Air-Conditioning & individual temperature control',
      'Modern tiled bathroom with 24/7 hot & cold geyser water',
      '43-inch LED Smart TV with HD cable channels',
      'High-speed complimentary Wi-Fi for business & leisure',
      'Dedicated room service with multi-cuisine dining menu',
    ],
    gradientTheme: 'from-[#192233] via-[#121622] to-[#0e1017]',
  },
  {
    id: 'executive-family-suite',
    name: 'Executive Family Suite',
    subtitle: 'Interconnected family suite designed for travelers exploring Tonk and Ranthambore wildlife',
    price: 4499,
    originalPrice: 5800,
    area: '560 sq.ft',
    capacity: '4 - 5 Guests',
    bed: '1 King + 2 Twin Beds',
    view: 'Lawn & Open Countryside',
    features: [
      'Twin air-conditioned bedrooms with lounge seating area',
      'Two ensuite clean hygienic bathrooms with luxury amenities',
      'Tea & coffee maker with complimentary supplies',
      'Ample space for extra mattresses and luggage staging',
      'Direct ground-level lawn access with quiet ambiance',
    ],
    gradientTheme: 'from-[#2b1f13] via-[#1a1518] to-[#111420]',
  },
  {
    id: 'deluxe-ac-room',
    name: 'Standard Deluxe AC Room',
    subtitle: 'Cozy, clean, and highly economical room for couples, solo travelers, and highway transits',
    price: 1999,
    originalPrice: 2600,
    area: '260 sq.ft',
    capacity: '2 Guests',
    bed: 'Double Bed',
    view: 'Courtyard View',
    features: [
      'Quiet split AC unit and ceiling fan ventilation',
      'Fresh crisp linens & sanitized bedding',
      'Work desk with charging sockets and reading light',
      'Complimentary bottled RO purified drinking water',
      '24-hour reception desk & wakeup call service',
    ],
    gradientTheme: 'from-[#1e261d] via-[#141a1a] to-[#0e1117]',
  },
  {
    id: 'marriage-party-suite',
    name: 'Celebration & Bridal Suite',
    subtitle: 'Special suite equipped for wedding couples, family hosts, and celebratory event preparations',
    price: 5299,
    originalPrice: 6800,
    area: '620 sq.ft',
    capacity: '3 - 4 Guests',
    bed: 'Master King Bed + Dressing Area',
    view: 'Direct Wedding Lawn View',
    features: [
      'Dedicated full-length bridal dressing mirror & vanity vanity lights',
      'Proximity to Sheetal Wedding Lawn and reception marquee',
      'Complimentary welcome basket with Tonk snacks & sweets',
      'Dedicated valet parking and priority room service',
      'Late check-out options for wedding party hosts',
    ],
    gradientTheme: 'from-[#2b1820] via-[#1a121d] to-[#0e1017]',
  },
];

interface SuitesSectionProps {
  onBookSuite: (suiteName: string) => void;
}

export const SuitesSection: React.FC<SuitesSectionProps> = ({ onBookSuite }) => {
  return (
    <section id="suites" className="py-24 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-semibold tracking-widest text-[#d4af37] uppercase">
          Comfortable Stays in Tonk
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-cinzel font-bold text-white mt-2">
          Rooms & Executive Suites
        </h2>
        <p className="text-sm md:text-base text-slate-300 mt-4 leading-relaxed font-light">
          Whether you are traveling between Jaipur and Kota, attending a royal wedding celebration, or visiting Tonk's historic Sunehri Kothi, enjoy clean, air-conditioned comfort with 24/7 service.
        </p>
      </div>

      {/* Grid of Suites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {SUITES_DATA.map((suite, idx) => (
          <motion.div
            key={suite.id}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            className="group relative rounded-2xl bg-[#101420] border border-white/10 hover:border-[#d4af37]/60 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl"
          >
            {/* Visual Hero Header */}
            <div className={`relative h-56 p-6 bg-gradient-to-br ${suite.gradientTheme} border-b border-white/10 flex flex-col justify-between overflow-hidden`}>
              
              {/* Subtle Animated Glow Accent */}
              <div className="absolute right-0 top-0 w-44 h-44 bg-[#d4af37]/10 rounded-full blur-2xl pointer-events-none" />

              {/* Top Bar inside card */}
              <div className="flex items-center justify-between relative z-10">
                <span className="text-xs font-medium text-slate-300 bg-black/50 px-3 py-1 rounded-full border border-white/10">
                  {suite.view}
                </span>

                <span className="text-xs text-[#d4af37] font-semibold bg-black/60 px-3 py-1 rounded-full border border-[#d4af37]/30">
                  Best Highway Tariff
                </span>
              </div>

              {/* Title & Pricing in Card Hero */}
              <div className="relative z-10 mt-auto">
                <h3 className="text-xl md:text-2xl font-cinzel font-bold text-white group-hover:text-[#d4af37] transition-colors">
                  {suite.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-md line-clamp-2">
                  {suite.subtitle}
                </p>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-bold font-mono text-[#d4af37] tabular-nums">
                    ₹{suite.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400">/ night</span>
                  <span className="text-xs text-slate-500 line-through font-mono tabular-nums ml-2">
                    ₹{suite.originalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Content & Specifications */}
            <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
              {/* Specs Row */}
              <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-xl bg-black/30 border border-white/5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Room Size</span>
                  <span className="font-semibold text-white font-mono tabular-nums">{suite.area}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Bedding</span>
                  <span className="font-semibold text-white truncate block">{suite.bed}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Guests</span>
                  <span className="font-semibold text-white">{suite.capacity}</span>
                </div>
              </div>

              {/* Key Amenities List */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider block">
                  Room Features
                </span>
                <ul className="space-y-2 text-xs text-slate-300">
                  {suite.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Action */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                <span className="text-[11px] text-emerald-400 font-medium">
                  Instant Confirmation
                </span>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onBookSuite(suite.name)}
                  className="px-5 py-2.5 text-xs font-bold text-black bg-[#d4af37] hover:bg-[#e6c150] rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <span>Book This Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
