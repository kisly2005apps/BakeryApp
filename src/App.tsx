/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNavBar, MainTab } from './components/BottomNavBar';
import { FridgeModule } from './components/FridgeModule';
import { RecipesModule } from './components/RecipesModule';
import { OrdersModule } from './components/OrdersModule';
import { CountryPickerModal } from './components/CountryPickerModal';
import {
  CountryConfig,
  Ingredient,
  PastryRecipe,
  Order,
  COUNTRIES
} from './types';
import {
  AppStorage,
  INITIAL_COUNTRY,
  INITIAL_INGREDIENTS,
  INITIAL_RECIPES,
  INITIAL_ORDERS
} from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('fridge');
  const [country, setCountry] = useState<CountryConfig>(() => AppStorage.getCountry());
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isInitialWelcome, setIsInitialWelcome] = useState(false);

  // Core State
  const [ingredients, setIngredients] = useState<Ingredient[]>(() =>
    AppStorage.getIngredients()
  );
  const [recipes, setRecipes] = useState<PastryRecipe[]>(() =>
    AppStorage.getRecipes()
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    AppStorage.getOrders()
  );

  useEffect(() => {
    if (!AppStorage.isSetupDone()) {
      setIsInitialWelcome(true);
      setIsCountryModalOpen(true);
    }
  }, []);

  // Handlers for persistence
  const handleSelectCountry = (newCountry: CountryConfig) => {
    setCountry(newCountry);
    AppStorage.saveCountry(newCountry);
    AppStorage.setSetupDone();
    setIsInitialWelcome(false);
    setIsCountryModalOpen(false);
  };

  const handleUpdateIngredients = (updated: Ingredient[]) => {
    setIngredients(updated);
    AppStorage.saveIngredients(updated);
  };

  const handleUpdateRecipes = (updated: PastryRecipe[]) => {
    setRecipes(updated);
    AppStorage.saveRecipes(updated);
  };

  const handleUpdateOrders = (updated: Order[]) => {
    setOrders(updated);
    AppStorage.saveOrders(updated);
  };

  const handleBakeRecipeForOrder = (recipe: PastryRecipe) => {
    // Quickly creates an order from a recipe and switches to orders tab
    const newOrd: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `#0${orders.length + 1}`,
      customerName: 'Новый клиент',
      customerContact: '@instagram_direct',
      recipeTitle: recipe.title,
      recipeId: recipe.id,
      details: `Выпечка по рецепту: ${recipe.yieldInfo}`,
      deadlineDate: 'Завтра, 14:00',
      status: 'new',
      totalPrice: recipe.recommendedPrice,
      prepayment: Math.round(recipe.recommendedPrice * 0.5),
      remaining: Math.round(recipe.recommendedPrice * 0.5),
      stickerColor: 'rose',
      createdAt: new Date().toISOString(),
    };
    handleUpdateOrders([newOrd, ...orders]);
    setActiveTab('orders');
  };

  const handleResetData = () => {
    if (confirm('Сбросить данные приложения к начальным настройкам?')) {
      AppStorage.resetAll();
      setCountry(INITIAL_COUNTRY);
      setIngredients(INITIAL_INGREDIENTS);
      setRecipes(INITIAL_RECIPES);
      setOrders(INITIAL_ORDERS);
    }
  };

  const activeOrdersCount = orders.filter((o) => o.status !== 'delivered').length;

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#2D2530] flex flex-col font-sans selection:bg-rose-200 selection:text-rose-900">
      {/* Top Header */}
      <Header
        country={country}
        onOpenCountryPicker={() => setIsCountryModalOpen(true)}
        onResetData={handleResetData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area (Max width optimized for mobile & tablet comfort with breathing room) */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-5 md:py-7">
        {activeTab === 'fridge' && (
          <FridgeModule
            country={country}
            ingredients={ingredients}
            onUpdateIngredients={handleUpdateIngredients}
            onOpenCountryPicker={() => setIsCountryModalOpen(true)}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipesModule
            country={country}
            recipes={recipes}
            ingredients={ingredients}
            onUpdateRecipes={handleUpdateRecipes}
            onBakeRecipeForOrder={handleBakeRecipeForOrder}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersModule
            country={country}
            orders={orders}
            recipes={recipes}
            onUpdateOrders={handleUpdateOrders}
          />
        )}
      </main>

      {/* Ergonomic Floating Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ordersBadgeCount={activeOrdersCount}
      />

      {/* Country and Currency Setup Modal */}
      <CountryPickerModal
        isOpen={isCountryModalOpen}
        selectedCountry={country}
        onSelectCountry={handleSelectCountry}
        onClose={() => {
          setIsCountryModalOpen(false);
          setIsInitialWelcome(false);
        }}
        isInitialSetup={isInitialWelcome}
      />
    </div>
  );
}
