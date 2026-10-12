import React, { useState } from 'react';
import {
  Plus,
  Clock,
  Cake,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Share2,
  ExternalLink,
  Flame
} from 'lucide-react';
import { PastryRecipe, CountryConfig, Ingredient } from '../types';
import { RecipeImportModal } from './RecipeImportModal';

interface RecipesModuleProps {
  country: CountryConfig;
  recipes: PastryRecipe[];
  ingredients: Ingredient[];
  onUpdateRecipes: (updated: PastryRecipe[]) => void;
  onBakeRecipeForOrder: (recipe: PastryRecipe) => void;
}

export const RecipesModule: React.FC<RecipesModuleProps> = ({
  country,
  recipes,
  ingredients,
  onUpdateRecipes,
  onBakeRecipeForOrder,
}) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(recipes[0]?.id || null);

  const handleAddRecipe = (newRec: PastryRecipe) => {
    onUpdateRecipes([newRec, ...recipes]);
    setExpandedRecipeId(newRec.id);
  };

  const toggleExpand = (id: string) => {
    setExpandedRecipeId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-rose-500">
            Вкладка 2
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2D2530] tracking-tight flex items-center gap-2">
            Мои рецепты 📖
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Умный импорт из соцсетей или фото, авто-расчет себестоимости и проверка запасов
          </p>
        </div>

        {/* Big Rounded "Add Recipe" Button */}
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="px-6 py-4 rounded-3xl bg-rose-400 hover:bg-rose-500 text-white font-extrabold text-sm shadow-xl shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer btn-bouncy"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Добавить рецепт (ИИ) ✨</span>
        </button>
      </div>

      {/* Recipes Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recipes.map((recipe) => {
          const isExpanded = expandedRecipeId === recipe.id;

          return (
            <div
              key={recipe.id}
              className="card-pastel rounded-3xl p-5 space-y-4 transition-all hover:shadow-lg border-2"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl p-2.5 rounded-2xl bg-rose-50 shadow-inner">
                    {recipe.emoji}
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-[#2D2530] leading-snug">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {recipe.prepTime}
                      </span>
                      <span>·</span>
                      <span>{recipe.yieldInfo}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">
                  {recipe.category}
                </span>
              </div>

              {/* Source Tag */}
              {recipe.sourceName && (
                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl">
                  <span>Источник:</span>
                  <span className="text-slate-600 truncate">{recipe.sourceName}</span>
                </div>
              )}

              {/* Fridge Check Alert Badge */}
              <div
                className={`p-3 rounded-2xl flex items-center justify-between text-xs font-bold ${
                  recipe.allInFridge
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {recipe.allInFridge ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>
                    {recipe.allInFridge
                      ? 'Все продукты есть в холодильнике!'
                      : `Не хватает: ${recipe.missingItems.join(', ')}`}
                  </span>
                </div>
              </div>

              {/* Economics Preview Strip */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-rose-50/50 rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">
                    Себестоимость продуктов:
                  </span>
                  <span className="text-base font-black font-mono text-[#2D2530]">
                    {recipe.estimatedCost.toFixed(2)} {country.symbol}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    Рекомендуемая продажа:
                  </span>
                  <span className="text-base font-black font-mono text-rose-500">
                    {recipe.recommendedPrice.toFixed(2)} {country.symbol}
                  </span>
                </div>
              </div>

              {/* Accordion Expand/Collapse */}
              <div>
                <button
                  onClick={() => toggleExpand(recipe.id)}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <span>{isExpanded ? 'Скрыть ингредиенты и шаги' : 'Показать ингредиенты и шаги'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="space-y-3 pt-2 text-xs border-t border-rose-100 animate-in fade-in">
                    {/* Ingredients list */}
                    <div className="space-y-1.5">
                      <span className="font-extrabold text-[#2D2530] block">Ингредиенты:</span>
                      <div className="space-y-1">
                        {recipe.ingredients.map((ing) => (
                          <div
                            key={ing.id}
                            className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-slate-50 text-[11px]"
                          >
                            <span className="text-slate-700 font-bold">{ing.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-500">
                                {ing.amount} {ing.unit}
                              </span>
                              {ing.inStock ? (
                                <span className="text-emerald-500 text-[10px] font-bold">✓ в запасе</span>
                              ) : (
                                <span className="text-amber-500 text-[10px] font-bold">купить</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-1.5 pt-1">
                      <span className="font-extrabold text-[#2D2530] block">Шаги приготовления:</span>
                      <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                        {recipe.steps.map((st, idx) => (
                          <li key={idx}>{st}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button: Bake & Create Order */}
              <button
                onClick={() => onBakeRecipeForOrder(recipe)}
                className="w-full py-3.5 rounded-2xl bg-rose-400 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer btn-bouncy"
              >
                <span>Принять заказ на этот торт 🎂</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Recipe Import Modal */}
      <RecipeImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        country={country}
        ingredientsInFridge={ingredients}
        onAddRecipe={handleAddRecipe}
      />
    </div>
  );
};
