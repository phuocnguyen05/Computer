import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SHOWROOM_LIST } from '../../data/mockData';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  QrCode,
  ExternalLink,
  X,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, navigateToAccountTab, isLoggedIn, requireAuth } = useApp();
  const [activeMapShowroom, setActiveMapShowroom] = useState<any | null>(null);

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 font-sans mt-16">
      {/* 4 CORE COMMITMENTS BANNER */}
      <div className="border-b border-slate-800 bg-slate-900/60 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Chính Hãng 100%</h4>
              <p className="text-xs text-slate-400">Cam kết đền 200% nếu phát hiện hàng giả, hàng nhái</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Miễn Phí Giao Hàng</h4>
              <p className="text-xs text-slate-400">Đơn hàng từ 1.000.000đ giao hỏa tốc toàn quốc</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">1 Đổi 1 Trong 30 Ngày</h4>
              <p className="text-xs text-slate-400">Đổi mới ngay lập tức nếu phát sinh lỗi phần cứng từ NSX</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Hỗ Trợ Kỹ Thuật 24/7</h4>
              <p className="text-xs text-slate-400">Bảo hành tận nhà, vệ sinh máy và cài win trọn đời</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Company & Showrooms */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white">
                GT
              </div>
              <span className="text-lg font-extrabold text-white">
                GEAR<span className="text-rose-500">TECH</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Hệ thống bán lẻ máy tính, PC gaming, linh kiện điện tử và thiết bị công nghệ hàng đầu Việt Nam. Đối tác phân phối chính thức của Intel, AMD, NVIDIA, ASUS ROG, MSI, Corsair.
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Tổng đài miễn cước: <strong>1800 6868</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Email CSKH: support@geartech.vn</span>
              </div>
            </div>
          </div>

          {/* Column 2: Showroom Locations */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-rose-500 pl-2">
              Hệ Thống Showroom
            </h4>
            <div className="space-y-3 text-xs">
              {SHOWROOM_LIST.map((sr, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <p className="font-bold text-slate-200">{sr.name}</p>
                  <p className="text-slate-400 mt-1">{sr.address}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                    <span className="text-slate-400 text-[11px]">{sr.hours}</span>
                    <button
                      id={`footer-btn-map-${idx}`}
                      onClick={() => setActiveMapShowroom(sr)}
                      className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <MapPin className="w-3 h-3" /> Xem bản đồ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Customer Policies & Services */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-cyan-500 pl-2">
              Chính Sách & Dịch Vụ
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {isLoggedIn && (
                <li>
                  <button
                    onClick={() => setCurrentView('warranty-lookup')}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Tra cứu thông tin bảo hành trực tuyến
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => requireAuth(() => setCurrentView('service-booking'), 'generic')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Đăng ký vệ sinh PC & Laptop miễn phí
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('pc-builder')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Công cụ xây dựng cấu hình PC tùy chọn
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToAccountTab('wishlist')}
                  className="hover:text-rose-400 transition-colors text-left"
                >
                  Danh sách sản phẩm yêu thích đã lưu
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToAccountTab('orders')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Quản lý và tra cứu tiến độ đơn hàng
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToAccountTab('profile')}
                  className="hover:text-slate-200 transition-colors text-left"
                >
                  Hồ sơ cá nhân & Sổ địa chỉ giao hàng
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToAccountTab('loyalty')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Chính sách tích điểm GT-Points & Ưu đãi VIP
                </button>
              </li>
              <li className="hover:text-slate-200 cursor-pointer">Chính sách bảo hành và đổi trả linh kiện</li>
              <li className="hover:text-slate-200 cursor-pointer">Chính sách vận chuyển và giao hàng siêu tốc</li>
              <li className="hover:text-slate-200 cursor-pointer">Chính sách bảo mật thông tin khách hàng</li>
              <li className="hover:text-slate-200 cursor-pointer">Hướng dẫn mua hàng trả góp lãi suất 0%</li>
            </ul>
          </div>

          {/* Column 4: Shipping & Payment Partners */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Thanh Toán & Vận Chuyển
            </h4>
            <div className="space-y-4">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-2">
                  Phương thức thanh toán
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center text-[10px] font-bold text-slate-200 flex flex-col items-center gap-1">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>VNPAY-QR</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center text-[10px] font-bold text-slate-200 flex flex-col items-center gap-1">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span>Visa / Master</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center text-[10px] font-bold text-slate-200 flex flex-col items-center gap-1">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>COD Tiền Mặt</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-2">
                  Đơn vị vận chuyển đối tác
                </span>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    Giao Hàng Nhanh (GHN)
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    GHTK
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    Viettel Post
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    Hỏa Tốc 2H Nội Thành
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2025 - 2026 GearTech Corporation. Giấy phép ĐKKD số: 0312345678 do Sở KH&ĐT cấp.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-200 cursor-pointer">Điều khoản dịch vụ</span>
            <span>•</span>
            <span className="hover:text-slate-200 cursor-pointer">Quy chế hoạt động</span>
            <span>•</span>
            <span className="hover:text-slate-200 cursor-pointer">Giải quyết khiếu nại</span>
          </div>
        </div>
      </div>

      {/* SHOWROOM MAP MODAL */}
      {activeMapShowroom && (
        <div
          id="showroom-map-modal"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveMapShowroom(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-2 text-rose-400">
              <MapPin className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">{activeMapShowroom.name}</h3>
            </div>
            <p className="text-xs text-slate-300 mb-1">{activeMapShowroom.address}</p>
            <p className="text-xs text-slate-400 mb-4">Hotline: {activeMapShowroom.phone} • {activeMapShowroom.hours}</p>

            {/* Simulated Interactive Map Display */}
            <div className="w-full h-64 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden relative flex items-center justify-center text-center p-4">
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-rose-600/20 border border-rose-500 flex items-center justify-center text-rose-500 animate-pulse">
                  <MapPin className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{activeMapShowroom.name}</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    Bản đồ định vị Google Maps tọa độ GPS chính xác. Bãi đỗ xe ô tô và xe máy rộng rãi, có bảo vệ trông xe miễn phí.
                  </p>
                </div>
                <a
                  href={activeMapShowroom.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Mở Trong Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
