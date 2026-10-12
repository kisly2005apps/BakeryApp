import { Ingredient, SubRecipe, MasterRecipe, Order } from '../types';
import { computeIngredientCosts } from './calculator';

const STORAGE_KEYS = {
  INGREDIENTS: 'bakeometrics_ingredients_v1',
  SUB_RECIPES: 'bakeometrics_sub_recipes_v1',
  MASTER_RECIPES: 'bakeometrics_master_recipes_v1',
  ORDERS: 'bakeometrics_orders_v1',
};

// Realistic initial bakery inventory
export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-1',
    name: 'Сливки 33% ультрапастеризованные',
    category: 'dairy',
    purchaseQuantity: 1,
    purchaseUnit: 'l',
    purchasePrice: 380,
    baseUnit: 'ml',
    baseQuantity: 1000,
    wastePercent: 2,
    baseCostPerUnit: 0.38,
    effectiveCostPerUnit: 0.3877,
    inStock: 4500,
    minStockAlert: 2000,
    notes: 'Остаток в пакете и на венчиках ~2%',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-2',
    name: 'Сыр творожный Cremette / Hochland',
    category: 'dairy',
    purchaseQuantity: 800,
    purchaseUnit: 'g',
    purchasePrice: 560,
    baseUnit: 'g',
    baseQuantity: 800,
    wastePercent: 2,
    baseCostPerUnit: 0.70,
    effectiveCostPerUnit: 0.7142,
    inStock: 3200,
    minStockAlert: 1600,
    notes: 'Стенки ванночки',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-3',
    name: 'Масло сливочное 82.5% ГОСТ',
    category: 'dairy',
    purchaseQuantity: 500,
    purchaseUnit: 'g',
    purchasePrice: 420,
    baseUnit: 'g',
    baseQuantity: 500,
    wastePercent: 1,
    baseCostPerUnit: 0.84,
    effectiveCostPerUnit: 0.8484,
    inStock: 1500,
    minStockAlert: 500,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-4',
    name: 'Шоколад темный Callebaut 54.5%',
    category: 'chocolate',
    purchaseQuantity: 2.5,
    purchaseUnit: 'kg',
    purchasePrice: 3200,
    baseUnit: 'g',
    baseQuantity: 2500,
    wastePercent: 3,
    baseCostPerUnit: 1.28,
    effectiveCostPerUnit: 1.3195,
    inStock: 4800,
    minStockAlert: 1000,
    notes: 'Утерь при темперировании/чашах ~3%',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-5',
    name: 'Мука пшеничная в/с Французская Штучка',
    category: 'flour_dry',
    purchaseQuantity: 2,
    purchaseUnit: 'kg',
    purchasePrice: 160,
    baseUnit: 'g',
    baseQuantity: 2000,
    wastePercent: 1,
    baseCostPerUnit: 0.08,
    effectiveCostPerUnit: 0.0808,
    inStock: 8000,
    minStockAlert: 3000,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-6',
    name: 'Сахарная пудра мелкого помола',
    category: 'flour_dry',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 140,
    baseUnit: 'g',
    baseQuantity: 1000,
    wastePercent: 1,
    baseCostPerUnit: 0.14,
    effectiveCostPerUnit: 0.1414,
    inStock: 3500,
    minStockAlert: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-7',
    name: 'Фундук цельный в скорлупе',
    category: 'nuts_fillings',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 650,
    baseUnit: 'g',
    baseQuantity: 1000,
    wastePercent: 32, // Nuts lose 32% during peeling & roasting
    baseCostPerUnit: 0.65,
    effectiveCostPerUnit: 0.9558,
    inStock: 1800,
    minStockAlert: 500,
    notes: 'Колотый вес: скорлупа и шелуха 32%',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-8',
    name: 'Пюре клубничное без сахара Boiron',
    category: 'nuts_fillings',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 980,
    baseUnit: 'g',
    baseQuantity: 1000,
    wastePercent: 4,
    baseCostPerUnit: 0.98,
    effectiveCostPerUnit: 1.0208,
    inStock: 2000,
    minStockAlert: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-9',
    name: 'Яйцо куриное С0 (десяток)',
    category: 'dairy',
    purchaseQuantity: 10,
    purchaseUnit: 'pcs',
    purchasePrice: 135,
    baseUnit: 'pcs',
    baseQuantity: 10,
    wastePercent: 11, // Egg shells are ~11%
    baseCostPerUnit: 13.5,
    effectiveCostPerUnit: 15.1685,
    inStock: 40,
    minStockAlert: 20,
    notes: 'Скорлупа составляет ~11% веса яйца',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-10',
    name: 'Пектин NH термообратимый',
    category: 'flour_dry',
    purchaseQuantity: 100,
    purchaseUnit: 'g',
    purchasePrice: 450,
    baseUnit: 'g',
    baseQuantity: 100,
    wastePercent: 1,
    baseCostPerUnit: 4.5,
    effectiveCostPerUnit: 4.5454,
    inStock: 350,
    minStockAlert: 100,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-11',
    name: 'Премиум коробка для торта с окном + лента',
    category: 'packaging',
    purchaseQuantity: 10,
    purchaseUnit: 'pcs',
    purchasePrice: 1800,
    baseUnit: 'pcs',
    baseQuantity: 10,
    wastePercent: 0,
    baseCostPerUnit: 180,
    effectiveCostPerUnit: 180,
    inStock: 25,
    minStockAlert: 10,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-12',
    name: 'Усиленная подложка золотая 26 см',
    category: 'packaging',
    purchaseQuantity: 20,
    purchaseUnit: 'pcs',
    purchasePrice: 1200,
    baseUnit: 'pcs',
    baseQuantity: 20,
    wastePercent: 0,
    baseCostPerUnit: 60,
    effectiveCostPerUnit: 60,
    inStock: 30,
    minStockAlert: 10,
    lastUpdated: new Date().toISOString(),
  },
];

