import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  ShoppingBag,
  Heart,
  Award,
  ShieldCheck,
  MapPin,
  Lock,
  RotateCcw,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Trash2,
  ShoppingCart,
  Sparkles,
  Eye,
  EyeOff,
  KeyRound,
  Check,
} from 'lucide-react';
import { Order } from '../../types';

export const AccountPage: React.FC = () => {
  const {
    currentUser,
    orders,
    cancelOrder,
    products,
    wishlist,
    toggleWishlist,
    addToCart,
    setSelectedProductId,
    currentView,
    setCurrentView,
    accountActiveTab,
    setAccountActiveTab,
    navigateToAccountTab,
    updateUserProfile,
    changePassword,
    showToast,
    isLoggedIn,
    setIsAuthModalOpen,
    setAuthModalTab,
  } = useApp();

  const activeTab = accountActiveTab;
  const setActiveTab = (tab: 'orders' | 'profile' | 'wishlist' | 'loyalty' | 'addresses') => {
    navigateToAccountTab(tab);
  };

  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('ALL');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);

  // Profile edit states
  const [profileName, setProfileName] = useState(currentUser.fullName);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');
  const [profileAddress, setProfileAddress] = useState(currentUser.address || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Sync profile when currentUser changes
  useEffect(() => {
    setProfileName(currentUser.fullName);
    setProfilePhone(currentUser.phone || '');
    setProfileAddress(currentUser.address || '');
  }, [currentUser.id, currentUser.fullName, currentUser.phone, currentUser.address]);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('Họ và tên không được để trống', 'error');
      return;
    }
    setIsUpdatingProfile(true);
    updateUserProfile({
      fullName: profileName.trim(),
      phone: profilePhone.trim(),
      address: profileAddress.trim(),
    });
    setTimeout(() => setIsUpdatingProfile(false), 300);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordSuccess('Đổi mật khẩu thành công! Mật khẩu mới đã được lưu.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.message || 'Mật khẩu hiện tại không chính xác.');
      }
    } catch {
      setPasswordError('Có lỗi xảy ra khi đổi mật khẩu.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Cancellation modal state (NO window.confirm to support iFrame sandbox!)
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Thay đổi địa chỉ giao hàng hoặc thông tin nhận hàng');
  const [customCancelReason, setCustomCancelReason] = useState<string>('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  // Address book local state
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: currentUser.fullName,
      phone: currentUser.phone || '0988667788',
      address: 'Số 102 Đường Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội',
      isDefault: true,
    },
    {
      id: 2,
      name: currentUser.fullName,
      phone: '0912345678',
      address: 'Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM',
      isDefault: false,
    },
  ]);

  // Status normalizer to map varying statuses (PROCESSING -> CONFIRMED, COMPLETED -> DELIVERED, etc.)
  const normalizeStatus = (status?: string): 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' => {
    if (!status) return 'PENDING';
    const s = String(status).toUpperCase().trim();
    if (s === 'PENDING' || s === 'WAITING' || s.includes('CHỜ') || s.includes('CHO_XAC_NHAN')) {
      return 'PENDING';
    }
    if (s === 'CONFIRMED' || s === 'PROCESSING' || s === 'PREPARING' || s.includes('XÁC NHẬN') || s.includes('XỬ LÝ') || s.includes('DA_XAC_NHAN')) {
      return 'CONFIRMED';
    }
    if (s === 'SHIPPING' || s === 'DELIVERING' || s.includes('GIAO') || s.includes('VẬN CHUYỂN') || s.includes('DANG_GIAO')) {
      return 'SHIPPING';
    }
    if (s === 'DELIVERED' || s === 'COMPLETED' || s === 'SUCCESS' || s.includes('THÀNH CÔNG') || s.includes('ĐÃ GIAO') || s.includes('HOAN_THANH')) {
      return 'DELIVERED';
    }
    if (s === 'CANCELLED' || s === 'CANCELED' || s.includes('HỦY') || s.includes('DA_HUY')) {
      return 'CANCELLED';
    }
    return 'PENDING';
  };

  // Wishlist products
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  // User orders (includes all user's orders, plus demo orders for full visibility)
  const userOrders = orders.filter(o => {
    if (currentUser.role === 'ADMIN' || currentUser.role === 'STAFF') return true;
    return (
      o.userId === currentUser.id ||
      o.phone === currentUser.phone ||
      o.shippingPhone === currentUser.phone ||
      o.userId === 3 ||
      o.userId === 1
    );
  });

  // Calculate counts for each status tab
  const countPending = userOrders.filter(o => normalizeStatus(o.orderStatus || o.status) === 'PENDING').length;
  const countConfirmed = userOrders.filter(o => normalizeStatus(o.orderStatus || o.status) === 'CONFIRMED').length;
  const countShipping = userOrders.filter(o => normalizeStatus(o.orderStatus || o.status) === 'SHIPPING').length;
  const countDelivered = userOrders.filter(o => normalizeStatus(o.orderStatus || o.status) === 'DELIVERED').length;
  const countCancelled = userOrders.filter(o => normalizeStatus(o.orderStatus || o.status) === 'CANCELLED').length;

  const filteredOrders = userOrders.filter(o => {
    if (orderFilterStatus === 'ALL') return true;
    return normalizeStatus(o.orderStatus || o.status) === orderFilterStatus;
  });

  const getStatusBadge = (status?: string) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case 'PENDING':
        return (
          <span className="bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-amber-500/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Chờ xác nhận
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-blue-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác nhận
          </span>
        );
      case 'SHIPPING':
        return (
          <span className="bg-cyan-500/20 text-cyan-400 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-cyan-500/30 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" /> Đang giao hàng
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Giao thành công
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-rose-500/20 text-rose-400 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-rose-500/30 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Đã hủy đơn
          </span>
        );
    }
  };

  const handleConfirmCancelOrder = async () => {
    if (!cancellingOrder) return;
    setIsSubmittingCancel(true);
    try {
      const finalReason = cancelReason === 'Lý do khác' && customCancelReason.trim()
        ? customCancelReason.trim()
        : cancelReason;

      await cancelOrder(cancellingOrder.id, finalReason);

      // Update selectedOrderDetail if it's currently open
      if (selectedOrderDetail && (String(selectedOrderDetail.id) === String(cancellingOrder.id) || selectedOrderDetail.orderCode === cancellingOrder.orderCode)) {
        setSelectedOrderDetail({
          ...selectedOrderDetail,
          status: 'CANCELLED',
          orderStatus: 'CANCELLED',
          note: finalReason ? `${selectedOrderDetail.note ? selectedOrderDetail.note + ' | ' : ''}Lý do hủy: ${finalReason}` : selectedOrderDetail.note,
        });
      }

      setCancellingOrder(null);
      setCustomCancelReason('');
    } catch (err) {
      showToast('Có lỗi xảy ra khi hủy đơn hàng, vui lòng thử lại', 'error');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleReorder = (order: Order) => {
    order.items.forEach(it => {
      const prod = products.find(p => p.id === it.productId);
      if (prod) {
        addToCart(prod, it.quantity);
      }
    });
    showToast(`Đã thêm ${order.items.length} sản phẩm vào giỏ hàng!`, 'success');
    setCurrentView('cart');
  };

  return (
    <div className="space-y-8 font-sans">
      {/* GUEST MODE NOTICE BANNER */}
      {!isLoggedIn && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-amber-500/40 space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Chế Độ Khách Vãng Lai</h3>
                <p className="text-xs text-slate-400">Bạn chưa đăng nhập tài khoản GearTech</p>
              </div>
            </div>
            <button
              onClick={() => {
                setAuthModalTab('login');
                setIsAuthModalOpen(true);
              }}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/30 whitespace-nowrap"
            >
              Đăng Nhập / Đăng Ký Ngay
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed pt-1">
            Đăng nhập tài khoản để quản lý lịch sử đơn hàng, điểm thưởng VIP và thông tin cá nhân. Nếu bạn đã mua hàng không cần tài khoản, bạn có thể tra cứu trạng thái đơn hàng bằng Số Điện Thoại tại mục <strong className="text-emerald-400 cursor-pointer hover:underline" onClick={() => setCurrentView('warranty-lookup')}>Tra Cứu Đơn Hàng</strong>.
          </p>
        </div>
      )}

      {/* User Header Profile Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-600/30">
            {currentUser.fullName.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">{currentUser.fullName}</h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                Thành Viên VIP
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{currentUser.email} • {currentUser.phone}</p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> {currentUser.points} Điểm Tích Lũy
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold">Ưu đãi giảm 2% mọi đơn hàng</span>
            </div>
          </div>
        </div>

        {/* Quick nav tabs */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 flex-wrap">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Đơn Hàng ({userOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'wishlist' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Yêu Thích ({wishlist.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'addresses' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Sổ Địa Chỉ</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'profile' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hồ Sơ & Mật Khẩu</span>
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'loyalty' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Điểm Thưởng VIP ({currentUser.points})</span>
          </button>
        </div>
      </div>

      {/* 1. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order Status Filters with live badge counts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {[
              { key: 'ALL', label: 'Tất Cả Đơn', count: userOrders.length },
              { key: 'PENDING', label: 'Chờ Xác Nhận', count: countPending },
              { key: 'CONFIRMED', label: 'Đã Xác Nhận', count: countConfirmed },
              { key: 'SHIPPING', label: 'Đang Vận Chuyển', count: countShipping },
              { key: 'DELIVERED', label: 'Giao Thành Công', count: countDelivered },
              { key: 'CANCELLED', label: 'Đã Hủy', count: countCancelled },
            ].map(tab => (
              <button
                key={tab.key}
                id={`tab-order-${tab.key.toLowerCase()}`}
                onClick={() => setOrderFilterStatus(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  orderFilterStatus === tab.key
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    orderFilterStatus === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => {
                const normStatus = normalizeStatus(order.orderStatus || order.status);
                const canCancel = ['PENDING', 'CONFIRMED'].includes(normStatus);

                return (
                  <div
                    key={order.id}
                    id={`order-card-${order.id}`}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">
                            {order.orderCode || `#${order.id}`}
                          </span>
                          {getStatusBadge(order.orderStatus || order.status)}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')} lúc {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • Thanh toán {order.paymentMethod} ({order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thu tiền'})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setSelectedOrderDetail(order)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                        >
                          Xem Chi Tiết & Timeline
                        </button>

                        {canCancel && (
                          <button
                            id={`btn-cancel-order-${order.id}`}
                            onClick={() => {
                              setCancellingOrder(order);
                              setCancelReason('Thay đổi địa chỉ giao hàng hoặc thông tin nhận hàng');
                              setCustomCancelReason('');
                            }}
                            className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Hủy Đơn Hàng</span>
                          </button>
                        )}

                        {normStatus === 'CANCELLED' && (
                          <button
                            onClick={() => handleReorder(order)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-800/40 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Mua Lại Đơn Này</span>
                          </button>
                        )}

                        {normStatus === 'DELIVERED' && (
                          <button
                            onClick={() => handleReorder(order)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-800/40 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Đặt Mua Lại</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Cancellation Note if cancelled */}
                    {normStatus === 'CANCELLED' && order.note && (
                      <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Đơn hàng đã được hủy</p>
                          <p className="text-slate-300 text-[11px] mt-0.5">{order.note}</p>
                        </div>
                      </div>
                    )}

                    {/* Items in order */}
                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div key={item.productId} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.productThumbnail}
                              alt={item.productName}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800"
                            />
                            <div>
                              <p className="font-bold text-white">{item.productName}</p>
                              <span className="text-[11px] text-slate-400">
                                Số lượng: {item.quantity} x {(item.unitPrice ?? item.price ?? 0).toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          </div>
                          <span className="font-black text-white">
                            {((item.unitPrice ?? item.price ?? 0) * item.quantity).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total & Summary footer */}
                    <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="text-slate-400">
                        Giao tới: <strong className="text-slate-200">{order.shippingAddress}</strong>
                      </span>
                      <div className="flex items-baseline gap-2 self-end">
                        <span className="text-slate-400">Tổng tiền đơn hàng:</span>
                        <span className="text-base font-black text-rose-500">
                          {order.totalAmount.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-xs text-slate-400 space-y-3">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-sm font-semibold text-slate-300">Không tìm thấy đơn hàng nào ở trạng thái này</p>
                <p className="text-slate-500">
                  {orderFilterStatus !== 'ALL'
                    ? 'Bạn có thể bấm vào tab "Tất Cả Đơn" để xem toàn bộ lịch sử đơn hàng của mình.'
                    : 'Hãy khám phá sản phẩm và đặt hàng ngay hôm nay!'}
                </p>
                {orderFilterStatus !== 'ALL' && (
                  <button
                    onClick={() => setOrderFilterStatus('ALL')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Xem Tất Cả Đơn Hàng
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. WISHLIST TAB */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-white uppercase tracking-tight">
            Sản Phẩm Yêu Thích Của Bạn ({wishlistProducts.length})
          </h3>

          {wishlistProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {wishlistProducts.map(p => (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between group hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="relative rounded-xl overflow-hidden bg-slate-950 h-36 mb-3">
                      <img src={p.thumbnailUrl} alt={p.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg"
                        title="Bỏ thích"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.brand}</span>
                    <h4
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setCurrentView('product-detail');
                      }}
                      className="text-xs font-bold text-white hover:text-rose-400 cursor-pointer line-clamp-2 mt-1"
                    >
                      {p.name}
                    </h4>
                    <div className="text-sm font-black text-rose-500 mt-2">
                      {p.priceSale.toLocaleString('vi-VN')}đ
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(p, 1)}
                    className="w-full mt-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Thêm Vào Giỏ Hàng</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-xs text-slate-400">
              Bạn chưa lưu sản phẩm nào vào danh sách yêu thích. Hãy bấm biểu tượng trái tim để lưu lại linh kiện mong muốn!
            </div>
          )}
        </div>
      )}

      {/* 3. ADDRESSES TAB */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white uppercase tracking-tight">Sổ Địa Chỉ Giao Hàng</h3>
            <button
              onClick={() => showToast('Chức năng thêm địa chỉ mới đã sẵn sàng', 'info')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
            >
              + Thêm Địa Chỉ Mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(addr => (
              <div key={addr.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 relative">
                {addr.isDefault && (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Mặc định
                  </span>
                )}
                <div>
                  <p className="text-sm font-bold text-white">{addr.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">SĐT: {addr.phone}</p>
                </div>
                <p className="text-xs text-slate-300">{addr.address}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PROFILE & SECURITY TAB */}
      {activeTab === 'profile' && (
        <div className="max-w-3xl space-y-6">
          {/* Card 1: Thông Tin Cá Nhân */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-rose-600/20">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">Hồ Sơ Cá Nhân</h3>
                  <p className="text-xs text-slate-400">Cập nhật thông tin định danh và giao nhận hàng</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Vai trò: <strong className="text-rose-400">{currentUser.role}</strong>
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Hoạt động
                </span>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-profile-name"
                    type="text"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="Nhập họ và tên..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Số điện thoại</label>
                  <input
                    id="input-profile-phone"
                    type="text"
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    placeholder="09xx xxx xxx"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Địa chỉ Email đăng nhập
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Cố định
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Email dùng làm tài khoản đăng nhập chính của hệ thống.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Địa chỉ giao hàng mặc định
                </label>
                <input
                  id="input-profile-address"
                  type="text"
                  value={profileAddress}
                  onChange={e => setProfileAddress(e.target.value)}
                  placeholder="Địa chỉ số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  id="btn-save-profile"
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-2"
                >
                  {isUpdatingProfile ? (
                    <span>Đang lưu...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Cập Nhật Thông Tin Hồ Sơ</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Đổi Mật Khẩu Bảo Mật */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                    Đổi Mật Khẩu Đăng Nhập
                  </h3>
                  <p className="text-xs text-slate-400">
                    Bảo mật tài khoản của bạn với mật khẩu mới có tối thiểu 6 ký tự
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 self-start sm:self-auto">
                Tài khoản: {currentUser.email}
              </span>
            </div>

            {/* Success Message Banner */}
            {passwordSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {/* Error Message Banner */}
            {passwordError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Mật khẩu hiện tại <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Mặc định demo: <strong className="text-slate-300 font-semibold">{currentUser.password || (currentUser.role === 'ADMIN' ? 'admin' : currentUser.role === 'STAFF' ? 'staff' : 'user')}</strong>
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="input-current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => {
                      setCurrentPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Nhập mật khẩu đang sử dụng..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    title={showCurrentPassword ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => {
                      setNewPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    title={showNewPassword ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Độ mạnh mật khẩu:</span>
                      <span
                        className={`font-bold ${
                          newPassword.length < 6
                            ? 'text-rose-400'
                            : newPassword.length < 9
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {newPassword.length < 6
                          ? 'Yếu (Quá ngắn)'
                          : newPassword.length < 9
                          ? 'Trung bình'
                          : 'Mạnh & An toàn'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex gap-1">
                      <div
                        className={`h-full flex-1 rounded-full transition-all ${
                          newPassword.length > 0
                            ? newPassword.length < 6
                              ? 'bg-rose-500'
                              : 'bg-emerald-500'
                            : 'bg-slate-800'
                        }`}
                      />
                      <div
                        className={`h-full flex-1 rounded-full transition-all ${
                          newPassword.length >= 6
                            ? newPassword.length < 9
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                            : 'bg-slate-800'
                        }`}
                      />
                      <div
                        className={`h-full flex-1 rounded-full transition-all ${
                          newPassword.length >= 9 ? 'bg-emerald-500' : 'bg-slate-800'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Xác nhận lại mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => {
                      setConfirmPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Nhập lại chính xác mật khẩu mới bên trên..."
                    className={`w-full bg-slate-950 border rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-rose-500 focus:border-rose-400'
                        : confirmPassword && confirmPassword === newPassword
                        ? 'border-emerald-500 focus:border-emerald-400'
                        : 'border-slate-800 focus:border-rose-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {confirmPassword && (
                  <p
                    className={`text-[11px] mt-1 flex items-center gap-1 ${
                      confirmPassword === newPassword ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {confirmPassword === newPassword ? (
                      <>
                        <Check className="w-3 h-3" /> Mật khẩu xác nhận đã trùng khớp
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" /> Mật khẩu xác nhận chưa khớp
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  id="btn-submit-change-password"
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-2"
                >
                  {isChangingPassword ? (
                    <span>Đang cập nhật...</span>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Xác Nhận Đổi Mật Khẩu</span>
                    </>
                  )}
                </button>
                {(currentPassword || newPassword || confirmPassword) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError(null);
                      setPasswordSuccess(null);
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
                  >
                    Hủy bỏ
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. LOYALTY & REWARDS TAB */}
      {activeTab === 'loyalty' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-900/40 border border-amber-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-6 h-6 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Hạng Thành Viên: VIP Gold Member
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {currentUser.points.toLocaleString('vi-VN')}{' '}
                  <span className="text-amber-400 text-lg sm:text-xl font-bold">GT-Points</span>
                </h2>
                <p className="text-xs text-slate-300 mt-2 max-w-lg">
                  Tích lũy 1 GT-Point cho mỗi 10.000đ chi tiêu. Đổi điểm lấy phiếu mua hàng giảm giá trực tiếp và các đặc quyền dịch vụ kỹ thuật VIP độc quyền!
                </p>
              </div>

              <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 min-w-[240px] space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Tiến trình nâng hạng:</span>
                  <strong className="text-amber-400">75%</strong>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Cần thêm 500 điểm để thăng hạng <strong>VIP Diamond</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Special VIP Privileges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Giảm Trực Tiếp 2%
              </span>
              <p className="text-xs text-slate-300">
                Áp dụng giảm thêm 2% trên tổng hóa đơn linh kiện hoặc PC build mới.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> Miễn Phí Vận Chuyển Hỏa Tốc
              </span>
              <p className="text-xs text-slate-300">
                Giao hàng 2H trong nội thành Hà Nội & TP.HCM hoàn toàn miễn phí.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Bảo Hành Ưu Tiên 1 Đổi 1
              </span>
              <p className="text-xs text-slate-300">
                Đổi ngay sản phẩm mới trong 30 ngày nếu lỗi NSX không cần chờ thẩm định lâu.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAIL TIMELINE MODAL */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">Chi Tiết Đơn Hàng {selectedOrderDetail.id}</h3>
                <p className="text-xs text-slate-400">
                  Thời gian đặt: {new Date(selectedOrderDetail.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                Đóng
              </button>
            </div>

            {/* Cancellation or Timeline State */}
            {normalizeStatus(selectedOrderDetail.orderStatus || selectedOrderDetail.status) === 'CANCELLED' ? (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs space-y-2 text-rose-300">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Đơn hàng này đã bị hủy</span>
                </div>
                <p className="text-slate-300">
                  {selectedOrderDetail.note || 'Lý do: Khách hàng yêu cầu hủy đơn trên hệ thống.'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Nếu bạn đã thanh toán trực tuyến qua VNPAY, khoản tiền sẽ được hoàn về tài khoản của bạn trong 2-3 ngày làm việc theo quy định ngân hàng.
                </p>
              </div>
            ) : (
              /* Timeline progress steps */
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-slate-300 block mb-3 uppercase tracking-wider">
                  Hành Trình Vận Đơn
                </span>
                <div className="flex items-center justify-between relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold z-10">
                      ✓
                    </div>
                    <span className="text-[10px] text-slate-300 font-semibold mt-1">Đã Đặt</span>
                  </div>

                  <div className={`h-0.5 flex-1 ${['CONFIRMED', 'SHIPPING', 'DELIVERED'].includes(normalizeStatus(selectedOrderDetail.orderStatus || selectedOrderDetail.status)) ? 'bg-emerald-600' : 'bg-slate-800'}`} />

                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                      ['CONFIRMED', 'SHIPPING', 'DELIVERED'].includes(normalizeStatus(selectedOrderDetail.orderStatus || selectedOrderDetail.status)) ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
                    }`}>
                      2
                    </div>
                    <span className="text-[10px] text-slate-300 font-semibold mt-1">Xác Nhận</span>
                  </div>

                  <div className={`h-0.5 flex-1 ${['SHIPPING', 'DELIVERED'].includes(normalizeStatus(selectedOrderDetail.orderStatus || selectedOrderDetail.status)) ? 'bg-emerald-600' : 'bg-slate-800'}`} />

                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                      ['SHIPPING', 'DELIVERED'].includes(normalizeStatus(selectedOrderDetail.orderStatus || selectedOrderDetail.status)) ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
                    }`}>
                      3
                    </div>
                    <span className="text-[10px] text-slate-300 font-semibold mt-1">Vận Chuyển</span>
                  </div>

                  <div className={`h-0.5 flex-1 ${normalizeStatus(selectedOrderDetail.orderStatus || selectedOrderDetail.status) === 'DELIVERED' ? 'bg-emerald-600' : 'bg-slate-800'}`} />

                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                      normalizeStatus(selectedOrderDetail.orderStatus || selectedOrderDetail.status) === 'DELIVERED' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
                    }`}>
                      4
                    </div>
                    <span className="text-[10px] text-slate-300 font-semibold mt-1">Thành Công</span>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Items list */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white block">Sản phẩm trong kiện hàng:</span>
              {selectedOrderDetail.items.map(it => (
                <div key={it.productId} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={it.productThumbnail} alt={it.productName} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <span className="font-bold text-white block">{it.productName}</span>
                      <span className="text-slate-400">Số lượng: {it.quantity} x {(it.unitPrice ?? it.price ?? 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                  <span className="font-bold text-white">{((it.unitPrice ?? it.price ?? 0) * it.quantity).toLocaleString('vi-VN')}đ</span>
                </div>
              ))}
            </div>

            {/* Shipping & Payment summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 text-slate-300">
              <p><strong>Người nhận:</strong> {selectedOrderDetail.shippingName} ({selectedOrderDetail.shippingPhone})</p>
              <p><strong>Địa chỉ giao:</strong> {selectedOrderDetail.shippingAddress}</p>
              <p><strong>Phương thức:</strong> {selectedOrderDetail.shippingMethod} • Thanh toán: {selectedOrderDetail.paymentMethod}</p>
              <p><strong>Tổng thanh toán:</strong> <strong className="text-rose-400 text-sm">{selectedOrderDetail.totalAmount.toLocaleString('vi-VN')}đ</strong></p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {['PENDING', 'CONFIRMED'].includes(normalizeStatus(selectedOrderDetail.orderStatus || selectedOrderDetail.status)) && (
                <button
                  id="modal-btn-cancel-order"
                  onClick={() => {
                    setCancellingOrder(selectedOrderDetail);
                    setCancelReason('Thay đổi địa chỉ giao hàng hoặc thông tin nhận hàng');
                    setCustomCancelReason('');
                  }}
                  className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Hủy Đơn Hàng Này</span>
                </button>
              )}

              {normalizeStatus(selectedOrderDetail.orderStatus || selectedOrderDetail.status) === 'CANCELLED' && (
                <button
                  onClick={() => {
                    handleReorder(selectedOrderDetail);
                    setSelectedOrderDetail(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Đặt Mua Lại Đơn Này</span>
                </button>
              )}

              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED CANCEL ORDER CONFIRMATION MODAL (Safe for iFrame - No window.confirm) */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Xác Nhận Hủy Đơn Hàng</h3>
                  <p className="text-xs text-rose-400 font-mono font-semibold">
                    {cancellingOrder.orderCode || `#${cancellingOrder.id}`} • {cancellingOrder.totalAmount.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCancellingOrder(null)}
                disabled={isSubmittingCancel}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Warning info */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-slate-200">
                Bạn có chắc chắn muốn hủy đơn hàng này không?
              </p>
              <p className="text-[11px] text-slate-400">
                Sau khi hủy, trạng thái đơn sẽ chuyển sang <strong className="text-rose-400">"Đã Hủy"</strong> và sản phẩm sẽ được hoàn trả lại kho hàng.
              </p>
            </div>

            {/* Cancellation reasons selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-200 block">
                Vui lòng chọn lý do hủy đơn:
              </label>

              {[
                'Thay đổi địa chỉ giao hàng hoặc thông tin nhận hàng',
                'Muốn thay đổi sản phẩm hoặc màu sắc khác',
                'Tìm thấy mức giá hoặc mã giảm giá tốt hơn',
                'Thời gian giao hàng dự kiến không phù hợp',
                'Đổi ý, không còn nhu cầu mua sản phẩm nữa',
                'Lý do khác',
              ].map(reasonOption => (
                <label
                  key={reasonOption}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    cancelReason === reasonOption
                      ? 'bg-rose-950/30 border-rose-600/70 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReasonRadio"
                    value={reasonOption}
                    checked={cancelReason === reasonOption}
                    onChange={() => setCancelReason(reasonOption)}
                    className="accent-rose-600"
                  />
                  <span>{reasonOption}</span>
                </label>
              ))}

              {cancelReason === 'Lý do khác' && (
                <textarea
                  value={customCancelReason}
                  onChange={e => setCustomCancelReason(e.target.value)}
                  placeholder="Vui lòng chia sẻ lý do chi tiết để GearTech cải thiện dịch vụ..."
                  rows={2}
                  className="w-full mt-2 p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                disabled={isSubmittingCancel}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                Giữ Lại Đơn Hàng
              </button>

              <button
                type="button"
                id="btn-confirm-cancel-order"
                onClick={handleConfirmCancelOrder}
                disabled={isSubmittingCancel}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                {isSubmittingCancel ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang Hủy Đơn...</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Xác Nhận Hủy Đơn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
