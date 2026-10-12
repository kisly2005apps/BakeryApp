import {
  Ingredient,
  PastryRecipe,
  Order,
  CountryConfig,
  COUNTRIES,
  ARScannedProduct
} from '../types';

const STORAGE_KEYS = {
  COUNTRY: 'bakeometrics_country_v2',
  INGREDIENTS: 'bakeometrics_ingredients_v2',
  RECIPES: 'bakeometrics_recipes_v2',
  ORDERS: 'bakeometrics_orders_v2',
  SETUP_DONE: 'bakeometrics_setup_done_v2',
};

export const INITIAL_COUNTRY: CountryConfig = COUNTRIES[0]; // Poland (zł)

export const SAMPLE_AR_PRODUCTS: ARScannedProduct[] = [
  {
    id: 'prod-milk',
    name: 'Молоко цельное 1л',
    emoji: '🥛',
    category: 'dairy',
    standardPackQty: 1,
    standardPackUnit: 'l',
    regionalPrices: { PL: 3.99, US: 3.49, EU: 1.29, KZ: 580, RU: 89, GB: 1.45 },
  },
  {
    id: 'prod-cream',
    name: 'Сливки 33% для взбивания 500мл',
    emoji: '🍶',
    category: 'dairy',
    standardPackQty: 500,
    standardPackUnit: 'ml',
    regionalPrices: { PL: 8.50, US: 4.80, EU: 2.10, KZ: 1400, RU: 260, GB: 2.20 },
  },
  {
    id: 'prod-butter',
    name: 'Сливочное масло 82.5% 200г',
    emoji: '🧈',
    category: 'dairy',
    standardPackQty: 200,
    standardPackUnit: 'g',
    regionalPrices: { PL: 7.20, US: 3.90, EU: 1.95, KZ: 1200, RU: 195, GB: 1.80 },
  },
  {
    id: 'prod-cheese',
    name: 'Сыр творожный Cremette 800г',
    emoji: '🧀',
    category: 'dairy',
    standardPackQty: 800,
    standardPackUnit: 'g',
    regionalPrices: { PL: 19.90, US: 7.50, EU: 4.50, KZ: 3200, RU: 560, GB: 4.20 },
  },
  {
    id: 'prod-choc',
    name: 'Шоколад темный Callebaut 54% 1кг',
    emoji: '🍫',
    category: 'chocolate',
    standardPackQty: 1,
    standardPackUnit: 'kg',
    regionalPrices: { PL: 54.00, US: 18.00, EU: 14.50, KZ: 8900, RU: 1650, GB: 13.50 },
  },
  {
    id: 'prod-eggs',
    name: 'Яйца куриные С0 (10 шт)',
    emoji: '🥚',
    category: 'dairy',
    standardPackQty: 10,
    standardPackUnit: 'pcs',
    regionalPrices: { PL: 9.90, US: 3.99, EU: 2.40, KZ: 750, RU: 135, GB: 2.10 },
  },
  {
    id: 'prod-flour',
    name: 'Мука пшеничная экстра 2кг',
    emoji: '🌾',
    category: 'flour_dry',
    standardPackQty: 2,
    standardPackUnit: 'kg',
    regionalPrices: { PL: 5.80, US: 3.20, EU: 1.60, KZ: 800, RU: 145, GB: 1.50 },
  },
  {
    id: 'prod-berries',
    name: 'Клубника свежая десертная 500г',
    emoji: '🍓',
    category: 'nuts_fillings',
    standardPackQty: 500,
    standardPackUnit: 'g',
    regionalPrices: { PL: 14.50, US: 4.99, EU: 3.20, KZ: 2400, RU: 390, GB: 2.99 },
  },
];

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-1',
    name: 'Молоко 1л',
    category: 'dairy',
    emoji: '🥛',
    purchaseQuantity: 1,
    purchaseUnit: 'l',
    purchasePrice: 3.99,
    baseUnit: 'ml',
    baseQuantity: 1000,
    wastePercent: 2,
    baseCostPerUnit: 0.00399,
    effectiveCostPerUnit: 0.00407,
    openPackRemainingPercent: 40, // 40% in open bottle = 400ml
    sealedPacksCount: 1, // 1 sealed pack = 1000ml -> total inStock = 1400ml
    inStock: 1400,
    minStockAlert: 500,
    notes: 'Открыто вчера, хранится в дверце',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-2',
    name: 'Сливки 33% 500мл',
    category: 'dairy',
    emoji: '🍶',
    purchaseQuantity: 500,
    purchaseUnit: 'ml',
    purchasePrice: 8.50,
    baseUnit: 'ml',
    baseQuantity: 500,
    wastePercent: 3,
    baseCostPerUnit: 0.017,
    effectiveCostPerUnit: 0.0175,
    openPackRemainingPercent: 80, // 400ml
    sealedPacksCount: 2, // 1000ml -> total 1400ml
    inStock: 1400,
    minStockAlert: 500,
    notes: 'Для кремов и ганаша',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-3',
    name: 'Сливочное масло 82.5% 200г',
    category: 'dairy',
    emoji: '🧈',
    purchaseQuantity: 200,
    purchaseUnit: 'g',
    purchasePrice: 7.20,
    baseUnit: 'g',
    baseQuantity: 200,
    wastePercent: 1,
    baseCostPerUnit: 0.036,
    effectiveCostPerUnit: 0.0363,
    openPackRemainingPercent: 60, // 120g
    sealedPacksCount: 1, // 200g -> total 320g
    inStock: 320,
    minStockAlert: 200,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-4',
    name: 'Сыр творожный Cremette 800г',
    category: 'dairy',
    emoji: '🧀',
    purchaseQuantity: 800,
    purchaseUnit: 'g',
    purchasePrice: 19.90,
    baseUnit: 'g',
    baseQuantity: 800,
    wastePercent: 2,
    baseCostPerUnit: 0.0248,
    effectiveCostPerUnit: 0.0253,
    openPackRemainingPercent: 90, // 720g
    sealedPacksCount: 0,
    inStock: 720,
    minStockAlert: 400,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-5',
    name: 'Шоколад темный Callebaut 1кг',
    category: 'chocolate',
    emoji: '🍫',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 54.00,
    baseUnit: 'g',
    baseQuantity: 1000,
    wastePercent: 2,
    baseCostPerUnit: 0.054,
    effectiveCostPerUnit: 0.0551,
    openPackRemainingPercent: 75, // 750g
    sealedPacksCount: 1, // 1000g -> total 1750g
    inStock: 1750,
    minStockAlert: 500,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-6',
    name: 'Яйца куриные С0 (10 шт)',
    category: 'dairy',
    emoji: '🥚',
    purchaseQuantity: 10,
    purchaseUnit: 'pcs',
    purchasePrice: 9.90,
    baseUnit: 'pcs',
    baseQuantity: 10,
    wastePercent: 10,
    baseCostPerUnit: 0.99,
    effectiveCostPerUnit: 1.10,
    openPackRemainingPercent: 70, // 7 шт
    sealedPacksCount: 1, // 10 шт -> total 17 шт
    inStock: 17,
    minStockAlert: 6,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ing-7',
    name: 'Мука пшеничная экстра 2кг',
    category: 'flour_dry',
    emoji: '🌾',
    purchaseQuantity: 2,
    purchaseUnit: 'kg',
    purchasePrice: 5.80,
    baseUnit: 'g',
    baseQuantity: 2000,
    wastePercent: 1,
    baseCostPerUnit: 0.0029,
    effectiveCostPerUnit: 0.00293,
    openPackRemainingPercent: 85, // 1700g
    sealedPacksCount: 1, // 2000g -> total 3700g
    inStock: 3700,
    minStockAlert: 1000,
    lastUpdated: new Date().toISOString(),
  },
];