// Initial sub-recipes
export const INITIAL_SUB_RECIPES: SubRecipe[] = [
  {
    id: 'sub-1',
    name: 'Шифоновый ванильный бисквит (16 см)',
    category: 'biscuit',
    yieldWeight: 450, // 450g net biscuit
    items: [
      { id: 'sbi-1', ingredientId: 'ing-9', name: 'Яйцо куриное С0', amount: 4, unit: 'pcs' },
      { id: 'sbi-2', ingredientId: 'ing-6', name: 'Сахарная пудра', amount: 130, unit: 'g' },
      { id: 'sbi-3', ingredientId: 'ing-5', name: 'Мука пшеничная в/с', amount: 140, unit: 'g' },
      { id: 'sbi-4', ingredientId: 'ing-3', name: 'Масло сливочное 82.5%', amount: 35, unit: 'g' },
    ],
    instructions: 'Взбить белки с пудрой до устойчивых пиков. Аккуратно ввести желтки и просеянную муку. Выпекать 35-40 мин при 165°C.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub-2',
    name: 'Шелковый Крем-чиз на сливках',
    category: 'cream',
    yieldWeight: 650, // 650g net cream
    items: [
      { id: 'sbi-5', ingredientId: 'ing-2', name: 'Сыр творожный Cremette', amount: 400, unit: 'g' },
      { id: 'sbi-6', ingredientId: 'ing-1', name: 'Сливки 33%', amount: 180, unit: 'ml' },
      { id: 'sbi-7', ingredientId: 'ing-6', name: 'Сахарная пудра', amount: 80, unit: 'g' },
    ],
    instructions: 'Охладить ингредиенты до 4°C. Взбивать на средней скорости миксера до плотной глянцевой массы без пузырей.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub-3',
    name: 'Клубничное конфи с пектином NH',
    category: 'filling',
    yieldWeight: 280, // 280g
    items: [
      { id: 'sbi-8', ingredientId: 'ing-8', name: 'Пюре клубничное Boiron', amount: 250, unit: 'g' },
      { id: 'sbi-9', ingredientId: 'ing-6', name: 'Сахарная пудра', amount: 35, unit: 'g' },
      { id: 'sbi-10', ingredientId: 'ing-10', name: 'Пектин NH', amount: 6, unit: 'g' },
    ],
    instructions: 'Нагреть пюре до 40°C, всыпать пектин с пудрой дождем. Прокипятить 1 минуту, разлить в кольцо 14 см и заморозить.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub-4',
    name: 'Шоколадный ганаш на темном Callebaut',
    category: 'cream',
    yieldWeight: 350,
    items: [
      { id: 'sbi-11', ingredientId: 'ing-4', name: 'Шоколад темный Callebaut 54.5%', amount: 180, unit: 'g' },
      { id: 'sbi-12', ingredientId: 'ing-1', name: 'Сливки 33%', amount: 140, unit: 'ml' },
      { id: 'sbi-13', ingredientId: 'ing-3', name: 'Масло сливочное 82.5%', amount: 30, unit: 'g' },
    ],
    instructions: 'Сливки довести до кипения, вылить на шоколад, пробить блендером с эмульсией, ввести мягкое масло при 35°C.',
    createdAt: new Date().toISOString(),
  },
];

