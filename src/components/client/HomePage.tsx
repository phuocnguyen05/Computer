import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PARTNER_BRANDS } from '../../data/mockData';
import { Product, FLASH_SALE_TAB_OPTIONS } from '../../types';
import {
  Flame,
  Clock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  Star,
  ShoppingCart,
  ShieldCheck,
  Zap,
  ArrowRight,
  Bot,
  Heart,
  Scale,
  Truck,
  CreditCard,
  Wrench,
  RotateCcw,
  LayoutGrid,
  Tag,
  X,
} from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 1,
    badge: 'SIÊU PHẨM GAMING 2026',
    title: 'PC Gaming Cyberpunk Ultra RTX 4090 24GB',
    subtitle: 'Khai phóng sức mạnh Core i9 14900K & RAM 64GB DDR5. Tặng màn hình OLED 240Hz khi mua nguyên dàn máy.',
    priceTag: '89.990.000đ',
    originalPrice: '105.000.000đ',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&auto=format&fit=crop&q=80',
    accent: 'from-rose-600 via-orange-600 to-amber-500',
    productId: 1,
  },
  {
    id: 2,
    badge: 'VUA HIỆU NĂNG GAMING',
    title: 'PC Phoenix Ryzen 7 7800X3D | RTX 4070 Ti Super',
    subtitle: 'Bộ đôi thống trị bảng xếp hạng FPS eSports thế giới. Tản nhiệt nước 360 ARGB siêu êm ái.',
    priceTag: '44.990.000đ',
    originalPrice: '52.000.000đ',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200&auto=format&fit=crop&q=80',
    accent: 'from-cyan-600 via-blue-600 to-indigo-600',
    productId: 2,
  },
  {
    id: 3,
    badge: 'SIÊU NHẸ 63 GRAM',
    title: 'Chuột Không Dây Razer DeathAdder V3 Pro Wireless',
    subtitle: 'Cảm biến Focus Pro 30K Optical. Vũ khí ưa thích của các Pro Player CS2 & Valorant.',
    priceTag: '2.890.000đ',
    originalPrice: '3.890.000đ',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1200&auto=format&fit=crop&q=80',
    accent: 'from-emerald-600 via-teal-600 to-cyan-600',
    productId: 6,
  },
];