export const INITIAL_RECIPES: PastryRecipe[] = [
  {
    id: 'rec-1',
    title: 'Бенто-торт «Клубничный Бархат»',
    emoji: '🍓',
    category: 'Бенто-торты',
    prepTime: '2.5 ч',
    yieldInfo: 'Диаметр 12 см (450г)',
    sourceType: 'link',
    sourceName: 'Instagram Reels @di_sweet_cake',
    sourceUrl: 'https://instagram.com/reels/cake_bento',
    ingredients: [
      { id: 'ri-1', name: 'Яйца С0', amount: 2, unit: 'шт', inStock: true },
      { id: 'ri-2', name: 'Мука высший сорт', amount: 70, unit: 'г', inStock: true },
      { id: 'ri-3', name: 'Сахарная пудра', amount: 65, unit: 'г', inStock: true },
      { id: 'ri-4', name: 'Сыр творожный Cremette', amount: 250, unit: 'г', inStock: true },
      { id: 'ri-5', name: 'Сливки 33%', amount: 100, unit: 'мл', inStock: true },
      { id: 'ri-6', name: 'Клубника свежая', amount: 120, unit: 'г', inStock: false },
    ],
    steps: [
      'Взбить белки с пудрой до устойчивых воздушных пиков.',
      'Выпекать 25 мин при 165°C в кольце 12 см.',
      'Взбить холодный сыр со сливками до шелкового крема.',
      'Собрать в ланч-боксе с клубничной прослойкой и милой надписью.',
    ],
    estimatedCost: 18.50,
    recommendedPrice: 55.00,
    allInFridge: false,
    missingItems: ['Клубника свежая (120г)'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rec-2',
    title: 'Шоколадный брауни с фундуком',
    emoji: '🍫',
    category: 'К чаю / Десерты',
    prepTime: '45 мин',
    yieldInfo: 'Форма 20х20 (8 порций)',
    sourceType: 'camera',
    sourceName: 'Фото из блокнота (бабушкин рецепт)',
    ingredients: [
      { id: 'ri-7', name: 'Шоколад темный Callebaut', amount: 200, unit: 'г', inStock: true },
      { id: 'ri-8', name: 'Сливочное масло 82.5%', amount: 120, unit: 'г', inStock: true },
      { id: 'ri-9', name: 'Яйца С0', amount: 3, unit: 'шт', inStock: true },
      { id: 'ri-10', name: 'Мука экстра', amount: 80, unit: 'г', inStock: true },
    ],
    steps: [
      'Растопить шоколад с маслом на водяной бане.',
      'Яйца взбить с сахаром до кремовой пены.',
      'Аккуратно соединить и выпекать ровно 22 минуты при 175°C (внутри влажный центр!).',
    ],
    estimatedCost: 22.80,
    recommendedPrice: 65.00,
    allInFridge: true,
    missingItems: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rec-3',
    title: 'Капкейки «Нежная Ваниль» (6 шт)',
    emoji: '🧁',
    category: 'Капкейки',
    prepTime: '1.5 ч',
    yieldInfo: '6 штучек с шапочками',
    sourceType: 'file',
    sourceName: 'Файл Cupcakes_Master.pdf',
    ingredients: [
      { id: 'ri-11', name: 'Сливочное масло', amount: 100, unit: 'г', inStock: true },
      { id: 'ri-12', name: 'Мука', amount: 150, unit: 'г', inStock: true },
      { id: 'ri-13', name: 'Молоко', amount: 80, unit: 'мл', inStock: true },
      { id: 'ri-14', name: 'Сыр творожный', amount: 200, unit: 'г', inStock: true },
    ],
    steps: [
      'Взбить мягкое масло, ввести яйцо и муку с молоком.',
      'Выпекать в капсулах 18-20 мин при 170°C.',
      'Отсадить высокие шапочки крема через насадку 1М.',
    ],
    estimatedCost: 14.20,
    recommendedPrice: 42.00,
    allInFridge: true,
    missingItems: [],
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    orderNumber: '#01',
    customerName: 'Алина Соколова',
    customerContact: '@alina_sweet',
    recipeTitle: 'Бенто-торт «Клубничный Бархат»',
    details: 'Надпись «Happy 25th!» розовым кремом. К 15:00 в пятницу.',
    deadlineDate: 'Пятница, 15:00',
    status: 'baking',
    totalPrice: 60.00,
    prepayment: 30.00,
    remaining: 30.00,
    stickerColor: 'rose',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ord-2',
    orderNumber: '#02',
    customerName: 'Мама Миши (Ольга)',
    customerContact: '+48 512 890 123',
    recipeTitle: 'Капкейки «Нежная Ваниль» (12 шт)',
    details: 'Детский праздник в садике, декор без орехов!',
    deadlineDate: 'Суббота, 11:00',
    status: 'new',
    totalPrice: 85.00,
    prepayment: 40.00,
    remaining: 45.00,
    stickerColor: 'peach',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ord-3',
    orderNumber: '#03',
    customerName: 'Виктория Ковальска',
    customerContact: '@viki_krawczyk',
    recipeTitle: 'Шоколадный брауни с фундуком',
    details: 'Подарочная коробочка с белой атласной лентой.',
    deadlineDate: 'Воскресенье, 17:00',
    status: 'decorating',
    totalPrice: 70.00,
    prepayment: 70.00,
    remaining: 0.00,
    stickerColor: 'lavender',
    createdAt: new Date().toISOString(),
  },
];

export class AppStorage {
  static getCountry(): CountryConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.COUNTRY);
    if (!raw) return INITIAL_COUNTRY;
    try {
      const code = JSON.parse(raw);
      return COUNTRIES.find((c) => c.code === code) || INITIAL_COUNTRY;
    } catch {
      return INITIAL_COUNTRY;
    }
  }

  static saveCountry(country: CountryConfig): void {
    localStorage.setItem(STORAGE_KEYS.COUNTRY, JSON.stringify(country.code));
  }

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

  static getRecipes(): PastryRecipe[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RECIPES);
    if (!raw) {
      this.saveRecipes(INITIAL_RECIPES);
      return INITIAL_RECIPES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_RECIPES;
    }
  }

  static saveRecipes(items: PastryRecipe[]): void {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(items));
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

  static isSetupDone(): boolean {
    return localStorage.getItem(STORAGE_KEYS.SETUP_DONE) === 'true';
  }

  static setSetupDone(): void {
    localStorage.setItem(STORAGE_KEYS.SETUP_DONE, 'true');
  }

  static resetAll(): void {
    localStorage.removeItem(STORAGE_KEYS.COUNTRY);
    localStorage.removeItem(STORAGE_KEYS.INGREDIENTS);
    localStorage.removeItem(STORAGE_KEYS.RECIPES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SETUP_DONE);
  }
}