// Initial master recipes
export const INITIAL_MASTER_RECIPES: MasterRecipe[] = [
  {
    id: 'master-1',
    name: 'Торт «Клубничный Бархат»',
    category: 'Торты бисквитные',
    baseDiameter: 16,
    baseHeight: 11,
    baseWeightGrams: 1400,
    description: 'Нежный ванильный шифоновый бисквит, крем-чиз на 33% сливках и яркая прослойка из клубничного конфи с пектином.',
    subRecipeItems: [
      { id: 'msr-1', subRecipeId: 'sub-1', name: 'Шифоновый ванильный бисквит (16 см)', amountWeight: 450 },
      { id: 'msr-2', subRecipeId: 'sub-2', name: 'Шелковый Крем-чиз на сливках', amountWeight: 650 },
      { id: 'msr-3', subRecipeId: 'sub-3', name: 'Клубничное конфи с пектином NH', amountWeight: 280 },
    ],
    directIngredients: [
      { id: 'mdi-1', ingredientId: 'ing-11', name: 'Премиум коробка для торта с окном + лента', amount: 1, unit: 'pcs' },
      { id: 'mdi-2', ingredientId: 'ing-12', name: 'Усиленная подложка золотая 26 см', amount: 1, unit: 'pcs' },
    ],
    prepTimeHours: 3.5,
    laborHourlyRate: 1100,
    equipmentAmortizationFixed: 220,
    equipmentAmortizationPercent: 6,
    packagingCost: 0, // Packaging accounted in directIngredients
    targetMarginPercent: 52,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'master-2',
    name: 'Торт «Трюфельный Ореховый Взрыв»',
    category: 'Шоколадные десерты',
    baseDiameter: 16,
    baseHeight: 10,
    baseWeightGrams: 1550,
    description: 'Шоколадные влажные коржи, крем-чиз, обжаренный фундук с карамелью и покрытие ганашем Callebaut.',
    subRecipeItems: [
      { id: 'msr-4', subRecipeId: 'sub-1', name: 'Шифоновый бисквит', amountWeight: 450 },
      { id: 'msr-5', subRecipeId: 'sub-4', name: 'Шоколадный ганаш Callebaut', amountWeight: 350 },
      { id: 'msr-6', subRecipeId: 'sub-2', name: 'Крем-чиз на сливках', amountWeight: 500 },
    ],
    directIngredients: [
      { id: 'mdi-3', ingredientId: 'ing-7', name: 'Фундук обжаренный чистый', amount: 180, unit: 'g' },
      { id: 'mdi-4', ingredientId: 'ing-11', name: 'Премиум коробка для торта', amount: 1, unit: 'pcs' },
      { id: 'mdi-5', ingredientId: 'ing-12', name: 'Усиленная подложка', amount: 1, unit: 'pcs' },
    ],
    prepTimeHours: 4.0,
    laborHourlyRate: 1200,
    equipmentAmortizationFixed: 280,
    equipmentAmortizationPercent: 6,
    packagingCost: 0,
    targetMarginPercent: 55,
    createdAt: new Date().toISOString(),
  },
];

