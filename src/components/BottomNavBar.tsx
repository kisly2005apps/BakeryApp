import React from 'react';
import { Layers, Cake, Heart, Sparkles, BookOpen, ShoppingBag } from 'lucide-react';

export type MainTab = 'fridge' | 'recipes' | 'orders';

interface BottomNavBarProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  ordersBadgeCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  ordersBadgeCount = 0,
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 max-w-lg mx-auto pointer-events-none no-print">
      <nav className="bg-white/95 backdrop-blur-xl border-2 border-rose-100 rounded-3xl p-2 shadow-2xl shadow-rose-200/50 flex items-center justify-between pointer-events-auto">
        {/* Tab 1: Склад ("Умный холодильник") */}
        <button
          onClick={() => onTabChange('fridge')}
          className={`flex-1 py-3 px-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer btn-bouncy ${
            activeTab === 'fridge'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="text-xl leading-none">🧊</span>
          <span
            className={`text-xs font-black mt-1 leading-none ${
              activeTab === 'fridge' ? 'text-white' : 'text-slate-500'
            }`}
          >
            Склад
          </span>
        </button>

        {/* Tab 2: Рецепты ("Умный импорт") */}
        <button
          onClick={() => onTabChange('recipes')}
          className={`flex-1 py-3 px-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer btn-bouncy ${
            activeTab === 'recipes'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="text-xl leading-none">📖</span>
          <span
            className={`text-xs font-black mt-1 leading-none ${
              activeTab === 'recipes' ? 'text-white' : 'text-slate-500'
            }`}
          >
            Рецепты
          </span>
        </button>

        {/* Tab 3: Заказы ("Лайт-CRM") */}
        <button
          onClick={() => onTabChange('orders')}
          className={`flex-1 py-3 px-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer btn-bouncy relative ${
            activeTab === 'orders'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="text-xl leading-none">💌</span>
          <span
            className={`text-xs font-black mt-1 leading-none ${
              activeTab === 'orders' ? 'text-white' : 'text-slate-500'
            }`}
          >
            Заказы
          </span>
          {ordersBadgeCount > 0 && (
            <span
              className={`absolute top-2 right-4 w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center font-mono ${
                activeTab === 'orders' ? 'bg-white text-rose-500' : 'bg-rose-500 text-white'
              }`}
            >
              {ordersBadgeCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};
