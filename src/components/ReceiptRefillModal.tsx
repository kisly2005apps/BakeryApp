import React, { useState } from 'react';
import { X, Receipt, Sparkles, Check, ArrowRight, RefreshCw, Plus } from 'lucide-react';
import { CountryConfig, Ingredient } from '../types';

interface ReceiptRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  country: CountryConfig;
  ingredients: Ingredient[];
  onRefillIngredients: (addedItems: Array<{ name: string; addQty: number; unit: string; price: number }>) => void;
}

export const ReceiptRefillModal: React.FC<ReceiptRefillModalProps> = ({
  isOpen,
  onClose,
  country,
  ingredients,
  onRefillIngredients,
}) => {
  const [selectedReceipt, setSelectedReceipt] = useState<'supermarket' | 'bakery_supplies'>('supermarket');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<Array<{ name: string; addQty: number; unit: string; price: number }>>([]);

  if (!isOpen) return null;

  const handleStartScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (selectedReceipt === 'supermarket') {
        setScannedItems([
          { name: 'Молоко 1л', addQty: 1000, unit: 'мл', price: country.code === 'PL' ? 3.99 : 85 },
          { name: 'Сливки 33% 500мл', addQty: 500, unit: 'мл', price: country.code === 'PL' ? 8.50 : 260 },
          { name: 'Сливочное масло 82.5% 200г', addQty: 200, unit: 'г', price: country.code === 'PL' ? 7.20 : 190 },
          { name: 'Яйца куриные С0 (10 шт)', addQty: 10, unit: 'шт', price: country.code === 'PL' ? 9.90 : 135 },
        ]);
      } else {
        setScannedItems([
          { name: 'Сыр творожный Cremette 800г', addQty: 800, unit: 'г', price: country.code === 'PL' ? 19.90 : 560 },
          { name: 'Шоколад темный Callebaut 1кг', addQty: 1000, unit: 'г', price: country.code === 'PL' ? 54.00 : 1650 },
        ]);
      }
    }, 1200);
  };

  const handleApplyRefill = () => {
    onRefillIngredients(scannedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-rose-100 space-y-5 text-center">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧾</span>
            <h3 className="text-base font-extrabold text-[#2D2530]">Пополнение по чеку</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 text-left">
          ИИ распознает чек из магазина и автоматически прибавит купленные пачки к остаткам в холодильнике!
        </p>

        {/* Receipt Mock Selection */}
        {scannedItems.length === 0 ? (
          <div className="space-y-3 text-left">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setSelectedReceipt('supermarket')}
                className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                  selectedReceipt === 'supermarket'
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <span className="text-xl block">🛒</span>
                <p className="text-xs font-bold text-[#2D2530] mt-1">Чек: Супермаркет</p>
                <p className="text-[10px] text-slate-400">Молоко, сливки, масло, яйца</p>
              </button>

              <button
                onClick={() => setSelectedReceipt('bakery_supplies')}
                className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                  selectedReceipt === 'bakery_supplies'
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <span className="text-xl block">🍫</span>
                <p className="text-xs font-bold text-[#2D2530] mt-1">Чек: Кондитерский</p>
                <p className="text-[10px] text-slate-400">Сыр Cremette, Callebaut</p>
              </button>
            </div>

            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className="w-full py-4 rounded-2xl bg-rose-400 hover:bg-rose-500 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer btn-bouncy"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ИИ считывает чек...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Распознать и прибавить в запас ✨</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-left animate-in fade-in">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Найдено {scannedItems.length} позиций для пополнения:</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {scannedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
                >
                  <span className="font-extrabold text-[#2D2530]">{item.name}</span>
                  <div className="text-right font-mono">
                    <span className="font-bold text-rose-500">
                      +{item.addQty} {item.unit}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {item.price} {country.symbol}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleApplyRefill}
              className="w-full py-3.5 rounded-2xl bg-rose-500 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer btn-bouncy"
            >
              Прибавить к моим запасам 🎉
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
