import React, { useState } from 'react';
import {
  Plus,
  Share2,
  Calendar,
  CheckCircle2,
  Trash2,
  DollarSign,
  Heart,
  Instagram,
  Phone,
  User,
  Sparkles,
  Cake
} from 'lucide-react';
import { Order, OrderStatus, CountryConfig, PastryRecipe } from '../types';
import { ReceiptShareModal } from './ReceiptShareModal';

interface OrdersModuleProps {
  country: CountryConfig;
  orders: Order[];
  recipes: PastryRecipe[];
  onUpdateOrders: (updated: Order[]) => void;
}

const STATUS_PILLS: Array<{ id: OrderStatus; label: string; emoji: string; color: string }> = [
  { id: 'new', label: 'Новый', emoji: '🎀', color: 'bg-rose-100 text-rose-700 border-rose-300' },
  { id: 'baking', label: 'В духовке', emoji: '👩‍🍳', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { id: 'decorating', label: 'Сборка', emoji: '🎂', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { id: 'ready', label: 'Готов!', emoji: '✨', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { id: 'delivered', label: 'Отдан', emoji: '❤️', color: 'bg-slate-100 text-slate-600 border-slate-300' },
];

const STICKER_STYLES: Record<Order['stickerColor'], string> = {
  rose: 'card-pastel-rose',
  peach: 'card-pastel-peach',
  lavender: 'card-pastel-lavender',
  mint: 'card-pastel-mint',
  yellow: 'bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200',
};

export const OrdersModule: React.FC<OrdersModuleProps> = ({
  country,
  orders,
  recipes,
  onUpdateOrders,
}) => {
  const [selectedOrderForShare, setSelectedOrderForShare] = useState<Order | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // Quick form for new order
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerContact: '',
    recipeTitle: recipes[0]?.title || 'Бенто-торт «Клубничный Бархат»',
    details: '',
    deadlineDate: 'Пятница, 16:00',
    totalPrice: 65,
    prepayment: 30,
    stickerColor: 'rose' as Order['stickerColor'],
  });

  // Finance edit handlers
  const handleUpdateFinance = (orderId: string, field: 'totalPrice' | 'prepayment', val: number) => {
    const updated = orders.map((ord) => {
      if (ord.id === orderId) {
        const newTotal = field === 'totalPrice' ? val : ord.totalPrice;
        const newPrepay = field === 'prepayment' ? val : ord.prepayment;
        const remaining = Math.max(0, newTotal - newPrepay);
        return {
          ...ord,
          totalPrice: newTotal,
          prepayment: newPrepay,
          remaining,
        };
      }
      return ord;
    });
    onUpdateOrders(updated);
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord));
    onUpdateOrders(updated);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Удалить этот стикер заказа?')) {
      onUpdateOrders(orders.filter((o) => o.id !== orderId));
    }
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customerName.trim()) return;

    const remaining = Math.max(0, newOrder.totalPrice - newOrder.prepayment);
    const created: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `#0${orders.length + 1}`,
      customerName: newOrder.customerName.trim(),
      customerContact: newOrder.customerContact.trim() || '@instagram',
      recipeTitle: newOrder.recipeTitle,
      details: newOrder.details.trim() || 'Праздничное оформление',
      deadlineDate: newOrder.deadlineDate.trim() || 'В выходные',
      status: 'new',
      totalPrice: Number(newOrder.totalPrice) || 50,
      prepayment: Number(newOrder.prepayment) || 0,
      remaining,
      stickerColor: newOrder.stickerColor,
      createdAt: new Date().toISOString(),
    };

    onUpdateOrders([created, ...orders]);
    setIsNewOrderModalOpen(false);
    setNewOrder({
      customerName: '',
      customerContact: '',
      recipeTitle: recipes[0]?.title || 'Бенто-торт',
      details: '',
      deadlineDate: 'Пятница, 16:00',
      totalPrice: 65,
      prepayment: 30,
      stickerColor: 'rose',
    });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-rose-500">
            Вкладка 3
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2D2530] tracking-tight flex items-center gap-2">
            Заказы и Клиенты 💌
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Лайт-CRM: яркие стикеры, контакты в Инстаграм и автоматический расчет остатка
          </p>
        </div>

        {/* Big Rounded "+ New Order" Button */}
        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="px-6 py-4 rounded-3xl bg-rose-400 hover:bg-rose-500 text-white font-extrabold text-sm shadow-xl shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer btn-bouncy"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>+ Принять заказ 🎂</span>
        </button>
      </div>

      {/* Orders Grid (Colorful Pastel Sticky Notes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => {
          const currentStatusObj =
            STATUS_PILLS.find((s) => s.id === order.status) || STATUS_PILLS[0];

          return (
            <div
              key={order.id}
              className={`rounded-3xl p-5 space-y-4 shadow-sm transition-all hover:shadow-md border-2 relative ${
                STICKER_STYLES[order.stickerColor]
              }`}
            >
              {/* Sticker Top Pin / Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-mono text-rose-500 bg-white/80 px-2 py-0.5 rounded-lg shadow-xs">
                      {order.orderNumber}
                    </span>
                    <h3 className="text-base font-black text-[#2D2530] leading-snug">
                      {order.customerName}
                    </h3>
                  </div>
                  <div className="text-xs font-bold text-rose-600 mt-1 flex items-center gap-1">
                    {order.customerContact.startsWith('@') ? (
                      <Instagram className="w-3.5 h-3.5" />
                    ) : (
                      <Phone className="w-3.5 h-3.5" />
                    )}
                    <span>{order.customerContact}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteOrder(order.id)}
                  title="Удалить"
                  className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Dessert info */}
              <div className="p-3 bg-white/70 rounded-2xl space-y-1 border border-white">
                <span className="text-xs font-black text-[#2D2530] block">
                  🎂 {order.recipeTitle}
                </span>
                <p className="text-[11px] text-slate-600 leading-tight">
                  {order.details}
                </p>
                <div className="text-[10px] font-bold text-slate-400 pt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Срок: {order.deadlineDate}</span>
                </div>
              </div>

              {/* Status Switcher (Friendly Pills) */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Статус десерта:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {STATUS_PILLS.map((st) => {
                    const isSelected = order.status === st.id;
                    return (
                      <button
                        key={st.id}
                        onClick={() => handleStatusChange(order.id, st.id)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-black whitespace-nowrap transition-all cursor-pointer border ${
                          isSelected
                            ? `${st.color} shadow-xs scale-105`
                            : 'bg-white/60 text-slate-400 border-transparent hover:bg-white'
                        }`}
                      >
                        <span>{st.emoji}</span> {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Simple Financial Inputs Block (Requested in prompt) */}
              <div className="p-3.5 bg-white rounded-2xl border-2 border-rose-100 space-y-2.5 shadow-xs">
                <span className="text-[10px] uppercase font-black tracking-wider text-rose-500 block">
                  Финансы (ручной ввод):
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Field: Выставить счет */}
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">
                      Выставить счет ({country.symbol}):
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={order.totalPrice}
                      onChange={(e) =>
                        handleUpdateFinance(
                          order.id,
                          'totalPrice',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-sm text-[#2D2530] focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  {/* Field: Предоплата внесена */}
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">
                      Предоплата ({country.symbol}):
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={order.prepayment}
                      onChange={(e) =>
                        handleUpdateFinance(
                          order.id,
                          'prepayment',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-sm text-emerald-600 focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                {/* Field: Остаток к оплате (считается автоматически) */}
                <div className="p-2.5 bg-rose-50/70 rounded-xl flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-600">Остаток к оплате:</span>
                  <span className="font-black text-base text-rose-600">
                    {order.remaining.toFixed(2)} {country.symbol}
                  </span>
                </div>
              </div>

              {/* Share Receipt / Invoice for Client */}
              <button
                onClick={() => {
                  setSelectedOrderForShare(order);
                  setIsShareModalOpen(true);
                }}
                className="w-full py-3 rounded-2xl bg-white hover:bg-rose-50 text-rose-500 border-2 border-rose-200 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer btn-bouncy shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Отправить сметку клиенту 💌</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* New Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-rose-100 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎀</span>
                <h3 className="text-lg font-black text-[#2D2530]">Новый заказ</h3>
              </div>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-3.5 text-left text-xs">
              <div>
                <label className="font-bold text-slate-600 block">Имя клиентки:</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Алина Соколова"
                  value={newOrder.customerName}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, customerName: e.target.value })
                  }
                  className="w-full mt-1 p-3 rounded-xl border border-rose-200 text-sm font-bold text-[#2D2530]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block">Инстаграм / телефон:</label>
                  <input
                    type="text"
                    placeholder="@kate_cake или +48..."
                    value={newOrder.customerContact}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, customerContact: e.target.value })
                    }
                    className="w-full mt-1 p-3 rounded-xl border border-rose-200 text-xs font-mono font-bold text-[#2D2530]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block">Дедлайн (день/время):</label>
                  <input
                    type="text"
                    placeholder="Пятница, 16:00"
                    value={newOrder.deadlineDate}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, deadlineDate: e.target.value })
                    }
                    className="w-full mt-1 p-3 rounded-xl border border-rose-200 text-xs font-bold text-[#2D2530]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block">Выбери десерт из меню:</label>
                <select
                  value={newOrder.recipeTitle}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, recipeTitle: e.target.value })
                  }
                  className="w-full mt-1 p-3 rounded-xl border border-rose-200 text-xs font-bold text-[#2D2530] bg-white"
                >
                  {recipes.map((r) => (
                    <option key={r.id} value={r.title}>
                      {r.emoji} {r.title}
                    </option>
                  ))}
                  <option value="Кастомный торт">🎂 Индивидуальный торт по эскизу</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block">Пожелания к декору и надписи:</label>
                <textarea
                  rows={2}
                  placeholder="Надпись «С днем рождения!», свежие ягоды..."
                  value={newOrder.details}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, details: e.target.value })
                  }
                  className="w-full mt-1 p-3 rounded-xl border border-rose-200 text-xs text-[#2D2530]"
                />
              </div>

              {/* Financial Inputs in Form */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-rose-50/60 rounded-2xl border border-rose-100">
                <div>
                  <label className="font-bold text-slate-600 block">
                    Выставить счет ({country.symbol}):
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={newOrder.totalPrice}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        totalPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full mt-1 p-2.5 rounded-xl bg-white border border-rose-200 font-mono font-bold text-sm text-[#2D2530]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block">
                    Предоплата ({country.symbol}):
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={newOrder.prepayment}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        prepayment: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full mt-1 p-2.5 rounded-xl bg-white border border-rose-200 font-mono font-bold text-sm text-emerald-600"
                  />
                </div>
              </div>

              {/* Color of sticky note */}
              <div>
                <label className="font-bold text-slate-600 block mb-1">Цвет стикера:</label>
                <div className="flex items-center gap-3">
                  {(['rose', 'peach', 'lavender', 'mint'] as Order['stickerColor'][]).map(
                    (col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setNewOrder({ ...newOrder, stickerColor: col })}
                        className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                          col === 'rose'
                            ? 'bg-rose-200'
                            : col === 'peach'
                            ? 'bg-orange-200'
                            : col === 'lavender'
                            ? 'bg-purple-200'
                            : 'bg-emerald-200'
                        } ${
                          newOrder.stickerColor === col
                            ? 'scale-125 border-slate-700'
                            : 'border-transparent'
                        }`}
                      />
                    )
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-rose-400 hover:bg-rose-500 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer btn-bouncy"
                >
                  Создать стикер заказа ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share / Receipt Modal */}
      <ReceiptShareModal
        order={selectedOrderForShare}
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedOrderForShare(null);
        }}
        country={country}
      />
    </div>
  );
};
