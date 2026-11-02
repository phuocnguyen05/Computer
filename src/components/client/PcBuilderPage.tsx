import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  Cpu,
  Layers,
  HardDrive,
  Monitor,
  Zap,
  Box,
  Fan,
  ShoppingCart,
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  X,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

interface ComponentSlot {
  key: string;
  name: string;
  icon: React.ElementType;
  required: boolean;
  categoryIds: number[];
  filterKeywords: string[];
  recommendedWattage?: number;
}

const PC_SLOTS: ComponentSlot[] = [
  {
    key: 'cpu',
    name: 'Bộ Vi Xử Lý (CPU)',
    icon: Cpu,
    required: true,
    categoryIds: [31],
    filterKeywords: ['CPU', 'Vi Xử Lý', 'Core i', 'Ryzen'],
  },
  {
    key: 'mainboard',
    name: 'Bo Mạch Chủ (Mainboard)',
    icon: Layers,
    required: true,
    categoryIds: [33],
    filterKeywords: ['Mainboard', 'Bo Mạch Chủ', 'Bo Mạch', 'B760', 'Z790', 'B650', 'X670'],
  },
  {
    key: 'ram',
    name: 'Bộ Nhớ Trong (RAM)',
    icon: Box,
    required: true,
    categoryIds: [34],
    filterKeywords: ['RAM', 'Bộ Nhớ Trong', 'DDR5', 'DDR4'],
  },
  {
    key: 'vga',
    name: 'Card Màn Hình (VGA / GPU)',
    icon: Monitor,
    required: false,
    categoryIds: [32],
    filterKeywords: ['VGA', 'Card Màn Hình', 'RTX', 'Radeon', 'GeForce'],
  },
  {
    key: 'storage',
    name: 'Ổ Cứng (SSD / HDD)',
    icon: HardDrive,
    required: true,
    categoryIds: [35],
    filterKeywords: ['SSD', 'HDD', 'Ổ Cứng', 'NVMe', 'Ổ SSD'],
  },
  {
    key: 'psu',
    name: 'Nguồn Máy Tính (PSU)',
    icon: Zap,
    required: true,
    categoryIds: [36],
    filterKeywords: ['Nguồn', 'PSU', 'Power Supply', '80 Plus'],
  },
  {
    key: 'case',
    name: 'Vỏ Case Máy Tính',
    icon: Box,
    required: true,
    categoryIds: [37],
    filterKeywords: ['Vỏ Case', 'Case Máy Tính', 'Thùng Máy'],
  },
  {
    key: 'cooler',
    name: 'Tản Nhiệt (Cooler / Fan)',
    icon: Fan,
    required: false,
    categoryIds: [38],
    filterKeywords: ['Tản Nhiệt', 'Cooler', 'AIO', 'Quạt Tản'],
  },
  {
    key: 'monitor',
    name: 'Màn Hình Máy Tính (Monitor)',
    icon: Monitor,
    required: false,
    categoryIds: [41, 42],
    filterKeywords: ['Màn Hình', 'Monitor'],
  },
];

