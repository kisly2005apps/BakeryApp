import React, { useState } from 'react';
import {
  FileText,
  Clock,
  User,
  Phone,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Printer,
  Sparkles,
  MapPin,
  Layers
} from 'lucide-react';
import { Order, KanbanStatus, MasterRecipe, Ingredient, SubRecipe } from '../types';
import { calculateMasterRecipeEconomics } from '../services/calculator';
import { EstimateReceiptModal } from './EstimateReceiptModal';

interface KanbanModuleProps {
  orders: Order[];
  masterRecipes: MasterRecipe[];
  ingredients: Ingredient[];
  subRecipes: SubRecipe[];
  onUpdateOrders: (orders: Order[]) => void;
  onOpenRecipeBuilder?: (recipeId: string) => void;
}

const KANBAN_COLUMNS: Array<{
  id: KanbanStatus;
  title: string;
  badgeColor: string;
  dotColor: string;
}> = [
  {
    id: 'prepayment_received',
    title: 'Предоплата получена',
    badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    dotColor: 'bg-blue-400',
  },
  {
    id: 'procurement',
    title: 'Закупка сырья',
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    dotColor: 'bg-amber-400',
  },
  {
    id: 'in_progress',
    title: 'В процессе выпечки',
    badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    dotColor: 'bg-cyan-400',
  },
  {
    id: 'ready_for_pickup',
    title: 'Ожидает выдачи',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    dotColor: 'bg-emerald-400',
  },
  {
    id: 'completed',
    title: 'Выполнен / Архив',
    badgeColor: 'border-slate-500/30 text-slate-400 bg-slate-500/10',
    dotColor: 'bg-slate-400',
  },
];

