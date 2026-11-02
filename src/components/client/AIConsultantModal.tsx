import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Zap,
  CheckCircle,
  ShoppingCart,
  Wrench,
} from 'lucide-react';

interface Message {
  sender: 'ai' | 'user';
  text: string;
  recommendedProducts?: any[];
}

export const AIConsultantModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { products, addToCart, setSelectedProductId, setCurrentView } = useApp();

  const [budget, setBudget] = useState('25-35');
  const [purpose, setPurpose] = useState('GAMING');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ Lý AI Chuyên Viên Tư Vấn Phần Cứng GearTech. Hãy cho tôi biết mức ngân sách và nhu cầu (Chơi game AAA, Livestream, Đồ họa 3D, Render video hay Văn phòng), tôi sẽ đề xuất ngay dàn máy tính tối ưu hiệu năng trên giá thành nhất!',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const handleQuickRecommend = async () => {
    setIsThinking(true);
    const userPrompt = `Tư vấn cấu hình cho nhu cầu ${purpose === 'GAMING' ? 'Chơi Game Esport & AAA' : purpose === 'GRAPHICS' ? 'Thiết kế đồ họa, Render 3D' : 'Văn phòng, đa nhiệm'} trong tầm giá ${budget} Triệu`;

    setMessages(prev => [...prev, { sender: 'user', text: userPrompt }]);

    try {
      const response = await fetch('/api/ai/consult-build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget, purpose, additionalReq: inputText }),
      });
      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply || 'Dưới đây là phương án cấu hình tối ưu nhất cho mức ngân sách của bạn:',
          recommendedProducts: data.recommendedProducts || products.slice(0, 3),
        },
      ]);
    } catch (e) {
      // Fallback local smart simulation
      const rec = products.filter(p => p.priceSale >= 5000000).slice(0, 3);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Với mức ngân sách ${budget} Triệu và mục đích ${purpose}, GearTech đề xuất bộ ba chủ lực: CPU hiệu năng đa nhân cao, GPU RTX thế hệ 40-series và nguồn đạt chuẩn Bronze/Gold để đảm bảo độ ổn định tối đa.`,
          recommendedProducts: rec,
        },
      ]);
    } finally {
      setIsThinking(false);
      setInputText('');
    }
  };

  const handleCustomSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setIsThinking(true);

    try {
      const response = await fetch('/api/ai/consult-build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget, purpose, additionalReq: text }),
      });
      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply,
          recommendedProducts: data.recommendedProducts,
        },
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Tôi đã ghi nhận yêu cầu "${text}". Để đạt hiệu năng cao nhất, bạn nên ưu tiên tối thiểu 32GB RAM DDR5 và card đồ họa từ RTX 4070 trở lên!`,
          recommendedProducts: products.slice(0, 2),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full h-[620px] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                AI Chuyên Gia Tư Vấn Phần Cứng PC
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Trực tuyến 24/7 • Phân tích tương thích tức thì
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Filter Bar */}
        <div className="p-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Ngân sách:</span>
            <select
              value={budget}
              onChange={e => setBudget(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none"
            >
              <option value="15-20">15 - 20 Triệu</option>
              <option value="25-35">25 - 35 Triệu (Phổ biến)</option>
              <option value="40-60">40 - 60 Triệu (Cao cấp)</option>
              <option value="80+">Trên 80 Triệu (Ultra High-End)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Nhu cầu:</span>
            <select
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none"
            >
              <option value="GAMING">Gaming Esport & AAA 4K</option>
              <option value="GRAPHICS">Đồ họa 3D / Render Premiere</option>
              <option value="OFFICE">Văn phòng / Lập trình</option>
            </select>
          </div>

          <button
            onClick={handleQuickRecommend}
            disabled={isThinking}
            className="ml-auto px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold transition-colors shadow flex items-center gap-1"
          >
            <Zap className="w-3 h-3" /> Gợi Ý Cấu Hình
          </button>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/40">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-rose-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>

                {/* Recommended products card list */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Linh kiện cấu hình gợi ý phù hợp:
                    </span>
                    {msg.recommendedProducts.map((p: any) => (
                      <div
                        key={p.id}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-[11px]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={p.thumbnailUrl}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover bg-slate-950 shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-semibold text-white truncate">{p.name}</p>
                            <span className="text-rose-400 font-bold">
                              {p.priceSale.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedProductId(p.id);
                              setCurrentView('product-detail');
                              onClose();
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px]"
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => {
                              addToCart(p, 1);
                              onClose();
                              setCurrentView('cart');
                            }}
                            className="p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
                            title="Thêm vào giỏ"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-2 items-center text-xs text-slate-400 pl-11">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>AI đang phân tích thông số tương thích và giá linh kiện...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleCustomSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Hỏi bất cứ điều gì (vd: 'i5 14600K đi với tản khí nào thì mát?')..."
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isThinking || !inputText.trim()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
