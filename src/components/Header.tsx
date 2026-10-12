import React from 'react';
import { CountryConfig } from '../types';
import { MainTab } from './BottomNavBar';
import { Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  country: CountryConfig;
  onOpenCountryPicker: () => void;
  onResetData: () => void;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  country,
  onOpenCountryPicker,
  onResetData,
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#FDF8F5]/90 backdrop-blur-md border-b border-rose-100/80 px-4 sm:px-6 py-3 transition-all no-print">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark Brand Title (one line) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-400 to-pink-500 text-white flex items-center justify-center text-lg shadow-sm shadow-rose-200">
            🍰
          </div>
          <span className="text-lg font-black tracking-tight text-[#2D2530] whitespace-nowrap">
            Bake-O-Metrics
          </span>
        </div>

        {/* Zone 2: Navigation Links (desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-black text-slate-500">
          <button
            onClick={() => onTabChange('fridge')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'fridge'
                ? 'text-rose-500 border-b-2 border-rose-500'
                : 'hover:text-rose-400'
            }`}
          >
            Холодильник 🧊
          </button>
          <button
            onClick={() => onTabChange('recipes')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'recipes'
                ? 'text-rose-500 border-b-2 border-rose-500'
                : 'hover:text-rose-400'
            }`}
          >
            Рецепты 📖
          </button>
          <button
            onClick={() => onTabChange('orders')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'orders'
                ? 'text-rose-500 border-b-2 border-rose-500'
                : 'hover:text-rose-400'
            }`}
          >
            Заказы 💌
          </button>
        </nav>

        {/* Zone 3: Country / Currency & Quick reset action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCountryPicker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-rose-200 text-xs font-black text-[#2D2530] hover:bg-rose-50 transition-colors shadow-xs cursor-pointer btn-bouncy"
          >
            <span>{country.flag}</span>
            <span className="font-mono text-rose-500">{country.symbol}</span>
          </button>

          <button
            onClick={onResetData}
            title="Сбросить к исходным данным"
            className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