export const KanbanModule: React.FC<KanbanModuleProps> = ({
  orders,
  masterRecipes,
  ingredients,
  subRecipes,
  onUpdateOrders,
  onOpenRecipeBuilder,
}) => {
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // New Order Form state
  const [newOrderForm, setNewOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    customerTelegram: '',
    customerNotes: '',
    recipeId: masterRecipes[0]?.id || '',
    targetDiameter: 20,
    deadlineDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16),
    deliveryType: 'pickup' as 'pickup' | 'courier',
    deliveryAddress: '',
    prepaymentRatio: 0.5,
  });

  // Lookup maps
  const ingredientsMap: Record<string, Ingredient> = {};
  ingredients.forEach((ing) => (ingredientsMap[ing.id] = ing));

  const subRecipesMap: Record<string, SubRecipe> = {};
  subRecipes.forEach((sub) => (subRecipesMap[sub.id] = sub));

  const handleStatusChange = (orderId: string, direction: 'next' | 'prev') => {
    const statusOrder: KanbanStatus[] = [
      'prepayment_received',
      'procurement',
      'in_progress',
      'ready_for_pickup',
      'completed',
    ];

    const updated = orders.map((ord) => {
      if (ord.id === orderId) {
        const currentIdx = statusOrder.indexOf(ord.status);
        const nextIdx =
          direction === 'next'
            ? Math.min(statusOrder.length - 1, currentIdx + 1)
            : Math.max(0, currentIdx - 1);
        return {
          ...ord,
          status: statusOrder[nextIdx],
        };
      }
      return ord;
    });

    onUpdateOrders(updated);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Удалить данный заказ из CRM?')) {
      onUpdateOrders(orders.filter((o) => o.id !== orderId));
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const recipe = masterRecipes.find((r) => r.id === newOrderForm.recipeId) || masterRecipes[0];
    if (!recipe) return;

    const econ = calculateMasterRecipeEconomics(
      recipe,
      ingredientsMap,
      subRecipesMap,
      newOrderForm.targetDiameter
    );

    const price = Math.round(econ.sellingPrice);
    const prepayment = Math.round(price * newOrderForm.prepaymentRatio);

    const newOrd: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `#BOM-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newOrderForm.customerName.trim(),
      customerPhone: newOrderForm.customerPhone.trim(),
      customerTelegram: newOrderForm.customerTelegram.trim() || undefined,
      customerNotes: newOrderForm.customerNotes.trim() || undefined,
      status: 'prepayment_received',
      recipeId: recipe.id,
      recipeName: recipe.name,
      targetDiameter: newOrderForm.targetDiameter,
      baseDiameter: recipe.baseDiameter,
      panScaleFactor: econ.scaleFactor,
      calculatedWeightGrams: econ.scaledWeightGrams,
      deadline: new Date(newOrderForm.deadlineDate).toISOString(),
      deliveryType: newOrderForm.deliveryType,
      deliveryAddress: newOrderForm.deliveryAddress.trim() || undefined,
      rawFoodCost: Math.round(econ.rawFoodCost),
      laborCost: Math.round(econ.laborCost),
      overheadCost: Math.round(econ.overheadCost),
      packagingCost: Math.round(econ.packagingCost),
      totalPrimeCost: Math.round(econ.totalPrimeCost),
      sellingPrice: price,
      prepaymentAmount: prepayment,
      remainingAmount: price - prepayment,
      netProfit: Math.round(econ.netProfit),
      marginPercent: Number(econ.marginPercent.toFixed(1)),
      createdAt: new Date().toISOString(),
    };

    onUpdateOrders([newOrd, ...orders]);
    setIsNewOrderModalOpen(false);
    setNewOrderForm({
      customerName: '',
      customerPhone: '',
      customerTelegram: '',
      customerNotes: '',
      recipeId: masterRecipes[0]?.id || '',
      targetDiameter: 20,
      deadlineDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16),
      deliveryType: 'pickup',
      deliveryAddress: '',
      prepaymentRatio: 0.5,
    });
  };

  // Overall Financial & Pipeline KPIs
  const activeOrders = orders.filter((o) => o.status !== 'completed');
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.sellingPrice, 0);
  const totalPrepayments = activeOrders.reduce((sum, o) => sum + o.prepaymentAmount, 0);
  const totalRemaining = activeOrders.reduce((sum, o) => sum + o.remainingAmount, 0);
  const totalNetProfit = activeOrders.reduce((sum, o) => sum + o.netProfit, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Модуль 4
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">Кондитерская CRM и Канбан-пайплайн</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Канбан-доска заказов и генерация PDF-смет
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Управление заказами по этапам готовности, контроль дедлайнов и мгновенная печать
            клиентской сметы или технологического листа в кондитерский цех.
          </p>
        </div>

        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer ring-1 ring-amber-400/40"
        >
          <Plus className="w-4 h-4" />
          <span>+ Принять новый заказ</span>
        </button>
      </div>

      {/* Financial Pipeline Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-white/5">
          <span className="text-xs text-slate-400 block">Активных заказов в работе:</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">
            {activeOrders.length}
          </span>
          <span className="text-[11px] text-slate-500">
            Всего в базе: {orders.length} заказов
          </span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-white/5">
          <span className="text-xs text-slate-400 block">Выручка в пайплайне:</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">
            {totalRevenue.toLocaleString('ru-RU')} ₽
          </span>
          <span className="text-[11px] text-slate-500">
            Остаток к получению: {totalRemaining.toLocaleString('ru-RU')} ₽
          </span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-white/5">
          <span className="text-xs text-slate-400 block">Получено предоплат:</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
            {totalPrepayments.toLocaleString('ru-RU')} ₽
          </span>
          <span className="text-[11px] text-slate-500">Уже на счете кондитера</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-white/5">
          <span className="text-xs text-slate-400 block">Прогноз чистой прибыли:</span>
          <span className="text-2xl font-bold text-cyan-400 font-mono mt-1 block">
            {totalNetProfit.toLocaleString('ru-RU')} ₽
          </span>
          <span className="text-[11px] text-slate-500">
            Средняя рентабельность ~53%
          </span>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((column) => {
          const columnOrders = orders.filter((o) => o.status === column.id);

          return (
            <div
              key={column.id}
              className="rounded-2xl glass-panel border border-white/10 p-3.5 flex flex-col space-y-3 min-w-[270px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${column.dotColor}`} />
                  <h3 className="text-xs font-bold text-white tracking-tight">
                    {column.title}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {columnOrders.length}
                </span>
              </div>

              {/* Order Cards Stack */}
              <div className="space-y-3 flex-1 min-h-[350px]">
                {columnOrders.map((order) => {
                  const deadlineDate = new Date(order.deadline);
                  const hoursLeft = Math.round(
                    (deadlineDate.getTime() - Date.now()) / (3600 * 1000)
                  );
                  const isUrgent = hoursLeft > 0 && hoursLeft <= 24;
                  const isOverdue = hoursLeft <= 0;

                  return (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-amber-500/40 transition-all space-y-3 shadow-md group"
                    >
                      {/* Top: Order # & Deadline */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-amber-400">
                          {order.orderNumber}
                        </span>

                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span
                            className={
                              isOverdue
                                ? 'text-rose-400 font-bold'
                                : isUrgent
                                ? 'text-amber-400 font-bold'
                                : 'text-slate-400'
                            }
                          >
                            {isOverdue ? 'Просрочен!' : `${hoursLeft} ч`}
                          </span>
                        </div>
                      </div>

                      {/* Recipe Title & Pan Diameter */}
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          {order.recipeName}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span>Ø {order.targetDiameter} см</span>
                          <span>·</span>
                          <span className="text-slate-300 font-bold">
                            {(order.calculatedWeightGrams / 1000).toFixed(2)} кг
                          </span>
                        </div>
                      </div>

                      {/* Customer Contact */}
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5 text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 text-white font-medium">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{order.customerName}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                          <span>{order.customerPhone}</span>
                          {order.customerTelegram && (
                            <span className="text-amber-400">{order.customerTelegram}</span>
                          )}
                        </div>
                      </div>

                      {/* Financials & Prepayment */}
                      <div className="pt-1 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Стоимость:</span>
                          <span className="font-bold text-white">
                            {order.sellingPrice.toLocaleString('ru-RU')} ₽
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Остаток к доплате:</span>
                          <span className="font-bold text-amber-400">
                            {order.remainingAmount.toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                      </div>

                      {/* Actions Strip */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1">
                        {/* Status Nav Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStatusChange(order.id, 'prev')}
                            disabled={order.status === 'prepayment_received'}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Предыдущий статус"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(order.id, 'next')}
                            disabled={order.status === 'completed'}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Следующий статус"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Open PDF / Receipt Modal */}
                        <button
                          onClick={() => {
                            setSelectedOrderForReceipt(order);
                            setIsReceiptModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-medium text-[11px] transition-colors"
                          title="Сгенерировать PDF-смету/Чек"
                        >
                          <FileText className="w-3 h-3" />
                          <span>PDF-смета</span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {columnOrders.length === 0 && (
                  <div className="h-32 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-slate-500 text-xs text-center p-3">
                    <span>Нет заказов в этой колонке</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Order Creation */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl glass-panel-gold bg-[#0F172A]/95 border border-amber-500/30 text-white shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Оформить заказ в CRM
              </h3>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Имя заказчика:</label>
                  <input
                    type="text"
                    required
                    value={newOrderForm.customerName}
                    onChange={(e) =>
                      setNewOrderForm({ ...newOrderForm, customerName: e.target.value })
                    }
                    placeholder="Елена Васильева"
                    className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">Телефон:</label>
                  <input
                    type="tel"
                    required
                    value={newOrderForm.customerPhone}
                    onChange={(e) =>
                      setNewOrderForm({ ...newOrderForm, customerPhone: e.target.value })
                    }
                    placeholder="+7 (999) 000-00-00"
                    className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Telegram (необязательно):</label>
                  <input
                    type="text"
                    value={newOrderForm.customerTelegram}
                    onChange={(e) =>
                      setNewOrderForm({ ...newOrderForm, customerTelegram: e.target.value })
                    }
                    placeholder="@username"
                    className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">Дедлайн (дата и время):</label>
                  <input
                    type="datetime-local"
                    required
                    value={newOrderForm.deadlineDate}
                    onChange={(e) =>
                      setNewOrderForm({ ...newOrderForm, deadlineDate: e.target.value })
                    }
                    className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Выбор рецепта изделия:</label>
                <select
                  value={newOrderForm.recipeId}
                  onChange={(e) =>
                    setNewOrderForm({ ...newOrderForm, recipeId: e.target.value })
                  }
                  className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white bg-slate-900"
                >
                  {masterRecipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (база {r.baseDiameter} см)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">
                    Диаметр формы заказа:
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="36"
                    required
                    value={newOrderForm.targetDiameter}
                    onChange={(e) =>
                      setNewOrderForm({
                        ...newOrderForm,
                        targetDiameter: parseInt(e.target.value, 10) || 16,
                      })
                    }
                    className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">Тип выдачи:</label>
                  <select
                    value={newOrderForm.deliveryType}
                    onChange={(e) =>
                      setNewOrderForm({
                        ...newOrderForm,
                        deliveryType: e.target.value as 'pickup' | 'courier',
                      })
                    }
                    className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white bg-slate-900"
                  >
                    <option value="pickup">Самовывоз</option>
                    <option value="courier">Курьерская доставка</option>
                  </select>
                </div>
              </div>

              {newOrderForm.deliveryType === 'courier' && (
                <div>
                  <label className="text-xs font-medium text-slate-300">Адрес доставки:</label>
                  <input
                    type="text"
                    value={newOrderForm.deliveryAddress}
                    onChange={(e) =>
                      setNewOrderForm({ ...newOrderForm, deliveryAddress: e.target.value })
                    }
                    placeholder="г. Москва, ул. Ленина 10, кв. 4"
                    className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-300">
                  Пожелания к декору и надписям:
                </label>
                <textarea
                  value={newOrderForm.customerNotes}
                  onChange={(e) =>
                    setNewOrderForm({ ...newOrderForm, customerNotes: e.target.value })
                  }
                  rows={2}
                  placeholder="Надпись «С днем рождения», без сахарных посыпок..."
                  className="w-full mt-1 p-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Создать заказ и рассчитать смету
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF / Receipt Modal */}
      <EstimateReceiptModal
        order={selectedOrderForReceipt}
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedOrderForReceipt(null);
        }}
        masterRecipes={masterRecipes}
        subRecipes={subRecipes}
        ingredients={ingredients}
      />
    </div>
  );
};
