export type BaseUnit = 'g' | 'ml' | 'pcs';

export type IngredientCategory =
  | 'dairy'
  | 'chocolate'
  | 'flour_dry'
  | 'nuts_fillings'
  | 'packaging'
  | 'other';

export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
  locale: string;
  defaultMilkPrice: number;
}

export const COUNTRIES: CountryConfig[] = [
  { code: 'PL', name: 'Польша', flag: '🇵🇱', currency: 'PLN', symbol: 'zł', locale: 'pl-PL', defaultMilkPrice: 3.99 },
  { code: 'US', name: 'США', flag: '🇺🇸', currency: 'USD', symbol: '$', locale: 'en-US', defaultMilkPrice: 3.49 },
  { code: 'EU', name: 'Германия / ЕС', flag: '🇪🇺', currency: 'EUR', symbol: '€', locale: 'de-DE', defaultMilkPrice: 1.29 },
  { code: 'KZ', name: 'Казахстан', flag: '🇰🇿', currency: 'KZT', symbol: '₸', locale: 'ru-KZ', defaultMilkPrice: 580 },
  { code: 'RU', name: 'Россия', flag: '🇷🇺', currency: 'RUB', symbol: '₽', locale: 'ru-RU', defaultMilkPrice: 89 },
  { code: 'GB', name: 'Великобритания', flag: '🇬🇧', currency: 'GBP', symbol: '£', locale: 'en-GB', defaultMilkPrice: 1.45 },
];

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  emoji: string;
  purchaseQuantity: number;
  purchaseUnit: 'g' | 'kg' | 'ml' | 'l' | 'pcs';
  purchasePrice: number;
  baseUnit: BaseUnit;
  baseQuantity: number;
  wastePercent: number; // 0 to 70%
  baseCostPerUnit: number;
  effectiveCostPerUnit: number;
  inStock: number; // in baseUnit
  openPackRemainingPercent: number; // 0 to 100%
  sealedPacksCount: number; // additional closed packages
  minStockAlert: number;
  notes?: string;
  lastUpdated: string;
}

export interface PastryRecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  inStock: boolean;
  requiredGramsOrMl?: number;
}

export interface PastryRecipe {
  id: string;
  title: string;
  emoji: string;
  category: string;
  prepTime: string;
  yieldInfo: string;
  sourceType: 'camera' | 'file' | 'link';
  sourceName?: string;
  sourceUrl?: string;
  ingredients: PastryRecipeIngredient[];
  steps: string[];
  estimatedCost: number;
  recommendedPrice: number;
  allInFridge: boolean;
  missingItems: string[];
  createdAt: string;
}

export type OrderStatus = 'new' | 'baking' | 'decorating' | 'ready' | 'delivered';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerContact: string; // phone or @instagram
  recipeTitle: string;
  recipeId?: string;
  details: string;
  deadlineDate: string;
  status: OrderStatus;
  totalPrice: number; // «Выставить счет»
  prepayment: number; // «Предоплата внесена» (вручную)
  remaining: number; // «Остаток к оплате» (считается автоматически: totalPrice - prepayment)
  stickerColor: 'rose' | 'peach' | 'lavender' | 'mint' | 'yellow';
  createdAt: string;
}

export interface ARScannedProduct {
  id: string;
  name: string;
  emoji: string;
  category: IngredientCategory;
  standardPackQty: number;
  standardPackUnit: 'g' | 'kg' | 'ml' | 'l' | 'pcs';
  regionalPrices: Record<string, number>;
}
