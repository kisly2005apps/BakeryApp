export type BaseUnit = 'g' | 'ml' | 'pcs';

export type IngredientCategory =
  | 'dairy'
  | 'chocolate'
  | 'flour_dry'
  | 'nuts_fillings'
  | 'packaging'
  | 'other';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  purchaseQuantity: number; // e.g. 0.9 or 900
  purchaseUnit: 'g' | 'kg' | 'ml' | 'l' | 'pcs';
  purchasePrice: number; // price for this package in rubles
  baseUnit: BaseUnit; // 'g', 'ml', or 'pcs'
  baseQuantity: number; // normalized (e.g. 0.9 l -> 900 ml)
  wastePercent: number; // 0 to 70% shrinkage/waste loss
  baseCostPerUnit: number; // purchasePrice / baseQuantity (руб / мл)
  effectiveCostPerUnit: number; // baseCostPerUnit / (1 - wastePercent/100) (руб / чистый мл)
  inStock: number; // in baseUnit
  minStockAlert: number; // in baseUnit
  notes?: string;
  lastUpdated: string;
}

export interface SubRecipeIngredientItem {
  id: string;
  ingredientId: string;
  name: string;
  amount: number; // in ingredient's baseUnit
  unit: BaseUnit;
}

export interface SubRecipe {
  id: string;
  name: string;
  category: 'biscuit' | 'cream' | 'soak' | 'filling' | 'decor' | 'other';
  yieldWeight: number; // Total net yield in grams (e.g. 600g cream)
  items: SubRecipeIngredientItem[];
  instructions?: string;
  notes?: string;
  createdAt: string;
}

export interface MasterRecipeSubRecipeItem {
  id: string;
  subRecipeId: string;
  name: string;
  amountWeight: number; // weight in grams in base cake (e.g. 500g biscuit, 450g cream)
}

export interface MasterRecipeDirectIngredientItem {
  id: string;
  ingredientId: string;
  name: string;
  amount: number; // amount in baseUnit (e.g. 1 premium cake box, or 50g gold decor)
  unit: BaseUnit;
}

export interface MasterRecipe {
  id: string;
  name: string;
  category: string;
  baseDiameter: number; // Standard cake pan diameter in cm (e.g. 16 cm)
  baseHeight?: number; // cm
  baseWeightGrams: number; // total estimated weight of base cake
  description: string;
  subRecipeItems: MasterRecipeSubRecipeItem[];
  directIngredients: MasterRecipeDirectIngredientItem[];
  prepTimeHours: number; // e.g. 3.5 hours
  laborHourlyRate: number; // e.g. 1200 rub/hour
  equipmentAmortizationFixed: number; // e.g. 250 rub per bake cycle
  equipmentAmortizationPercent: number; // e.g. 5% of raw food cost
  packagingCost: number; // e.g. 350 rub
  targetMarginPercent: number; // e.g. 50%
  customSellingPrice?: number;
  imageUrl?: string;
  createdAt: string;
}

export type KanbanStatus =
  | 'prepayment_received'
  | 'procurement'
  | 'in_progress'
  | 'ready_for_pickup'
  | 'completed';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerTelegram?: string;
  customerNotes?: string;
  status: KanbanStatus;
  recipeId: string;
  recipeName: string;
  targetDiameter: number; // e.g. 22 cm
  baseDiameter: number; // e.g. 16 cm
  panScaleFactor: number; // e.g. (22/16)^2 = 1.8906
  calculatedWeightGrams: number;
  deadline: string; // ISO string
  deliveryType: 'pickup' | 'courier';
  deliveryAddress?: string;
  rawFoodCost: number;
  laborCost: number;
  overheadCost: number;
  packagingCost: number;
  totalPrimeCost: number;
  sellingPrice: number;
  prepaymentAmount: number;
  remainingAmount: number;
  netProfit: number;
  marginPercent: number;
  createdAt: string;
}

export interface ReceiptParsedItem {
  name: string;
  rawQuantity: number;
  rawUnit: string;
  price: number;
  normalizedBaseUnit: BaseUnit;
  normalizedBaseQty: number;
  estimatedWastePercent: number;
  category: IngredientCategory;
}

export interface ReceiptScanResult {
  storeName: string;
  receiptDate: string;
  items: ReceiptParsedItem[];
  source?: string;
}
