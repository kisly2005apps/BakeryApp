import React, { useState } from 'react';
import {
  X,
  Camera,
  Sparkles,
  Check,
  Plus,
  Minus,
  ArrowRight,
  RefreshCw,
  Sliders,
  DollarSign,
  ScanLine
} from 'lucide-react';
import { CountryConfig, ARScannedProduct, Ingredient, IngredientCategory } from '../types';
import { SAMPLE_AR_PRODUCTS } from '../services/storage';

interface ARCameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  country: CountryConfig;
  onAddIngredient: (ing: Ingredient) => void;
}

export const ARCameraScannerModal: React.FC<ARCameraScannerModalProps> = ({
  isOpen,
  onClose,
  country,
  onAddIngredient,
}) => {
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [step, setStep] = useState<'scanning' | 'slider' | 'sealed' | 'price' | 'done'>('scanning');
  const [isRecognizing, setIsRecognizing] = useState(false);

  // Form states during the flow
  const [remainingPercent, setRemainingPercent] = useState<number>(40);
  const [hasSealedPacks, setHasSealedPacks] = useState<boolean | null>(null);
  const [sealedCount, setSealedCount] = useState<number>(1);
  const [useSuggestedPrice, setUseSuggestedPrice] = useState<boolean>(true);
  const [customPriceValue, setCustomPriceValue] = useState<string>('');

  if (!isOpen) return null;

  const currentProduct: ARScannedProduct = SAMPLE_AR_PRODUCTS[selectedProductIndex];
  const suggestedPrice =
    currentProduct.regionalPrices[country.code] ||
    currentProduct.regionalPrices['PL'] ||
    5.0;

  // Trigger recognition mock
  const handleRecognize = () => {
    setIsRecognizing(true);
    setTimeout(() => {
      setIsRecognizing(false);
      setStep('slider');
    }, 1100);
  };

  const handleNextProductInList = () => {
    setSelectedProductIndex((prev) => (prev + 1) % SAMPLE_AR_PRODUCTS.length);
    setStep('scanning');
    setRemainingPercent(50);
    setHasSealedPacks(null);
    setSealedCount(1);
    setUseSuggestedPrice(true);
    setCustomPriceValue('');
  };

  const handleSaveProduct = () => {
    const finalPrice = useSuggestedPrice
      ? suggestedPrice
      : parseFloat(customPriceValue) || suggestedPrice;

    // Calculate total inStock
    // e.g. 1L pack: open 40% = 400ml + sealed 1 pack = 1000ml -> total 1400ml
    let baseQtyPerPack = currentProduct.standardPackQty;
    let baseUnit: 'g' | 'ml' | 'pcs' = 'g';

    if (currentProduct.standardPackUnit === 'l') {
      baseQtyPerPack = currentProduct.standardPackQty * 1000;
      baseUnit = 'ml';
    } else if (currentProduct.standardPackUnit === 'ml') {
      baseQtyPerPack = currentProduct.standardPackQty;
      baseUnit = 'ml';
    } else if (currentProduct.standardPackUnit === 'kg') {
      baseQtyPerPack = currentProduct.standardPackQty * 1000;
      baseUnit = 'g';
    } else if (currentProduct.standardPackUnit === 'g') {
      baseQtyPerPack = currentProduct.standardPackQty;
      baseUnit = 'g';
    } else {
      baseUnit = 'pcs';
      baseQtyPerPack = currentProduct.standardPackQty;
    }

    const openPackAmount = Math.round((remainingPercent / 100) * baseQtyPerPack);
    const sealedAmount = (hasSealedPacks ? sealedCount : 0) * baseQtyPerPack;
    const totalInStock = openPackAmount + sealedAmount;

    const baseCostPerUnit = finalPrice / (baseQtyPerPack || 1);

    const newIng: Ingredient = {
      id: `ing-${Date.now()}`,
      name: currentProduct.name,
      category: currentProduct.category,
      emoji: currentProduct.emoji,
      purchaseQuantity: currentProduct.standardPackQty,
      purchaseUnit: currentProduct.standardPackUnit,
      purchasePrice: finalPrice,
      baseUnit,
      baseQuantity: baseQtyPerPack,
      wastePercent: 2,
      baseCostPerUnit,
      effectiveCostPerUnit: baseCostPerUnit * 1.02,
      openPackRemainingPercent: remainingPercent,
      sealedPacksCount: hasSealedPacks ? sealedCount : 0,
      inStock: totalInStock,
      minStockAlert: Math.round(baseQtyPerPack * 0.3),
      notes: `Добавлено через AR-сканер`,
      lastUpdated: new Date().toISOString(),
    };

    onAddIngredient(newIng);
    setStep('done');
  };

  const getSliderHint = (val: number) => {
    if (val <= 15) return 'Почти на донышке 🤏';
    if (val <= 45) return 'Меньше половины упаковки 🥛';
    if (val <= 75) return 'Больше половины упаковки 🧃';
    return 'Почти полная упаковка! ✨';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-[#FAF7F5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white flex flex-col max-h-[94vh]">
        {/* Top Camera Header */}
        <div className="px-5 py-3.5 bg-white border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#2D2530] flex items-center gap-1.5">
                AR-сканер холодильника
                <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                  ИИ Vision
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mock Camera Viewfinder */}
        <div className="relative bg-slate-900 aspect-video sm:h-52 overflow-hidden flex flex-col items-center justify-center text-white">
          {/* Camera Grid Lines & AR Target Reticle */}
          <div className="absolute inset-4 border border-white/20 rounded-2xl pointer-events-none flex items-center justify-center">
            <div className="w-28 h-28 border-2 border-rose-400 rounded-2xl relative animate-pulse">
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-rose-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-rose-400" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-rose-400" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-rose-400" />
              <ScanLine className="w-6 h-6 text-rose-400 absolute inset-0 m-auto" />
            </div>
          </div>

          {/* Product in Viewfinder */}
          <div className="z-10 flex flex-col items-center space-y-1">
            <span className="text-6xl filter drop-shadow-md transform hover:scale-110 transition-transform">
              {currentProduct.emoji}
            </span>
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20">
              {currentProduct.name}
            </div>
          </div>

          {/* Bottom Switcher inside camera */}
          <div className="absolute bottom-2 inset-x-4 flex items-center justify-between text-[11px] text-white/80">
            <span>Продукт в кадре</span>
            <button
              onClick={handleNextProductInList}
              className="text-rose-300 hover:text-white font-bold flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full cursor-pointer"
            >
              Сменить объект <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Interactive Steps Form */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {/* Step 1: Scanning Prompt */}
          {step === 'scanning' && (
            <div className="text-center space-y-4 py-2">
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-[#2D2530]">
                  Наведи камеру на пачку или баночку
                </h4>
                <p className="text-xs text-slate-500">
                  ИИ распознает кондитерский продукт и поможет быстро учесть открытый остаток.
                </p>
              </div>

              <button
                onClick={handleRecognize}
                disabled={isRecognizing}
                className="w-full py-4 rounded-2xl bg-rose-400 hover:bg-rose-500 text-white font-extrabold text-base shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer btn-bouncy"
              >
                {isRecognizing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>ИИ сканирует упаковку...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Распознать {currentProduct.name}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Open pack remaining slider */}
          {step === 'slider' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-center gap-3">
                <span className="text-3xl">{currentProduct.emoji}</span>
                <div>
                  <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">
                    ИИ распознал:
                  </span>
                  <p className="text-sm font-extrabold text-[#2D2530]">{currentProduct.name}</p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-white rounded-2xl border-2 border-rose-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2D2530]">
                    Сколько осталось в открытой упаковке?
                  </span>
                  <span className="text-lg font-black font-mono text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-xl">
                    {remainingPercent}%
                  </span>
                </div>

                {/* Big Ergonomic Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={remainingPercent}
                  onChange={(e) => setRemainingPercent(parseInt(e.target.value, 10))}
                  className="w-full h-3 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />

                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span className="text-rose-500">{getSliderHint(remainingPercent)}</span>
                  <span>
                    ~{Math.round((remainingPercent / 100) * currentProduct.standardPackQty)}{' '}
                    {currentProduct.standardPackUnit}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStep('sealed')}
                className="w-full py-3.5 rounded-2xl bg-rose-400 hover:bg-rose-500 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer btn-bouncy"
              >
                <span>Далее: Закрытые пачки</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 3: Additional Sealed Packages */}
          {step === 'sealed' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center space-y-1">
                <span className="text-3xl block">📦</span>
                <h4 className="text-base font-extrabold text-[#2D2530]">
                  Есть еще такие же закрытые упаковки?
                </h4>
                <p className="text-xs text-slate-500">
                  Например, целая закрытая бутылка молока или пачка масла в запасе.
                </p>
              </div>

              {hasSealedPacks === null ? (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      setHasSealedPacks(true);
                      setSealedCount(1);
                    }}
                    className="py-4 rounded-2xl bg-rose-500 text-white font-black text-base shadow-md cursor-pointer btn-bouncy"
                  >
                    Да, есть запас! ✨
                  </button>
                  <button
                    onClick={() => {
                      setHasSealedPacks(false);
                      setStep('price');
                    }}
                    className="py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer btn-bouncy"
                  >
                    Нет, только эта
                  </button>
                </div>
              ) : (
                <div className="space-y-4 p-4 bg-white rounded-2xl border-2 border-rose-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D2530]">
                      Количество закрытых упаковок:
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSealedCount(Math.max(1, sealedCount - 1))}
                        className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 font-bold flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-xl font-black font-mono text-[#2D2530] w-6 text-center">
                        {sealedCount}
                      </span>
                      <button
                        onClick={() => setSealedCount(sealedCount + 1)}
                        className="w-9 h-9 rounded-xl bg-rose-500 text-white font-bold flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('price')}
                    className="w-full py-3.5 rounded-2xl bg-rose-400 hover:bg-rose-500 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer btn-bouncy"
                  >
                    <span>Далее: Умная цена</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Smart Regional Price */}
          {step === 'price' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-1">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                  Умный подбор цен ({country.name})
                </span>
                <p className="text-sm text-[#2D2530] font-medium">
                  Средняя цена в твоем регионе:{' '}
                  <strong className="text-base font-black text-rose-600 font-mono">
                    {suggestedPrice} {country.symbol}
                  </strong>
                </p>
                <p className="text-[11px] text-slate-500">
                  Добавить продукт в холодильник по этой цене?
                </p>
              </div>

              {useSuggestedPrice ? (
                <div className="space-y-2">
                  <button
                    onClick={handleSaveProduct}
                    className="w-full py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-base shadow-lg shadow-rose-200 transition-all cursor-pointer btn-bouncy"
                  >
                    Да, добавить за {suggestedPrice} {country.symbol} ✨
                  </button>
                  <button
                    onClick={() => {
                      setUseSuggestedPrice(false);
                      setCustomPriceValue(suggestedPrice.toString());
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Ввести цену вручную
                  </button>
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-white rounded-2xl border border-rose-200">
                  <label className="text-xs font-bold text-slate-600 block">
                    Твоя цена за упаковку ({country.symbol}):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={customPriceValue}
                      onChange={(e) => setCustomPriceValue(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 p-3 rounded-xl border-2 border-rose-200 font-mono text-base font-bold text-[#2D2530] focus:outline-none focus:border-rose-400"
                    />
                    <span className="text-base font-bold text-rose-500 font-mono">
                      {country.symbol}
                    </span>
                  </div>

                  <button
                    onClick={handleSaveProduct}
                    className="w-full py-3.5 rounded-2xl bg-rose-500 text-white font-extrabold text-sm shadow-md cursor-pointer btn-bouncy"
                  >
                    Сохранить с моей ценой ✨
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Success & Continue */}
          {step === 'done' && (
            <div className="text-center space-y-4 py-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-500 mx-auto flex items-center justify-center text-3xl">
                🎉
              </div>
              <div>
                <h4 className="text-lg font-black text-[#2D2530]">
                  {currentProduct.name} на полочке!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Остаток учтен, себестоимость в десертах будет рассчитываться автоматически.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleNextProductInList}
                  className="py-3.5 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-xs cursor-pointer btn-bouncy"
                >
                  + Сканировать следующий
                </button>
                <button
                  onClick={onClose}
                  className="py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md cursor-pointer btn-bouncy"
                >
                  В холодильник 🧊
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
