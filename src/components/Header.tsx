import React from 'react';
import { Sparkles, Plus, RefreshCw } from 'lucide-react';

export type ActiveTab = 'kanban' | 'warehouse' | 'recipes' | 'economics';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onQuickReceiptScan: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onQuickReceiptScan,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0B0F17]/85 backdrop-blur-md px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark Brand Title (one line, single element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-[0_0_15px_rgba(245,158,11,0.35)]">
            BM
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
            Bake-O-Metrics
          </span>
        </div>

        {/* Zone 2: 4 single-line nav links with hover / active indicators */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-400">
          <button
            onClick={() => onTabChange('kanban')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'kanban'
                ? 'text-amber-400 border-b-2 border-amber-400 font-bold'
                : 'hover:text-white'
            }`}
          >
            CRM Канбан
          </button>
          <button
            onClick={() => onTabChange('warehouse')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'warehouse'
                ? 'text-amber-400 border-b-2 border-amber-400 font-bold'
                : 'hover:text-white'
            }`}
          >
            AI-Склад
          </button>
          <button
            onClick={() => onTabChange('recipes')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'recipes'
                ? 'text-amber-400 border-b-2 border-amber-400 font-bold'
                : 'hover:text-white'
            }`}
          >
            Конструктор рецептов
          </button>
          <button
            onClick={() => onTabChange('economics')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'economics'
                ? 'text-amber-400 border-b-2 border-amber-400 font-bold'
                : 'hover:text-white'
            }`}
          >
            Unit-Экономика
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (plus subtle reset affordance) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onResetData}
            title="Сбросить к демонстрационным данным"
            className="p-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onQuickReceiptScan}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-md hover:from-amber-400 hover:to-amber-500 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Скан чека (ИИ)</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-around pt-3 mt-2 border-t border-white/5 text-xs font-semibold text-slate-400">
        <button
          onClick={() => onTabChange('kanban')}
          className={`py-1 ${activeTab === 'kanban' ? 'text-amber-400 font-bold' : ''}`}
        >
          Канбан
        </button>
        <button
          onClick={() => onTabChange('warehouse')}
          className={`py-1 ${activeTab === 'warehouse' ? 'text-amber-400 font-bold' : ''}`}
        >
          Склад
        </button>
        <button
          onClick={() => onTabChange('recipes')}
          className={`py-1 ${activeTab === 'recipes' ? 'text-amber-400 font-bold' : ''}`}
        >
          Рецепты
        </button>
        <button
          onClick={() => onTabChange('economics')}
          className={`py-1 ${activeTab === 'economics' ? 'text-amber-400 font-bold' : ''}`}
        >
          Экономика
        </button>
      </div>
    </header>
  );
};