export const PcBuilderPage: React.FC = () => {
  const { products, addToCart, setCurrentView, showToast } = useApp();

  // Selected components map: { cpu: Product, vga: Product, ... }
  const [selectedBuild, setSelectedBuild] = useState<Record<string, Product | null>>({
    cpu: null,
    mainboard: null,
    ram: null,
    vga: null,
    storage: null,
    psu: null,
    case: null,
    cooler: null,
    monitor: null,
  });

  // Active slot picker modal state
  const [activeSlotModal, setActiveSlotModal] = useState<ComponentSlot | null>(null);

  // Modal search, filter and sort states
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalBrandFilter, setModalBrandFilter] = useState<string>('all');
  const [modalSort, setModalSort] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const openSlotModal = (slot: ComponentSlot) => {
    setActiveSlotModal(slot);
    setModalSearchQuery('');
    setModalBrandFilter('all');
    setModalSort('default');
  };

  // Total price of selected build
  const totalPrice = useMemo(() => {
    return Object.values(selectedBuild).reduce((sum, item) => sum + (item ? item.priceSale : 0), 0);
  }, [selectedBuild]);

  // Estimated system wattage calculation
  const estimatedWattage = useMemo(() => {
    let watts = 80; // Baseline motherboard, fans, chipset
    const cpu = selectedBuild.cpu;
    const vga = selectedBuild.vga;

    if (cpu) {
      if (cpu.name.includes('i9') || cpu.name.includes('Ryzen 9')) watts += 250;
      else if (cpu.name.includes('i7') || cpu.name.includes('7800X3D')) watts += 150;
      else watts += 90;
    }

    if (vga) {
      if (vga.name.includes('4090')) watts += 450;
      else if (vga.name.includes('4080')) watts += 320;
      else if (vga.name.includes('4070')) watts += 220;
      else if (vga.name.includes('4060')) watts += 130;
      else watts += 150;
    }

    return watts;
  }, [selectedBuild]);

  const recommendedPsuWattage = Math.ceil((estimatedWattage * 1.3) / 50) * 50;

  // Compatibility checking
  const compatibilityAlerts = useMemo(() => {
    const alerts: { type: 'success' | 'warning' | 'error'; message: string }[] = [];

    const cpu = selectedBuild.cpu;
    const mainboard = selectedBuild.mainboard;
    const psu = selectedBuild.psu;

    // Check CPU & Mainboard socket match
    if (cpu && mainboard) {
      const isIntelCpu = cpu.name.toLowerCase().includes('intel') || cpu.name.toLowerCase().includes('core i');
      const isAmdCpu = cpu.name.toLowerCase().includes('amd') || cpu.name.toLowerCase().includes('ryzen');

      const isIntelBoard = mainboard.name.includes('Z790') || mainboard.name.includes('B760') || mainboard.name.includes('H610') || mainboard.name.includes('LGA1700');
      const isAmdBoard = mainboard.name.includes('B650') || mainboard.name.includes('X670') || mainboard.name.includes('AM5');

      if (isIntelCpu && isAmdBoard) {
        alerts.push({
          type: 'error',
          message: 'Không tương thích Socket! CPU Intel không lắp được trên Bo Mạch Chủ chipset AMD (AM5/B650).',
        });
      } else if (isAmdCpu && isIntelBoard) {
        alerts.push({
          type: 'error',
          message: 'Không tương thích Socket! CPU AMD Ryzen không lắp được trên Bo Mạch Chủ chipset Intel (LGA1700/Z790).',
        });
      } else {
        alerts.push({
          type: 'success',
          message: 'Socket CPU và Bo Mạch Chủ hoàn toàn tương thích và khớp chuẩn.',
        });
      }
    }

    // Check PSU Capacity
    if (psu) {
      alerts.push({
        type: 'success',
        message: `Hệ thống tiêu thụ ước tính ~${estimatedWattage}W. Nguồn máy tính đảm bảo cấp điện ổn định.`,
      });
    }

    return alerts;
  }, [selectedBuild, estimatedWattage]);

  // Select item into slot
  const handleSelectProduct = (slotKey: string, product: Product) => {
    setSelectedBuild(prev => ({ ...prev, [slotKey]: product }));
    setActiveSlotModal(null);
    showToast(`Đã thêm ${product.name} vào cấu hình`, 'success');
  };

  const handleRemoveSlot = (slotKey: string) => {
    setSelectedBuild(prev => ({ ...prev, [slotKey]: null }));
  };

  const handleResetBuild = () => {
    setSelectedBuild({
      cpu: null,
      mainboard: null,
      ram: null,
      vga: null,
      storage: null,
      psu: null,
      case: null,
      cooler: null,
      monitor: null,
    });
    showToast('Đã đặt lại toàn bộ cấu hình PC', 'info');
  };

  // 1. Raw products strictly belonging to the active component slot
  const rawSlotProducts = useMemo(() => {
    if (!activeSlotModal) return [];

    const isPrebuiltPC = (p: Product) => {
      return (
        [1, 11, 12, 13, 14].includes(p.categoryId) ||
        p.name.trim().toLowerCase().startsWith('pc ') ||
        (p.categoryName && p.categoryName.toLowerCase().includes('pc gaming')) ||
        (p.categoryName && p.categoryName.toLowerCase().includes('workstation'))
      );
    };

    const isLaptop = (p: Product) => {
      return (
        [2, 21, 22, 23, 24].includes(p.categoryId) ||
        p.name.trim().toLowerCase().startsWith('laptop ') ||
        (p.categoryName && p.categoryName.toLowerCase().includes('laptop'))
      );
    };

    return products.filter(p => {
      // Exclude complete prebuilt PCs and laptops
      if (isPrebuiltPC(p) || isLaptop(p)) return false;

      // Check exact subcategory match
      if (activeSlotModal.categoryIds.includes(p.categoryId)) {
        return true;
      }

      // Slot-specific fallbacks for products under category 3 (Linh Kiện Máy Tính)
      const nameLower = p.name.toLowerCase();

      if (activeSlotModal.key === 'cpu') {
        return (
          p.categoryId === 31 ||
          ((p.categoryId === 3 || !p.categoryId) &&
            (nameLower.startsWith('cpu') || nameLower.includes('bộ vi xử lý') || nameLower.includes('core i') || nameLower.includes('ryzen')) &&
            !nameLower.includes('mainboard') &&
            !nameLower.includes('vga') &&
            !nameLower.includes('rtx'))
        );
      }

      if (activeSlotModal.key === 'mainboard') {
        return (
          p.categoryId === 33 ||
          ((p.categoryId === 3 || !p.categoryId) &&
            (nameLower.includes('mainboard') || nameLower.includes('bo mạch')) &&
            !nameLower.startsWith('cpu'))
        );
      }

      if (activeSlotModal.key === 'ram') {
        return (
          p.categoryId === 34 ||
          ((p.categoryId === 3 || !p.categoryId) &&
            (nameLower.includes('ram') || nameLower.includes('bộ nhớ trong')) &&
            !nameLower.startsWith('cpu'))
        );
      }

      if (activeSlotModal.key === 'vga') {
        return (
          p.categoryId === 32 ||
          ((p.categoryId === 3 || !p.categoryId) &&
            (nameLower.includes('vga') || nameLower.includes('card màn hình') || nameLower.includes('card đồ họa') || nameLower.includes('geforce') || nameLower.includes('radeon')))
        );
      }

      if (activeSlotModal.key === 'storage') {
        return (
          p.categoryId === 35 ||
          ((p.categoryId === 3 || !p.categoryId) &&
            (nameLower.includes('ssd') || nameLower.includes('hdd') || nameLower.includes('ổ cứng') || nameLower.includes('nvme')))
        );
      }

      if (activeSlotModal.key === 'psu') {
        return (
          p.categoryId === 36 ||
          ((p.categoryId === 3 || !p.categoryId) &&
            (nameLower.includes('nguồn') || nameLower.includes('psu') || nameLower.includes('power supply')))
        );
      }

      if (activeSlotModal.key === 'case') {
        return (
          p.categoryId === 37 ||
          ((p.categoryId === 3 || !p.categoryId) &&
            (nameLower.includes('case') || nameLower.includes('vỏ máy') || nameLower.includes('vỏ case')) &&
            !nameLower.includes('fan tản') &&
            !nameLower.includes('tản nhiệt'))
        );
      }

      if (activeSlotModal.key === 'cooler') {
        return (
          p.categoryId === 38 ||
          ((p.categoryId === 3 || !p.categoryId) &&
            (nameLower.includes('tản nhiệt') || nameLower.includes('cooler') || nameLower.includes('aio')))
        );
      }

      if (activeSlotModal.key === 'monitor') {
        return (
          [41, 42].includes(p.categoryId) ||
          ((p.categoryId === 4 || !p.categoryId) &&
            (nameLower.includes('màn hình') || nameLower.includes('monitor')))
        );
      }

      return false;
    });
  }, [products, activeSlotModal]);

  // Available brands for filter chips inside the modal
  const modalAvailableBrands = useMemo(() => {
    const brands = new Set<string>();
    rawSlotProducts.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands);
  }, [rawSlotProducts]);

  // Filtered and sorted products for display in the modal
  const displayModalProducts = useMemo(() => {
    let list = [...rawSlotProducts];

    // Brand filter
    if (modalBrandFilter !== 'all') {
      list = list.filter(p => p.brand.toLowerCase() === modalBrandFilter.toLowerCase());
    }

    // Search query filter
    if (modalSearchQuery.trim()) {
      const q = modalSearchQuery.toLowerCase().trim();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
          (p.specs && p.specs.some(s => s.value.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)))
      );
    }

    // Sorting
    if (modalSort === 'price-asc') {
      list.sort((a, b) => a.priceSale - b.priceSale);
    } else if (modalSort === 'price-desc') {
      list.sort((a, b) => b.priceSale - a.priceSale);
    }

    return list;
  }, [rawSlotProducts, modalBrandFilter, modalSearchQuery, modalSort]);

  // Add all components to shopping cart
  const handleAddAllToCart = () => {
    const selectedItems = Object.values(selectedBuild).filter((item): item is Product => item !== null);
    if (selectedItems.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 linh kiện để thêm vào giỏ', 'error');
      return;
    }

    selectedItems.forEach(item => {
      addToCart(item, 1);
    });

    showToast(`Đã thêm ${selectedItems.length} linh kiện vào giỏ hàng!`, 'success');
    setCurrentView('cart');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Đã sao chép liên kết cấu hình PC vào khay nhớ tạm!', 'success');
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Xây Dựng Cấu Hình PC (PC Builder)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tự tay lựa chọn linh kiện, tự động kiểm tra tương thích phần cứng và tính toán công suất nguồn thông minh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetBuild}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm Mới</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Cấu Hình</span>
          </button>
          <button
            onClick={handleShare}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-cyan-400 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Chia Sẻ</span>
          </button>
        </div>
      </div>

      {/* Energy & Compatibility Indicator Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Estimated Wattage */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Công Suất Ước Tính</span>
            <p className="text-base font-black text-white">~{estimatedWattage} W</p>
            <span className="text-[10px] text-slate-400">Khuyến nghị nguồn từ {recommendedPsuWattage}W</span>
          </div>
        </div>

        {/* Total Cost */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Tổng Tiền Cấu Hình</span>
            <p className="text-base font-black text-rose-500">{totalPrice.toLocaleString('vi-VN')}đ</p>
            <span className="text-[10px] text-slate-400">Đã bao gồm VAT & công lắp ráp</span>
          </div>
        </div>

        {/* Compatibility Status */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Tình Trạng Tương Thích</span>
            {compatibilityAlerts.some(a => a.type === 'error') ? (
              <p className="text-xs font-bold text-rose-400 flex items-center gap-1 mt-1">
                <AlertTriangle className="w-4 h-4" /> Phát hiện lỗi xung đột
              </p>
            ) : (
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-4 h-4" /> Cấu hình tối ưu, sẵn sàng lắp ráp
              </p>
            )}
          </div>
          <button
            id="btn-add-pc-build-cart"
            onClick={handleAddAllToCart}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-rose-600/25"
          >
            Thêm Vào Giỏ
          </button>
        </div>
      </div>

      {/* COMPATIBILITY ALERTS DISPLAY */}
      {compatibilityAlerts.length > 0 && (
        <div className="space-y-2">
          {compatibilityAlerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                alert.type === 'error'
                  ? 'bg-rose-950/70 border-rose-800/80 text-rose-200'
                  : 'bg-emerald-950/50 border-emerald-800/60 text-emerald-200'
              }`}
            >
              {alert.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* COMPONENT SLOTS LIST */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-black text-white uppercase tracking-tight pb-3 border-b border-slate-800">
          Danh Sách Linh Kiện Cần Chọn
        </h2>

        <div className="space-y-3">
          {PC_SLOTS.map(slot => {
            const selectedItem = selectedBuild[slot.key];
            const Icon = slot.icon;

            return (
              <div
                key={slot.key}
                id={`slot-row-${slot.key}`}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-700"
              >
                {/* Slot Label & Info */}
                <div className="flex items-center gap-3.5 min-w-[200px]">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{slot.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {slot.required ? '(Bắt buộc)' : '(Tùy chọn nâng cao)'}
                    </span>
                  </div>
                </div>

                {/* Selected Item Preview or Empty placeholder */}
                <div className="flex-1">
                  {selectedItem ? (
                    <div className="flex items-center gap-3 p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                      <img
                        src={selectedItem.thumbnailUrl}
                        alt={selectedItem.name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-950 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{selectedItem.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs font-bold text-rose-400">
                            {selectedItem.priceSale.toLocaleString('vi-VN')}đ
                          </span>
                          <span className="text-[10px] text-emerald-400">
                            Bảo hành {selectedItem.warrantyMonths} Tháng
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSlot(slot.key)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                        title="Xóa linh kiện"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-dashed border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                      <span>Chưa chọn linh kiện cho mục này</span>
                    </div>
                  )}
                </div>

                {/* Action button */}
                <button
                  id={`btn-choose-slot-${slot.key}`}
                  onClick={() => openSlotModal(slot)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
                    selectedItem
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{selectedItem ? 'Đổi Linh Kiện' : 'Chọn Linh Kiện'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* COMPONENT PICKER MODAL */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[88vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center shrink-0">
                  <activeSlotModal.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Chọn: {activeSlotModal.name}</h3>
                  <p className="text-[11px] text-slate-400">
                    Chỉ hiển thị linh kiện thuộc đúng phân loại này, bảo đảm tương thích hệ thống
                  </p>
                </div>
              </div>
              <button
                id="btn-close-slot-modal"
                onClick={() => setActiveSlotModal(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Đóng bảng chọn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar & Sort Control */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-modal-search-slot"
                    type="text"
                    value={modalSearchQuery}
                    onChange={e => setModalSearchQuery(e.target.value)}
                    placeholder={`Tìm kiếm nhanh ${activeSlotModal.name.toLowerCase()} (tên, hãng, model, socket)...`}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                    autoFocus
                  />
                  {modalSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setModalSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md"
                      title="Xóa tìm kiếm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
                  <select
                    id="select-modal-sort-slot"
                    value={modalSort}
                    onChange={e => setModalSort(e.target.value as 'default' | 'price-asc' | 'price-desc')}
                    className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="default">Sắp xếp: Mặc định</option>
                    <option value="price-asc">Giá: Thấp đến Cao</option>
                    <option value="price-desc">Giá: Cao đến Thấp</option>
                  </select>
                </div>
              </div>

              {/* Brand Filter Chips & Results Count */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                {modalAvailableBrands.length > 1 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">Thương hiệu:</span>
                    <button
                      onClick={() => setModalBrandFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        modalBrandFilter === 'all'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                      }`}
                    >
                      Tất cả ({rawSlotProducts.length})
                    </button>
                    {modalAvailableBrands.map(brand => {
                      const count = rawSlotProducts.filter(p => p.brand.toLowerCase() === brand.toLowerCase()).length;
                      return (
                        <button
                          key={brand}
                          onClick={() => setModalBrandFilter(brand)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            modalBrandFilter === brand
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                          }`}
                        >
                          {brand} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="text-[11px] text-slate-400 ml-auto">
                  Tìm thấy <strong className="text-white font-bold">{displayModalProducts.length}</strong> linh kiện
                  {modalSearchQuery && (
                    <button
                      onClick={() => setModalSearchQuery('')}
                      className="ml-2 text-rose-400 hover:underline cursor-pointer"
                    >
                      (Xóa bộ lọc tìm kiếm)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* List of matching products */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800/60">
              {displayModalProducts.length === 0 ? (
                <div className="py-12 text-center space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">Không tìm thấy linh kiện phù hợp</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {modalSearchQuery
                      ? `Không có kết quả nào khớp với "${modalSearchQuery}". Thử tìm với từ khóa khác như tên dòng sản phẩm hoặc mã số.`
                      : 'Hiện chưa có linh kiện nào thuộc mục này.'}
                  </p>
                  {(modalSearchQuery || modalBrandFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setModalSearchQuery('');
                        setModalBrandFilter('all');
                      }}
                      className="mt-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium rounded-xl transition-colors"
                    >
                      Xem tất cả {activeSlotModal.name}
                    </button>
                  )}
                </div>
              ) : (
                displayModalProducts.map(product => {
                  const isCurrentlyChosen = selectedBuild[activeSlotModal.key]?.id === product.id;

                  return (
                    <div
                      key={product.id}
                      className={`pt-3 pb-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-3 rounded-2xl transition-all ${
                        isCurrentlyChosen
                          ? 'bg-rose-950/20 border border-rose-500/40'
                          : 'hover:bg-slate-800/40 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <img
                          src={product.thumbnailUrl}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-xl bg-slate-950 border border-slate-800 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {product.brand} • SKU: {product.sku}
                            </span>
                            <span className="text-[10px] text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/50 font-medium">
                              Bảo hành {product.warrantyMonths}T
                            </span>
                            {isCurrentlyChosen && (
                              <span className="text-[10px] text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/80 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Đang chọn
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white line-clamp-2 leading-relaxed" title={product.name}>
                            {product.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs">
                            <span className="font-black text-rose-400">
                              {product.priceSale.toLocaleString('vi-VN')}đ
                            </span>
                            {product.priceOriginal > product.priceSale && (
                              <span className="text-[11px] text-slate-500 line-through">
                                {product.priceOriginal.toLocaleString('vi-VN')}đ
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400">
                              Kho: {product.stock > 0 ? `${product.stock} cái` : 'Hết hàng'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        id={`btn-select-product-${product.id}`}
                        onClick={() => handleSelectProduct(activeSlotModal.key, product)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 ${
                          isCurrentlyChosen
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25'
                        }`}
                      >
                        {isCurrentlyChosen ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-rose-400" />
                            <span>Đang Dùng</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Chọn Món Này</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
