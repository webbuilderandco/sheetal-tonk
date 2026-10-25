import React, { useState } from 'react';
import { Utensils, Clock, Flame, Award, Calendar, CheckCircle } from 'lucide-react';

interface MenuItem {
  name: string;
  category: 'Rajasthani Heritage' | 'Nawabi Tonk Specialties' | 'Royal Desserts';
  description: string;
  spiceLevel: 'Mild' | 'Medium' | 'Royal Rich';
  price: string;
  isChefSpecial: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  {
    name: 'Shahi Dal Baati Churma Thali',
    category: 'Rajasthani Heritage',
    description: 'Crisp oven-baked whole wheat baatis dipped in pure desi ghee, served with panchmel dal, gatte ki sabzi, and dry fruit churma',
    spiceLevel: 'Medium',
    price: '₹550',
    isChefSpecial: true,
  },
  {
    name: 'Tonk Nawabi Korma',
    category: 'Nawabi Tonk Specialties',
    description: 'Slow-simmered rich gravy infused with brown onions, crushed mace, green cardamom, and simmered tender paneer or choices',
    spiceLevel: 'Royal Rich',
    price: '₹480',
    isChefSpecial: true,
  },
  {
    name: 'Ker Sangri Ro Saag',
    category: 'Rajasthani Heritage',
    description: 'Authentic desert beans and wild berries cooked with royal whole red chilies, dry mango powder, and cold-pressed mustard oil',
    spiceLevel: 'Medium',
    price: '₹420',
    isChefSpecial: false,
  },
  {
    name: 'Sunehri Dum Biryani',
    category: 'Nawabi Tonk Specialties',
    description: 'Aromatic aged basmati rice layered with fragrant saffron, rose water, fried mint leaves, and royal spice potli seal',
    spiceLevel: 'Mild',
    price: '₹490',
    isChefSpecial: false,
  },
  {
    name: 'Royal Shahi Tukda with Saffron Rabdi',
    category: 'Royal Desserts',
    description: 'Crisp golden brioche soaked in cardamom syrup, crowned with 8-hour slow-cooked condensed milk rabdi and silver varq',
    spiceLevel: 'Mild',
    price: '₹280',
    isChefSpecial: true,
  },
  {
    name: 'Malpua with Pistachio Rabdi',
    category: 'Royal Desserts',
    description: 'Warm fluffy griddle cakes infused with crushed fennel and saffron syrup, served warm alongside chilled pistachio cream',
    spiceLevel: 'Mild',
    price: '₹260',
    isChefSpecial: false,
  },
];

interface DiningSectionProps {
  onReserveTable: () => void;
}

export const DiningSection: React.FC<DiningSectionProps> = ({ onReserveTable }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Rajasthani Heritage', 'Nawabi Tonk Specialties', 'Royal Desserts'];

  const filteredItems = activeCategory === 'All' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter((i) => i.category === activeCategory);

  return (
    <section id="dining" className="py-24 px-6 bg-[#0a0d16] border-t border-b border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-widest text-[#d4af37] uppercase">
              Gastronomic Heritage
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-cinzel font-bold text-white mt-2">
              The Sunehri Rasoi & Rooftop Jharokha
            </h2>
            <p className="text-sm md:text-base text-slate-300 mt-4 leading-relaxed font-light">
              Tonk is historically celebrated for its refined Nawabi culinary traditions that merge the hearty spices of Rajasthan with the delicate aromatics of Awadh. Dine beneath carved sandstone arches or under the starlit sky.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onReserveTable}
              className="px-6 py-3 text-xs font-bold text-black bg-[#d4af37] hover:bg-[#e6c150] rounded-xl transition-colors shadow-lg flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Reserve a Dining Table</span>
            </button>
          </div>
        </div>

        {/* Ambiance highlights banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-[#111624] border border-white/10 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#d4af37]/10 text-[#d4af37] shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-cinzel font-bold text-white">The Sunehri Dining Room</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Opulent ground-tier banquet dining hall with live sitar recitals and traditional copper thali banquet services.
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-[#d4af37]">
                <Clock className="w-3.5 h-3.5" />
                <span>12:00 PM – 3:30 PM & 7:00 PM – 11:00 PM</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#111624] border border-white/10 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#d4af37]/10 text-[#d4af37] shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-cinzel font-bold text-white">Jharokha Rooftop Lounge</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Open-air terrace dining under illuminated chattris, serving sunset mocktails, clay pot kebabs, and starlight suppers.
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-[#d4af37]">
                <Clock className="w-3.5 h-3.5" />
                <span>5:00 PM – 11:30 PM (Evening & Night)</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#111624] border border-white/10 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#d4af37]/10 text-[#d4af37] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-cinzel font-bold text-white">Pure Desi Ghee & Artisanal Spices</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Our kitchen exclusively crafts recipes with farm-fresh organic dairy, locally churned ghee, and hand-ground Tonk spices.
              </p>
              <div className="mt-3 text-[11px] text-emerald-400 font-medium">
                100% Certified Hygiene & Fresh Farm Produce
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs (Functional segmented buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'bg-[#151a28] text-slate-300 hover:text-white hover:bg-[#1f263b]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#111624] border border-white/10 hover:border-[#d4af37]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-base font-cinzel font-bold text-white">
                    {item.name}
                  </h4>
                  <span className="text-base font-mono font-bold text-[#d4af37] tabular-nums shrink-0">
                    {item.price}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-3">
                  <span>{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#d4af37]">{item.spiceLevel}</span>
                  {item.isChefSpecial && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-400 font-medium">Chef's Signature</span>
                    </>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Handcrafted Fresh to Order</span>
                <button
                  onClick={onReserveTable}
                  className="text-[#d4af37] hover:text-white transition-colors font-medium flex items-center gap-1"
                >
                  Order at Table &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
