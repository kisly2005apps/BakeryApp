import React, { useState } from 'react';
import {
  X,
  Camera,
  FileText,
  Link2,
  Sparkles,
  Upload,
  ArrowRight,
  RefreshCw,
  Check,
  Video,
  Instagram
} from 'lucide-react';
import { PastryRecipe, CountryConfig, Ingredient } from '../types';

interface RecipeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  country: CountryConfig;
  ingredientsInFridge: Ingredient[];
  onAddRecipe: (recipe: PastryRecipe) => void;
}

export const RecipeImportModal: React.FC<RecipeImportModalProps> = ({
  isOpen,
  onClose,
  country,
  ingredientsInFridge,
  onAddRecipe,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'camera' | 'file' | 'link'>('link');
  const [isProcessing, setIsProcessing] = useState(false);

  // Input states
  const [urlInput, setUrlInput] = useState('https://instagram.com/reels/sweet_bento_cake');
  const [linkPreset, setLinkPreset] = useState<'instagram' | 'youtube' | 'tiktok'>('instagram');

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartImport = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      let newRecipe: PastryRecipe;

      if (selectedMethod === 'link') {
        newRecipe = {
          id: `rec-${Date.now()}`,
          title: 'Торт «Малиновый Пломбир»',
          emoji: '🍦',
          category: 'Муссовые торты',
          prepTime: '2 ч',
          yieldInfo: 'Форма 16 см (1.2 кг)',
          sourceType: 'link',
          sourceName: linkPreset === 'instagram' ? 'Instagram Reels' : 'YouTube Shorts',
          sourceUrl: urlInput,
          ingredients: [
            { id: 'i-1', name: 'Сливки 33%', amount: 350, unit: 'мл', inStock: true },
            { id: 'i-2', name: 'Сыр творожный Cremette', amount: 300, unit: 'г', inStock: true },
            { id: 'i-3', name: 'Малина свежая/пюре', amount: 200, unit: 'г', inStock: false },
            { id: 'i-4', name: 'Сахарная пудра', amount: 90, unit: 'г', inStock: true },
            { id: 'i-5', name: 'Желатин листовой', amount: 10, unit: 'г', inStock: true },
          ],
          steps: [
            'Замочить желатин в ледяной воде на 10 минут.',
            'Взбить холодные сливки с пудрой до мягких волн.',
            'Ввести творожный сыр и теплое малиновое кули с желатином.',
            'Залить в силиконовую форму и убрать в мороз на 4 часа.',
          ],
          estimatedCost: country.code === 'PL' ? 24.50 : 680,
          recommendedPrice: country.code === 'PL' ? 75.00 : 2100,
          allInFridge: false,
          missingItems: ['Малина свежая/пюре (200г)'],
          createdAt: new Date().toISOString(),
        };
      } else if (selectedMethod === 'camera') {
        newRecipe = {
          id: `rec-${Date.now()}`,
          title: 'Мамин Медовик «Семейный рецепт»',
          emoji: '🍯',
          category: 'Классика',
          prepTime: '3 ч',
          yieldInfo: '8 тонких коржей (1.5 кг)',
          sourceType: 'camera',
          sourceName: 'Фото из старой кулинарной тетради',
          ingredients: [
            { id: 'i-6', name: 'Мед натуральный', amount: 100, unit: 'г', inStock: true },
            { id: 'i-7', name: 'Сливочное масло 82.5%', amount: 100, unit: 'г', inStock: true },
            { id: 'i-8', name: 'Яйца С0', amount: 3, unit: 'шт', inStock: true },
            { id: 'i-9', name: 'Мука высший сорт', amount: 400, unit: 'г', inStock: true },
            { id: 'i-10', name: 'Сметана 25% / Сливки', amount: 500, unit: 'г', inStock: true },
          ],
          steps: [
            'Растопить мед с маслом и содой до янтарного оттенка (карамелизация).',
            'Замесить мягкое теплое тесто, раскатать 8 тончайших коржей.',
            'Выпекать каждый корж по 4-5 минут при 180°C.',
            'Прослоить нежным сметанно-сливочным кремом.',
          ],
          estimatedCost: country.code === 'PL' ? 21.00 : 590,
          recommendedPrice: country.code === 'PL' ? 68.00 : 1900,
          allInFridge: true,
          missingItems: [],
          createdAt: new Date().toISOString(),
        };
      } else {
        newRecipe = {
          id: `rec-${Date.now()}`,
          title: 'Фисташковый чизкейк Сан-Себастьян',
          emoji: '🍰',
          category: 'Чизкейки',
          prepTime: '1 ч 15 мин',
          yieldInfo: 'Форма 18 см (1.1 кг)',
          sourceType: 'file',
          sourceName: 'Файл SanSebastian_Pistachio.pdf',
          ingredients: [
            { id: 'i-11', name: 'Сыр творожный Cremette', amount: 600, unit: 'г', inStock: true },
            { id: 'i-12', name: 'Сливки 33%', amount: 300, unit: 'мл', inStock: true },
            { id: 'i-13', name: 'Яйца С0', amount: 4, unit: 'шт', inStock: true },
            { id: 'i-14', name: 'Фисташковая паста 100%', amount: 80, unit: 'г', inStock: false },
          ],
          steps: [
            'Смешать сыр, пудру и фисташковую пасту на низкой скорости миксера.',
            'По одному ввести яйца и жирные сливки, не взбивая лишний воздух.',
            'Выпекать в пергаменте при 220°C 26-28 минут до карамельной корочки и дрожащего центра.',
          ],
          estimatedCost: country.code === 'PL' ? 32.00 : 920,
          recommendedPrice: country.code === 'PL' ? 95.00 : 2800,
          allInFridge: false,
          missingItems: ['Фисташковая паста 100% (80г)'],
          createdAt: new Date().toISOString(),
        };
      }

      onAddRecipe(newRecipe);
      onClose();
    }, 1300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border-2 border-rose-100 space-y-5 text-center">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h3 className="text-lg font-black text-[#2D2530]">Умный импорт рецепта</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 text-left">
          Выбери удобный способ — ИИ сам выделит ингредиенты, граммовки и проверит, есть ли они в твоем холодильнике!
        </p>

        {/* 3 Visual Import Options with Big Rounded Cards */}
        <div className="grid grid-cols-3 gap-2.5 text-left">
          {/* Option 1: Camera Photo */}
          <button
            onClick={() => setSelectedMethod('camera')}
            className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer btn-bouncy ${
              selectedMethod === 'camera'
                ? 'border-rose-400 bg-rose-50 shadow-sm'
                : 'border-slate-100 hover:border-rose-200 bg-white'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center text-2xl mb-1.5 shadow-inner">
              📷
            </div>
            <p className="text-xs font-black text-[#2D2530] leading-tight">Сделать фото</p>
            <p className="text-[10px] text-slate-400 mt-0.5">из блокнота</p>
          </button>

          {/* Option 2: Upload File */}
          <button
            onClick={() => setSelectedMethod('file')}
            className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer btn-bouncy ${
              selectedMethod === 'file'
                ? 'border-rose-400 bg-rose-50 shadow-sm'
                : 'border-slate-100 hover:border-rose-200 bg-white'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-500 flex items-center justify-center text-2xl mb-1.5 shadow-inner">
              📄
            </div>
            <p className="text-xs font-black text-[#2D2530] leading-tight">Загрузить файл</p>
            <p className="text-[10px] text-slate-400 mt-0.5">PDF / заметка</p>
          </button>

          {/* Option 3: Paste Link */}
          <button
            onClick={() => setSelectedMethod('link')}
            className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer btn-bouncy ${
              selectedMethod === 'link'
                ? 'border-rose-400 bg-rose-50 shadow-sm'
                : 'border-slate-100 hover:border-rose-200 bg-white'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-500 flex items-center justify-center text-2xl mb-1.5 shadow-inner">
              🔗
            </div>
            <p className="text-xs font-black text-[#2D2530] leading-tight">Вставить ссылку</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Reels / Shorts</p>
          </button>
        </div>

        {/* Selected Method Details */}
        <div className="p-4 bg-slate-50 rounded-2xl text-left space-y-3">
          {selectedMethod === 'link' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Ссылка на видео с рецептом:
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://instagram.com/reels/..."
                className="w-full p-3 rounded-xl bg-white border border-rose-200 text-xs font-mono text-[#2D2530] focus:outline-none focus:border-rose-400"
              />
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                <span>Популярные:</span>
                <button
                  type="button"
                  onClick={() => {
                    setUrlInput('https://instagram.com/reels/sweet_bento_cake');
                    setLinkPreset('instagram');
                  }}
                  className="text-pink-500 font-bold hover:underline cursor-pointer"
                >
                  Instagram Reels
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setUrlInput('https://youtube.com/shorts/raspberry_plombir');
                    setLinkPreset('youtube');
                  }}
                  className="text-red-500 font-bold hover:underline cursor-pointer"
                >
                  YouTube Shorts
                </button>
              </div>
            </div>
          )}

          {selectedMethod === 'camera' && (
            <div className="text-center py-3 space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 mx-auto flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-[#2D2530]">
                Фотография рукописного рецепта или книги
              </p>
              <p className="text-[11px] text-slate-400">
                ИИ обучен распознавать даже неровный почерк и старые бабушкины тетради!
              </p>
            </div>
          )}

          {selectedMethod === 'file' && (
            <div className="text-center py-3 space-y-2">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-500 mx-auto flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-[#2D2530]">
                Выбери файл рецепта (.pdf, .doc, .txt)
              </p>
              <p className="text-[11px] text-slate-400">
                Мгновенный парсинг таблиц ингредиентов и граммовок
              </p>
            </div>
          )}
        </div>

        {/* Submit Import Action */}
        <button
          onClick={handleStartImport}
          disabled={isProcessing}
          className="w-full py-4 rounded-2xl bg-rose-400 hover:bg-rose-500 text-white font-extrabold text-sm shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer btn-bouncy"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>ИИ анализирует и считает себестоимость...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Импортировать рецепт с ИИ ✨</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