export const HomePage: React.FC<{ onOpenAIConsultant?: () => void }> = ({ onOpenAIConsultant }) => {
  const {
    products,
    sections,
    setSelectedProductId,
    setSelectedCategoryId,
    setCurrentView,
    addToCart,
    wishlist,
    toggleWishlist,
    addToCompare,
    setSearchQuery,
    promptLoginOrGuest,
    isLoggedIn,
    showToast,
  } = useApp();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [flashSaleTab, setFlashSaleTab] = useState<string>('ALL');
  const [isFlashMenuOpen, setIsFlashMenuOpen] = useState<boolean>(false);
  const [showAllFlashSaleItems, setShowAllFlashSaleItems] = useState<boolean>(false);

  // Flash sale countdown timer state (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Slide autoplay
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);

  const matchesFlashSaleTab = (p: Product, tab: string) => {
    if (tab === 'ALL') return true;
    if (p.flashSaleTab === tab) return true;
    const cat = (p.categoryName || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    switch (tab) {
      case 'DEAL_MAN_HINH':
        return cat.includes('màn hình') || cat.includes('monitor') || name.includes('màn hình');
      case 'DEAL_CPU':
        return cat.includes('cpu') || cat.includes('vi xử lý') || name.includes('intel') || name.includes('ryzen') || name.includes('core');
      case 'DEAL_RAM':
        return cat.includes('ram') || cat.includes('bộ nhớ') || name.includes('ddr4') || name.includes('ddr5');
      case 'DEAL_VGA':
        return cat.includes('vga') || cat.includes('card') || name.includes('rtx') || name.includes('gtx') || name.includes('radeon');
      case 'DEAL_LAPTOP':
        return cat.includes('laptop') || name.includes('laptop');
      case 'DEAL_PC':
        return cat.includes('pc') || cat.includes('máy tính bộ') || name.includes('pc gaming');
      case 'DEAL_PHIM_CHUOT':
        return cat.includes('chuột') || cat.includes('bàn phím') || cat.includes('keyboard') || cat.includes('mouse') || name.includes('chuột') || name.includes('bàn phím');
      case 'DEAL_LOA_TAI_NGHE':
        return cat.includes('loa') || cat.includes('tai nghe') || cat.includes('headphone') || cat.includes('speaker') || name.includes('tai nghe') || name.includes('loa');
      case 'DEAL_OCUNG_SSD':
        return cat.includes('ssd') || cat.includes('ổ cứng') || cat.includes('hdd') || name.includes('ssd') || name.includes('nvme');
      case 'DEAL_MAINBOARD':
        return cat.includes('mainboard') || cat.includes('bo mạch') || name.includes('mainboard') || name.includes('b760') || name.includes('z790');
      case 'DEAL_NGUON_TANNHIET':
        return cat.includes('nguồn') || cat.includes('psu') || cat.includes('tản nhiệt') || name.includes('psu') || name.includes('tản');
      case 'DEAL_LINH_KIEN':
        return cat.includes('phụ kiện') || cat.includes('khác');
      default:
        return false;
    }
  };

  const allFlashSaleProducts = products.filter(p => p.isFlashSale || p.pinnedSection === 'FLASH_SALE');
  const flashSaleProducts = allFlashSaleProducts.filter(p => matchesFlashSaleTab(p, flashSaleTab));

  // Pull-to-refresh state & handlers for mobile view
  const [touchStartY, setTouchStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 5) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY <= 5 && touchStartY > 0) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY;
      if (distance > 0) {
        setPullDistance(Math.min(distance * 0.45, 120));
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(70);
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
        setTouchStartY(0);
        showToast('Đã làm mới! Đã cập nhật sản phẩm & Hot Deal mới nhất.', 'success');
      }, 1200);
    } else {
      setPullDistance(0);
      setTouchStartY(0);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="space-y-12 pb-12 font-sans select-none relative"
    >
      {/* Pull-To-Refresh Mobile Effect Banner */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          style={{ height: `${Math.max(pullDistance, isRefreshing ? 55 : 0)}px` }}
          className="overflow-hidden transition-all duration-200 flex items-center justify-center bg-slate-900/95 border border-slate-800 rounded-2xl text-xs text-rose-400 font-bold gap-2 shadow-lg mb-2"
        >
          <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-rose-500' : ''}`} />
          <span>
            {isRefreshing
              ? 'Đang cập nhật sản phẩm & Hot Deal mới nhất...'
              : pullDistance > 60
              ? 'Thả tay để làm mới...'
              : 'Kéo xuống để làm mới...'}
          </span>
        </div>
      )}

      {/* 1. BANNER CAROUSEL */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="relative h-[380px] sm:h-[450px] lg:h-[480px] w-full">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Image with overlay */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center brightness-75 scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

              {/* Text content */}
              <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center max-w-2xl">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase text-white bg-gradient-to-r ${slide.accent} shadow-md w-fit mb-3`}
                >
                  {slide.badge}
                </span>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-3">
                  {slide.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 line-clamp-2 sm:line-clamp-3">
                  {slide.subtitle}
                </p>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-3xl font-black text-rose-500">{slide.priceTag}</span>
                    <span className="text-xs sm:text-sm text-slate-400 line-through">
                      {slide.originalPrice}
                    </span>
                  </div>
                  <button
                    id={`hero-slide-btn-${slide.id}`}
                    onClick={() => {
                      setSelectedProductId(slide.productId);
                      setCurrentView('product-detail');
                    }}
                    className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-rose-600/30 transition-all flex items-center gap-2"
                  >
                    <span>Xem Chi Tiết & Mua Ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Arrows */}
          <button
            onClick={() => setCurrentSlide((currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/60 shadow transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((currentSlide + 1) % HERO_SLIDES.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/60 shadow transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Carousel Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide ? 'w-8 bg-rose-500' : 'w-2 bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. 4-PILLAR BENTO SERVICE & TRUST CARDS (4 Ô Cam Kết Dịch Vụ Vàng) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800/90 hover:border-rose-500/50 rounded-2xl p-4.5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-950/20 flex items-center gap-3.5 group">
          <div className="w-12 h-12 rounded-xl bg-rose-600/15 border border-rose-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Truck className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
              Giao Hỏa Tốc 2 Giờ
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">
              Nhận hàng trong ngày, miễn phí nội thành đơn từ 1Tr
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/50 rounded-2xl p-4.5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/20 flex items-center gap-3.5 group">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <RotateCcw className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              Bảo Hành 1 Đổi 1
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">
              Đổi mới trong 30 ngày nếu phát sinh lỗi phần cứng
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 hover:border-amber-500/50 rounded-2xl p-4.5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-950/20 flex items-center gap-3.5 group">
          <div className="w-12 h-12 rounded-xl bg-amber-600/15 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CreditCard className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
              Trả Góp 0% Lãi Suất
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">
              Thủ tục thẻ tín dụng & CCCD online chỉ mất 5 phút
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/50 rounded-2xl p-4.5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/20 flex items-center gap-3.5 group">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/15 border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Wrench className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
              Vệ Sinh & Lắp Ráp Free
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">
              Bảo dưỡng PC trọn đời, tra keo tản nhiệt cao cấp
            </p>
          </div>
        </div>
      </section>

      {/* 3. FLASH SALE WITH REAL-TIME COUNTDOWN CLOCK & DEAL TABS */}
      <section
        id="section-flash-sale"
        className="rounded-3xl bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-900/90 border border-rose-900/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Background ambient glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Title and Countdown Timer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-rose-900/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/40 animate-pulse">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Flash Sale Giá Sốc
                </h2>
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Chỉ hôm nay
                </span>
              </div>
              <p className="text-xs text-rose-200/70 mt-0.5">Số lượng có hạn, giá sẽ tăng lại khi hết giờ</p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-2xl border border-rose-800/40">
            <Clock className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-semibold text-slate-300">Kết thúc sau:</span>
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-white">
              <span className="bg-rose-600 px-2 py-1 rounded-lg">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-rose-600 px-2 py-1 rounded-lg">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-rose-600 px-2 py-1 rounded-lg">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Category Menu for Flash Sale Deals (No Horizontal Scrollbar) */}
        <div className="py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Primary Button to Open Category List */}
            <button
              id="tab-flash-dropdown-btn"
              onClick={() => setIsFlashMenuOpen(!isFlashMenuOpen)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shadow-lg border cursor-pointer ${
                flashSaleTab === 'ALL' || isFlashMenuOpen
                  ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30 hover:bg-rose-500'
                  : 'bg-slate-900 text-slate-200 border-slate-700/80 hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-amber-300" />
              <span className="text-sm">
                {flashSaleTab === 'ALL'
                  ? 'Tất Cả Hot Deal'
                  : `Danh Mục: ${FLASH_SALE_TAB_OPTIONS.find(o => o.id === flashSaleTab)?.shortLabel || 'Hot Deal'}`}
              </span>
              <span className="bg-slate-950/70 px-2 py-0.5 rounded-full text-[11px] text-amber-300 font-extrabold border border-amber-500/20">
                {flashSaleProducts.length} Deal
              </span>
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-300 ${isFlashMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* If a category filter is active (not ALL), show a quick Reset / Active pill */}
            {flashSaleTab !== 'ALL' && (
              <div className="flex items-center gap-2 bg-slate-900 border border-rose-500/50 px-3 py-1.5 rounded-xl">
                <span className="text-xs text-rose-300 font-semibold flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-rose-400" />
                  Đang lọc: <strong>{FLASH_SALE_TAB_OPTIONS.find(o => o.id === flashSaleTab)?.label}</strong>
                </span>
                <button
                  onClick={() => setFlashSaleTab('ALL')}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Xem tất cả hot deal"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Expanded Grid Panel of Categories (Like Product Categories Grid) */}
          {isFlashMenuOpen && (
            <div className="mt-3 p-4 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
                    DANH MỤC SẢN PHẨM FLASH SALE ({allFlashSaleProducts.length} HOT DEALS)
                  </h4>
                </div>
                <button
                  onClick={() => setIsFlashMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Đóng menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of Categories similar to Product Categories section */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {FLASH_SALE_TAB_OPTIONS.map(opt => {
                  const count = opt.id === 'ALL'
                    ? allFlashSaleProducts.length
                    : allFlashSaleProducts.filter(p => matchesFlashSaleTab(p, opt.id)).length;
                  const isSelected = flashSaleTab === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setFlashSaleTab(opt.id);
                        setIsFlashMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between group cursor-pointer ${
                        isSelected
                          ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30'
                          : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-rose-500/50 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold truncate group-hover:text-amber-300 transition-colors">
                          {opt.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-1" />}
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-1">
                        <span className={isSelected ? 'text-rose-100 font-medium' : 'text-slate-400'}>
                          {opt.id === 'ALL' ? 'Tất cả deal' : 'Sản phẩm'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                          isSelected ? 'bg-slate-950/50 text-white' : 'bg-slate-800 text-amber-400'
                        }`}>
                          {count} Deal
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid or Empty State */}
        {flashSaleProducts.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-950/60 rounded-3xl border border-slate-800 my-4">
            <Flame className="w-10 h-10 text-rose-500/50 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-300">Chưa có deal Flash Sale cho danh mục này hôm nay</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Hãy bấm chọn <strong>"Tất Cả Hot Deal"</strong> trong menu để săn những deal hot đang giảm giá sâu nhất!
            </p>
            <button
              onClick={() => setFlashSaleTab('ALL')}
              className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/30 inline-flex items-center gap-1.5"
            >
              <span>Xem Tất Cả Hot Deal ({allFlashSaleProducts.length})</span>
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
              {(showAllFlashSaleItems ? flashSaleProducts : flashSaleProducts.slice(0, 6)).map(p => {
                const discountPct = Math.round(((p.priceOriginal - p.priceSale) / p.priceOriginal) * 100);
                return (
                  <div
                    key={p.id}
                    id={`flash-product-card-${p.id}`}
                    className="bg-slate-950/70 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-950/40 group flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail & Badges */}
                      <div className="relative rounded-xl overflow-hidden bg-slate-900 h-48 mb-3">
                        <img
                          src={p.thumbnailUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <div className="bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-lg shadow">
                            -{discountPct}%
                          </div>
                          <div className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow backdrop-blur-md ${
                            p.stock > 0 ? 'bg-amber-500/90 text-slate-950' : 'bg-red-900/90 text-white'
                          }`}>
                            {p.stock > 0 ? `Còn ${p.stock} suất` : 'Cháy hàng'}
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                          {isLoggedIn && (
                            <button
                              onClick={() => toggleWishlist(p.id)}
                              className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                                wishlist.includes(p.id)
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-900/80 text-slate-300 hover:text-rose-400'
                              }`}
                              title="Yêu thích"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </button>
                          )}
                          <button
                            onClick={() => addToCompare(p)}
                            className="p-1.5 rounded-lg bg-slate-900/80 text-slate-300 hover:text-cyan-400 backdrop-blur-md transition-colors"
                            title="So sánh"
                          >
                            <Scale className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Brand & Name */}
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{p.brand}</span>
                      <h3
                        onClick={() => {
                          setSelectedProductId(p.id);
                          setCurrentView('product-detail');
                        }}
                        className="text-sm font-bold text-slate-100 hover:text-rose-400 cursor-pointer line-clamp-2 mt-1 transition-colors leading-snug"
                      >
                        {p.name}
                      </h3>

                      {/* Rating & Sold count */}
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        <div className="flex items-center text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="ml-1 font-bold">{p.ratingAvg}</span>
                        </div>
                        <span>•</span>
                        <span>Đã bán {p.soldCount}</span>
                      </div>

                      {/* Price */}
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-base font-black text-rose-500">
                          {p.priceSale.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          {p.priceOriginal.toLocaleString('vi-VN')}đ
                        </span>
                      </div>

                      {/* Sold progress bar */}
                      <div className="mt-3">
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full"
                            style={{
                              width: `${
                                p.stock > 0
                                  ? Math.min(100, Math.round((p.soldCount / (p.soldCount + p.stock)) * 100))
                                  : 100
                              }%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-semibold mt-1">
                          <span className="text-slate-400">Đã bán: <strong className="text-amber-400">{p.soldCount}</strong></span>
                          <span className={p.stock > 0 ? 'text-rose-400 font-bold' : 'text-red-500 font-bold'}>
                            {p.stock > 0 ? `Còn tồn: ${p.stock}` : 'Đã hết hàng!'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Buy / Add button */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        id={`flash-btn-buy-${p.id}`}
                        disabled={p.stock <= 0}
                        onClick={() => {
                          addToCart(p, 1);
                          if (p.stock > 0) {
                            promptLoginOrGuest(() => setCurrentView('checkout'), 'buy_now');
                          }
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors shadow ${
                          p.stock > 0
                            ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {p.stock > 0 ? 'Mua Ngay' : 'Tạm Hết Hàng'}
                      </button>
                      <button
                        id={`flash-btn-cart-${p.id}`}
                        disabled={p.stock <= 0}
                        onClick={() => addToCart(p, 1)}
                        className={`p-2 rounded-xl transition-colors ${
                          p.stock > 0
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer'
                            : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                        }`}
                        title={p.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {flashSaleProducts.length > 6 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllFlashSaleItems(!showAllFlashSaleItems)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 inline-flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <span>
                    {showAllFlashSaleItems
                      ? 'Thu gọn bớt'
                      : `Xem thêm ${flashSaleProducts.length - 6} sản phẩm Flash Sale`}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllFlashSaleItems ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* 3. DYNAMIC ADMIN-CONFIGURED HOMEPAGE SECTIONS */}
      {sections
        .filter(s => s.isActive && s.sectionType === 'GRID_PRODUCTS')
        .map(section => {
          const sectionProducts = products.filter(p => p.pinnedSection === section.filterTag);
          if (sectionProducts.length === 0) return null;

          return (
            <section key={section.id} className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-6 bg-rose-600 rounded-full" />
                  <h2 className="text-xl font-extrabold text-white tracking-tight">{section.title}</h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setCurrentView('catalog');
                  }}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <span>Xem tất cả</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {sectionProducts.map(p => {
                  const discountPct = Math.round(((p.priceOriginal - p.priceSale) / p.priceOriginal) * 100);
                  return (
                    <div
                      key={p.id}
                      id={`product-card-${p.id}`}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between group"
                    >
                      <div>
                        {/* Thumbnail */}
                        <div className="relative rounded-xl overflow-hidden bg-slate-950 h-44 mb-3">
                          <img
                            src={p.thumbnailUrl}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {discountPct > 0 && (
                            <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow">
                              -{discountPct}%
                            </span>
                          )}
                          <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                            <button
                              onClick={() => toggleWishlist(p.id)}
                              className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                                wishlist.includes(p.id)
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-900/80 text-slate-300 hover:text-rose-400'
                              }`}
                            >
                              <Heart className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        </div>

                        {/* Details */}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {p.brand} • Bảo hành {p.warrantyMonths}T
                        </span>
                        <h3
                          onClick={() => {
                            setSelectedProductId(p.id);
                            setCurrentView('product-detail');
                          }}
                          className="text-xs font-bold text-slate-200 hover:text-rose-400 cursor-pointer line-clamp-2 mt-1 transition-colors leading-snug"
                        >
                          {p.name}
                        </h3>

                        {/* Key Spec Snippet */}
                        {p.specs.length > 0 && (
                          <div className="mt-2 py-1.5 px-2 bg-slate-950/60 rounded-lg text-[10px] text-slate-400 line-clamp-1 border border-slate-800/60">
                            {p.specs[0].name}: <span className="text-slate-300">{p.specs[0].value}</span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-sm font-black text-rose-400">
                            {p.priceSale.toLocaleString('vi-VN')}đ
                          </span>
                          {p.priceOriginal > p.priceSale && (
                            <span className="text-[11px] text-slate-400 line-through">
                              {p.priceOriginal.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                        <button
                          onClick={() => addToCart(p, 1)}
                          className="flex-1 py-1.5 bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Thêm vào giỏ</span>
                        </button>
                        <button
                          onClick={() => addToCompare(p)}
                          className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-cyan-400 transition-colors"
                          title="So sánh cấu hình"
                        >
                          <Scale className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

      {/* 4. PARTNER BRANDS LOGO CAROUSEL / GRID */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">
            Hợp Tác Chiến Lược
          </span>
          <h2 className="text-lg sm:text-xl font-black text-white mt-1">
            Đối Tác Thương Hiệu Công Nghệ Hàng Đầu
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sản phẩm chính hãng 100% nhập khẩu chính ngạch đầy đủ hóa đơn VAT
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {PARTNER_BRANDS.map((brand, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedCategoryId(null);
                setSearchQuery(brand.name);
                setCurrentView('catalog');
              }}
              className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-rose-500/50 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center mb-2 overflow-hidden">
                <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition-colors">
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
