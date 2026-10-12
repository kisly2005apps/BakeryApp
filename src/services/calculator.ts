import { Ingredient, SubRecipe, MasterRecipe, BaseUnit } from '../types';

export function normalizeToBaseUnit(qty: number, unit: string): { baseQty: number; baseUnit: BaseUnit } {
  const cleanUnit = unit.toLowerCase().trim();
  if (cleanUnit === 'кг' || cleanUnit === 'kg') {
    return { baseQty: qty * 1000, baseUnit: 'g' };
  }
  if (cleanUnit === 'г' || cleanUnit === 'гр' || cleanUnit === 'g') {
    return { baseQty: qty, baseUnit: 'g' };
  }
  if (cleanUnit === 'л' || cleanUnit === 'l') {
    return { baseQty: qty * 1000, baseUnit: 'ml' };
  }
  if (cleanUnit === 'мл' || cleanUnit === 'ml') {
    return { baseQty: qty, baseUnit: 'ml' };
  }
  return { baseQty: qty, baseUnit: 'pcs' };
}

export function computeIngredientCosts(
  purchasePrice: number,
  purchaseQuantity: number,
  purchaseUnit: 'g' | 'kg' | 'ml' | 'l' | 'pcs',
  wastePercent: number
): {
  baseQuantity: number;
  baseUnit: BaseUnit;
  baseCostPerUnit: number;
  effectiveCostPerUnit: number;
} {
  const { baseQty, baseUnit } = normalizeToBaseUnit(purchaseQuantity, purchaseUnit);
  const safeBaseQty = baseQty > 0 ? baseQty : 1;
  const baseCostPerUnit = purchasePrice / safeBaseQty;
  
  // Effective cost accounts for waste & shrinkage
  // e.g., if hazelnuts lose 30% during peeling, usable 70% costs full 100%
  const cleanWaste = Math.min(Math.max(wastePercent, 0), 95);
  const effectiveCostPerUnit = baseCostPerUnit / ((100 - cleanWaste) / 100);

  return {
    baseQuantity: safeBaseQty,
    baseUnit,
    baseCostPerUnit,
    effectiveCostPerUnit,
  };
}

export function calculateSubRecipeCost(
  subRecipe: SubRecipe,
  ingredientsMap: Record<string, Ingredient>
): {
  totalCost: number;
  costPerGram: number;
  costPer100g: number;
  costPerKg: number;
  itemsBreakdown: Array<{
    name: string;
    amount: number;
    unit: BaseUnit;
    cost: number;
    wastePercent: number;
  }>;
} {
  let totalCost = 0;
  const itemsBreakdown: Array<{
    name: string;
    amount: number;
    unit: BaseUnit;
    cost: number;
    wastePercent: number;
  }> = [];

  for (const item of subRecipe.items) {
    const ing = ingredientsMap[item.ingredientId];
    if (ing) {
      const itemCost = item.amount * ing.effectiveCostPerUnit;
      totalCost += itemCost;
      itemsBreakdown.push({
        name: ing.name,
        amount: item.amount,
        unit: ing.baseUnit,
        cost: itemCost,
        wastePercent: ing.wastePercent,
      });
    } else {
      itemsBreakdown.push({
        name: item.name,
        amount: item.amount,
        unit: item.unit,
        cost: 0,
        wastePercent: 0,
      });
    }
  }

  const safeYield = subRecipe.yieldWeight > 0 ? subRecipe.yieldWeight : 1;
  const costPerGram = totalCost / safeYield;

  return {
    totalCost,
    costPerGram,
    costPer100g: costPerGram * 100,
    costPerKg: costPerGram * 1000,
    itemsBreakdown,
  };
}

export function calculateGeometricScale(targetDiameter: number, baseDiameter: number): number {
  if (baseDiameter <= 0 || targetDiameter <= 0) return 1;
  // Area scaling ratio: (D_target / D_base)^2
  const ratio = (targetDiameter / baseDiameter) * (targetDiameter / baseDiameter);
  return Number(ratio.toFixed(4));
}