// Initial orders in CRM Kanban
export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: '#BOM-2401',
    customerName: 'Екатерина Романова',
    customerPhone: '+7 (916) 432-88-19',
    customerTelegram: '@kate_romanova',
    customerNotes: 'Юбилей мамы 50 лет. Надпись золотом «С юбилеем, любимая мама!». Доставить до 14:00.',
    status: 'in_progress',
    recipeId: 'master-1',
    recipeName: 'Торт «Клубничный Бархат»',
    targetDiameter: 22,
    baseDiameter: 16,
    panScaleFactor: 1.8906,
    calculatedWeightGrams: 2650,
    deadline: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
    deliveryType: 'courier',
    deliveryAddress: 'г. Москва, ул. Тверская 14, кв. 82',
    rawFoodCost: 1980,
    laborCost: 3850,
    overheadCost: 340,
    packagingCost: 240,
    totalPrimeCost: 6410,
    sellingPrice: 13500,
    prepaymentAmount: 7000,
    remainingAmount: 6500,
    netProfit: 7090,
    marginPercent: 52.5,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ord-102',
    orderNumber: '#BOM-2402',
    customerName: 'Артем Васильев',
    customerPhone: '+7 (903) 774-12-05',
    customerTelegram: '@artem_v',
    customerNotes: 'Для детского праздника. Без ягодных косточек, акцент на шоколадный вкус.',
    status: 'procurement',
    recipeId: 'master-2',
    recipeName: 'Торт «Трюфельный Ореховый Взрыв»',
    targetDiameter: 20,
    baseDiameter: 16,
    panScaleFactor: 1.5625,
    calculatedWeightGrams: 2420,
    deadline: new Date(Date.now() + 52 * 3600 * 1000).toISOString(),
    deliveryType: 'pickup',
    rawFoodCost: 2450,
    laborCost: 4800,
    overheadCost: 420,
    packagingCost: 240,
    totalPrimeCost: 7910,
    sellingPrice: 16800,
    prepaymentAmount: 8400,
    remainingAmount: 8400,
    netProfit: 8890,
    marginPercent: 52.9,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ord-103',
    orderNumber: '#BOM-2403',
    customerName: 'Алина Соколова',
    customerPhone: '+7 (925) 901-33-44',
    customerTelegram: '@alina_sweet',
    customerNotes: 'Свадебный кенди-бар, дегустационный торт 16 см.',
    status: 'ready_for_pickup',
    recipeId: 'master-1',
    recipeName: 'Торт «Клубничный Бархат»',
    targetDiameter: 16,
    baseDiameter: 16,
    panScaleFactor: 1.0,
    calculatedWeightGrams: 1400,
    deadline: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    deliveryType: 'pickup',
    rawFoodCost: 1045,
    laborCost: 3850,
    overheadCost: 280,
    packagingCost: 240,
    totalPrimeCost: 5415,
    sellingPrice: 11500,
    prepaymentAmount: 6000,
    remainingAmount: 5500,
    netProfit: 6085,
    marginPercent: 52.9,
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ord-104',
    orderNumber: '#BOM-2404',
    customerName: 'Михаил Ковалев',
    customerPhone: '+7 (915) 112-90-80',
    customerNotes: 'Корпоративный заказ к пятнице. Упаковка с логотипом компании.',
    status: 'prepayment_received',
    recipeId: 'master-2',
    recipeName: 'Торт «Трюфельный Ореховый Взрыв»',
    targetDiameter: 24,
    baseDiameter: 16,
    panScaleFactor: 2.25,
    calculatedWeightGrams: 3500,
    deadline: new Date(Date.now() + 96 * 3600 * 1000).toISOString(),
    deliveryType: 'courier',
    deliveryAddress: 'г. Москва, БЦ «Белые Сады», Лесная 7',
    rawFoodCost: 3520,
    laborCost: 4800,
    overheadCost: 490,
    packagingCost: 240,
    totalPrimeCost: 9050,
    sellingPrice: 19500,
    prepaymentAmount: 10000,
    remainingAmount: 9500,
    netProfit: 10450,
    marginPercent: 53.6,
    createdAt: new Date().toISOString(),
  },
];

export class AppRepository {
  static getIngredients(): Ingredient[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    if (!raw) {
      this.saveIngredients(INITIAL_INGREDIENTS);
      return INITIAL_INGREDIENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_INGREDIENTS;
    }
  }

  static saveIngredients(items: Ingredient[]): void {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(items));
  }

  static getSubRecipes(): SubRecipe[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUB_RECIPES);
    if (!raw) {
      this.saveSubRecipes(INITIAL_SUB_RECIPES);
      return INITIAL_SUB_RECIPES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SUB_RECIPES;
    }
  }

  static saveSubRecipes(items: SubRecipe[]): void {
    localStorage.setItem(STORAGE_KEYS.SUB_RECIPES, JSON.stringify(items));
  }

  static getMasterRecipes(): MasterRecipe[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MASTER_RECIPES);
    if (!raw) {
      this.saveMasterRecipes(INITIAL_MASTER_RECIPES);
      return INITIAL_MASTER_RECIPES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MASTER_RECIPES;
    }
  }

  static saveMasterRecipes(items: MasterRecipe[]): void {
    localStorage.setItem(STORAGE_KEYS.MASTER_RECIPES, JSON.stringify(items));
  }

  static getOrders(): Order[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      this.saveOrders(INITIAL_ORDERS);
      return INITIAL_ORDERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ORDERS;
    }
  }

  static saveOrders(items: Order[]): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(items));
  }

  static resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.INGREDIENTS);
    localStorage.removeItem(STORAGE_KEYS.SUB_RECIPES);
    localStorage.removeItem(STORAGE_KEYS.MASTER_RECIPES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
  }
}
