import React, { useState } from 'react';
import {
  Camera,
  Receipt,
  Plus,
  Minus,
  Sliders,
  Sparkles,
  Search,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { CountryConfig, Ingredient, IngredientCategory } from '../types';
import { ARCameraScannerModal } from './ARCameraScannerModal';
import { ReceiptRefillModal } from './ReceiptRefillModal';

interface FridgeModuleProps {
  country: CountryConfig;
  ingredients: Ingredient[];
  onUpdateIngredients: (updated: Ingredient[]) => void;
  onOpenCountryPicker: () => void;
}

const CATEGORY_TABS: Array<{ id: string; label: string; icon: string }> = [
  { id: 'all', label: 'Все полочки', icon: '🧊' },
  { id: 'dairy', label: 'Молочка и сыры', icon: '🧀' },
  { id: 'chocolate', label: 'Шоколад', icon: '🍫' },
  { id: 'flour_dry', label: 'Мука и сухое', icon: '🌾' },
  { id: 'nuts_fillings', label: 'Ягоды и орехи', icon: '🍓' },
];

export const FridgeModule: React.FC<FridgeModuleProps> = ({
  country,
  ingredients,
  onUpdateIngredients,
  onOpenCountryPicker,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isARScannerOpen, setIsARScannerOpen] = useState<boolean>(false);
  const [isReceiptRefillOpen, setIsReceiptRefillOpen] = useState<boolean>(false);

  // Directly update open pack remaining slider on a card
  const handleOpenPackSliderChange = (id: string, newPercent: number) => {
    const updated = ingredients.map((item) => {
      if (item.id === id) {
        const openQty = Math.round((newPercent / 100) * item.baseQuantity);
        const sealedQty = item.sealedPacksCount * item.baseQuantity;
        return {
          ...item,
          openPackRemainingPercent: newPercent,
          inStock: openQty + sealedQty,
          lastUpdated: new Date().toISOString(),
        };
      }
      return item;
    });
    onUpdateIngredients(updated);
  };

  // Adjust sealed packs count (+ / -)
  const handleSealedCountAdjust = (id: string, delta: number) => {
    const updated = ingredients.map((item) => {
      if (item.id === id) {
        const newCount = Math.max(0, item.sealedPacksCount + delta);
        const openQty = Math.round((item.openPackRemainingPercent / 100) * item.baseQuantity);
        const sealedQty = newCount * item.baseQuantity;
        return {
          ...item,
          sealedPacksCount: newCount,
          inStock: openQty + sealedQty,
          lastUpdated: new Date().toISOString(),
        };
      }
      return item;
    });
    onUpdateIngredients(updated);
  };

  // Add new ingredient from AR scanner
  const handleAddIngredient = (newIng: Ingredient) => {
    onUpdateIngredients([newIng, ...ingredients]);
  };

  // Refill existing ingredients from receipt
  const handleRefillIngredients = (
    refills: Array<{ name: string; addQty: number; unit: string; price: number }>
  ) => {
    const updated = ingredients.map((ing) => {
      const match = refills.find(
        (r) => ing.name.toLowerCase().includes(r.name.toLowerCase()) || r.name.toLowerCase().includes(ing.name.toLowerCase())
      );
      if (match) {
        return {
          ...ing,
          inStock: ing.inStock + match.addQty,
          sealedPacksCount: ing.sealedPacksCount + 1,
          lastUpdated: new Date().toISOString(),
        };
      }
      return ing;
    });
    onUpdateIngredients(updated);
  };

  const filtered = ingredients.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Top Welcome & Country Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-rose-500">
            Вкладка 1
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2D2530] tracking-tight flex items-center gap-2">
            Умный холодильник 🧊
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Все твои остатки, открытые баночки и закрытые пачки под контролем
          </p>
        </div>

        {/* Currency / Country Badge */}
        <button
          onClick={onOpenCountryPicker}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border-2 border-rose-100 hover:border-rose-300 shadow-sm transition-all cursor-pointer btn-bouncy"
        >
          <span className="text-xl">{country.flag}</span>
          <div className="text-left hidden sm:block">
            <span className="text-[10px] text-slate-400 block font-bold leading-none">Страна</span>
            <span className="text-xs font-black text-[#2D2530]">{country.name} ({country.symbol})</span>
          </div>
          <span className="text-xs font-black text-rose-500 sm:hidden">{country.symbol}</span>
        </button>
      </div>

      {/* Hero Action Cards: AR Scanner + Receipt Refill */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Main AR Scanner Button (Large, friendly, rounded) */}
        <button
          onClick={() => setIsARScannerOpen(true)}
          className="p-5 rounded-3xl bg-gradient-to-br from-rose-400 via-rose-500 to-pink-500 text-white text-left shadow-xl shadow-rose-200 transition-all flex items-center justify-between cursor-pointer btn-bouncy relative overflow-hidden group"
        >
          <div className="space-y-1 z-10">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
              Камера и ИИ
            </span>
            <h2 className="text-xl font-black tracking-tight">Заполнить холодильник</h2>
            <p className="text-xs text-rose-100">
              Наведи на продукты — ИИ сам спросит сколько осталось! ✨
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shrink-0 z-10 shadow-inner">
            📷
          </div>
        </button>

        {/* Receipt refill button */}
        <button
          onClick={() => setIsReceiptRefillOpen(true)}
          className="p-5 rounded-3xl bg-white border-2 border-rose-100 hover:border-rose-300 text-left shadow-md transition-all flex items-center justify-between cursor-pointer btn-bouncy"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full inline-block">
              Покупки
            </span>
            <h2 className="text-xl font-black text-[#2D2530] tracking-tight">Сканировать чек</h2>
            <p className="text-xs text-slate-400">
              Купила продукты? Прибавь их в один клик без рутины
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-3xl shrink-0">
            🧾
          </div>
        </button>
      </div>

      {/* Category Shelf Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {CATEGORY_TABS.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer btn-bouncy ${
                isSelected
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                  : 'bg-white border-2 border-rose-50 text-slate-600 hover:border-rose-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Shelf Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const isLow = item.inStock <= item.minStockAlert;
          return (
            <div
              key={item.id}
              className="card-pastel rounded-3xl p-5 space-y-4 transition-all hover:shadow-lg"
            >
              {/* Card Top: Emoji, Title, Price */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-rose-50">{item.emoji}</span>
                  <div>
                    <h3 className="text-base font-extrabold text-[#2D2530] leading-tight">
                      {item.name}
                    </h3>
                    <span className="text-xs font-mono font-bold text-rose-500">
                      {item.purchasePrice} {country.symbol}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-black text-[#2D2530] block">
                    {item.inStock} {item.baseUnit}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">в запасе</span>
                </div>
              </div>

              {/* In-Card Open Pack Slider */}
              <div className="p-3.5 bg-rose-50/60 rounded-2xl space-y-2 border border-rose-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Открытая упаковка:</span>
                  <span className="font-mono text-rose-600 font-black">
                    {item.openPackRemainingPercent}%
                  </span>
                </div>

                {/* Big Ergonomic In-Card Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={item.openPackRemainingPercent}
                  onChange={(e) =>
                    handleOpenPackSliderChange(item.id, parseInt(e.target.value, 10))
                  }
                  className="w-full h-2.5 bg-rose-200/80 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />

                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>0%</span>
                  <span>Быстро сдвинуть остаток</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Card Bottom: Sealed packs count & stock alert */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Закрытые:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSealedCountAdjust(item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center text-xs font-black font-mono">
                      {item.sealedPacksCount}
                    </span>
                    <button
                      onClick={() => handleSealedCountAdjust(item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-rose-400 hover:bg-rose-500 text-white font-bold flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isLow ? (
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl flex items-center gap-1 border border-amber-200">
                    <AlertTriangle className="w-3 h-3" />
                    Мало!
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Хватает
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AR Camera Scanner Modal */}
      <ARCameraScannerModal
        isOpen={isARScannerOpen}
        onClose={() => setIsARScannerOpen(false)}
        country={country}
        onAddIngredient={handleAddIngredient}
      />

      {/* Receipt Refill Modal */}
      <ReceiptRefillModal
        isOpen={isReceiptRefillOpen}
        onClose={() => setIsReceiptRefillOpen(false)}
        country={country}
        ingredients={ingredients}
        onRefillIngredients={handleRefillIngredients}
      />
    </div>
  );
};