export interface MasterEconomicsResult {
  scaleFactor: number;
  scaledWeightGrams: number;
  rawFoodCost: number;
  laborCost: number;
  overheadCost: number;
  packagingCost: number;
  totalPrimeCost: number;
  recommendedPrice: number;
  sellingPrice: number;
  netProfit: number;
  marginPercent: number;
  foodCostPercent: number;
  hourlyYield: number;
  subRecipesBreakdown: Array<{
    name: string;
    originalWeight: number;
    scaledWeight: number;
    cost: number;
  }>;
  directIngredientsBreakdown: Array<{
    name: string;
    originalAmount: number;
    scaledAmount: number;
    unit: BaseUnit;
    cost: number;
  }>;
}

export function calculateMasterRecipeEconomics(
  recipe: MasterRecipe,
  ingredientsMap: Record<string, Ingredient>,
  subRecipesMap: Record<string, SubRecipe>,
  targetDiameterOverride?: number,
  customSellingPriceOverride?: number
): MasterEconomicsResult {
  const targetDiam = targetDiameterOverride || recipe.baseDiameter;
  const scaleFactor = calculateGeometricScale(targetDiam, recipe.baseDiameter);

  let rawFoodCost = 0;
  let totalScaledWeight = 0;

  const subRecipesBreakdown: Array<{
    name: string;
    originalWeight: number;
    scaledWeight: number;
    cost: number;
  }> = [];

  for (const item of recipe.subRecipeItems) {
    const sub = subRecipesMap[item.subRecipeId];
    const originalWeight = item.amountWeight;
    const scaledWeight = originalWeight * scaleFactor;
    totalScaledWeight += scaledWeight;

    let subCost = 0;
    if (sub) {
      const { costPerGram } = calculateSubRecipeCost(sub, ingredientsMap);
      subCost = scaledWeight * costPerGram;
    }
    rawFoodCost += subCost;
    subRecipesBreakdown.push({
      name: sub ? sub.name : item.name,
      originalWeight,
      scaledWeight,
      cost: subCost,
    });
  }

  const directIngredientsBreakdown: Array<{
    name: string;
    originalAmount: number;
    scaledAmount: number;
    unit: BaseUnit;
    cost: number;
  }> = [];

  for (const item of recipe.directIngredients) {
    const ing = ingredientsMap[item.ingredientId];
    const originalAmount = item.amount;
    const scaledAmount = originalAmount * scaleFactor;

    let directCost = 0;
    if (ing) {
      directCost = scaledAmount * ing.effectiveCostPerUnit;
      if (ing.baseUnit === 'g') {
        totalScaledWeight += scaledAmount;
      }
    }
    rawFoodCost += directCost;
    directIngredientsBreakdown.push({
      name: ing ? ing.name : item.name,
      originalAmount,
      scaledAmount,
      unit: ing ? ing.baseUnit : item.unit,
      cost: directCost,
    });
  }

  // Labor cost
  const laborCost = recipe.prepTimeHours * recipe.laborHourlyRate;

  // Overhead & Amortization
  const overheadCost =
    recipe.equipmentAmortizationFixed +
    (recipe.equipmentAmortizationPercent / 100) * rawFoodCost;

  // Packaging cost
  const packagingCost = recipe.packagingCost;

  // Total Prime Cost
  const totalPrimeCost = rawFoodCost + laborCost + overheadCost + packagingCost;

  // Recommended price based on target margin
  const safeMargin = Math.min(Math.max(recipe.targetMarginPercent, 1), 90);
  const recommendedPrice = totalPrimeCost / ((100 - safeMargin) / 100);

  const sellingPrice =
    customSellingPriceOverride !== undefined && customSellingPriceOverride > 0
      ? customSellingPriceOverride
      : recipe.customSellingPrice && recipe.customSellingPrice > 0
      ? recipe.customSellingPrice * scaleFactor
      : recommendedPrice;

  const netProfit = sellingPrice - totalPrimeCost;
  const marginPercent = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;
  const foodCostPercent = sellingPrice > 0 ? (rawFoodCost / sellingPrice) * 100 : 0;
  const hourlyYield = recipe.prepTimeHours > 0 ? (netProfit + laborCost) / recipe.prepTimeHours : 0;

  return {
    scaleFactor,
    scaledWeightGrams: Math.round(totalScaledWeight || recipe.baseWeightGrams * scaleFactor),
    rawFoodCost,
    laborCost,
    overheadCost,
    packagingCost,
    totalPrimeCost,
    recommendedPrice,
    sellingPrice,
    netProfit,
    marginPercent,
    foodCostPercent,
    hourlyYield,
    subRecipesBreakdown,
    directIngredientsBreakdown,
  };
}
