import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Headphones,
  PhoneCall,
  Clock,
  CheckCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Message {
  id: string;
  sender: 'store' | 'user';
  text: string;
  time: string;
}

interface StoreChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAIConsultant?: () => void;
}

export const StoreChatModal: React.FC<StoreChatModalProps> = ({
  isOpen,
  onClose,
  onOpenAIConsultant,
}) => {
  const {
    currentUser,
    conversations,
    customerSendMessage,
    markConversationAsReadByCustomer,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find or determine customer's active conversation
  const customerId = currentUser ? String(currentUser.id) : 'guest-current';
  const customerConv = conversations.find(
    c => c.customerId === customerId || (currentUser?.phone && c.customerPhone === currentUser.phone)
  );

  // When opened, mark conversation as read for customer
  useEffect(() => {
    if (isOpen && customerConv) {
      markConversationAsReadByCustomer(customerConv.id);
    }
  }, [isOpen, customerConv?.id, customerConv?.messages.length]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [customerConv?.messages, isOpen, isTyping]);

  const quickQuestions = [
    'Tư vấn PC Gaming theo ngân sách',
    'Chính sách bảo hành & đổi trả',
    'Kiểm tra tình trạng giao hàng 2H',
    'Đặt lịch vệ sinh PC miễn phí',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    customerSendMessage(text, {
      name: currentUser?.fullName,
      phone: currentUser?.phone,
      email: currentUser?.email,
    });

    if (!textToSend) setInputText('');

    // Optional subtle simulated acknowledgment if it's the very first guest message
    if (!customerConv || customerConv.messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 800);
    }
  };

  if (!isOpen) return null;

  // Active messages to display
  const displayMessages = customerConv ? customerConv.messages : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 pointer-events-none">
      <div
        id="store-chat-container"
        className="w-full sm:w-[410px] h-[580px] max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 ring-1 ring-white/10 font-sans"
      >
        {/* Chat Window Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">CSKH GearTech 24/7</h3>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-400" />
                Phản hồi trong 1 phút • Hotline 1800 6868
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="btn-close-store-chat"
              onClick={onClose}
              title="Đóng chat"
              className="p-2 text-slate-400 hover:text-white hover:bg-rose-600/20 hover:text-rose-400 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Shortcut Banner */}
        <div className="px-4 py-2 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border-b border-purple-900/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-[11px] font-medium">Cần tạo cấu hình tự động?</span>
          </div>
          {onOpenAIConsultant && (
            <button
              id="btn-switch-to-ai-from-chat"
              onClick={() => {
                onClose();
                onOpenAIConsultant();
              }}
              className="text-[11px] font-bold text-rose-400 hover:text-rose-300 underline underline-offset-2 flex items-center gap-1"
            >
              Mở AI Tư Vấn →
            </button>
          )}
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-slate-950/50">
          {/* Trust notification */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Bảo mật thông tin khách hàng & hỗ trợ kỹ thuật tận tâm
            </div>
          </div>

          {displayMessages.length === 0 ? (
            <div className="flex flex-col items-start space-y-1">
              <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-xs shadow-md">
                Xin chào <strong className="text-white">{currentUser?.fullName || 'Quý khách'}</strong>! Cảm ơn bạn đã ghé thăm GearTech. Đội ngũ nhân viên và kỹ thuật viên chúng tôi luôn sẵn sàng hỗ trợ bạn. Bạn cần tư vấn sản phẩm, báo giá, hoặc kiểm tra đơn hàng nào hôm nay ạ?
              </div>
              <span className="text-[10px] text-slate-500 px-1">Vừa xong</span>
            </div>
          ) : (
            displayMessages.map(msg => {
              const isCustomer = msg.sender === 'CUSTOMER';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                >
                  {!isCustomer && (
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[11px] font-bold text-slate-300">
                        {msg.senderName || 'CSKH GearTech'}
                      </span>
                      {msg.senderRole && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-950/70 border border-emerald-700/50 text-emerald-400 font-semibold">
                          {msg.senderRole === 'ADMIN' ? 'Admin' : 'Nhân Viên'}
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isCustomer
                        ? 'bg-rose-600 text-white rounded-br-xs shadow-md shadow-rose-600/20'
                        : 'bg-slate-800/95 text-slate-100 border border-slate-700/80 rounded-bl-xs shadow-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isCustomer && <CheckCheck className="w-3 h-3 text-rose-400" />}
                  </div>
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-2 rounded-2xl w-fit border border-slate-700/50">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-[11px] text-slate-400">Chuyên viên đang nhập phản hồi...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="p-2.5 bg-slate-900 border-t border-slate-800">
          <p className="text-[10px] font-semibold text-slate-400 mb-1.5 px-1 uppercase tracking-wider">
            Câu hỏi nhanh thường gặp:
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                id={`btn-quick-q-${idx}`}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-left whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <a
            href="tel:18006868"
            title="Gọi Hotline 1800 6868"
            className="p-2.5 bg-slate-800 hover:bg-emerald-600/20 text-slate-400 hover:text-emerald-400 border border-slate-700 rounded-xl transition-colors shrink-0"
          >
            <PhoneCall className="w-4 h-4" />
          </a>

          <input
            id="input-store-chat"
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Nhập nội dung cần hỗ trợ..."
            className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
          />

          <button
            id="btn-send-store-chat"
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-xl transition-all shadow-md shadow-emerald-600/30 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
