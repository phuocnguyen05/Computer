import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Toast } from './components/common/Toast';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './components/client/HomePage';
import { CatalogPage } from './components/client/CatalogPage';
import { ProductDetailPage } from './components/client/ProductDetailPage';
import { CartPage } from './components/client/CartPage';
import { CheckoutPage } from './components/client/CheckoutPage';
import { PcBuilderPage } from './components/client/PcBuilderPage';
import { ComparePage } from './components/client/ComparePage';
import { AccountPage } from './components/client/AccountPage';
import { WarrantyLookupPage } from './components/client/WarrantyLookupPage';
import { ServiceBookingPage } from './components/client/ServiceBookingPage';
import { AIConsultantModal } from './components/client/AIConsultantModal';
import { StoreChatModal } from './components/client/StoreChatModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { AuthGate } from './components/auth/AuthGate';
import { AuthModal } from './components/common/AuthModal';
import { LoginPromptModal } from './components/common/LoginPromptModal';
import { Bot, Sparkles, Headphones, ArrowUp, ChevronLeft, ChevronRight, Home, Grid, Cpu, ShoppingCart, User } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isLoggedIn,
    conversations,
    currentUser,
    canGoBack,
    canGoNext,
    goBack,
    goNext,
    setPendingGuestAction,
    setAuthPromptReason,
    setIsLoginPromptOpen,
    setIsAuthModalOpen,
    setAuthModalTab,
    requireAuth,
    showToast,
    cartCount,
    unreadNotificationCount,
    navigateToAccountTab,
  } = useApp();
  const [isAIConsultantOpen, setIsAIConsultantOpen] = useState(false);
  const [isStoreChatOpen, setIsStoreChatOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Auth Guard for protected views (service-booking, warranty-lookup)
  useEffect(() => {
    if (!isLoggedIn && (currentView === 'service-booking' || currentView === 'warranty-lookup')) {
      showToast('Tính năng này yêu cầu đăng nhập tài khoản', 'error');
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      setCurrentView('home');
    }
  }, [currentView, isLoggedIn]);

  // Check unread messages for the logged-in customer
  const customerId = currentUser ? String(currentUser.id) : 'guest-current';
  const customerConv = conversations.find(
    c => c.customerId === customerId || (currentUser?.phone && c.customerPhone === currentUser.phone)
  );
  const unreadForCustomer = customerConv?.unreadCountForCustomer || 0;

  // Listen to window scroll to show/hide back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  // Automatically scroll back to top whenever user changes views
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [currentView]);

  // If in Admin view, render dedicated full Admin Portal
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-rose-600 selection:text-white">
        <Toast />
        <AdminPortal />
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-600 selection:text-white font-sans">
      <Toast />
      <Header />

      {/* Main Client Content Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-8">
        {currentView === 'home' && (
          <HomePage onOpenAIConsultant={() => setIsAIConsultantOpen(true)} />
        )}
        {currentView === 'catalog' && <CatalogPage />}
        {currentView === 'product-detail' && <ProductDetailPage />}
        {currentView === 'cart' && <CartPage />}
        {currentView === 'checkout' && <CheckoutPage />}
        {currentView === 'pc-builder' && <PcBuilderPage />}
        {currentView === 'compare' && <ComparePage />}
        {(currentView === 'account' || currentView === 'wishlist' || currentView === 'profile' || currentView === 'orders') && <AccountPage />}
        {(currentView === 'warranty-check' || currentView === 'warranty-lookup' || currentView === 'warranty') && <WarrantyLookupPage />}
        {currentView === 'service-booking' && <ServiceBookingPage />}
      </main>

      <Footer />

      {/* Nút Trở Lại Đầu Trang (Căn giữa chính giữa màn hình theo chiều ngang) */}
      {showBackToTop && (
        <button
          id="btn-back-to-top"
          onClick={scrollToTop}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 hover:bg-rose-600 text-slate-200 hover:text-white rounded-full shadow-2xl border border-slate-700/80 hover:border-rose-500 transition-all duration-300 hover:scale-105 group flex items-center gap-2 text-xs font-bold backdrop-blur-md cursor-pointer animate-fade-in"
          title="Trở lại đầu trang"
          aria-label="Trở lại đầu trang"
        >
          <div className="w-5 h-5 rounded-full bg-rose-500/20 group-hover:bg-white/20 flex items-center justify-center transition-colors">
            <ArrowUp className="w-3.5 h-3.5 text-rose-400 group-hover:text-white transition-transform group-hover:-translate-y-0.5" />
          </div>
          <span>Lên đầu trang</span>
        </button>
      )}

      {/* Floating Action Buttons (Góc dưới cùng bên phải: Chat với cửa hàng ở dưới, AI ở ngay trên) */}
      <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 flex flex-col items-end gap-2.5">

        {/* Nút AI Tư Vấn Cấu Hình (ở ngay trên mục chat với cửa hàng) */}
        <button
          id="btn-floating-ai-consultant"
          onClick={() => setIsAIConsultantOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-2xl shadow-xl shadow-purple-600/30 font-bold text-xs flex items-center gap-2.5 transition-all hover:scale-105 group border border-white/20 shrink-0"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
          </div>
          <span className="hidden sm:inline">AI Tư Vấn Cấu Hình</span>
          <span className="sm:hidden">AI Tư Vấn</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        </button>

        {/* Nút Chat Với Cửa Hàng (ở góc dưới cùng bên phải màn hình) */}
        <button
          id="btn-floating-store-chat"
          onClick={() => {
            requireAuth(() => {
              setIsStoreChatOpen(true);
            }, 'chat');
          }}
          className="relative px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl shadow-2xl shadow-emerald-600/40 font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all hover:scale-105 group border border-emerald-400/30 shrink-0"
        >
          <div className="relative w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <Headphones className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 border-2 border-slate-900 rounded-full" />
          </div>
          <span>Chat Với Cửa Hàng</span>
          {unreadForCustomer > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-bounce shadow-md">
              {unreadForCustomer}
            </span>
          )}
        </button>
      </div>

      {/* Smart Hardware Consultant Dialog */}
      <AIConsultantModal
        isOpen={isAIConsultantOpen}
        onClose={() => setIsAIConsultantOpen(false)}
      />

      {/* Live Store Customer Support Chat Dialog */}
      <StoreChatModal
        isOpen={isStoreChatOpen}
        onClose={() => setIsStoreChatOpen(false)}
        onOpenAIConsultant={() => setIsAIConsultantOpen(true)}
      />
      {/* Global Authentication & Prompt Modals */}
      <AuthModal />
      <LoginPromptModal />

      {/* Mobile Bottom Navigation Bar (iOS / Android Native App Experience) */}
      <nav aria-label="Điều hướng di động" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/98 backdrop-blur-xl border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            currentView === 'home' ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Trang Chủ</span>
        </button>

        <button
          onClick={() => setCurrentView('catalog')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            currentView === 'catalog' ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px]">Danh Mục</span>
        </button>

        <button
          onClick={() => setCurrentView('pc-builder')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            currentView === 'pc-builder' ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-5 h-5" />
          <span className="text-[10px]">Build PC</span>
        </button>

        <button
          onClick={() => setCurrentView('cart')}
          className={`relative flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            currentView === 'cart' ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Giỏ Hàng</span>
        </button>

        <button
          onClick={() => {
            if (isLoggedIn) {
              navigateToAccountTab('orders');
            } else {
              setAuthModalTab('login');
              setIsAuthModalOpen(true);
            }
          }}
          className={`relative flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            currentView === 'account' || currentView === 'orders' ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-[10px]">Tài Khoản</span>
        </button>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
