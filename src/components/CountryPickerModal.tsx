import React from 'react';
import { Sparkles, Check, Globe } from 'lucide-react';
import { CountryConfig, COUNTRIES } from '../types';

interface CountryPickerModalProps {
  isOpen: boolean;
  selectedCountry: CountryConfig;
  onSelectCountry: (country: CountryConfig) => void;
  onClose: () => void;
  isInitialSetup?: boolean;
}

export const CountryPickerModal: React.FC<CountryPickerModalProps> = ({
  isOpen,
  selectedCountry,
  onSelectCountry,
  onClose,
  isInitialSetup = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-rose-100 space-y-5 text-center">
        {/* Cute top icon */}
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-500 mx-auto flex items-center justify-center text-3xl shadow-inner">
          🌍
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-[#2D2530] tracking-tight">
            {isInitialSetup ? 'Добро пожаловать в кондитерскую!' : 'Выбор страны и валюты'}
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
            Выбери свою страну — цены в холодильнике и счетах автоматически перейдут в нужную валюту.
          </p>
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {COUNTRIES.map((c) => {
            const isSelected = selectedCountry.code === c.code;
            return (
              <button
                key={c.code}
                onClick={() => {
                  onSelectCountry(c);
                  if (!isInitialSetup) onClose();
                }}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer btn-bouncy ${
                  isSelected
                    ? 'border-rose-400 bg-rose-50/70 shadow-sm'
                    : 'border-slate-100 hover:border-rose-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{c.flag}</span>
                  <div>
                    <p className="text-xs font-extrabold text-[#2D2530]">{c.name}</p>
                    <p className="text-[11px] font-mono text-rose-500 font-bold">
                      {c.symbol} ({c.currency})
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {isInitialSetup ? (
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-rose-400 hover:bg-rose-500 text-white font-extrabold text-base shadow-lg shadow-rose-200 transition-all cursor-pointer btn-bouncy"
          >
            Начать творить вкусности ✨
          </button>
        ) : (
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors pt-1"
          >
            Закрыть
          </button>
        )}
      </div>
    </div>
  );
};
