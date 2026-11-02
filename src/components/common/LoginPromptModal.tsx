import React from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, X, LogIn, ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';

export const LoginPromptModal: React.FC = () => {
  const {
    isLoginPromptOpen,
    setIsLoginPromptOpen,
    authPromptReason,
    handleLoginPromptResponse,
  } = useApp();

  if (!isLoginPromptOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-6">
        {/* Close button */}
        <button
          onClick={() => handleLoginPromptResponse('no_login')}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-colors"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 shrink-0">
            {authPromptReason === 'checkout' ? (
              <ShoppingBag className="w-6 h-6" />
            ) : authPromptReason === 'buy_now' ? (
              <Sparkles className="w-6 h-6" />
            ) : (
              <Lock className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Yêu Cầu Đăng Nhập</h3>
            <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Bắt buộc thanh toán với tài khoản
            </span>
          </div>
        </div>

        {/* Question Text */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-slate-200 text-sm font-bold text-center leading-relaxed">
          <p className="text-base text-white">Bạn có muốn đăng nhập không?</p>
          <p className="text-xs text-slate-400 font-normal mt-1.5">
            Đơn hàng cần được liên kết với tài khoản GearTech của bạn để bảo hành và tích điểm VIP.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            id="btn-prompt-no-login"
            onClick={() => handleLoginPromptResponse('no_login')}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs sm:text-sm transition-all border border-slate-700/80 text-center cursor-pointer"
          >
            Không đăng nhập
          </button>
          <button
            id="btn-prompt-login-now"
            onClick={() => handleLoginPromptResponse('login')}
            className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
