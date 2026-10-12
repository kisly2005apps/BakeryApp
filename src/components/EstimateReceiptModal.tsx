import React, { useState } from 'react';
import { X, Printer, Share2, Copy, Check, Download, Cake, Sparkles, FileText, Phone, Calendar } from 'lucide-react';
import { Order, MasterRecipe, SubRecipe, Ingredient } from '../types';
import { calculateMasterRecipeEconomics } from '../services/calculator';

interface EstimateReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  masterRecipes: MasterRecipe[];
  subRecipes: SubRecipe[];
  ingredients: Ingredient[];
}

export const EstimateReceiptModal: React.FC<EstimateReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  masterRecipes,
  subRecipes,
  ingredients,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'client' | 'kitchen'>('client');

  if (!isOpen || !order) return null;

  const matchedRecipe = masterRecipes.find((r) => r.id === order.recipeId);

  // Maps
  const ingredientsMap: Record<string, Ingredient> = {};
  ingredients.forEach((ing) => (ingredientsMap[ing.id] = ing));

  const subRecipesMap: Record<string, SubRecipe> = {};
  subRecipes.forEach((sub) => (subRecipesMap[sub.id] = sub));

  const econ = matchedRecipe
    ? calculateMasterRecipeEconomics(
        matchedRecipe,
        ingredientsMap,
        subRecipesMap,
        order.targetDiameter,
        order.sellingPrice
      )
    : null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `🎂 Смета на кондитерский заказ ${order.orderNumber}
Кондитерская лаборатория "Bake-O-Metrics"
------------------------------------------------
Клиент: ${order.customerName} (${order.customerPhone})
Изделие: ${order.recipeName}
Диаметр: Ø ${order.targetDiameter} см | Вес: ~${(order.calculatedWeightGrams / 1000).toFixed(2)} кг
Дедлайн: ${new Date(order.deadline).toLocaleString('ru-RU')}
Тип выдачи: ${order.deliveryType === 'courier' ? `Доставка курьером (${order.deliveryAddress || ''})` : 'Самовывоз из студии'}

Финансовый расчет:
Стоимость заказа: ${order.sellingPrice.toLocaleString('ru-RU')} ₽
Внесенная предоплата: ${order.prepaymentAmount.toLocaleString('ru-RU')} ₽
Остаток к доплате при получении: ${order.remainingAmount.toLocaleString('ru-RU')} ₽

Пожелания: ${order.customerNotes || 'Стандартное оформление'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[94vh] flex flex-col rounded-2xl glass-panel-gold bg-[#0B0F17] text-slate-100 shadow-2xl border border-amber-500/30 overflow-hidden">
        {/* Top Modal Controls (No Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-slate-900/90 no-print">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-amber-400 font-bold">
              {order.orderNumber}
            </span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveView('client')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeView === 'client'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Смета для клиента
              </button>
              <button
                onClick={() => setActiveView('kitchen')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeView === 'kitchen'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Техкарта в цех
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Скопировано!' : 'Копировать текст'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Печать / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-950/80 font-sans print:bg-white print:text-black">
          {/* Brand Header */}
          <div className="border-b-2 border-amber-500/40 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white uppercase print:text-black">
                  BAKE-O-METRICS
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold print:border print:border-black print:text-black">
                  CONFECTIONERY LAB
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 print:text-slate-600">
                Студия авторских десертов · Прецизионные расчеты и технологии
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5 print:text-slate-600">
                г. Москва · +7 (495) 890-44-12 · info@bakeometrics.pro
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block print:text-black">
                {activeView === 'client' ? 'СМЕТА-СПЕЦИФИКАЦИЯ' : 'ПРОИЗВОДСТВЕННЫЙ ЛИСТ'}
              </span>
              <span className="text-lg font-bold font-mono text-white block mt-0.5 print:text-black">
                {order.orderNumber}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5 print:text-slate-600">
                Дата заказа: {new Date(order.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

          {/* Client & Logistics Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-white/10 text-xs print:bg-slate-50 print:border-slate-300">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block print:text-slate-600">
                Заказчик:
              </span>
              <p className="font-bold text-white text-sm print:text-black">{order.customerName}</p>
              <p className="text-slate-300 font-mono print:text-black">{order.customerPhone}</p>
              {order.customerTelegram && (
                <p className="text-amber-400 font-mono print:text-black">{order.customerTelegram}</p>
              )}
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block print:text-slate-600">
                Готовность / Выдача:
              </span>
              <p className="font-bold text-amber-300 text-sm font-mono print:text-black">
                {new Date(order.deadline).toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-slate-300 print:text-black">
                {order.deliveryType === 'courier' ? (
                  <>Курьерская доставка: {order.deliveryAddress || 'Адрес согласовывается'}</>
                ) : (
                  <>Самовывоз из кондитерской студии</>
                )}
              </p>
            </div>
          </div>

          {/* Cake Specification Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 print:text-black">
              <span>Спецификация изделия</span>
              <span>Параметры</span>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden print:border-slate-300">
              <div className="p-4 bg-slate-900/80 flex items-center justify-between border-b border-white/10 print:bg-slate-100 print:border-slate-300">
                <div>
                  <h4 className="text-base font-bold text-white print:text-black">{order.recipeName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 print:text-slate-600">
                    Геометрический диаметр: <strong className="text-white print:text-black">Ø {order.targetDiameter} см</strong> (базовый {order.baseDiameter} см, коэффициент формы ×{order.panScaleFactor.toFixed(2)})
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-bold text-amber-400 print:text-black">
                    ~{(order.calculatedWeightGrams / 1000).toFixed(2)} кг
                  </span>
                  <span className="text-[11px] text-slate-400 block print:text-slate-600">
                    ({order.calculatedWeightGrams} г)
                  </span>
                </div>
              </div>

              {/* Sub-recipes composition breakdown */}
              {econ && (
                <div className="p-4 bg-slate-950/40 text-xs space-y-2 print:bg-white">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block print:text-slate-600">
                    Технологические модули в составе:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {econ.subRecipesBreakdown.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-white/5 print:bg-slate-50 print:border-slate-200"
                      >
                        <span className="text-slate-300 font-medium print:text-black">{s.name}</span>
                        <span className="font-mono text-amber-300 font-bold print:text-black">
                          {Math.round(s.scaledWeight)} г
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {order.customerNotes && (
                <div className="p-3 bg-slate-900/40 border-t border-white/5 text-xs text-slate-300 print:bg-white print:text-black">
                  <strong className="text-amber-400 print:text-black">Пожелания / Декор: </strong>
                  {order.customerNotes}
                </div>
              )}
            </div>
          </div>

          {/* Client Financial Ledger */}
          {activeView === 'client' && (
            <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900/80 to-slate-900/90 border border-amber-500/30 space-y-3 print:bg-white print:border-slate-400">
              <div className="flex justify-between items-center text-xs text-slate-300 print:text-black">
                <span>Стоимость заказного изделия:</span>
                <span className="font-mono font-bold text-base text-white print:text-black">
                  {order.sellingPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-emerald-400 print:text-black">
                <span>Внесенная предоплата (50%):</span>
                <span className="font-mono font-bold text-base">
                  - {order.prepaymentAmount.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              <div className="border-t border-white/10 pt-3 flex justify-between items-center text-sm print:border-slate-400">
                <span className="font-bold text-white print:text-black">
                  Остаток к оплате при передаче заказа:
                </span>
                <span className="font-mono font-extrabold text-xl text-amber-400 print:text-black">
                  {order.remainingAmount.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>
          )}

          {/* Kitchen Production Sheet View */}
          {activeView === 'kitchen' && econ && (
            <div className="p-5 rounded-xl bg-slate-900/80 border border-white/10 space-y-4 print:bg-white print:border-slate-300">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400 uppercase tracking-wider print:text-black">
                  Внутренняя производственная калькуляция (только для шефа)
                </span>
                <span className="font-mono text-slate-400 print:text-slate-600">
                  Prime Cost: {Math.round(econ.totalPrimeCost)} ₽ · Маржа: {Math.round(econ.netProfit)} ₽ ({econ.marginPercent.toFixed(1)}%)
                </span>
              </div>

              <div className="space-y-3">
                {matchedRecipe?.subRecipeItems.map((item) => {
                  const sub = subRecipesMap[item.subRecipeId];
                  if (!sub) return null;
                  const scaledSubWeight = item.amountWeight * order.panScaleFactor;
                  const subRatio = scaledSubWeight / (sub.yieldWeight || 1);

                  return (
                    <div key={item.id} className="p-3 rounded-lg bg-slate-950/60 border border-white/5 text-xs space-y-2 print:bg-slate-50 print:border-slate-200">
                      <div className="flex justify-between font-bold text-white print:text-black">
                        <span>{sub.name}</span>
                        <span className="font-mono text-amber-300 print:text-black">{Math.round(scaledSubWeight)} г</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-300 print:text-black">
                        {sub.items.map((it) => {
                          const scaledAmt = it.unit === 'pcs' ? (it.amount * subRatio).toFixed(1) : Math.round(it.amount * subRatio);
                          return (
                            <div key={it.id} className="flex justify-between border-b border-white/5 pb-0.5">
                              <span>{it.name}:</span>
                              <span className="font-bold">{scaledAmt} {it.unit}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Signature and Quality Guarantee Footer */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-3 print:text-slate-600">
            <span>Гарантия свежести и соблюдения СанПиН · Срок годности 72 часа при t 4±2°C</span>
            <div className="flex items-center gap-6">
              <span>Подпись кондитера: _______________</span>
              <span>Подпись клиента: _______________</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
