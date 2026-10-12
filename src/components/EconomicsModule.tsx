import React, { useState } from 'react';
import {
  DollarSign,
  Clock,
  Zap,
  TrendingUp,
  Percent,
  Sliders,
  Package,
  Layers,
  Sparkles,
  PieChart,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MasterRecipe, Ingredient, SubRecipe } from '../types';
import { calculateMasterRecipeEconomics } from '../services/calculator';

interface EconomicsModuleProps {
  masterRecipes: MasterRecipe[];
  ingredients: Ingredient[];
  subRecipes: SubRecipe[];
  onUpdateMasterRecipe: (updatedRecipe: MasterRecipe) => void;
}

export const EconomicsModule: React.FC<EconomicsModuleProps> = ({
  masterRecipes,
  ingredients,
  subRecipes,
  onUpdateMasterRecipe,
}) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(
    masterRecipes[0]?.id || ''
  );

  const activeRecipe =
    masterRecipes.find((r) => r.id === selectedRecipeId) || masterRecipes[0];

  // Local state for interactive sliders on active recipe
  const [laborHours, setLaborHours] = useState<number>(
    activeRecipe ? activeRecipe.prepTimeHours : 3.5
  );
  const [laborHourlyRate, setLaborHourlyRate] = useState<number>(
    activeRecipe ? activeRecipe.laborHourlyRate : 1200
  );
  const [amortizationFixed, setAmortizationFixed] = useState<number>(
    activeRecipe ? activeRecipe.equipmentAmortizationFixed : 250
  );
  const [amortizationPercent, setAmortizationPercent] = useState<number>(
    activeRecipe ? activeRecipe.equipmentAmortizationPercent : 5
  );
  const [packagingCost, setPackagingCost] = useState<number>(
    activeRecipe ? activeRecipe.packagingCost : 350
  );
  const [targetMargin, setTargetMargin] = useState<number>(
    activeRecipe ? activeRecipe.targetMarginPercent : 50
  );
  const [customPrice, setCustomPrice] = useState<number>(
    activeRecipe?.customSellingPrice || 0
  );

  // Sync state when recipe changes
  React.useEffect(() => {
    if (activeRecipe) {
      setLaborHours(activeRecipe.prepTimeHours);
      setLaborHourlyRate(activeRecipe.laborHourlyRate);
      setAmortizationFixed(activeRecipe.equipmentAmortizationFixed);
      setAmortizationPercent(activeRecipe.equipmentAmortizationPercent);
      setPackagingCost(activeRecipe.packagingCost);
      setTargetMargin(activeRecipe.targetMarginPercent);
      setCustomPrice(activeRecipe.customSellingPrice || 0);
    }
  }, [selectedRecipeId]);

  // Maps
  const ingredientsMap: Record<string, Ingredient> = {};
  ingredients.forEach((ing) => (ingredientsMap[ing.id] = ing));

  const subRecipesMap: Record<string, SubRecipe> = {};
  subRecipes.forEach((sub) => (subRecipesMap[sub.id] = sub));

  // Ephemeral recipe with slider adjustments for live economics preview
  const ephemeralRecipe: MasterRecipe = {
    ...activeRecipe,
    prepTimeHours: laborHours,
    laborHourlyRate: laborHourlyRate,
    equipmentAmortizationFixed: amortizationFixed,
    equipmentAmortizationPercent: amortizationPercent,
    packagingCost: packagingCost,
    targetMarginPercent: targetMargin,
    customSellingPrice: customPrice > 0 ? customPrice : undefined,
  };

  const econ = calculateMasterRecipeEconomics(
    ephemeralRecipe,
    ingredientsMap,
    subRecipesMap,
    activeRecipe?.baseDiameter,
    customPrice > 0 ? customPrice : undefined
  );

  const handleSaveToRecipe = () => {
    if (!activeRecipe) return;
    const updated: MasterRecipe = {
      ...activeRecipe,
      prepTimeHours: laborHours,
      laborHourlyRate,
      equipmentAmortizationFixed: amortizationFixed,
      equipmentAmortizationPercent: amortizationPercent,
      packagingCost,
      targetMarginPercent: targetMargin,
      customSellingPrice: customPrice > 0 ? customPrice : undefined,
    };
    onUpdateMasterRecipe(updated);
    alert('Параметры экономики сохранены в рецепт!');
  };

  // Cost component percentages
  const foodShare = econ.totalPrimeCost > 0 ? (econ.rawFoodCost / econ.totalPrimeCost) * 100 : 0;
  const laborShare = econ.totalPrimeCost > 0 ? (econ.laborCost / econ.totalPrimeCost) * 100 : 0;
  const amortShare = econ.totalPrimeCost > 0 ? (econ.overheadCost / econ.totalPrimeCost) * 100 : 0;
  const packShare = econ.totalPrimeCost > 0 ? (econ.packagingCost / econ.totalPrimeCost) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Модуль 3
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">Учет скрытых расходов и Unit-экономика</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Экономический движок и скрытые косты
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Полноценный расчет себестоимости: сырье + тариф кондитера + амортизация оборудования и электричество +
            упаковка. Автоматическое ценообразование на базе желаемой маржинальности.
          </p>
        </div>

        <button
          onClick={handleSaveToRecipe}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Сохранить параметры в рецепт</span>
        </button>
      </div>

      {/* Recipe Selector */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/80 rounded-xl border border-white/10 overflow-x-auto">
        {masterRecipes.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRecipeId(r.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              selectedRecipeId === r.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Top Unit Economics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Full Prime Cost */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-1">
          <span className="text-xs text-slate-400 block">Полная себестоимость (Prime Cost):</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-white">
              {Math.round(econ.totalPrimeCost).toLocaleString('ru-RU')}
            </span>
            <span className="text-sm font-mono text-slate-400">₽</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Сырье: {Math.round(econ.rawFoodCost)} ₽ + Труд: {Math.round(econ.laborCost)} ₽
          </span>
        </div>

        {/* Recommended Sale Price */}
        <div className="p-5 rounded-2xl glass-panel-gold border border-amber-500/30 space-y-1">
          <span className="text-xs text-amber-300 font-medium block">
            Рекомендуемая цена продажи:
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {Math.round(econ.recommendedPrice).toLocaleString('ru-RU')}
            </span>
            <span className="text-sm font-mono text-amber-300">₽</span>
          </div>
          <span className="text-[11px] text-amber-400/80 block">
            При рентабельности {targetMargin}% (маржа {Math.round(econ.recommendedPrice - econ.totalPrimeCost)} ₽)
          </span>
        </div>

        {/* Net Profit */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-1">
          <span className="text-xs text-slate-400 block">Чистая прибыль за торт:</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {Math.round(econ.netProfit).toLocaleString('ru-RU')}
            </span>
            <span className="text-sm font-mono text-emerald-400">₽</span>
          </div>
          <span className="text-[11px] text-emerald-400/80 block">
            Маржинальность: {econ.marginPercent.toFixed(1)}%
          </span>
        </div>

        {/* Hourly Yield */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-1">
          <span className="text-xs text-slate-400 block">Доход кондитера в час (Yield):</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {Math.round(econ.hourlyYield).toLocaleString('ru-RU')}
            </span>
            <span className="text-sm font-mono text-cyan-400">₽/час</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            (Оплата труда + прибыль) / {laborHours} ч
          </span>
        </div>
      </div>

      {/* Main 2-Col Layout: Cost Structure Sliders & Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Interactive Hidden Costs Sliders */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            Скрытые косты и параметры производства
          </h3>

          {/* 1. Labor cost slider */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                Тариф мастера и затраченное время
              </span>
              <span className="font-mono text-cyan-300 font-bold">
                {Math.round(econ.laborCost).toLocaleString('ru-RU')} ₽
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 block">
                  Стоимость часа работы:
                </label>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    min="200"
                    step="50"
                    value={laborHourlyRate}
                    onChange={(e) => setLaborHourlyRate(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg glass-input text-xs font-mono text-white"
                  />
                  <span className="text-xs text-slate-500">₽/ч</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block">
                  Время изготовления: <strong className="text-white font-mono">{laborHours} ч</strong>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={laborHours}
                  onChange={(e) => setLaborHours(parseFloat(e.target.value))}
                  className="w-full mt-2 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* 2. Amortization & Electricity */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Амортизация оборудования и электричество
              </span>
              <span className="font-mono text-amber-300 font-bold">
                {Math.round(econ.overheadCost).toLocaleString('ru-RU')} ₽
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 block">
                  Фиксированный износ на цикл (печь, миксер):
                </label>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={amortizationFixed}
                    onChange={(e) => setAmortizationFixed(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg glass-input text-xs font-mono text-white"
                  />
                  <span className="text-xs text-slate-500">₽</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block">
                  Переменная надбавка к сырью:{' '}
                  <strong className="text-white font-mono">{amortizationPercent}%</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={amortizationPercent}
                  onChange={(e) => setAmortizationPercent(parseInt(e.target.value, 10))}
                  className="w-full mt-2 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>
          </div>

          {/* 3. Packaging & Consumables */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Package className="w-4 h-4 text-purple-400" />
                Упаковка, коробка, подложка, лента
              </span>
              <span className="font-mono text-purple-300 font-bold">
                {Math.round(packagingCost).toLocaleString('ru-RU')} ₽
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                step="50"
                value={packagingCost}
                onChange={(e) => setPackagingCost(parseFloat(e.target.value) || 0)}
                className="w-36 p-2 rounded-lg glass-input text-xs font-mono text-white"
              />
              <span className="text-xs text-slate-400">
                Фиксированная себестоимость презентационной упаковки
              </span>
            </div>
          </div>

          {/* 4. Target Margin Slider */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-emerald-400" />
                Желаемая рентабельность (Маржа):
              </span>
              <span className="font-mono text-emerald-300 font-bold text-sm">
                {targetMargin}%
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="75"
              step="1"
              value={targetMargin}
              onChange={(e) => setTargetMargin(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>20% (Эконом)</span>
              <span>45% (Стандарт)</span>
              <span>60% (Премиум)</span>
              <span>75% (Люкс)</span>
            </div>
          </div>
        </div>

        {/* Right Col: Cost Structure Visualization & Pricing simulator */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-amber-400" />
            Структура себестоимости и Маржинальный анализ
          </h3>

          {/* Visual Stacked Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Распределение затрат в 100% себестоимости:</span>
              <span className="font-mono font-bold text-white">
                100% = {Math.round(econ.totalPrimeCost)} ₽
              </span>
            </div>

            <div className="h-5 w-full bg-slate-800 rounded-lg overflow-hidden flex border border-white/10">
              <div
                style={{ width: `${foodShare}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Сырье: ${foodShare.toFixed(1)}%`}
              />
              <div
                style={{ width: `${laborShare}%` }}
                className="bg-cyan-500 h-full transition-all"
                title={`Труд: ${laborShare.toFixed(1)}%`}
              />
              <div
                style={{ width: `${amortShare}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`Амортизация: ${amortShare.toFixed(1)}%`}
              />
              <div
                style={{ width: `${packShare}%` }}
                className="bg-purple-500 h-full transition-all"
                title={`Упаковка: ${packShare.toFixed(1)}%`}
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-300">
                  Сырье (Food Cost):{' '}
                  <strong className="font-mono text-emerald-400">
                    {Math.round(econ.rawFoodCost)} ₽ ({foodShare.toFixed(1)}%)
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-cyan-500" />
                <span className="text-slate-300">
                  Оплата труда мастера:{' '}
                  <strong className="font-mono text-cyan-400">
                    {Math.round(econ.laborCost)} ₽ ({laborShare.toFixed(1)}%)
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500" />
                <span className="text-slate-300">
                  Амортизация/Свет:{' '}
                  <strong className="font-mono text-amber-400">
                    {Math.round(econ.overheadCost)} ₽ ({amortShare.toFixed(1)}%)
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-purple-500" />
                <span className="text-slate-300">
                  Упаковка:{' '}
                  <strong className="font-mono text-purple-400">
                    {Math.round(econ.packagingCost)} ₽ ({packShare.toFixed(1)}%)
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Simulator / Custom Selling Price */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
            <span className="text-xs font-semibold text-white block">
              Симулятор реальной цены продажи (ручной ввод):
            </span>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                <input
                  type="number"
                  placeholder={`Рекомендовано: ${Math.round(econ.recommendedPrice)}`}
                  value={customPrice || ''}
                  onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono text-white placeholder-slate-500"
                />
              </div>

              {customPrice > 0 && (
                <button
                  onClick={() => setCustomPrice(0)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Сбросить к рекомендованной
                </button>
              )}
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-white/5 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Итоговая цена клиенту:</span>
                <span className="text-white font-bold text-sm">
                  {Math.round(econ.sellingPrice).toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Чистая маржа:</span>
                <span className="text-emerald-400 font-bold">
                  +{Math.round(econ.netProfit).toLocaleString('ru-RU')} ₽ ({econ.marginPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Доля фудкоста от чека:</span>
                <span className="text-slate-300 font-bold">
                  {econ.foodCostPercent.toFixed(1)}% (целевая норма 20-30%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
