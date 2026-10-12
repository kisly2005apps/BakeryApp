import React, { useState } from 'react';
import { Plus, Search, Sparkles, AlertTriangle, Layers, Percent, Trash2, Edit2, Check, ArrowUpDown } from 'lucide-react';
import { Ingredient, IngredientCategory, BaseUnit } from '../types';
import { computeIngredientCosts } from '../services/calculator';
import { ReceiptScanModal } from './ReceiptScanModal';

interface WarehouseModuleProps {
  ingredients: Ingredient[];
  onUpdateIngredients: (updated: Ingredient[]) => void;
}

const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  dairy: 'Молочные продукты',
  chocolate: 'Шоколад и какао',
  flour_dry: 'Мука и сухие смеси',
  nuts_fillings: 'Орехи, фрукты, начинки',
  packaging: 'Упаковка и декор',
  other: 'Прочее сырье',
};

export const WarehouseModule: React.FC<WarehouseModuleProps> = ({
  ingredients,
  onUpdateIngredients,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New ingredient form state
  const [newForm, setNewForm] = useState({
    name: '',
    category: 'dairy' as IngredientCategory,
    purchaseQuantity: 1,
    purchaseUnit: 'l' as 'g' | 'kg' | 'ml' | 'l' | 'pcs',
    purchasePrice: 100,
    wastePercent: 0,
    minStockAlert: 500,
    notes: '',
  });

  const handleWasteSliderChange = (ingredientId: string, newWastePercent: number) => {
    const updated = ingredients.map((item) => {
      if (item.id === ingredientId) {
        const costs = computeIngredientCosts(
          item.purchasePrice,
          item.purchaseQuantity,
          item.purchaseUnit,
          newWastePercent
        );
        return {
          ...item,
          wastePercent: newWastePercent,
          baseCostPerUnit: Number(costs.baseCostPerUnit.toFixed(4)),
          effectiveCostPerUnit: Number(costs.effectiveCostPerUnit.toFixed(4)),
          lastUpdated: new Date().toISOString(),
        };
      }
      return item;
    });
    onUpdateIngredients(updated);
  };

  const handleStockAdjust = (ingredientId: string, delta: number) => {
    const updated = ingredients.map((item) => {
      if (item.id === ingredientId) {
        const newStock = Math.max(0, item.inStock + delta);
        return {
          ...item,
          inStock: newStock,
          lastUpdated: new Date().toISOString(),
        };
      }
      return item;
    });
    onUpdateIngredients(updated);
  };

  const handleDeleteIngredient = (id: string) => {
    if (confirm('Удалить данный ингредиент со склада?')) {
      onUpdateIngredients(ingredients.filter((item) => item.id !== id));
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim()) return;

    const costs = computeIngredientCosts(
      newForm.purchasePrice,
      newForm.purchaseQuantity,
      newForm.purchaseUnit,
      newForm.wastePercent
    );

    const newIng: Ingredient = {
      id: `ing-${Date.now()}`,
      name: newForm.name.trim(),
      category: newForm.category,
      purchaseQuantity: newForm.purchaseQuantity,
      purchaseUnit: newForm.purchaseUnit,
      purchasePrice: newForm.purchasePrice,
      baseUnit: costs.baseUnit,
      baseQuantity: costs.baseQuantity,
      wastePercent: newForm.wastePercent,
      baseCostPerUnit: Number(costs.baseCostPerUnit.toFixed(4)),
      effectiveCostPerUnit: Number(costs.effectiveCostPerUnit.toFixed(4)),
      inStock: costs.baseQuantity,
      minStockAlert: newForm.minStockAlert,
      notes: newForm.notes.trim(),
      lastUpdated: new Date().toISOString(),
    };

    onUpdateIngredients([newIng, ...ingredients]);
    setIsCreateModalOpen(false);
    setNewForm({
      name: '',
      category: 'dairy',
      purchaseQuantity: 1,
      purchaseUnit: 'l',
      purchasePrice: 100,
      wastePercent: 0,
      minStockAlert: 500,
      notes: '',
    });
  };

  const filteredIngredients = ingredients.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = ingredients.filter(
    (item) => item.inStock <= item.minStockAlert
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Модуль 1
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">Складской учет и нормализация</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            AI-Склад и Умный парсинг сырья
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Автоматическая нормализация единиц в базовые (1 г / 1 мл), учет процента усушки/отхода сырья
            и мгновенный пересчет себестоимости чистого нетто-веса.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsScanModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer ring-1 ring-amber-400/40"
          >
            <Sparkles className="w-4 h-4" />
            <span>Добавить из чека (ИИ)</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-white/10 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Новый ингредиент</span>
          </button>
        </div>
      </div>

      {/* KPI mini-strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-white/5">
          <span className="text-xs text-slate-400 block">Всего позиций на складе</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">
            {ingredients.length}
          </span>
          <span className="text-[11px] text-slate-500">Автонормализовано в базу</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-white/5">
          <span className="text-xs text-slate-400 block">Оповещения об остатке</span>
          <span className={`text-2xl font-bold font-mono mt-1 block ${lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {lowStockCount}
          </span>
          <span className="text-[11px] text-slate-500">
            {lowStockCount > 0 ? 'Требуется закупка' : 'Запас в норме'}
          </span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-white/5">
          <span className="text-xs text-slate-400 block">Средний отход сырья</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">
            {(
              ingredients.reduce((acc, i) => acc + i.wastePercent, 0) /
              (ingredients.length || 1)
            ).toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-500">Усушка, очистка, обрезки</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-white/5">
          <span className="text-xs text-slate-400 block">Точность расчета себестоимости</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
            0.0001 ₽
          </span>
          <span className="text-[11px] text-slate-500">За 1 мл / 1 грамм нетто</span>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или заметкам..."
            className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Category Pills (functional filter buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 bg-slate-900/60 rounded-xl border border-white/5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Все ({ingredients.length})
          </button>
          {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => {
            const count = ingredients.filter((i) => i.category === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === catKey
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {catLabel} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Ingredients Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIngredients.map((item) => {
          const isLowStock = item.inStock <= item.minStockAlert;
          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl glass-panel transition-all border ${
                isLowStock
                  ? 'border-amber-500/40 bg-amber-500/[0.04]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {item.name}
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {CATEGORY_LABELS[item.category] || item.category}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteIngredient(item.id)}
                  title="Удалить позицию"
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Purchase vs Normalized stats */}
              <div className="mt-3 p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-xs space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Закупка:</span>
                  <span className="text-slate-200">
                    {item.purchaseQuantity} {item.purchaseUnit} = {item.purchasePrice} ₽
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>Базовая цена (брутто):</span>
                  <span className="text-slate-300">
                    {item.baseCostPerUnit.toFixed(4)} ₽/{item.baseUnit}
                  </span>
                </div>

                <div className="flex items-center justify-between text-emerald-400 pt-1 border-t border-white/5 font-bold">
                  <span>Чистая цена (нетто):</span>
                  <span className="text-sm">
                    {item.effectiveCostPerUnit.toFixed(4)} ₽/{item.baseUnit}
                  </span>
                </div>
              </div>

              {/* Interactive Waste Slider */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Percent className="w-3 h-3 text-amber-400" />
                    Процент отхода / усушки:
                  </span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded text-[11px]">
                    {item.wastePercent}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={item.wastePercent}
                  onChange={(e) =>
                    handleWasteSliderChange(item.id, parseInt(e.target.value, 10))
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0%</span>
                  <span>Орехи/кожура 30%</span>
                  <span>60%</span>
                </div>
              </div>

              {/* Stock in warehouse & Quick Adjustment */}
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Остаток на складе:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white font-mono">
                      {item.inStock.toLocaleString('ru-RU')} {item.baseUnit}
                    </span>
                    {isLowStock && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        Мало!
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStockAdjust(item.id, -100)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition-colors"
                    title="-100 ед"
                  >
                    -100
                  </button>
                  <button
                    onClick={() => handleStockAdjust(item.id, 500)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-xs font-mono transition-colors"
                    title="+500 ед"
                  >
                    +500
                  </button>
                </div>
              </div>

              {item.notes && (
                <p className="mt-2 text-[11px] text-slate-500 italic truncate">
                  {item.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {filteredIngredients.length === 0 && (
        <div className="p-12 text-center rounded-2xl glass-panel border border-white/10 space-y-3">
          <Layers className="w-8 h-8 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">Ингредиенты не найдены</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Попробуйте изменить поисковый запрос или добавьте новые позиции со сканера чеков.
          </p>
          <button
            onClick={() => setIsScanModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Сканировать чек через ИИ
          </button>
        </div>
      )}

      {/* Modal: Manual Add Ingredient */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl glass-panel-gold bg-[#0F172A]/95 p-6 border border-amber-500/30 text-white shadow-2xl">
            <h3 className="text-base font-bold text-white">Добавить ингредиент вручную</h3>
            <p className="text-xs text-slate-400 mt-1">
              Система автоматически нормализует единицы измерения в граммы или миллилитры.
            </p>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300">Название сырья:</label>
                <input
                  type="text"
                  required
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="например: Сливки 33% Valio"
                  className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Категория:</label>
                  <select
                    value={newForm.category}
                    onChange={(e) =>
                      setNewForm({ ...newForm, category: e.target.value as IngredientCategory })
                    }
                    className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white bg-slate-900"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">Цена за пачку (₽):</label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    required
                    value={newForm.purchasePrice}
                    onChange={(e) =>
                      setNewForm({ ...newForm, purchasePrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Объем / Вес в пачке:</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={newForm.purchaseQuantity}
                    onChange={(e) =>
                      setNewForm({ ...newForm, purchaseQuantity: parseFloat(e.target.value) || 1 })
                    }
                    className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">Единица упаковки:</label>
                  <select
                    value={newForm.purchaseUnit}
                    onChange={(e) =>
                      setNewForm({
                        ...newForm,
                        purchaseUnit: e.target.value as 'g' | 'kg' | 'ml' | 'l' | 'pcs',
                      })
                    }
                    className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white bg-slate-900"
                  >
                    <option value="l">Литры (л)</option>
                    <option value="ml">Миллилитры (мл)</option>
                    <option value="kg">Килограммы (кг)</option>
                    <option value="g">Граммы (г)</option>
                    <option value="pcs">Штуки (шт)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Процент отхода/усушки:</span>
                  <span className="font-mono text-amber-400 font-bold">{newForm.wastePercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={newForm.wastePercent}
                  onChange={(e) =>
                    setNewForm({ ...newForm, wastePercent: parseInt(e.target.value, 10) })
                  }
                  className="w-full mt-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Receipt Scanning Modal */}
      <ReceiptScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onAddIngredients={(newItems) => {
          onUpdateIngredients([...newItems, ...ingredients]);
        }}
      />
    </div>
  );
};
