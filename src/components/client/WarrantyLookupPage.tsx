import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Search,
  Calendar,
  AlertCircle,
  Clock,
  Wrench,
  CheckCircle,
  Copy,
  Phone,
  User,
  Printer,
  Sparkles,
  ChevronRight,
  RefreshCw,
  MessageSquare,
  Box,
  Truck,
  Lock,
  ShieldAlert,
  Plus,
  ArrowRight,
  Check,
  X,
  Info,
} from 'lucide-react';
import { WarrantyRecord } from '../../types';

export const WarrantyLookupPage: React.FC = () => {
  const {
    warrantyRecords,
    currentUser,
    orders,
    setCurrentView,
    showToast,
    addWarrantyRecord,
    addWarrantyHistory,
    setAdminActiveTab,
  } = useApp();

  // Role permissions check
  const isStaffOrAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'STAFF';
  const isCustomer = !isStaffOrAdmin;

  // My devices computation (belonging strictly to current customer by phone, full name, or order codes)
  const myDevices = useMemo(() => {
    const userPhoneClean = (currentUser?.phone || '').replace(/\s+/g, '');
    const userNameClean = (currentUser?.fullName || '').toLowerCase().trim();

    return warrantyRecords.filter(r => {
      const recPhoneClean = (r.customerPhone || '').replace(/\s+/g, '');
      const recNameClean = (r.customerName || '').toLowerCase().trim();

      const matchPhone = userPhoneClean && recPhoneClean === userPhoneClean;
      const matchName = userNameClean && recNameClean === userNameClean;
      const matchOrder = orders.some(
        o => (o.userId === currentUser?.id || o.phone.replace(/\s+/g, '') === userPhoneClean) &&
             o.orderCode === r.orderCode
      );

      return matchPhone || matchName || matchOrder;
    });
  }, [currentUser, warrantyRecords, orders]);

  // Tab state: Customers default to 'my-devices', Staff/Admin default to 'all-records'
  const [activeTab, setActiveTab] = useState<'my-devices' | 'search' | 'all-records' | 'policy'>(
    isStaffOrAdmin ? 'all-records' : 'my-devices'
  );

  // Search input: prefilled with current user's phone or first device's serial
  const [searchInput, setSearchInput] = useState<string>(() => {
    if (isStaffOrAdmin) return '';
    return currentUser?.phone || '0988123456';
  });

  const [hasSearched, setHasSearched] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<WarrantyRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');

  // Staff/Admin Modals
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const [isAddHistoryModalOpen, setIsAddHistoryModalOpen] = useState(false);
  const [newRecordForm, setNewRecordForm] = useState({
    serialNumber: '',
    productName: '',
    brand: 'ASUS ROG',
    customerName: '',
    customerPhone: '',
    orderCode: '',
    warrantyMonths: 36,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 36 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    thumbnailUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600',
  });
  const [newHistoryForm, setNewHistoryForm] = useState({
    date: new Date().toISOString().split('T')[0],
    issue: '',
    result: 'Đã kiểm tra và bàn giao hoàn hảo',
    staffName: currentUser?.fullName || 'Kỹ thuật viên',
  });

  // Switch tab default when role changes
  useEffect(() => {
    if (isCustomer) {
      if (activeTab === 'all-records') {
        setActiveTab('my-devices');
      }
      if (!searchInput && currentUser?.phone) {
        setSearchInput(currentUser.phone);
      }
    }
  }, [currentUser?.role, isCustomer]);

  // Remaining days calculation
  const getRemainingDays = (endDateStr: string) => {
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  // Calculate percentage of warranty period consumed
  const getWarrantyProgress = (startDateStr: string, endDateStr: string) => {
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    if (now >= end) return 100;
    if (now <= start) return 0;
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  // Searchable records: all registered warranty records can be looked up by serial/phone/order
  const searchableRecords = useMemo(() => {
    return warrantyRecords;
  }, [warrantyRecords]);

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchInput.trim()) {
      return isCustomer && myDevices.length > 0 ? myDevices : warrantyRecords;
    }
    const term = searchInput.trim().toLowerCase();
    const termClean = term.replace(/\s+/g, '');

    return searchableRecords.filter(r => {
      const matchSerial = r.serialNumber?.toLowerCase().includes(term);
      const matchPhone = r.customerPhone?.replace(/\s+/g, '').includes(termClean);
      const matchName = r.customerName?.toLowerCase().includes(term);
      const matchProduct = r.productName?.toLowerCase().includes(term);
      const matchOrder = r.orderCode?.toLowerCase().includes(term);
      return matchSerial || matchPhone || matchName || matchProduct || matchOrder;
    });
  }, [searchInput, searchableRecords, isCustomer, myDevices, warrantyRecords]);

  // Active record to show detail for (defaults to first match if search result exists)
  const activeDetailRecord =
    selectedRecord && searchableRecords.some(r => r.id === selectedRecord.id)
      ? selectedRecord
      : searchResults.length > 0
      ? searchResults[0]
      : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      showToast('Vui lòng nhập số Serial, SĐT hoặc Mã đơn hàng để tra cứu', 'error');
      return;
    }
    setHasSearched(true);
    setActiveTab('search');

    if (searchResults.length > 0) {
      setSelectedRecord(searchResults[0]);
      showToast(
        `Đã tìm thấy ${searchResults.length} thiết bị bảo hành phù hợp!`,
        'success'
      );
    } else {
      setSelectedRecord(null);
      showToast('Không tìm thấy thiết bị nào phù hợp trong danh sách của bạn', 'info');
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép ${label}: ${text}`, 'success');
  };

  const handleSelectRecord = (record: WarrantyRecord) => {
    setSelectedRecord(record);
    setActiveTab('search');
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans pb-16">
      {/* 1. Header banner */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
          <ShieldCheck className="w-4 h-4" />
          <span>HỆ THỐNG BẢO HÀNH ĐIỆN TỬ GEARTECH 2026</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Tra Cứu Thông Tin Bảo Hành Trực Tuyến
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Tra cứu thời hạn bảo hành, lịch sử tiếp nhận sửa chữa và chính sách đổi mới bằng Số Serial, SĐT hoặc Mã đơn hàng
        </p>
      </div>

      {/* 2. Search Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              id="warranty-search-input"
              type="text"
              value={searchInput}
              onChange={e => {
                setSearchInput(e.target.value);
                setHasSearched(true);
              }}
              placeholder="Nhập số Serial thiết bị (VD: SN-VGA-4090-001), SĐT mua hàng hoặc mã đơn..."
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-emerald-500 rounded-2xl pl-12 pr-10 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSelectedRecord(null);
                }}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 text-xs px-1.5 py-0.5 rounded bg-slate-800"
              >
                Xóa
              </button>
            )}
          </div>
          <button
            id="btn-warranty-submit"
            type="submit"
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Kiểm Tra Ngay</span>
          </button>
        </form>

        {/* Quick Suggestions */}
        <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap pt-1 border-t border-slate-800/80">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Gợi ý tra cứu nhanh:
          </span>

          <button
            type="button"
            onClick={() => {
              setSearchInput(currentUser?.phone || '0988123456');
              setHasSearched(true);
              setActiveTab('search');
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 border border-slate-700 text-[11px] text-slate-300 font-medium transition-colors"
          >
            SĐT ({currentUser?.phone || '0988123456'})
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchInput('SN-VGA-4090-001');
              setHasSearched(true);
              setActiveTab('search');
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 border border-slate-700 text-[11px] text-slate-300 font-mono transition-colors"
          >
            SN-VGA-4090-001 (RTX 4090)
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchInput('SN-CYBER-4090-8891');
              setHasSearched(true);
              setActiveTab('search');
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 border border-slate-700 text-[11px] text-slate-300 font-mono transition-colors"
          >
            SN-CYBER-4090 (PC Gaming)
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchInput('SN-PC-7800-002');
              setHasSearched(true);
              setActiveTab('search');
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 border border-slate-700 text-[11px] text-slate-300 font-mono transition-colors"
          >
            SN-PC-7800-002 (PC Ryzen 7)
          </button>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1">
        {/* Customer view prioritizes 'my-devices' */}
        <button
          onClick={() => setActiveTab('my-devices')}
          className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'my-devices'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>
            {isCustomer
              ? `Thiết Bị Của Tôi (${myDevices.length})`
              : `Thiết Bị Của Tôi (${myDevices.length})`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'search'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>
            Kết Quả Tra Cứu ({searchResults.length})
          </span>
        </button>

        {/* Tab 3: System Database — ONLY VISIBLE TO STAFF & ADMIN */}
        {isStaffOrAdmin ? (
          <button
            onClick={() => setActiveTab('all-records')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'all-records'
                ? 'border-purple-500 text-purple-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-4 h-4 text-purple-400" />
            <span>Toàn Bộ Hệ Thống ({warrantyRecords.length})</span>
            <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800">
              Admin & Staff
            </span>
          </button>
        ) : (
          <div className="px-3 py-2 text-xs text-slate-500 flex items-center gap-1.5 opacity-60 cursor-not-allowed">
            <Lock className="w-3.5 h-3.5" />
            <span>Toàn Hệ Thống (Chỉ NV/Admin)</span>
          </div>
        )}

        <button
          onClick={() => setActiveTab('policy')}
          className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'policy'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Chính Sách & Quy Trình</span>
        </button>

        {/* Staff / Admin Quick Action: Add Record */}
        {isStaffOrAdmin && (
          <button
            onClick={() => setIsAddRecordModalOpen(true)}
            className="ml-auto px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Phiếu Bảo Hành</span>
          </button>
        )}
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: THIẾT BỊ CỦA TÔI */}
      {activeTab === 'my-devices' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Danh Sách Thiết Bị Của Bạn ({myDevices.length} sản phẩm)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chủ tài khoản: <strong className="text-slate-200">{currentUser?.fullName}</strong> • SĐT: <strong className="text-emerald-400">{currentUser?.phone}</strong>
              </p>
            </div>

            <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              Chế độ bảo mật: <span className="text-emerald-400 font-bold">Riêng tư khách hàng</span>
            </div>
          </div>

          {myDevices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myDevices.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSelectRecord(item)}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.productName}
                      className="w-14 h-14 rounded-2xl object-cover bg-slate-950 border border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-extrabold text-cyan-400 uppercase">
                        {item.brand}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {item.productName}
                      </h4>
                      <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                        S/N: {item.serialNumber}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Hết hạn: <strong>{new Date(item.endDate).toLocaleDateString('vi-VN')}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 text-[11px] font-bold border border-emerald-700/50">
                      Còn {getRemainingDays(item.endDate)} ngày
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <Box className="w-12 h-12 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">Chưa Có Thiết Bị Nào Được Đăng Ký Bảo Hành</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tài khoản <strong>{currentUser?.fullName}</strong> ({currentUser?.phone}) hiện chưa ghi nhận đơn hàng hoặc serial nào trong cơ sở dữ liệu.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setCurrentView('catalog')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  Khám Phá Linh Kiện & Dàn PC Mới
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KẾT QUẢ TRA CỨU CHI TIẾT */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {activeDetailRecord ? (
            <div className="space-y-6">
              {/* Detailed Electronic Certificate Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Title & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        activeDetailRecord.thumbnailUrl ||
                        'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=200'
                      }
                      alt={activeDetailRecord.productName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-700 bg-slate-950 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                          {activeDetailRecord.brand || 'GearTech Verified'}
                        </span>
                        {activeDetailRecord.orderCode && (
                          <span className="text-[10px] font-bold text-cyan-400">
                            Đơn hàng #{activeDetailRecord.orderCode}
                          </span>
                        )}
                      </div>
                      <h2 className="text-base sm:text-xl font-black text-white mt-1 leading-snug">
                        {activeDetailRecord.productName}
                      </h2>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-slate-400">Số Serial:</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                          {activeDetailRecord.serialNumber}
                        </span>
                        <button
                          onClick={() => handleCopy(activeDetailRecord.serialNumber, 'Số Serial')}
                          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                          title="Sao chép S/N"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                    {activeDetailRecord.status === 'ACTIVE' &&
                    getRemainingDays(activeDetailRecord.endDate) > 0 ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-400 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-900/30">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>Đang Còn Hạn Bảo Hành</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-950/90 border border-rose-500/60 text-rose-400 font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-900/30">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span>Đã Hết Hạn Bảo Hành</span>
                      </div>
                    )}
                    <span className="text-[11px] text-slate-400 mt-1">
                      Thời hạn bảo hành:{' '}
                      <strong>{activeDetailRecord.warrantyMonths || 36} tháng</strong> chính hãng
                    </span>
                  </div>
                </div>

                {/* Progress Bar for warranty remaining */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      Tiến trình thời gian bảo hành:
                    </span>
                    <span className="text-emerald-400 font-black">
                      {getRemainingDays(activeDetailRecord.endDate) > 0
                        ? `Còn lại ${getRemainingDays(activeDetailRecord.endDate)} ngày`
                        : 'Hết hạn bảo hành'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        getRemainingDays(activeDetailRecord.endDate) > 90
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : getRemainingDays(activeDetailRecord.endDate) > 0
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${getWarrantyProgress(
                          activeDetailRecord.startDate,
                          activeDetailRecord.endDate
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>
                      Kích hoạt:{' '}
                      {new Date(activeDetailRecord.startDate).toLocaleDateString('vi-VN')}
                    </span>
                    <span>
                      Đã trôi qua:{' '}
                      {getWarrantyProgress(
                        activeDetailRecord.startDate,
                        activeDetailRecord.endDate
                      )}
                      %
                    </span>
                    <span>
                      Hết hạn:{' '}
                      {new Date(activeDetailRecord.endDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Information Metrics 4 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày mua hàng
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      {new Date(activeDetailRecord.startDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> Ngày hết hạn
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      {new Date(activeDetailRecord.endDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" /> Chủ sở hữu
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white truncate">
                      {activeDetailRecord.customerName || 'Khách hàng'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-rose-400" /> SĐT đăng ký
                    </span>
                    <p className="text-xs sm:text-sm font-mono font-bold text-white">
                      {activeDetailRecord.customerPhone || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Service / Maintenance History */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-cyan-400" />
                      <span>
                        Nhật Ký Bảo Trì & Sửa Chữa (
                        {activeDetailRecord.history?.length || 0})
                      </span>
                    </h3>

                    <div className="flex items-center gap-2">
                      {/* Staff & Admin can add history entries */}
                      {isStaffOrAdmin && (
                        <button
                          onClick={() => setIsAddHistoryModalOpen(true)}
                          className="px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Ghi nhận sửa chữa
                        </button>
                      )}

                      <button
                        onClick={() => setCurrentView('service-booking')}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Đặt lịch vệ sinh PC miễn phí
                      </button>
                    </div>
                  </div>

                  {activeDetailRecord.history && activeDetailRecord.history.length > 0 ? (
                    <div className="space-y-2.5">
                      {activeDetailRecord.history.map((hist: any, index: number) => (
                        <div
                          key={hist.id || index}
                          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-400">
                            <span className="font-semibold text-slate-300">
                              Lần tiếp nhận: <strong>{hist.date}</strong>
                            </span>
                            <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700/60 inline-flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" />
                              {hist.result}
                            </span>
                          </div>
                          <p className="text-slate-300">
                            <strong>Nội dung yêu cầu / Hiện tượng:</strong> {hist.issue}
                          </p>
                          {hist.staffName && (
                            <p className="text-[11px] text-slate-400">
                              Kỹ thuật viên phụ trách:{' '}
                              <span className="text-cyan-300">{hist.staffName}</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>
                        Sản phẩm chưa từng phát sinh lỗi hoặc tiếp nhận sửa chữa nào. Tình trạng hoạt động hoàn hảo 100%.
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setCurrentView('service-booking')}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-md shadow-emerald-600/20"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Đặt Lịch Vệ Sinh & Bảo Dưỡng Miễn Phí</span>
                  </button>

                  <button
                    onClick={() => {
                      const chatBtn = document.getElementById('btn-floating-store-chat');
                      if (chatBtn) chatBtn.click();
                    }}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 border border-slate-700"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Yêu Cầu Hỗ Trợ Kỹ Thuật (Chat)</span>
                  </button>

                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors flex items-center gap-2 border border-slate-700 ml-auto"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In Phiếu Bảo Hành Điện Tử</span>
                  </button>
                </div>
              </div>

              {/* Other matching results in the allowed scope */}
              {searchResults.length > 1 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {isCustomer
                      ? `Các thiết bị khác của bạn (${searchResults.length}):`
                      : `Các thiết bị khác cùng kết quả tìm kiếm (${searchResults.length}):`}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchResults
                      .filter(r => r.id !== activeDetailRecord.id)
                      .map(record => (
                        <div
                          key={record.id}
                          onClick={() => handleSelectRecord(record)}
                          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer flex items-center gap-3.5 group"
                        >
                          <img
                            src={record.thumbnailUrl}
                            alt={record.productName}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                              {record.productName}
                            </h4>
                            <p className="text-[11px] font-mono text-emerald-400 mt-0.5">
                              SN: {record.serialNumber}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              Hạn: {new Date(record.endDate).toLocaleDateString('vi-VN')} • Còn{' '}
                              {getRemainingDays(record.endDate)} ngày
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-white">
                Không Tìm Thấy Thiết Bị Với Từ Khóa: "{searchInput}"
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                {isCustomer
                  ? 'Quý khách vui lòng kiểm tra lại số Serial hoặc mã đơn hàng trên tài khoản của bạn. Nhằm bảo mật, hệ thống không hiển thị thiết bị của khách hàng khác.'
                  : 'Không tìm thấy thiết bị nào trong cơ sở dữ liệu toàn hệ thống khớp với từ khóa trên.'}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (isCustomer) {
                      setSearchInput(currentUser?.phone || '0988123456');
                      setActiveTab('my-devices');
                    } else {
                      setSearchInput('');
                      setActiveTab('all-records');
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />{' '}
                  {isCustomer ? 'Xem Danh Sách Thiết Bị Của Tôi' : 'Xem Toàn Bộ Hệ Thống'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TOÀN BỘ HỆ THỐNG (ONLY ADMIN & STAFF) */}
      {activeTab === 'all-records' && isStaffOrAdmin && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-950/30 p-4 rounded-2xl border border-purple-800/40">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-purple-400" />
                <span>Toàn Bộ Cơ Sở Dữ Liệu Bảo Hành ({warrantyRecords.length} thiết bị)</span>
              </h3>
              <p className="text-xs text-purple-300/80 mt-0.5">
                Chế độ quản trị: Cho phép nhân viên và admin tra cứu, kiểm tra lịch sử và sửa chữa thiết bị của mọi khách hàng.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tất cả ({warrantyRecords.length})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Còn hạn ({warrantyRecords.filter(r => r.status === 'ACTIVE').length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {warrantyRecords
              .filter(r => (statusFilter === 'ALL' ? true : r.status === statusFilter))
              .map(record => (
                <div
                  key={record.id}
                  onClick={() => handleSelectRecord(record)}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/60 transition-all cursor-pointer group flex items-center gap-3.5 shadow-sm"
                >
                  <img
                    src={record.thumbnailUrl}
                    alt={record.productName}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase">
                        {record.brand}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
                        Còn {getRemainingDays(record.endDate)} ngày
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate mt-0.5 group-hover:text-purple-400 transition-colors">
                      {record.productName}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      S/N: <strong className="text-slate-200">{record.serialNumber}</strong> • Khách:{' '}
                      <span className="text-amber-300 font-sans font-semibold">{record.customerName}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      SĐT: {record.customerPhone} • Mã đơn: #{record.orderCode || 'N/A'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: CHÍNH SÁCH & QUY TRÌNH BẢO HÀNH */}
      {activeTab === 'policy' && (
        <div className="space-y-6">
          {/* 4 Cam Kết Vàng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-black">
                1:1
              </div>
              <h4 className="text-sm font-bold text-white">1 Đổi 1 Trong 30 Ngày</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Đổi sản phẩm mới 100% nguyên seal nếu linh kiện phát sinh lỗi phần cứng từ nhà sản xuất trong 30 ngày đầu tiên.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Bảo Hành Tận Nơi 2H</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kỹ thuật viên GearTech đến kiểm tra, nhận và trả bảo hành tận nhà tại khu vực nội thành TP.HCM, Hà Nội & Đà Nẵng.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Cho Mượn Linh Kiện Thay Thế</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cung cấp VGA, RAM, CPU tương đương để quý khách sử dụng làm việc, chơi game không bị gián đoạn trong lúc chờ hãng xử lý.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Vệ Sinh PC Miễn Phí Trọn Đời</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Miễn phí bảo dưỡng, thổi bụi, tra keo tản nhiệt gốm cao cấp và cân chỉnh airflow trọn vòng đời sản phẩm.
              </p>
            </div>
          </div>

          {/* Quy Trình Tiếp Nhận 4 Bước */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Quy Trình Xử Lý Bảo Hành 4 Bước Siêu Tốc</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-black text-emerald-400">BƯỚC 1</span>
                <h5 className="text-xs font-bold text-white">Tra Cứu & Liên Hệ</h5>
                <p className="text-[11px] text-slate-400">
                  Kiểm tra Serial trực tuyến hoặc gọi Hotline 1800 6868 thông báo sự cố phần cứng.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-black text-cyan-400">BƯỚC 2</span>
                <h5 className="text-xs font-bold text-white">Tiếp Nhận Thiết Bị</h5>
                <p className="text-[11px] text-slate-400">
                  Kỹ thuật viên đến tận nhà lấy máy hoặc quý khách mang qua 1 trong 3 Showroom lớn.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-black text-amber-400">BƯỚC 3</span>
                <h5 className="text-xs font-bold text-white">Kiểm Tra & Đổi Mới / Sửa</h5>
                <p className="text-[11px] text-slate-400">
                  Test lỗi trong 24h. Đổi mới linh kiện ngay lập tức hoặc gửi hãng sửa chữa chính ngạch.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-black text-purple-400">BƯỚC 4</span>
                <h5 className="text-xs font-bold text-white">Bàn Giao & Bảo Trì</h5>
                <p className="text-[11px] text-slate-400">
                  Vệ sinh máy sạch sẽ, dán tem bảo hành mới và giao tận tay quý khách hoàn toàn miễn phí.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAFF/ADMIN MODAL: THÊM PHIẾU BẢO HÀNH */}
      {isAddRecordModalOpen && isStaffOrAdmin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>Thêm Phiếu Bảo Hành Mới Vào Hệ Thống</span>
              </h3>
              <button
                onClick={() => setIsAddRecordModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newRecordForm.serialNumber.trim() || !newRecordForm.productName.trim()) {
                  showToast('Vui lòng nhập Serial và Tên sản phẩm', 'error');
                  return;
                }
                addWarrantyRecord({
                  serialNumber: newRecordForm.serialNumber.trim().toUpperCase(),
                  productName: newRecordForm.productName.trim(),
                  brand: newRecordForm.brand,
                  customerName: newRecordForm.customerName.trim() || 'Khách Hàng',
                  customerPhone: newRecordForm.customerPhone.trim() || '0900000000',
                  orderCode: newRecordForm.orderCode.trim() || `GT-${Date.now().toString().slice(-6)}`,
                  startDate: newRecordForm.startDate,
                  endDate: newRecordForm.endDate,
                  warrantyMonths: Number(newRecordForm.warrantyMonths) || 36,
                  status: 'ACTIVE',
                  thumbnailUrl: newRecordForm.thumbnailUrl,
                  history: [],
                });
                setIsAddRecordModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Số Serial (S/N) *</label>
                <input
                  type="text"
                  value={newRecordForm.serialNumber}
                  onChange={e => setNewRecordForm({ ...newRecordForm, serialNumber: e.target.value })}
                  placeholder="VD: SN-VGA-5090-001"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tên Sản Phẩm / Dàn Máy *</label>
                <input
                  type="text"
                  value={newRecordForm.productName}
                  onChange={e => setNewRecordForm({ ...newRecordForm, productName: e.target.value })}
                  placeholder="VD: VGA MSI RTX 4070Ti Super 16GB Gaming X Slim"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Thương Hiệu</label>
                  <input
                    type="text"
                    value={newRecordForm.brand}
                    onChange={e => setNewRecordForm({ ...newRecordForm, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Thời Hạn (Tháng)</label>
                  <input
                    type="number"
                    value={newRecordForm.warrantyMonths}
                    onChange={e => setNewRecordForm({ ...newRecordForm, warrantyMonths: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Họ Tên Khách Hàng</label>
                  <input
                    type="text"
                    value={newRecordForm.customerName}
                    onChange={e => setNewRecordForm({ ...newRecordForm, customerName: e.target.value })}
                    placeholder="VD: Lê Thị Mai"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={newRecordForm.customerPhone}
                    onChange={e => setNewRecordForm({ ...newRecordForm, customerPhone: e.target.value })}
                    placeholder="VD: 0912345678"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Ngày Bắt Đầu</label>
                  <input
                    type="date"
                    value={newRecordForm.startDate}
                    onChange={e => setNewRecordForm({ ...newRecordForm, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Ngày Hết Hạn</label>
                  <input
                    type="date"
                    value={newRecordForm.endDate}
                    onChange={e => setNewRecordForm({ ...newRecordForm, endDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddRecordModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow"
                >
                  Lưu Vào Hệ Thống
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAFF/ADMIN MODAL: THÊM NHẬT KÝ SỬA CHỮA / BẢO DƯỠNG */}
      {isAddHistoryModalOpen && isStaffOrAdmin && activeDetailRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-purple-400" />
                <span>Ghi Nhận Bảo Trì / Sửa Chữa</span>
              </h3>
              <button
                onClick={() => setIsAddHistoryModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              Thiết bị: <strong>{activeDetailRecord.productName}</strong>
              <div className="font-mono text-emerald-400 mt-0.5">
                S/N: {activeDetailRecord.serialNumber} • Khách: {activeDetailRecord.customerName}
              </div>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newHistoryForm.issue.trim()) {
                  showToast('Vui lòng nhập mô tả hiện tượng / yêu cầu', 'error');
                  return;
                }
                addWarrantyHistory(activeDetailRecord.id, {
                  date: newHistoryForm.date,
                  issue: newHistoryForm.issue.trim(),
                  result: newHistoryForm.result.trim(),
                  staffName: newHistoryForm.staffName.trim(),
                });
                setIsAddHistoryModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Ngày Tiếp Nhận</label>
                <input
                  type="date"
                  value={newHistoryForm.date}
                  onChange={e => setNewHistoryForm({ ...newHistoryForm, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Hiện Tượng / Lý Do Tiếp Nhận *</label>
                <textarea
                  rows={2}
                  value={newHistoryForm.issue}
                  onChange={e => setNewHistoryForm({ ...newHistoryForm, issue: e.target.value })}
                  placeholder="VD: Khách hàng yêu cầu vệ sinh định kỳ và kiểm tra quạt tản nhiệt..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Kết Quả Xử Lý *</label>
                <input
                  type="text"
                  value={newHistoryForm.result}
                  onChange={e => setNewHistoryForm({ ...newHistoryForm, result: e.target.value })}
                  placeholder="VD: Đã vệ sinh, thay keo tản nhiệt gốm, test full load 65°C đạt chuẩn"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Kỹ Thuật Viên Phụ Trách</label>
                <input
                  type="text"
                  value={newHistoryForm.staffName}
                  onChange={e => setNewHistoryForm({ ...newHistoryForm, staffName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddHistoryModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow"
                >
                  Lưu Nhật Ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
