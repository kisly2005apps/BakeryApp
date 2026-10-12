import React, { useState } from 'react';
import {
  GitFork,
  Maximize2,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  Scale,
  Clock,
  ArrowRight,
  FolderTree,
  CircleDot,
  CheckCircle2
} from 'lucide-react';
import {
  Ingredient,
  SubRecipe,
  MasterRecipe,
  BaseUnit,
  MasterRecipeSubRecipeItem
} from '../types';
import {
  calculateSubRecipeCost,
  calculateGeometricScale,
  calculateMasterRecipeEconomics
} from '../services/calculator';

interface RecipeTreeModuleProps {
  ingredients: Ingredient[];
  subRecipes: SubRecipe[];
  masterRecipes: MasterRecipe[];
  onUpdateSubRecipes: (subs: SubRecipe[]) => void;
  onUpdateMasterRecipes: (masters: MasterRecipe[]) => void;
  onSelectRecipeForOrder?: (recipe: MasterRecipe, targetDiameter: number) => void;
}

export const RecipeTreeModule: React.FC<RecipeTreeModuleProps> = ({
  ingredients,
  subRecipes,
  masterRecipes,
  onUpdateSubRecipes,
  onUpdateMasterRecipes,
  onSelectRecipeForOrder,
}) => {
  const [selectedMasterId, setSelectedMasterId] = useState<string>(
    masterRecipes[0]?.id || ''
  );
  const [targetDiameter, setTargetDiameter] = useState<number>(22);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'sub-1': true,
    'sub-2': true,
    'sub-3': true,
    'sub-4': true,
  });

  // Modal states
  const [isSubRecipeModalOpen, setIsSubRecipeModalOpen] = useState(false);
  const [editingSubRecipe, setEditingSubRecipe] = useState<SubRecipe | null>(null);

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Maps for fast lookups
  const ingredientsMap: Record<string, Ingredient> = {};
  ingredients.forEach((ing) => (ingredientsMap[ing.id] = ing));

  const subRecipesMap: Record<string, SubRecipe> = {};
  subRecipes.forEach((sub) => (subRecipesMap[sub.id] = sub));

  const activeMaster = masterRecipes.find((r) => r.id === selectedMasterId) || masterRecipes[0];

  // Geometric scale factor
  const baseDiam = activeMaster ? activeMaster.baseDiameter : 16;
  const scaleFactor = calculateGeometricScale(targetDiameter, baseDiam);

  // Economic calculation with geometric scaling
  const masterEconomics = activeMaster
    ? calculateMasterRecipeEconomics(
        activeMaster,
        ingredientsMap,
        subRecipesMap,
        targetDiameter
      )
    : null;

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleAskAiTechnologist = async () => {
    if (!activeMaster) return;
    setIsAiLoading(true);
    setAiAdvice(null);
    try {
      const res = await fetch('/api/ai/recipe-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeName: activeMaster.name,
          baseDiameter: activeMaster.baseDiameter,
          targetDiameter: targetDiameter,
          ingredients: masterEconomics?.subRecipesBreakdown,
          notes: activeMaster.description,
        }),
      });
      const data = await res.json();
      setAiAdvice(data.recommendation);
    } catch {
      setAiAdvice(
        `Масштабирование с ${baseDiam} см до ${targetDiameter} см (коэффициент ${scaleFactor.toFixed(2)}): увеличьте выпечку бисквита на 12-15% времени при 165°C.`
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  // Sub-recipe creation handler
  const handleSaveSubRecipe = (sub: SubRecipe) => {
    const existingIdx = subRecipes.findIndex((s) => s.id === sub.id);
    if (existingIdx >= 0) {
      const updated = [...subRecipes];
      updated[existingIdx] = sub;
      onUpdateSubRecipes(updated);
    } else {
      onUpdateSubRecipes([sub, ...subRecipes]);
    }
    setIsSubRecipeModalOpen(false);
    setEditingSubRecipe(null);
  };

  const handleDeleteSubRecipe = (id: string) => {
    if (confirm('Удалить данный суб-рецепт?')) {
      onUpdateSubRecipes(subRecipes.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Модуль 2
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">Архитектура изделия и геометрия</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Древовидный конструктор рецептов и геометрический перерасчет
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Сборка торта из готовых суб-рецептов («Бисквит», «Крем», «Конфи», «Ганаш») и автоматический пересчет
            массы ингредиентов по формуле площади круга: S = π·(D/2)².
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setEditingSubRecipe(null);
              setIsSubRecipeModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-white/10 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Создать суб-рецепт (Крем/Бисквит)</span>
          </button>
        </div>
      </div>

      {/* Recipe Selection Tabs & Geometric Scaling Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Master Recipe Hierarchy Tree */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recipe Switcher */}
          <div className="flex items-center gap-2 p-1 bg-slate-900/80 rounded-xl border border-white/10 overflow-x-auto">
            {masterRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => {
                  setSelectedMasterId(recipe.id);
                  setTargetDiameter(recipe.baseDiameter);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  selectedMasterId === recipe.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {recipe.name}
              </button>
            ))}
          </div>

          {activeMaster && masterEconomics && (
            <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-6">
              {/* Recipe Meta Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FolderTree className="w-5 h-5 text-amber-400" />
                    {activeMaster.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{activeMaster.description}</p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/10">
                    Базовый: Ø {activeMaster.baseDiameter} см
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    Заказ: Ø {targetDiameter} см (×{scaleFactor.toFixed(2)})
                  </span>
                </div>
              </div>

              {/* Sub-recipes Tree Container */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-2">
                  <span>МОДУЛИ / СУБ-РЕЦЕПТЫ В СОСТАВЕ ТОРТА</span>
                  <span>ВЕС (БАЗА → СКЕЙЛ) · СЕБЕСТОИМОСТЬ</span>
                </div>

                {activeMaster.subRecipeItems.map((item) => {
                  const sub = subRecipesMap[item.subRecipeId];
                  const isExpanded = !!expandedNodes[item.subRecipeId];
                  const originalWeight = item.amountWeight;
                  const scaledWeight = Math.round(originalWeight * scaleFactor);
                  
                  let subUnitCost = 0;
                  let subItems: any[] = [];
                  if (sub) {
                    const subCostData = calculateSubRecipeCost(sub, ingredientsMap);
                    subUnitCost = subCostData.costPerGram;
                    subItems = subCostData.itemsBreakdown;
                  }
                  const totalSubCost = scaledWeight * subUnitCost;

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-white/10 bg-slate-900/60 overflow-hidden transition-all"
                    >
                      {/* Sub-Recipe Header Row */}
                      <div
                        onClick={() => toggleNode(item.subRecipeId)}
                        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <button className="text-slate-400 hover:text-white">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-amber-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                              {sub ? sub.name : item.name}
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                                {sub?.category || 'модуль'}
                              </span>
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Себестоимость готового полуфабриката:{' '}
                              <strong className="text-slate-300 font-mono">
                                {(subUnitCost * 100).toFixed(2)} ₽/100г
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Weight & Cost Stats */}
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-white">
                            <span className="text-slate-400 line-through mr-1.5 text-[11px]">
                              {originalWeight} г
                            </span>
                            <span className="text-amber-300">{scaledWeight} г</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {totalSubCost.toFixed(1)} ₽
                          </span>
                        </div>
                      </div>

                      {/* Nested Atomic Ingredients inside Sub-Recipe */}
                      {isExpanded && sub && (
                        <div className="px-4 pb-3 pt-1 border-t border-white/5 bg-slate-950/50 space-y-2">
                          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                            Сырьевой состав суб-рецепта (пропорции на {scaledWeight} г):
                          </div>

                          {sub.items.map((subIng) => {
                            const ing = ingredientsMap[subIng.ingredientId];
                            // Scale proportionally: (scaledWeight / sub.yieldWeight) * subIng.amount
                            const subRatio = scaledWeight / (sub.yieldWeight || 1);
                            const scaledIngAmount =
                              subIng.unit === 'pcs'
                                ? Number((subIng.amount * subRatio).toFixed(1))
                                : Math.round(subIng.amount * subRatio);
                            const ingCost = ing
                              ? scaledIngAmount * ing.effectiveCostPerUnit
                              : 0;

                            return (
                              <div
                                key={subIng.id}
                                className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-900/40 border border-white/5"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
                                  <span className="text-slate-300 font-medium">{subIng.name}</span>
                                  {ing && ing.wastePercent > 0 && (
                                    <span className="text-[10px] text-amber-400/80 font-mono">
                                      (отход {ing.wastePercent}%)
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 font-mono text-[11px]">
                                  <span className="text-slate-300">
                                    {scaledIngAmount} {subIng.unit}
                                  </span>
                                  <span className="text-slate-500">·</span>
                                  <span className="text-emerald-400 font-semibold">
                                    {ingCost.toFixed(1)} ₽
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                          {sub.instructions && (
                            <p className="text-[11px] text-slate-400 italic pt-1 border-t border-white/5">
                              Техкарта: {sub.instructions}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Direct Ingredients (Packaging, Substrate, Decor) */}
                {activeMaster.directIngredients.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs text-slate-400 font-semibold px-2 mb-2">
                      ПРЯМЫЕ РАСХОДНИКИ И УПАКОВКА (НЕ МАСШТАБИРУЮТСЯ ПО КВАДРАТУ)
                    </div>
                    {activeMaster.directIngredients.map((item) => {
                      const ing = ingredientsMap[item.ingredientId];
                      const cost = ing ? item.amount * ing.effectiveCostPerUnit : 0;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-slate-900/40 text-xs mb-2"
                        >
                          <span className="text-slate-200 font-medium">{item.name}</span>
                          <div className="font-mono text-xs flex items-center gap-3">
                            <span className="text-slate-400">
                              {item.amount} {item.unit}
                            </span>
                            <span className="text-emerald-400 font-bold">{cost.toFixed(1)} ₽</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Total Calculated Weight & Raw Material Prime Cost */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 block">
                    Итоговая расчетная масса изделия при Ø {targetDiameter} см:
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xl font-bold font-mono text-white">
                      {(masterEconomics.scaledWeightGrams / 1000).toFixed(2)} кг
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ({masterEconomics.scaledWeightGrams} г)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">
                    Стоимость сырья (Food Cost):
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {Math.round(masterEconomics.rawFoodCost).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Interactive Geometric Scaling Controls & AI Technologist */}
        <div className="space-y-4">
          {/* Pan Diameter Geometric Slider & Circle Viz */}
          <div className="p-5 rounded-2xl glass-panel-gold border border-amber-500/30 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Геометрия формы</h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-lg">
                К = {scaleFactor.toFixed(4)}
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Диаметр формы заказа:</span>
                <span className="text-base font-bold font-mono text-white">
                  {targetDiameter} см
                </span>
              </div>

              <input
                type="range"
                min="12"
                max="32"
                step="1"
                value={targetDiameter}
                onChange={(e) => setTargetDiameter(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>12 см</span>
                <span>База: {baseDiam} см</span>
                <span>22 см</span>
                <span>32 см</span>
              </div>
            </div>

            {/* Quick buttons */}
            <div className="flex items-center gap-1.5">
              {[14, 16, 18, 20, 22, 24, 26, 28].map((d) => (
                <button
                  key={d}
                  onClick={() => setTargetDiameter(d)}
                  className={`flex-1 py-1 text-[11px] font-mono rounded transition-colors ${
                    targetDiameter === d
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Visual Circular Representation */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Target Pan Circle */}
                <div
                  style={{
                    width: `${Math.min(130, (targetDiameter / 32) * 130)}px`,
                    height: `${Math.min(130, (targetDiameter / 32) * 130)}px`,
                  }}
                  className="rounded-full border-2 border-amber-400 bg-amber-500/10 flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                  <div
                    style={{
                      width: `${Math.min(130, (baseDiam / 32) * 130)}px`,
                      height: `${Math.min(130, (baseDiam / 32) * 130)}px`,
                    }}
                    className="rounded-full border border-dashed border-slate-500/60 flex items-center justify-center text-[10px] font-mono text-slate-400"
                  >
                    база {baseDiam}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-center text-slate-400">
                Площадь формы:{' '}
                <strong className="text-amber-300 font-mono">
                  {(Math.PI * Math.pow(targetDiameter / 2, 2)).toFixed(0)} см²
                </strong>{' '}
                (в <strong className="text-white font-mono">{scaleFactor.toFixed(2)}</strong> раз больше базовой)
              </p>
            </div>

            {/* Action to create order from this scaled configuration */}
            {onSelectRecipeForOrder && activeMaster && (
              <button
                onClick={() => onSelectRecipeForOrder(activeMaster, targetDiameter)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
              >
                <span>Создать заказ на торт Ø {targetDiameter} см</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AI Pastry Technologist Advisor */}
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">ИИ-Технолог выпечки</h4>
              </div>
              <button
                onClick={handleAskAiTechnologist}
                disabled={isAiLoading}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 disabled:opacity-50"
              >
                {isAiLoading ? 'Расчет...' : 'Совет по выпечке'}
              </button>
            </div>

            <p className="text-xs text-slate-400">
              При изменении диаметра формы изменяется теплопередача в духовке. ИИ подберет
              температурный режим и время выпечки для {targetDiameter} см.
            </p>

            {aiAdvice && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/20 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line animate-in fade-in">
                {aiAdvice}
              </div>
            )}
          </div>

          {/* Sub-recipes library quick drawer */}
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5 text-amber-400" />
                База готовых суб-рецептов ({subRecipes.length})
              </h4>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {subRecipes.map((sub) => {
                const { costPer100g } = calculateSubRecipeCost(sub, ingredientsMap);
                return (
                  <div
                    key={sub.id}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white truncate max-w-[150px]">{sub.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Выход: {sub.yieldWeight}г · {costPer100g.toFixed(1)} ₽/100г
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingSubRecipe(sub);
                          setIsSubRecipeModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Редактировать"
                      >
                        <Scale className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubRecipe(sub.id)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create / Edit Sub-Recipe */}
      {isSubRecipeModalOpen && (
        <SubRecipeEditorModal
          isOpen={isSubRecipeModalOpen}
          initialData={editingSubRecipe}
          ingredients={ingredients}
          onClose={() => {
            setIsSubRecipeModalOpen(false);
            setEditingSubRecipe(null);
          }}
          onSave={handleSaveSubRecipe}
        />
      )}
    </div>
  );
};

// Sub-recipe editor modal component
interface SubRecipeEditorModalProps {
  isOpen: boolean;
  initialData: SubRecipe | null;
  ingredients: Ingredient[];
  onClose: () => void;
  onSave: (sub: SubRecipe) => void;
}

const SubRecipeEditorModal: React.FC<SubRecipeEditorModalProps> = ({
  isOpen,
  initialData,
  ingredients,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<SubRecipe['category']>(
    initialData?.category || 'cream'
  );
  const [yieldWeight, setYieldWeight] = useState(initialData?.yieldWeight || 500);
  const [instructions, setInstructions] = useState(initialData?.instructions || '');
  const [items, setItems] = useState<Array<{ ingredientId: string; amount: number }>>(
    initialData?.items.map((i) => ({ ingredientId: i.ingredientId, amount: i.amount })) || [
      { ingredientId: ingredients[0]?.id || '', amount: 200 },
    ]
  );

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { ingredientId: ingredients[0]?.id || '', amount: 100 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: 'ingredientId' | 'amount', val: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedItems = items.map((it, idx) => {
      const ing = ingredients.find((i) => i.id === it.ingredientId);
      return {
        id: `sbi-${Date.now()}-${idx}`,
        ingredientId: it.ingredientId,
        name: ing ? ing.name : 'Ингредиент',
        amount: Number(it.amount),
        unit: (ing ? ing.baseUnit : 'g') as BaseUnit,
      };
    });

    const sub: SubRecipe = {
      id: initialData?.id || `sub-${Date.now()}`,
      name: name.trim(),
      category,
      yieldWeight: Number(yieldWeight) || 500,
      items: formattedItems,
      instructions: instructions.trim(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    onSave(sub);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl glass-panel-gold bg-[#0F172A]/95 border border-amber-500/30 text-white shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            {initialData ? 'Редактировать суб-рецепт' : 'Новый кондитерский суб-рецепт'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300">Название полуфабриката:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="например: Шелковый Крем-чиз на белом шоколаде"
              className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300">Тип модуля:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white bg-slate-900"
              >
                <option value="biscuit">Бисквит / Коржи</option>
                <option value="cream">Крем / Мусс / Ганаш</option>
                <option value="filling">Конфи / Кули / Пралине</option>
                <option value="soak">Пропитка / Сироп</option>
                <option value="decor">Декор / Покрытие</option>
                <option value="other">Прочее</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300">
                Выход готового веса (граммы нетто):
              </label>
              <input
                type="number"
                min="10"
                required
                value={yieldWeight}
                onChange={(e) => setYieldWeight(parseFloat(e.target.value) || 100)}
                className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Items in Sub-Recipe */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold">Ингредиенты суб-рецепта:</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-amber-400 hover:text-amber-300 font-medium"
              >
                + Добавить позицию
              </button>
            </div>

            {items.map((it, idx) => {
              const selectedIng = ingredients.find((i) => i.id === it.ingredientId);
              return (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={it.ingredientId}
                    onChange={(e) => handleItemChange(idx, 'ingredientId', e.target.value)}
                    className="flex-1 p-2 rounded-xl glass-input text-xs text-white bg-slate-900"
                  >
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.effectiveCostPerUnit.toFixed(2)} ₽/{ing.baseUnit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={it.amount}
                    onChange={(e) =>
                      handleItemChange(idx, 'amount', parseFloat(e.target.value) || 0)
                    }
                    className="w-24 p-2 rounded-xl glass-input text-xs text-white font-mono"
                    placeholder="Кол-во"
                  />
                  <span className="text-xs text-slate-400 w-8 font-mono">
                    {selectedIng?.baseUnit || 'г'}
                  </span>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">Краткая инструкция/техкарта:</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              placeholder="Температура ингредиентов, скорость взбивания..."
              className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Сохранить суб-рецепт
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
