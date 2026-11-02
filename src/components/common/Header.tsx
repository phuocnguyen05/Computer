import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ShieldCheck,
  Search,
  ShoppingCart,
  User,
  Flame,
  Wrench,
  ChevronDown,
  Layers,
  Heart,
  Scale,
  Menu,
  X,
  Cpu,
  Monitor,
  Laptop,
  Tv,
  Keyboard,
  Headphones,
  Settings,
  LogIn,
  LogOut,
  UserPlus,
  ShieldAlert,
  Truck,
  CreditCard,
  Award,
  ChevronLeft,
  ChevronRight,
  Bell,
  PackageCheck,
  CheckCheck,
  Trash2,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'pc-gaming': Monitor,
  'laptop': Laptop,
  'linh-kien-pc': Cpu,
  'man-hinh': Tv,
  'ban-phim-chuot': Keyboard,
  'tai-nghe-loa': Headphones,
};

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    canGoBack,
    canGoNext,
    goBack,
    goNext,
    navigateToAccountTab,
    setSelectedProductId,
    setSelectedCategoryId,
    searchQuery,
    setSearchQuery,
    cartCount,
    cartTotal,
    wishlist,
    compareList,
    currentUser,
    isLoggedIn,
    setIsAuthModalOpen,
    setAuthModalTab,
    logout,
    switchRole,
    categories,
    products,
    requireAuth,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useApp();

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeParentCatId, setActiveParentCatId] = useState<number | null>(1);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationTabFilter, setNotificationTabFilter] = useState<string>('all');
  const notificationRef = useRef<HTMLDivElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchCatFilter, setSearchCatFilter] = useState<string>('all');
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 220;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Search filtered suggestions
  const searchResults = searchQuery.trim()
    ? products
        .filter(p => {
          const matchesCat = (() => {
            if (searchCatFilter === 'all') return true;
            const filterId = Number(searchCatFilter);
            if (p.categoryId === filterId) return true;
            const parentCat = categories.find(c => c.id === filterId);
            if (parentCat && parentCat.children) {
              return parentCat.children.some(c => c.id === p.categoryId);
            }
            return false;
          })();
          const matchesText =
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesCat && matchesText;
        })
        .slice(0, 6)
    : [];

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCategory = categories.find(c => c.id === activeParentCatId) || categories[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100 font-sans shadow-lg">
      {/* 1. TOP ANNOUNCEMENT & UTILITIES BAR */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 whitespace-nowrap overflow-x-auto scrollbar-none">
          {/* Left contact info */}
          <div className="flex items-center gap-4 shrink-0">
            <span className="flex items-center gap-1.5 text-rose-400 font-semibold shrink-0">
              <Phone className="w-3.5 h-3.5 animate-pulse" /> Hotline: 1800 6868 (Miễn phí 24/7)
            </span>
            <span className="hidden sm:flex items-center gap-1.5 hover:text-slate-200 cursor-pointer shrink-0">
              <Mail className="w-3.5 h-3.5 text-cyan-400" /> support@geartech.vn
            </span>
            <button
              id="header-btn-showrooms"
              onClick={() => setCurrentView('service-booking')}
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Hệ thống 3 Showroom
            </button>
            <button
              id="header-btn-free-cleaning"
              onClick={() => requireAuth(() => setCurrentView('service-booking'), 'generic')}
              className="hidden lg:flex items-center gap-1 bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 px-2 py-0.5 rounded-full hover:bg-cyan-900 transition-colors shrink-0"
            >
              <Sparkles className="w-3 h-3" /> Vệ sinh PC/Laptop Miễn Phí
            </button>
          </div>

          {/* Right quick tools, 3 accounts switcher & auth */}
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            {isLoggedIn && (
              <button
                id="header-btn-warranty-lookup"
                onClick={() => setCurrentView('warranty-lookup')}
                className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 font-medium transition-colors shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Tra cứu bảo hành
              </button>
            )}

            <span className="text-slate-700 hidden sm:inline shrink-0">|</span>

            {/* Authenticated User Status or Guest Indicator on Top Bar */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-400 hidden xl:inline">Xin chào,</span>
                <button
                  id="topbar-btn-profile"
                  onClick={() => navigateToAccountTab('profile')}
                  className="text-xs font-bold text-white max-w-[140px] truncate hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                  title="Bấm để xem hồ sơ cá nhân"
                >
                  {currentUser.fullName}
                </button>
                <button
                  id="topbar-btn-loyalty"
                  onClick={() => navigateToAccountTab('loyalty')}
                  className="text-[10px] text-amber-400 font-bold hover:underline hidden xl:inline cursor-pointer shrink-0"
                  title="Bấm để xem điểm tích lũy & đặc quyền VIP"
                >
                  ({currentUser.points} điểm)
                </button>
                <button
                  onClick={() => navigateToAccountTab('profile')}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider cursor-pointer shrink-0 ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : currentUser.role === 'STAFF'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                  title="Vai trò tài khoản - Xem hồ sơ"
                >
                  {currentUser.role}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Chế độ: <strong className="text-amber-400 font-semibold">Khách Vãng Lai</strong>
                </span>
                <button
                  id="topbar-btn-login-prompt"
                  onClick={() => {
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="text-[11px] font-bold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                >
                  (Đăng Nhập)
                </button>
              </div>
            )}

            {/* Portal Switcher Button & Logout Button (Only when logged in) */}
            {isLoggedIn && (
              <>
                {currentView === 'admin' ? (
                  <button
                    id="header-btn-switch-client"
                    onClick={() => setCurrentView('home')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-0.5 rounded-lg text-xs transition-colors shadow flex items-center gap-1 shrink-0"
                  >
                    <Monitor className="w-3 h-3" /> Về Website Mua Hàng
                  </button>
                ) : (
                  (currentUser.role === 'ADMIN' || currentUser.role === 'STAFF') && (
                    <button
                      id="header-btn-switch-admin"
                      onClick={() => setCurrentView('admin')}
                      className="bg-rose-700 hover:bg-rose-600 text-white font-bold px-2.5 py-0.5 rounded-lg text-xs transition-colors shadow flex items-center gap-1 shrink-0"
                    >
                      <Settings className="w-3 h-3" /> Admin
                    </button>
                  )
                )}

                {/* Quick Logout Button */}
                <button
                  id="top-btn-logout"
                  onClick={logout}
                  className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors ml-1 px-2 py-0.5 rounded-lg hover:bg-rose-950/40 shrink-0"
                  title="Đăng xuất khỏi hệ thống"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng Xuất</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-3 lg:gap-5">
          {/* Logo & Back/Next Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="header-btn-logo"
              onClick={() => {
                setSelectedCategoryId(null);
                setCurrentView('home');
              }}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-rose-400 transition-colors">
                    GEAR<span className="text-rose-500">TECH</span>
                  </span>
                  <span className="hidden sm:inline-block bg-rose-500/20 text-rose-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-500/30">
                    PC & GEAR
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 hidden xl:block tracking-wide">
                  Chuyên Nghiệp • Chính Hãng 100%
                </p>
              </div>
            </button>

            {/* Back & Next Page Navigation Tool Controls (Sát bên cạnh Logo GEARTECH) */}
            <div className="hidden md:flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-xl p-0.5 shrink-0">
              <button
                id="header-btn-nav-back"
                onClick={goBack}
                disabled={!canGoBack}
                className={`px-2 py-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
                  canGoBack
                    ? 'text-slate-100 hover:text-white bg-slate-800 hover:bg-rose-600 active:scale-95 cursor-pointer shadow-sm'
                    : 'text-slate-600 bg-slate-950/40 cursor-not-allowed opacity-40'
                }`}
                title={canGoBack ? 'Quay lại tab/trang vừa xem' : 'Không có trang trước'}
                aria-label="Quay lại 1 tab/trang trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Back</span>
              </button>

              <button
                id="header-btn-nav-next"
                onClick={goNext}
                disabled={!canGoNext}
                className={`px-2 py-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
                  canGoNext
                    ? 'text-slate-100 hover:text-white bg-slate-800 hover:bg-rose-600 active:scale-95 cursor-pointer shadow-sm'
                    : 'text-slate-600 bg-slate-950/40 cursor-not-allowed opacity-40'
                }`}
                title={canGoNext ? 'Tiến tới tab/trang kế tiếp' : 'Không có trang kế tiếp'}
                aria-label="Chuyển tiếp 1 tab/trang sau"
              >
                <span className="hidden lg:inline text-[11px]">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Center: Search Box Bar (Integrated in main header row) */}
          <div className="hidden md:flex flex-1 max-w-xl xl:max-w-2xl relative" ref={searchRef}>
            <div className="relative w-full flex items-center bg-slate-900 border border-slate-700/80 focus-within:border-rose-500 rounded-xl shadow-inner transition-all group">
              {/* Search Icon */}
              <div className="pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-500 transition-colors">
                <Search className="w-4 h-4" />
              </div>

              {/* Input field */}
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setCurrentView('catalog');
                    setSearchFocused(false);
                  }
                }}
                placeholder="Tìm kiếm CPU, VGA RTX 4090, PC Gaming, Laptop ROG, Màn hình 240Hz..."
                className="w-full bg-transparent pl-2.5 pr-20 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
              />

              {/* Clear button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-16 p-1 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Xóa từ khóa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Submit search button */}
              <button
                id="header-btn-submit-search"
                onClick={() => {
                  setCurrentView('catalog');
                  setSearchFocused(false);
                }}
                className="absolute right-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1"
              >
                <span>Tìm</span>
              </button>
            </div>

            {/* Realtime Search Auto-Suggest Box */}
            {searchFocused && searchQuery.trim().length > 0 && (
              <div
                id="header-search-suggestions"
                className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
              >
                <div className="p-3 border-b border-slate-800 text-xs text-slate-400 flex justify-between items-center bg-slate-950/70">
                  <span>Kết quả cho: <strong className="text-white">"{searchQuery}"</strong></span>
                  <button
                    onClick={() => {
                      setCurrentView('catalog');
                      setSearchFocused(false);
                    }}
                    className="text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Xem tất cả ({searchResults.length}) &rarr;
                  </button>
                </div>
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
                    {searchResults.map(p => (
                      <div
                        key={p.id}
                        id={`search-item-${p.id}`}
                        onClick={() => {
                          setSelectedProductId(p.id);
                          setCurrentView('product-detail');
                          setSearchFocused(false);
                        }}
                        className="flex items-center gap-3 p-2.5 hover:bg-slate-800/80 cursor-pointer transition-colors"
                      >
                        <img src={p.thumbnailUrl || p.images?.[0] || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500'} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-slate-800 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-white truncate hover:text-rose-400">{p.name}</h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-extrabold text-rose-400">{p.priceSale.toLocaleString('vi-VN')}đ</span>
                            <span className="text-[10px] text-emerald-400 ml-auto font-medium">
                              {p.stock > 0 ? `Còn ${p.stock}` : 'Hết hàng'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Không tìm thấy sản phẩm nào khớp với từ khóa "{searchQuery}".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Navigation Buttons (All h-10 uniform height) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Compare Tool */}
            <button
              id="header-btn-compare"
              onClick={() => setCurrentView('compare')}
              className="hidden md:flex relative h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              title="So sánh sản phẩm"
            >
              <Scale className="w-4 h-4" />
              {compareList.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Wishlist (Only when logged in) */}
            {isLoggedIn && (
              <button
                id="header-btn-wishlist"
                onClick={() => {
                  navigateToAccountTab('wishlist');
                }}
                className="hidden md:flex relative h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
                title="Sản phẩm yêu thích (Bấm chuyển sang mục Yêu Thích)"
              >
                <Heart className="w-4 h-4" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>
            )}

            {/* Notification Bell Button & Center Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                id="header-btn-notifications"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                title="Trung tâm thông báo tài khoản"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Notification Center Dropdown / Modal */}
              {isNotificationOpen && (
                <div
                  id="header-notification-dropdown"
                  className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-20 sm:top-full sm:mt-2 w-auto sm:w-96 max-w-md mx-auto sm:mx-0 bg-slate-900 border border-slate-700 sm:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl"
                >
                  <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-rose-500" />
                      <h4 className="text-xs sm:text-sm font-bold text-white">Thông Báo Của Bạn</h4>
                      {unreadNotificationCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-extrabold">
                          {unreadNotificationCount} chưa đọc
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors text-[11px]"
                        title="Đánh dấu tất cả đã đọc"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsNotificationOpen(false)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1 px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 text-[11px] overflow-x-auto scrollbar-none">
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'ORDER', label: 'Đơn hàng' },
                      { id: 'WARRANTY', label: 'Bảo hành' },
                      { id: 'SECURITY', label: 'Bảo mật' },
                      { id: 'PROMO', label: 'Ưu đãi' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setNotificationTabFilter(tab.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 ${
                          notificationTabFilter === tab.id
                            ? 'bg-rose-600 text-white shadow'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.filter(n => notificationTabFilter === 'all' || n.type === notificationTabFilter).length > 0 ? (
                      notifications
                        .filter(n => notificationTabFilter === 'all' || n.type === notificationTabFilter)
                        .map(n => (
                          <div
                            key={n.id}
                            className={`p-3 hover:bg-slate-800/60 transition-colors relative group ${
                              !n.isRead ? 'bg-rose-950/15' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                n.type === 'ORDER' ? 'bg-cyan-950 text-cyan-400' :
                                n.type === 'WARRANTY' ? 'bg-emerald-950 text-emerald-400' :
                                n.type === 'SECURITY' ? 'bg-amber-950 text-amber-400' :
                                'bg-rose-950 text-rose-400'
                              }`}>
                                {n.type === 'ORDER' ? <PackageCheck className="w-4 h-4" /> :
                                 n.type === 'WARRANTY' ? <ShieldCheck className="w-4 h-4" /> :
                                 n.type === 'SECURITY' ? <ShieldAlert className="w-4 h-4" /> :
                                 <Sparkles className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h6 className={`text-xs font-bold truncate ${!n.isRead ? 'text-white' : 'text-slate-300'}`}>
                                    {n.title}
                                  </h6>
                                  <span className="text-[10px] text-slate-500 shrink-0">
                                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                  {n.message}
                                </p>
                                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/40">
                                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                                    {n.type === 'ORDER' ? 'Đơn hàng' : n.type === 'WARRANTY' ? 'Bảo hành' : n.type === 'SECURITY' ? 'Bảo mật' : 'Hệ thống'}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {!n.isRead && (
                                      <button
                                        onClick={() => markNotificationAsRead(n.id)}
                                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                                      >
                                        Đã đọc
                                      </button>
                                    )}
                                    {n.linkView && (
                                      <button
                                        onClick={() => {
                                          if (n.linkView === 'orders') {
                                            navigateToAccountTab('orders');
                                          } else if (n.linkView === 'warranty-lookup') {
                                            setCurrentView('warranty-lookup');
                                          } else {
                                            setCurrentView(n.linkView as any);
                                          }
                                          setIsNotificationOpen(false);
                                        }}
                                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold"
                                      >
                                        Xem chi tiết &rarr;
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteNotification(n.id)}
                                      className="text-slate-500 hover:text-rose-400 p-1 rounded"
                                      title="Xóa thông báo"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400">
                        Không có thông báo nào trong mục này.
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-center">
                    {isLoggedIn ? (
                      <button
                        onClick={() => {
                          navigateToAccountTab('orders');
                          setIsNotificationOpen(false);
                        }}
                        className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        Quản lý đơn hàng & Tài khoản của bạn &rarr;
                      </button>
                    ) : (
                      <div className="flex items-center justify-between gap-2 py-1 px-2">
                        <span className="text-[11px] text-slate-400 text-left">
                          Đăng nhập để xem đơn hàng & ưu đãi cá nhân
                        </span>
                        <button
                          onClick={() => {
                            setAuthModalTab('login');
                            setIsAuthModalOpen(true);
                            setIsNotificationOpen(false);
                          }}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow shrink-0"
                        >
                          Đăng Nhập
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              id="header-btn-cart"
              onClick={() => setCurrentView('cart')}
              className="relative h-10 flex items-center gap-2 px-2.5 sm:px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/30 shrink-0 whitespace-nowrap"
            >
              <div className="relative flex items-center">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-rose-600 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[9px] text-rose-100 font-normal">Giỏ hàng</span>
                <span className="text-xs font-bold leading-none">{cartTotal.toLocaleString('vi-VN')}đ</span>
              </div>
            </button>

            {/* User Account Menu / Login Button */}
            {!isLoggedIn ? (
              <button
                id="header-btn-login-trigger"
                onClick={() => {
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="h-10 flex items-center gap-2 px-3.5 rounded-xl bg-slate-900 border border-rose-500/40 hover:border-rose-500 text-rose-400 hover:text-white hover:bg-rose-600 transition-all font-bold text-xs shadow-md shadow-rose-600/10 shrink-0 whitespace-nowrap"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng Nhập / Đăng Ký</span>
                <span className="sm:hidden">Đăng nhập</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  id="header-btn-account-menu"
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className={`h-10 flex items-center gap-2 px-2.5 sm:px-3 rounded-xl bg-slate-900 border transition-all shrink-0 whitespace-nowrap ${
                    currentUser.role === 'ADMIN'
                      ? 'border-rose-500/50 hover:border-rose-400'
                      : currentUser.role === 'STAFF'
                      ? 'border-amber-500/50 hover:border-amber-400'
                      : 'border-emerald-500/50 hover:border-emerald-400'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ring-2 shrink-0 ${
                      currentUser.role === 'ADMIN'
                        ? 'bg-rose-950 text-rose-300 ring-rose-500'
                        : currentUser.role === 'STAFF'
                        ? 'bg-amber-950 text-amber-300 ring-amber-500'
                        : 'bg-emerald-950 text-emerald-300 ring-emerald-500'
                    }`}
                  >
                    {currentUser.fullName.slice(0, 1)}
                  </div>
                  <div className="hidden md:block text-left leading-tight">
                    <span className="block text-xs font-semibold truncate max-w-[100px] text-slate-100">
                      {currentUser.fullName}
                    </span>
                    <span
                      className={`block text-[9px] font-bold uppercase tracking-wider ${
                        currentUser.role === 'ADMIN'
                          ? 'text-rose-400'
                          : currentUser.role === 'STAFF'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {currentUser.role} • {currentUser.points} điểm
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block shrink-0" />
                </button>

                {/* Account Dropdown */}
                {isAccountMenuOpen && (
                  <div
                    id="header-account-dropdown"
                    className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 divide-y divide-slate-800/80"
                    onMouseLeave={() => setIsAccountMenuOpen(false)}
                  >
                    {/* User profile summary */}
                    <div className="p-2.5">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => {
                            navigateToAccountTab('profile');
                            setIsAccountMenuOpen(false);
                          }}
                          className="text-xs font-bold text-white hover:text-rose-400 transition-colors text-left"
                          title="Bấm chuyển thẳng sang Hồ sơ"
                        >
                          {currentUser.fullName}
                        </button>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            currentUser.role === 'ADMIN'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : currentUser.role === 'STAFF'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          Vai trò: {currentUser.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{currentUser.email}</p>
                      <button
                        onClick={() => {
                          navigateToAccountTab('loyalty');
                          setIsAccountMenuOpen(false);
                        }}
                        className="text-[10px] text-amber-400 mt-1 hover:underline block text-left"
                        title="Bấm chuyển sang mục Điểm thưởng & VIP"
                      >
                        Điểm tích lũy: <strong>{currentUser.points} GT-Points</strong> (Xem VIP)
                      </button>
                    </div>

                    {/* Navigation items */}
                    <div className="py-1">
                      <button
                        id="account-menu-profile"
                        onClick={() => {
                          navigateToAccountTab('profile');
                          setIsAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Hồ sơ cá nhân & Mật khẩu</span>
                      </button>
                      <button
                        id="account-menu-orders"
                        onClick={() => {
                          navigateToAccountTab('orders');
                          setIsAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                        <span>Lịch sử đơn hàng</span>
                      </button>
                      <button
                        id="account-menu-wishlist"
                        onClick={() => {
                          navigateToAccountTab('wishlist');
                          setIsAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Heart className="w-3.5 h-3.5 text-rose-400" />
                          <span>Danh sách yêu thích</span>
                        </div>
                        {wishlist.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-600/20 text-rose-400 text-[10px] font-bold">
                            {wishlist.length}
                          </span>
                        )}
                      </button>
                      <button
                        id="account-menu-addresses"
                        onClick={() => {
                          navigateToAccountTab('addresses');
                          setIsAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sổ địa chỉ nhận hàng</span>
                      </button>
                      <button
                        id="account-menu-loyalty"
                        onClick={() => {
                          navigateToAccountTab('loyalty');
                          setIsAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>Điểm tích lũy & Ưu đãi VIP</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-400">
                          {currentUser.points} điểm
                        </span>
                      </button>
                      <button
                        id="account-menu-warranty"
                        onClick={() => {
                          setCurrentView('warranty-lookup');
                          setIsAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tra cứu hạn bảo hành máy tính</span>
                      </button>
                    </div>

                    {/* Admin portal shortcut for staff/admin */}
                    {(currentUser.role === 'ADMIN' || currentUser.role === 'STAFF') && (
                      <div className="py-1">
                        <button
                          id="account-menu-admin-link"
                          onClick={() => {
                            setCurrentView('admin');
                            setIsAccountMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Vào Cổng Quản Trị ({currentUser.role})</span>
                        </button>
                      </div>
                    )}

                    {/* Logout button */}
                    <div className="pt-1">
                      <button
                        id="account-menu-logout"
                        onClick={() => {
                          logout();
                          setIsAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng Xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              id="header-btn-mobile-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. CATEGORY & NAVIGATION BAR (Sub-header) */}
      <div className="border-t border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-4 py-1.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Mega Menu Toggle Button */}
          <div className="relative shrink-0" ref={megaMenuRef}>
            <button
              id="header-btn-megamenu-toggle"
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className={`flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-bold border transition-all ${
                isMegaMenuOpen
                  ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-600/25'
                  : 'bg-slate-950/70 border-slate-700/80 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              <span>Danh Mục Sản Phẩm</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mega Menu Dropdown */}
            {isMegaMenuOpen && (
              <div
                id="mega-menu-dropdown"
                className="absolute left-0 top-full mt-2 w-[95vw] sm:w-[720px] max-w-[95vw] bg-slate-900/98 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col sm:flex-row max-h-[75vh] sm:max-h-[480px]"
              >
                {/* Left parent list */}
                <div className="w-full sm:w-64 bg-slate-950/80 sm:border-r border-b sm:border-b-0 border-slate-800 p-2 space-y-1 shrink-0 overflow-y-auto max-h-48 sm:max-h-none">
                  {categories.map(cat => {
                    const IconComp = CATEGORY_ICONS[cat.slug] || Cpu;
                    const isActive = activeParentCatId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        id={`megamenu-cat-${cat.id}`}
                        onMouseEnter={() => setActiveParentCatId(cat.id)}
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategoryId(cat.id);
                          setCurrentView('catalog');
                          setIsMegaMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-rose-400'}`} />
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-400" />
                      </button>
                    );
                  })}
                </div>

                {/* Right subcategories & brands */}
                <div className="flex-1 p-5 bg-slate-900/90 overflow-y-auto max-h-[480px]">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                    <div>
                      <h4 className="font-bold text-white text-sm">{activeCategory.name}</h4>
                      <p className="text-xs text-slate-400">{activeCategory.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategoryId(activeCategory.id);
                        setCurrentView('catalog');
                        setIsMegaMenuOpen(false);
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                    >
                      Xem tất cả &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {activeCategory.children && activeCategory.children.length > 0 ? (
                      activeCategory.children.map(sub => (
                        <button
                          key={sub.id}
                          id={`megamenu-subcat-${sub.id}`}
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategoryId(sub.id);
                            setCurrentView('catalog');
                            setIsMegaMenuOpen(false);
                          }}
                          className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-left transition-all group"
                        >
                          <span className="text-xs font-medium text-slate-200 group-hover:text-rose-400 transition-colors block">
                            {sub.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Sẵn hàng chính hãng, bảo hành 36T
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 col-span-2">Đang cập nhật danh mục con...</p>
                    )}
                  </div>

                  {/* Featured Brands under category */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Thương hiệu đối tác hàng đầu
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {['ASUS ROG', 'MSI', 'Gigabyte', 'Corsair', 'Kingston', 'Intel', 'AMD'].map(b => (
                        <button
                          key={b}
                          onClick={() => {
                            setSelectedCategoryId(null);
                            setSearchQuery(b);
                            setCurrentView('catalog');
                            setIsMegaMenuOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] border border-slate-700/60 transition-colors"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center Category Shortcut Links with Slide Buttons & Visible Scrollbar */}
          <div className="hidden md:flex items-center gap-1 flex-1 min-w-0 px-1 relative group">
            <button
              type="button"
              onClick={() => scrollCategories('left')}
              className="absolute left-0 z-10 p-1.5 bg-slate-900/95 hover:bg-rose-600 text-slate-300 hover:text-white rounded-full shadow-lg border border-slate-700 transition-all hidden group-hover:flex items-center justify-center -ml-2.5 cursor-pointer"
              title="Cuộn sang trái"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div
              ref={categoryScrollRef}
              className="flex items-center gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 py-1 text-xs font-semibold w-full scroll-smooth"
            >
              {categories.map(cat => {
                const IconComp = CATEGORY_ICONS[cat.slug] || Cpu;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategoryId(cat.id);
                      setCurrentView('catalog');
                    }}
                    className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0"
                  >
                    <IconComp className="w-3.5 h-3.5 text-rose-400" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
              <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />
              {isLoggedIn && (
                <button
                  onClick={() => setCurrentView('warranty-lookup')}
                  className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tra Cứu Bảo Hành</span>
                </button>
              )}
              <button
                onClick={() => requireAuth(() => setCurrentView('service-booking'), 'generic')}
                className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Vệ Sinh PC</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => scrollCategories('right')}
              className="absolute right-0 z-10 p-1.5 bg-slate-900/95 hover:bg-rose-600 text-slate-300 hover:text-white rounded-full shadow-lg border border-slate-700 transition-all hidden group-hover:flex items-center justify-center -mr-2.5 cursor-pointer"
              title="Cuộn sang phải"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right perks */}
          <div className="hidden xl:flex items-center gap-3 text-xs font-semibold text-slate-300 whitespace-nowrap shrink-0 ml-auto">
            <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              <Truck className="w-3.5 h-3.5 text-rose-400" /> Giao 2H
            </span>
            <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Chính Hãng
            </span>
            <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" /> Trả Góp 0%
            </span>
          </div>
        </div>
      </div>

      {/* 4. MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-3">
          {/* Quick User Actions */}
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800">
            {isLoggedIn && (
              <button
                onClick={() => {
                  navigateToAccountTab('wishlist');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-left text-xs font-bold text-rose-300 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> Yêu Thích
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px]">
                  {wishlist.length}
                </span>
              </button>
            )}
            <button
              onClick={() => {
                navigateToAccountTab('profile');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-800 text-left text-xs font-semibold text-slate-200 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-slate-400" /> Hồ Sơ Cá Nhân
            </button>
            <button
              onClick={() => {
                navigateToAccountTab('orders');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-800 text-left text-xs font-semibold text-slate-200 flex items-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-slate-400" /> Đơn Hàng Của Tôi
            </button>
            <button
              onClick={() => {
                navigateToAccountTab('loyalty');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/30 text-left text-xs font-semibold text-amber-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Điểm VIP
              </span>
              <span className="text-[10px] font-bold text-amber-400">{currentUser.points}đ</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setCurrentView('catalog');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-800 text-left text-xs font-semibold text-slate-200"
            >
              Tất Cả Sản Phẩm
            </button>
            <button
              onClick={() => {
                setCurrentView('pc-builder');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-800 text-left text-xs font-semibold text-cyan-300"
            >
              Xây Dựng Cấu Hình PC
            </button>
            {isLoggedIn && (
              <button
                onClick={() => {
                  setCurrentView('warranty-lookup');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-slate-800 text-left text-xs font-semibold text-emerald-300"
              >
                Tra Cứu Bảo Hành
              </button>
            )}
            <button
              onClick={() => {
                requireAuth(() => {
                  setCurrentView('service-booking');
                  setIsMobileMenuOpen(false);
                }, 'generic');
              }}
              className="p-2.5 rounded-xl bg-slate-800 text-left text-xs font-semibold text-amber-300"
            >
              Vệ Sinh Máy Miễn Phí
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400 block mb-2 font-bold uppercase">Danh mục sản phẩm</span>
            <div className="space-y-1.5">
              {categories.map(cat => (
                <div key={cat.id} className="space-y-0.5">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategoryId(cat.id);
                      setCurrentView('catalog');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-slate-500 font-normal">Tất cả &rarr;</span>
                  </button>
                  {cat.children && cat.children.length > 0 && (
                    <div className="pl-4 ml-2 border-l border-slate-800 space-y-0.5">
                      {cat.children.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategoryId(sub.id);
                            setCurrentView('catalog');
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-2 py-1 rounded text-[11px] text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 flex items-center gap-1.5"
                        >
                          <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0" />
                          <span className="truncate">{sub.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
