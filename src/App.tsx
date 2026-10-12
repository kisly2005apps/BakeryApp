/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { KanbanModule } from './components/KanbanModule';
import { WarehouseModule } from './components/WarehouseModule';
import { RecipeTreeModule } from './components/RecipeTreeModule';
import { EconomicsModule } from './components/EconomicsModule';
import { ReceiptScanModal } from './components/ReceiptScanModal';
import {
  Ingredient,
  SubRecipe,
  MasterRecipe,
  Order
} from './types';
import {
  AppRepository,
  INITIAL_INGREDIENTS,
  INITIAL_SUB_RECIPES,
  INITIAL_MASTER_RECIPES,
  INITIAL_ORDERS
} from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('kanban');
  const [isReceiptScanOpen, setIsReceiptScanOpen] = useState(false);

  // Core application domain state
  const [ingredients, setIngredients] = useState<Ingredient[]>(() =>
    AppRepository.getIngredients()
  );
  const [subRecipes, setSubRecipes] = useState<SubRecipe[]>(() =>
    AppRepository.getSubRecipes()
  );
  const [masterRecipes, setMasterRecipes] = useState<MasterRecipe[]>(() =>
    AppRepository.getMasterRecipes()
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    AppRepository.getOrders()
  );

  // Persistence triggers
  const handleUpdateIngredients = (updated: Ingredient[]) => {
    setIngredients(updated);
    AppRepository.saveIngredients(updated);
  };

  const handleUpdateSubRecipes = (updated: SubRecipe[]) => {
    setSubRecipes(updated);
    AppRepository.saveSubRecipes(updated);
  };

  const handleUpdateMasterRecipes = (updated: MasterRecipe[]) => {
    setMasterRecipes(updated);
    AppRepository.saveMasterRecipes(updated);
  };

  const handleUpdateOrders = (updated: Order[]) => {
    setOrders(updated);
    AppRepository.saveOrders(updated);
  };

  const handleUpdateSingleMasterRecipe = (updated: MasterRecipe) => {
    const list = masterRecipes.map((r) => (r.id === updated.id ? updated : r));
    handleUpdateMasterRecipes(list);
  };

  const handleResetData = () => {
    if (confirm('Сбросить все данные к демонстрационным фабричным настройкам?')) {
      AppRepository.resetToDefault();
      setIngredients(INITIAL_INGREDIENTS);
      setSubRecipes(INITIAL_SUB_RECIPES);
      setMasterRecipes(INITIAL_MASTER_RECIPES);
      setOrders(INITIAL_ORDERS);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar following Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickReceiptScan={() => setIsReceiptScanOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {activeTab === 'kanban' && (
          <KanbanModule
            orders={orders}
            masterRecipes={masterRecipes}
            ingredients={ingredients}
            subRecipes={subRecipes}
            onUpdateOrders={handleUpdateOrders}
            onOpenRecipeBuilder={() => setActiveTab('recipes')}
          />
        )}

        {activeTab === 'warehouse' && (
          <WarehouseModule
            ingredients={ingredients}
            onUpdateIngredients={handleUpdateIngredients}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipeTreeModule
            ingredients={ingredients}
            subRecipes={subRecipes}
            masterRecipes={masterRecipes}
            onUpdateSubRecipes={handleUpdateSubRecipes}
            onUpdateMasterRecipes={handleUpdateMasterRecipes}
            onSelectRecipeForOrder={(recipe, targetDiameter) => {
              setActiveTab('kanban');
            }}
          />
        )}

        {activeTab === 'economics' && (
          <EconomicsModule
            masterRecipes={masterRecipes}
            ingredients={ingredients}
            subRecipes={subRecipes}
            onUpdateMasterRecipe={handleUpdateSingleMasterRecipe}
          />
        )}
      </main>

      {/* Global Quick Receipt Scan Modal */}
      <ReceiptScanModal
        isOpen={isReceiptScanOpen}
        onClose={() => setIsReceiptScanOpen(false)}
        onAddIngredients={(newItems) => {
          handleUpdateIngredients([...newItems, ...ingredients]);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            Bake-O-Metrics Confectionery ERP System · Архитектура чистых вычислений и ИИ-анализа
          </span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Нормализация 1 мл / 1 г</span>
            <span>·</span>
            <span>Канбан-CRM</span>
            <span>·</span>
            <span>Геометрический скейлинг Ø</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
