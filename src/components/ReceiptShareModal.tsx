import React, { useState } from 'react';
import { X, Copy, Check, Share2, Heart, Sparkles, MessageCircle } from 'lucide-react';
import { Order, CountryConfig } from '../types';

interface ReceiptShareModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  country: CountryConfig;
}

export const ReceiptShareModal: React.FC<ReceiptShareModalProps> = ({
  order,
  isOpen,
  onClose,
  country,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopy = () => {
    const text = `🎂 Твой заказ принят с любовью! ✨
Заказ: ${order.orderNumber}
Десерт: ${order.recipeTitle}
Пожелания: ${order.details || 'Авторское оформление'}
Готовность: ${order.deadlineDate}

💰 Сумма заказа: ${order.totalPrice.toFixed(2)} ${country.symbol}
✨ Внесенная предоплата: ${order.prepayment.toFixed(2)} ${country.symbol}
💳 Остаток к оплате при получении: ${order.remaining.toFixed(2)} ${country.symbol}

Спасибо за заказ! ❤️
Кондитерская мастерская`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-rose-100 space-y-5 text-center">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💌</span>
            <h3 className="text-base font-black text-[#2D2530]">Смета для клиента</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cute Instagram-style Pastel Receipt Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-b from-[#FFF5F7] to-[#FFF0F3] border-2 border-rose-200 text-left space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-rose-200/80 pb-3">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-rose-500 block">
                Сладкий заказ
              </span>
              <p className="text-base font-black text-[#2D2530]">{order.orderNumber}</p>
            </div>
            <span className="text-2xl">🎂</span>
          </div>

          <div className="space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Клиент:</span>
            <p className="font-extrabold text-[#2D2530] text-sm">{order.customerName}</p>
            <p className="text-rose-600 font-bold">{order.customerContact}</p>
          </div>

          <div className="space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Десерт:</span>
            <p className="font-extrabold text-[#2D2530]">{order.recipeTitle}</p>
            <p className="text-slate-500 text-[11px]">{order.details}</p>
          </div>

          <div className="p-3 bg-white/80 rounded-2xl space-y-1.5 border border-rose-100 font-mono text-xs">
            <div className="flex justify-between text-slate-600 font-bold">
              <span>Сумма заказа:</span>
              <span className="text-[#2D2530] font-black">
                {order.totalPrice.toFixed(2)} {country.symbol}
              </span>
            </div>
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Предоплата:</span>
              <span>- {order.prepayment.toFixed(2)} {country.symbol}</span>
            </div>
            <div className="border-t border-rose-100 pt-1.5 flex justify-between font-black text-sm text-rose-600">
              <span>Остаток к оплате:</span>
              <span>{order.remaining.toFixed(2)} {country.symbol}</span>
            </div>
          </div>

          <div className="text-center text-[11px] font-bold text-rose-400 pt-1 flex items-center justify-center gap-1">
            <span>Печется со свежей любовью</span>
            <Heart className="w-3.5 h-3.5 fill-rose-400" />
          </div>
        </div>

        {/* Copy Action Button */}
        <button
          onClick={handleCopy}
          className="w-full py-4 rounded-2xl bg-rose-400 hover:bg-rose-500 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer btn-bouncy"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Скопировано в буфер обмена! ❤️</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Скопировать для WhatsApp / Direct 💌</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
