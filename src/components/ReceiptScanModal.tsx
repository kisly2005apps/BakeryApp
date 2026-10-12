import React, { useState } from 'react';
import { X, Sparkles, Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, ShoppingCart, Percent } from 'lucide-react';
import { Ingredient, ReceiptParsedItem, BaseUnit, IngredientCategory } from '../types';
import { RECEIPT_PRESETS } from '../services/receiptPresets';
import { computeIngredientCosts } from '../services/calculator';

interface ReceiptScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIngredients: (newIngredients: Ingredient[]) => void;
}

export const ReceiptScanModal: React.FC<ReceiptScanModalProps> = ({
  isOpen,
  onClose,
  onAddIngredients,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'text' | 'photo'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState(RECEIPT_PRESETS[0].id);
  const [customText, setCustomText] = useState(RECEIPT_PRESETS[0].text);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [parsedItems, setParsedItems] = useState<ReceiptParsedItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>({});
  const [wasteAdjustments, setWasteAdjustments] = useState<Record<number, number>>({});
  const [storeName, setStoreName] = useState<string>('');
  const [sourceNote, setSourceNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePresetSelect = (id: string) => {
    setSelectedPresetId(id);
    const preset = RECEIPT_PRESETS.find((p) => p.id === id);
    if (preset) {
      setCustomText(preset.text);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMime(file.type);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        const base64Clean = result.split(',')[1];
        setImageBase64(base64Clean);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleParse = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setParsedItems([]);

    try {
      let body: any = {};
      if (activeTab === 'photo' && imageBase64) {
        body = { imageBase64, mimeType: imageMime || 'image/jpeg' };
      } else {
        body = { rawText: customText };
      }

      const res = await fetch('/api/ai/parse-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Ошибка сервера: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setParsedItems(data.items);
        setStoreName(data.storeName || 'Магазин / Поставщик');
        setSourceNote(data.source === 'gemini-3.8-flash' ? 'ИИ Gemini 3.8 Flash' : 'Умный локальный парсер');

        // Select all by default
        const initialSelected: Record<number, boolean> = {};
        const initialWaste: Record<number, number> = {};
        data.items.forEach((item: ReceiptParsedItem, idx: number) => {
          initialSelected[idx] = true;
          initialWaste[idx] = item.estimatedWastePercent || 0;
        });
        setSelectedItems(initialSelected);
        setWasteAdjustments(initialWaste);
      } else {
        setErrorMsg('Не удалось распознать позиции. Проверьте текст чека.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка обработки чека');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWasteChange = (index: number, val: number) => {
    setWasteAdjustments((prev) => ({ ...prev, [index]: val }));
  };

  const handleToggleSelect = (index: number) => {
    setSelectedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCommitToStock = () => {
    const newIngredients: Ingredient[] = [];

    parsedItems.forEach((item, idx) => {
      if (!selectedItems[idx]) return;

      const waste = wasteAdjustments[idx] !== undefined ? wasteAdjustments[idx] : item.estimatedWastePercent;
      let purchaseUnit: 'g' | 'kg' | 'ml' | 'l' | 'pcs' = 'pcs';
      const rawU = item.rawUnit.toLowerCase();
      if (rawU === 'л' || rawU === 'l') purchaseUnit = 'l';
      else if (rawU === 'мл' || rawU === 'ml') purchaseUnit = 'ml';
      else if (rawU === 'кг' || rawU === 'kg') purchaseUnit = 'kg';
      else if (rawU === 'г' || rawU === 'гр' || rawU === 'g') purchaseUnit = 'g';

      const costs = computeIngredientCosts(
        item.price,
        item.rawQuantity,
        purchaseUnit,
        waste
      );

      const ing: Ingredient = {
        id: `ing-${Date.now()}-${idx}`,
        name: item.name,
        category: (item.category as IngredientCategory) || 'other',
        purchaseQuantity: item.rawQuantity,
        purchaseUnit,
        purchasePrice: item.price,
        baseUnit: costs.baseUnit,
        baseQuantity: costs.baseQuantity,
        wastePercent: waste,
        baseCostPerUnit: Number(costs.baseCostPerUnit.toFixed(4)),
        effectiveCostPerUnit: Number(costs.effectiveCostPerUnit.toFixed(4)),
        inStock: costs.baseQuantity, // initial stock equal to bought package
        minStockAlert: Math.round(costs.baseQuantity * 0.25),
        notes: `Чек от ${new Date().toLocaleDateString('ru-RU')} (${storeName})`,
        lastUpdated: new Date().toISOString(),
      };

      newIngredients.push(ing);
    });

    if (newIngredients.length > 0) {
      onAddIngredients(newIngredients);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl glass-panel-gold bg-[#0F172A]/95 text-slate-100 shadow-2xl border border-amber-500/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Умный AI-сканер чеков
                <span className="text-xs px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono font-medium">
                  Gemini Flash 3.8
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Автоматическое извлечение цен, нормализация в 1 г / 1 мл и расчет усушки
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Source Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-900/80 rounded-xl border border-white/10">
            <button
              onClick={() => {
                setActiveTab('preset');
                const preset = RECEIPT_PRESETS.find((p) => p.id === selectedPresetId);
                if (preset) setCustomText(preset.text);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'preset'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Готовые пресеты чеков
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'text'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Вставить текст чека
            </button>
            <button
              onClick={() => setActiveTab('photo')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'photo'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              Загрузить фото чека
            </button>
          </div>

          {/* Tab 1: Preset selection */}
          {activeTab === 'preset' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {RECEIPT_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePresetSelect(p.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all ${
                      selectedPresetId === p.id
                        ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400/50'
                        : 'border-white/10 bg-slate-900/60 hover:border-white/20'
                    }`}
                  >
                    <p className="text-xs font-bold text-amber-300">{p.store}</p>
                    <p className="text-xs text-white font-medium mt-0.5 line-clamp-1">{p.title}</p>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/10 text-xs font-mono text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                {customText}
              </div>
            </div>
          )}

          {/* Tab 2: Raw Text */}
          {activeTab === 'text' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Вставьте текст электронного чека (ОФД / Банк / СМС / Чек из магазина):
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Пример: Сливки 33% 1л 380 руб&#10;Сыр Cremette 800г 560 руб..."
                rows={6}
                className="w-full p-3 rounded-xl glass-input text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none resize-none"
              />
            </div>
          )}

          {/* Tab 3: Photo Upload */}
          {activeTab === 'photo' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-900/40 relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={imagePreview}
                      alt="Превью чека"
                      className="max-h-48 rounded-lg object-contain border border-white/10 shadow-lg"
                    />
                    <p className="text-xs text-amber-300 mt-2 font-medium">
                      Фото загружено. Нажмите «Распознать через ИИ»
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-amber-500/20 text-amber-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-white">
                      Перетащите фото чека или кликните для выбора
                    </p>
                    <p className="text-xs text-slate-400">PNG, JPG или WEBP</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parse Trigger Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              ИИ нормализует единицы (л → мл, кг → г) и предложит кондитерский коэффициент усушки
            </span>
            <button
              onClick={handleParse}
              disabled={isLoading || (activeTab === 'photo' && !imageBase64)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Парсинг чека через ИИ...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Распознать через ИИ
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Skeleton Loaders during AI parsing */}
          {isLoading && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-44 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-28 bg-slate-800 rounded animate-pulse" />
              </div>
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-1/3 bg-slate-800 rounded" />
                    <div className="h-4 w-20 bg-slate-800 rounded" />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-8 bg-slate-800/80 rounded" />
                    <div className="h-8 bg-slate-800/80 rounded" />
                    <div className="h-8 bg-slate-800/80 rounded" />
                    <div className="h-8 bg-slate-800/80 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Parsed Results Section */}
          {parsedItems.length > 0 && !isLoading && (
            <div className="space-y-4 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Распознано позиций:</span>
                    <span className="text-amber-400 font-mono">{parsedItems.length}</span>
                    <span className="text-xs text-slate-400">({storeName})</span>
                  </h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {sourceNote} · Все цены автоматически пересчитаны в себестоимость чистого веса
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allChecked = Object.values(selectedItems).every(Boolean);
                    const updated: Record<number, boolean> = {};
                    parsedItems.forEach((_, i) => (updated[i] = !allChecked));
                    setSelectedItems(updated);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4"
                >
                  {Object.values(selectedItems).every(Boolean) ? 'Снять все' : 'Выбрать все'}
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {parsedItems.map((item, idx) => {
                  const currentWaste =
                    wasteAdjustments[idx] !== undefined
                      ? wasteAdjustments[idx]
                      : item.estimatedWastePercent;
                  const costs = computeIngredientCosts(
                    item.price,
                    item.rawQuantity,
                    (item.rawUnit.toLowerCase() as any) || 'pcs',
                    currentWaste
                  );
                  const isChecked = !!selectedItems[idx];

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isChecked
                          ? 'border-amber-500/40 bg-slate-900/90 shadow-md'
                          : 'border-white/5 bg-slate-950/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelect(idx)}
                            className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-white/20 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white tracking-wide">
                                {item.name}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                {item.category}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                              <span>
                                Упаковка:{' '}
                                <strong className="text-slate-200">
                                  {item.rawQuantity} {item.rawUnit}
                                </strong>
                              </span>
                              <span>·</span>
                              <span>
                                Цена:{' '}
                                <strong className="text-amber-400 font-mono">
                                  {item.price.toLocaleString('ru-RU')} ₽
                                </strong>
                              </span>
                              <span>·</span>
                              <span>
                                Базовая норма: {costs.baseQuantity} {costs.baseUnit} (
                                <span className="font-mono">{costs.baseCostPerUnit.toFixed(3)} ₽/{costs.baseUnit}</span>)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Net Cost Highlight */}
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block">Чистая цена за 1 {costs.baseUnit}:</span>
                          <span className="text-sm font-bold text-emerald-400 font-mono">
                            {costs.effectiveCostPerUnit.toFixed(4)} ₽
                          </span>
                        </div>
                      </div>

                      {/* Waste & Shrinkage Slider Control */}
                      <div className="mt-3 pt-3 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-amber-300">
                          <Percent className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-medium">Коэффициент отхода / усушки:</span>
                          <span className="font-mono font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                            {currentWaste}%
                          </span>
                        </div>

                        <div className="flex items-center gap-3 flex-1 max-w-xs">
                          <span className="text-[10px] text-slate-500 font-mono">0%</span>
                          <input
                            type="range"
                            min="0"
                            max="60"
                            step="1"
                            value={currentWaste}
                            onChange={(e) => handleWasteChange(idx, parseInt(e.target.value, 10))}
                            className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                          <span className="text-[10px] text-slate-500 font-mono">60%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            Отмена
          </button>

          {parsedItems.length > 0 && (
            <button
              onClick={handleCommitToStock}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
            >
              <span>Добавить на склад (+{Object.values(selectedItems).filter(Boolean).length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
