import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Star,
  Ticket,
  Users,
  Layers,
  Warehouse,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Printer,
  Search,
  Check,
  X,
  CornerDownRight,
  Shield,
  ArrowUpRight,
  ShieldAlert,
  Lock,
  UserCheck,
  LogOut,
  MessageSquare,
  Send,
  Mail,
  Phone,
  CheckCheck,
  Clock,
  Sparkles,
  ShieldCheck,
  Wrench,
  ArrowUp,
  Flame,
  Zap,
  Database,
  RefreshCw,
  Workflow,
} from 'lucide-react';
import { Product, Order, Voucher, Review, Category, FLASH_SALE_TAB_OPTIONS } from '../../types';
import { SoaArchitectureTab } from './SoaArchitectureTab';

export const AdminPortal: React.FC = () => {
  const {
    adminActiveTab,
    setAdminActiveTab,
    products,
    categories,
    saveCategory,
    addCategory,
    deleteCategory,
    orders,
    reviews,
    vouchers,
    users,
    sections,
    inventoryLogs,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    addVoucher,
    deleteVoucher,
    replyReview,
    updateUserStatus,
    updateUserRole,
    toggleSection,
    restockProduct,
    setCurrentView,
    currentUser,
    logout,
    switchRole,
    showToast,
    conversations,
    activeChatId,
    setActiveChatId,
    totalUnreadForStaff,
    staffSendMessage,
    markConversationAsReadByStaff,
    markConversationAsUnreadByStaff,
    deleteConversation,
    toggleStarConversation,
    warrantyRecords,
    addWarrantyRecord,
    addWarrantyHistory,
  } = useApp();

  const mainRef = React.useRef<HTMLElement>(null);
  const [showAdminBackToTop, setShowAdminBackToTop] = useState(false);

  React.useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => {
      setShowAdminBackToTop(el.scrollTop > 280);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Search & Filter local states
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // Category management modal states
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({
    name: '',
    slug: '',
    parentId: null,
    icon: 'FolderTree',
    description: '',
  });

  // Chat management local states
  const [chatFilter, setChatFilter] = useState<'ALL' | 'UNREAD' | 'READ' | 'STARRED'>('ALL');
  const [chatSearch, setChatSearch] = useState('');
  const [chatReplyInput, setChatReplyInput] = useState('');

  // Review reply state
  const [activeReplyReviewId, setActiveReplyReviewId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // Voucher modal state
  const [newVoucher, setNewVoucher] = useState({
    code: '',
    description: '',
    discountType: 'PERCENT' as 'PERCENT' | 'FIXED',
    discountValue: 10,
    minOrderAmount: 2000000,
    maxDiscountAmount: 500000,
    usageLimit: 50,
    startDate: '2026-03-01',
    endDate: '2026-12-31',
  });
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // Quick Flash Sale Modal state
  const [isFlashSaleModalOpen, setIsFlashSaleModalOpen] = useState(false);
  const [quickFlashSaleProdId, setQuickFlashSaleProdId] = useState<number | null>(null);
  const [quickFlashSalePrice, setQuickFlashSalePrice] = useState<number>(0);
  const [quickFlashSaleStock, setQuickFlashSaleStock] = useState<number>(10);
  const [quickFlashSaleTab, setQuickFlashSaleTab] = useState<string>('DEAL_PHIM_CHUOT');

  // Restock modal state
  const [restockItem, setRestockItem] = useState<{ id: number; name: string; addQty: number; note: string } | null>(null);

  // Warranty management local states
  const [warrantySearch, setWarrantySearch] = useState('');
  const [warrantyStatusFilter, setWarrantyStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');
  const [selectedWarrantyRecord, setSelectedWarrantyRecord] = useState<any | null>(null);
  const [isAdminAddWarrantyOpen, setIsAdminAddWarrantyOpen] = useState(false);
  const [isAdminAddHistoryOpen, setIsAdminAddHistoryOpen] = useState(false);
  const [adminNewRecord, setAdminNewRecord] = useState({
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
  const [adminNewHistory, setAdminNewHistory] = useState({
    date: new Date().toISOString().split('T')[0],
    issue: '',
    result: 'Đã hoàn tất bảo trì, vệ sinh máy sạch sẽ, test full load ổn định',
    staffName: currentUser.fullName,
  });

  // Firebase Inspector state
  const [firebaseCollection, setFirebaseCollection] = useState<'products' | 'orders' | 'users' | 'conversations'>('products');
  const [firestoreDocs, setFirestoreDocs] = useState<any[]>([]);
  const [isLoadingFirestore, setIsLoadingFirestore] = useState(false);

  const fetchFirestoreData = async (colName: 'products' | 'orders' | 'users' | 'conversations') => {
    setIsLoadingFirestore(true);
    try {
      const querySnapshot = await getDocs(collection(db, colName));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFirestoreDocs(list);
      showToast(`Đã tải thành công ${list.length} tài liệu từ collection "${colName}" trên Firebase!`, 'success');
    } catch (err: any) {
      showToast(`Lỗi khi tải từ Firebase: ${err.message}`, 'error');
    } finally {
      setIsLoadingFirestore(false);
    }
  };

  React.useEffect(() => {
    if (adminActiveTab === 'firebase') {
      fetchFirestoreData(firebaseCollection);
    }
  }, [adminActiveTab, firebaseCollection]);

  // Computed metrics
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const lowStockProducts = products.filter(p => p.stock < 5);
  const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING');

  // Revenue chart simulation (7 recent days)
  const revenueByDay = [
    { day: 'T2', amount: 48500000 },
    { day: 'T3', amount: 62000000 },
    { day: 'T4', amount: 79000000 },
    { day: 'T5', amount: 54000000 },
    { day: 'T6', amount: 98000000 },
    { day: 'T7', amount: 145000000 },
    { day: 'CN', amount: 168000000 },
  ];
  const maxRev = Math.max(...revenueByDay.map(d => d.amount));

  // Handle Save Product (Create or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.priceSale) {
      showToast('Vui lòng nhập tên và giá bán sản phẩm', 'error');
      return;
    }

    const isFlash = !!editingProduct.isFlashSale;
    const pinnedSec = isFlash
      ? 'FLASH_SALE'
      : (editingProduct.pinnedSection && editingProduct.pinnedSection !== 'NONE' ? editingProduct.pinnedSection : 'NONE');

    if (editingProduct.id) {
      updateProduct({
        ...(editingProduct as Product),
        isFlashSale: isFlash,
        pinnedSection: pinnedSec as any,
        priceSale: Number(editingProduct.priceSale),
        priceOriginal: Number(editingProduct.priceOriginal) || Number(editingProduct.priceSale) * 1.15,
        stock: Number(editingProduct.stock),
        flashSaleTab: editingProduct.flashSaleTab || 'ALL',
      });
      showToast(isFlash ? 'Đã lưu sản phẩm & chuyển vào danh sách Flash Sale thành công!' : 'Đã cập nhật sản phẩm thành công!');
    } else {
      addProduct({
        name: editingProduct.name,
        sku: editingProduct.sku || `SKU-${Date.now().toString().slice(-4)}`,
        categoryId: editingProduct.categoryId || 1,
        categoryName: categories.find(c => c.id === editingProduct.categoryId)?.name || 'Linh Kiện',
        brand: editingProduct.brand || 'ASUS ROG',
        priceOriginal: Number(editingProduct.priceOriginal) || Number(editingProduct.priceSale) * 1.15,
        priceSale: Number(editingProduct.priceSale),
        stock: Number(editingProduct.stock) || 10,
        warrantyMonths: Number(editingProduct.warrantyMonths) || 36,
        thumbnailUrl: editingProduct.thumbnailUrl || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500',
        images: [editingProduct.thumbnailUrl || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500'],
        description: editingProduct.description || 'Sản phẩm chính hãng phân phối tại GearTech.',
        specs: editingProduct.specs || [
          { name: 'Thương hiệu', value: editingProduct.brand || 'ASUS' },
          { name: 'Bảo hành', value: '36 Tháng' },
        ],
        isFlashSale: isFlash,
        pinnedSection: pinnedSec as any,
        flashSaleTab: (editingProduct.flashSaleTab as any) || 'ALL',
      });
      showToast(isFlash ? 'Đã tạo sản phẩm mới & kích hoạt Flash Sale thành công!' : 'Đã thêm sản phẩm mới thành công!');
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // RBAC Access Gate: Only ADMIN and STAFF can access the Admin Portal
  if (currentUser.role === 'USER') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 mx-auto flex items-center justify-center shadow-lg shadow-rose-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30">
              Quyền Truy Cập Bị Giới Hạn
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">Khu Vực Quản Trị Hệ Thống</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bạn đang đăng nhập bằng tài khoản <strong className="text-emerald-400">Khách Hàng ({currentUser.fullName})</strong>. Cổng quản trị này chỉ cấp phép cho vai trò <strong className="text-rose-400">ADMIN</strong> hoặc <strong className="text-amber-400">STAFF</strong>.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              id="admin-btn-back-home"
              onClick={() => setCurrentView('home')}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Quay Lại Trang Mua Sắm (Khách Hàng)</span>
            </button>
            <button
              id="admin-btn-logout-switch"
              onClick={logout}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Đăng Xuất Để Đăng Nhập Tài Khoản Khác</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Admin Sub-bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-black text-white shadow-lg shadow-rose-600/30">
            GT
          </div>
          <div>
            <span className="text-sm font-extrabold text-white">
              GEARTECH <span className="text-rose-500">ADMIN PORTAL</span>
            </span>
            <p className="text-[10px] text-slate-400">Hệ thống quản trị bán hàng đa kênh & kho vận</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 hidden sm:inline">Tài khoản:</span>
            <strong className="text-xs text-white">{currentUser.fullName}</strong>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                currentUser.role === 'ADMIN'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {currentUser.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'NHÂN VIÊN'}
            </span>
          </div>

          <button
            id="admin-btn-view-client"
            onClick={() => setCurrentView('home')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow flex items-center gap-1.5"
          >
            <span>Về Website Khách Hàng</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            id="admin-btn-top-logout"
            onClick={logout}
            className="px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 text-rose-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* SIDEBAR NAVIGATION (10 Core Admin Tabs) */}
        <aside className="w-full md:w-64 bg-slate-900/80 border-r border-slate-800 p-4 space-y-1.5 shrink-0">
          {[
            { id: 'dashboard', label: '1. Tổng Quan (Dashboard)', icon: LayoutDashboard },
            { id: 'products', label: '2. Quản Lý Sản Phẩm', icon: Package },
            { id: 'categories', label: '3. Quản Lý Danh Mục', icon: FolderTree },
            { id: 'orders', label: '4. Quản Lý Đơn Hàng', icon: ShoppingBag, count: pendingOrders.length },
            { id: 'reviews', label: '5. Đánh Giá & Phản Hồi', icon: Star },
            { id: 'vouchers', label: '6. Khuyến Mãi & Flash Sale', icon: Ticket },
            {
              id: 'users',
              label: '7. Khách Hàng & Phân Quyền',
              icon: Users,
              adminOnly: currentUser.role === 'STAFF' ? 'Chỉ Admin' : undefined,
            },
            {
              id: 'sections',
              label: '8. Cấu Hình Trang Chủ',
              icon: Layers,
              adminOnly: currentUser.role === 'STAFF' ? 'Chỉ Admin' : undefined,
            },
            { id: 'inventory', label: '9. Quản Lý Kho Hàng', icon: Warehouse, alert: lowStockProducts.length > 0 },
            { id: 'reports', label: '10. Báo Cáo & Thống Kê', icon: BarChart3 },
            { id: 'chat', label: '11. Tin Nhắn & CSKH', icon: MessageSquare, count: totalUnreadForStaff },
            { id: 'warranty', label: '12. Bảo Hành & Sửa Chữa', icon: ShieldCheck, count: warrantyRecords.length },
            { id: 'firebase', label: '13. Dữ Liệu Firebase Firestore', icon: Database },
            { id: 'soa', label: '14. Kiến Trúc SOA (Bài Tập Lớn)', icon: Workflow },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = adminActiveTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`admin-tab-btn-${tab.id}`}
                onClick={() => setAdminActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25'
                    : 'text-slate-400 hover:bg-slate-800/90 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {tab.adminOnly && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-amber-400 font-semibold border border-amber-500/30">
                      {tab.adminOnly}
                    </span>
                  )}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                      {tab.count}
                    </span>
                  )}
                  {tab.alert && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </div>
              </button>
            );
          })}
        </aside>

        {/* MAIN ADMIN CONTENT AREA */}
        <main ref={mainRef} className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
          {/* TAB 14: SOA ARCHITECTURE (BÀI TẬP LỚN) */}
          {adminActiveTab === 'soa' && <SoaArchitectureTab />}

          {/* TAB 13: FIREBASE FIRESTORE DATA INSPECTOR */}
          {adminActiveTab === 'firebase' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Database className="w-6 h-6 text-rose-500" />
                    <span>Trình Khám Phá Dữ Liệu Firebase Firestore</span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Xem trực tiếp các collection và tài liệu đang được lưu trữ bảo mật trên đám mây Firebase (Project ID: <code className="text-rose-400 font-bold">zippy-anvil-bc70r</code>)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://console.firebase.google.com/project/zippy-anvil-bc70r/firestore"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all"
                  >
                    <span>Mở Firebase Console</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Collection selector buttons */}
              <div className="flex items-center gap-2 flex-wrap bg-slate-900 p-3 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 mr-2">Chọn Collection:</span>
                {(['products', 'orders', 'users', 'conversations'] as const).map(col => (
                  <button
                    key={col}
                    onClick={() => setFirebaseCollection(col)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      firebaseCollection === col
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    /{col}
                  </button>
                ))}
                <button
                  onClick={() => fetchFirestoreData(firebaseCollection)}
                  className="ml-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tải Lại Dữ Liệu</span>
                </button>
              </div>

              {/* Documents table / list */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Collection:</span>
                    <span className="text-rose-400">/{firebaseCollection}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                      {firestoreDocs.length} tài liệu
                    </span>
                  </h3>
                  {isLoadingFirestore && (
                    <span className="text-xs text-amber-400 font-semibold animate-pulse">Đang tải dữ liệu từ Firebase...</span>
                  )}
                </div>

                {firestoreDocs.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                      <Database className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-400">Không tìm thấy tài liệu nào trong collection này trên Firebase.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {firestoreDocs.map((doc, idx) => (
                      <div key={doc.id || idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-emerald-400">Document ID: {doc.id}</span>
                          <span className="text-[10px] text-slate-500 font-mono">Item #{idx + 1}</span>
                        </div>
                        <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/90 p-3 rounded-xl overflow-x-auto border border-slate-800">
                          {JSON.stringify(doc, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {adminActiveTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Tổng Quan Bán Hàng</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Báo cáo doanh thu, đơn hàng và kho bãi theo thời gian thực</p>
                </div>
                <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
                  Cập nhật: Hôm nay {new Date().toLocaleTimeString('vi-VN')}
                </span>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Doanh Thu Tháng Này
                  </span>
                  <p className="text-2xl font-black text-rose-500">{totalRevenue.toLocaleString('vi-VN')}đ</p>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <TrendingUp className="w-3 h-3" /> +18.4% so với tháng trước
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Đơn Hàng Mới Cần Xử Lý
                  </span>
                  <p className="text-2xl font-black text-amber-400">{pendingOrders.length}</p>
                  <span className="text-[11px] text-slate-400">
                    Tổng cộng: {orders.length} đơn hàng trong hệ thống
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cảnh Báo Sắp Hết Kho (&lt; 5)
                  </span>
                  <p className="text-2xl font-black text-rose-400">{lowStockProducts.length}</p>
                  <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Cần nhập bổ sung gấp
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tổng Khách Hàng
                  </span>
                  <p className="text-2xl font-black text-cyan-400">{users.length}</p>
                  <span className="text-[11px] text-slate-400">
                    {users.filter(u => u.status === 'ACTIVE').length} tài khoản đang hoạt động
                  </span>
                </div>
              </div>

              {/* Real Charts: 7-day revenue bar chart + Category breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 7-day Bar Chart */}
                <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Biểu Đồ Doanh Thu 7 Ngày Gần Nhất
                    </h3>
                    <span className="text-xs text-emerald-400 font-semibold">Tăng trưởng ổn định</span>
                  </div>

                  <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
                    {revenueByDay.map((d, i) => {
                      const heightPct = Math.round((d.amount / maxRev) * 100);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                          <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {(d.amount / 1000000).toFixed(1)}M
                          </span>
                          <div
                            className="w-full bg-gradient-to-t from-rose-600 to-amber-500 rounded-xl transition-all group-hover:brightness-125 shadow"
                            style={{ height: `${heightPct}%` }}
                          />
                          <span className="text-xs font-bold text-slate-300">{d.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Categories Chart */}
                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
                    Tỷ Trọng Doanh Thu
                  </h3>
                  <div className="space-y-3 pt-2 text-xs">
                    {[
                      { name: 'PC Gaming & Dàn Máy', pct: 45, color: 'bg-rose-500' },
                      { name: 'Card Màn Hình (VGA)', pct: 25, color: 'bg-amber-500' },
                      { name: 'Laptop Gaming', pct: 15, color: 'bg-cyan-500' },
                      { name: 'Gaming Gear & Màn Hình', pct: 15, color: 'bg-indigo-500' },
                    ].map((c, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-slate-300 font-medium">
                          <span>{c.name}</span>
                          <span className="font-bold text-white">{c.pct}%</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                          <div className={`${c.color} h-full rounded-full`} style={{ width: `${c.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5 Recent Orders Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Đơn Hàng Gần Đây Nhất
                  </h3>
                  <button
                    onClick={() => setAdminActiveTab('orders')}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Xem tất cả đơn &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="pb-3">Mã Đơn</th>
                        <th className="pb-3">Khách Hàng</th>
                        <th className="pb-3">Tổng Tiền</th>
                        <th className="pb-3">Thanh Toán</th>
                        <th className="pb-3">Trạng Thái</th>
                        <th className="pb-3 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id} className="hover:bg-slate-800/40">
                          <td className="py-3 font-mono font-bold text-white">{o.id}</td>
                          <td className="py-3">{o.shippingName}</td>
                          <td className="py-3 font-bold text-rose-400">{o.totalAmount.toLocaleString('vi-VN')}đ</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px]">
                              {o.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.orderStatus === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                              o.orderStatus === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-400' :
                              o.orderStatus === 'CANCELLED' ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'
                            }`}>
                              {o.orderStatus}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrderForInvoice(o);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px]"
                            >
                              In Phiếu
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT (CRUD) */}
          {adminActiveTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Quản Lý Sản Phẩm</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Thêm, sửa, xóa linh kiện, quản lý kho và flash sale</p>
                </div>
                <button
                  id="admin-btn-add-product"
                  onClick={() => {
                    if (currentUser.role === 'STAFF') {
                      showToast('Chỉ Quản Trị Viên (ADMIN) mới có quyền tạo sản phẩm mới', 'error');
                      return;
                    }
                    setEditingProduct({
                      name: '',
                      sku: `GT-${Math.floor(1000 + Math.random() * 9000)}`,
                      brand: 'ASUS ROG',
                      categoryId: 1,
                      priceOriginal: 25000000,
                      priceSale: 21990000,
                      stock: 15,
                      warrantyMonths: 36,
                      thumbnailUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500',
                      description: 'Mô tả chi tiết cấu hình và ưu đãi tặng kèm...',
                      specs: [
                        { name: 'Thương hiệu', value: 'ASUS ROG' },
                        { name: 'Thời hạn bảo hành', value: '36 Tháng' },
                      ],
                      isFlashSale: false,
                    });
                    setIsProductModalOpen(true);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 ${
                    currentUser.role === 'STAFF'
                      ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  {currentUser.role === 'STAFF' ? <Lock className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-white" />}
                  <span>Thêm Sản Phẩm Mới</span>
                </button>
              </div>

              {currentUser.role === 'STAFF' && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Chế độ Tra Cứu (STAFF):</strong> Bạn có quyền xem danh sách sản phẩm và tồn kho. Quyền Thêm/Sửa/Xóa sản phẩm thuộc về <strong>ADMIN</strong>.
                  </span>
                </div>
              )}

              {/* Search filter */}
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Tìm theo tên sản phẩm, mã SKU hoặc thương hiệu..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Product Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="pb-3">Sản Phẩm</th>
                      <th className="pb-3">SKU</th>
                      <th className="pb-3">Hãng</th>
                      <th className="pb-3">Giá Bán</th>
                      <th className="pb-3">Tồn Kho</th>
                      <th className="pb-3">Bảo Hành</th>
                      <th className="pb-3">Flash Sale</th>
                      <th className="pb-3 text-right">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {products
                      .filter(
                        p =>
                          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.brand.toLowerCase().includes(productSearch.toLowerCase())
                      )
                      .map(p => (
                        <tr key={p.id} className="hover:bg-slate-800/40">
                          <td className="py-3 flex items-center gap-3">
                            <img
                              src={p.thumbnailUrl}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-950 shrink-0"
                            />
                            <div className="min-w-0 max-w-xs">
                              <span className="font-bold text-white block truncate">{p.name}</span>
                              <span className="text-[10px] text-slate-400">{p.categoryName}</span>
                            </div>
                          </td>
                          <td className="py-3 font-mono text-[11px]">{p.sku}</td>
                          <td className="py-3 font-medium">{p.brand}</td>
                          <td className="py-3 font-bold text-rose-400">
                            {p.priceSale.toLocaleString('vi-VN')}đ
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.stock < 5 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              {p.stock} cái
                            </span>
                          </td>
                          <td className="py-3">{p.warrantyMonths}T</td>
                          <td className="py-3">
                            {p.isFlashSale ? (
                              <span className="text-amber-400 font-bold text-[11px]">Bật Deal</span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Tắt</span>
                            )}
                          </td>
                          <td className="py-3 text-right space-x-1.5">
                            <button
                              onClick={() => {
                                if (currentUser.role === 'STAFF') {
                                  showToast('Chỉ Quản Trị Viên (ADMIN) mới có quyền sửa sản phẩm', 'error');
                                  return;
                                }
                                setEditingProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 rounded-lg text-slate-300 transition-colors"
                              title={currentUser.role === 'STAFF' ? 'Chỉ ADMIN mới có quyền sửa' : 'Chỉnh sửa'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (currentUser.role === 'STAFF') {
                                  showToast('Chỉ Quản Trị Viên (ADMIN) mới có quyền xóa sản phẩm', 'error');
                                  return;
                                }
                                deleteProduct(p.id);
                                showToast(`Đã xóa sản phẩm "${p.name}"`, 'success');
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 rounded-lg text-slate-300 transition-colors"
                              title={currentUser.role === 'STAFF' ? 'Chỉ ADMIN mới có quyền xóa' : 'Xóa sản phẩm'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORY TREE */}
          {adminActiveTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Cây Danh Mục Đa Cấp</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Thêm, sửa, xóa danh mục sản phẩm, cấu hình slug và phân cấp cha - con</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={e => setCategorySearch(e.target.value)}
                      placeholder="Tìm danh mục..."
                      className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 w-48 sm:w-64"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (currentUser.role === 'STAFF') {
                        showToast('Chỉ Quản Trị Viên (ADMIN) mới có quyền tạo danh mục mới', 'error');
                        return;
                      }
                      setEditingCategory({
                        name: '',
                        slug: '',
                        parentId: null,
                        icon: 'FolderTree',
                        description: '',
                      });
                      setIsCategoryModalOpen(true);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-lg ${
                      currentUser.role === 'STAFF'
                        ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    }`}
                  >
                    {currentUser.role === 'STAFF' ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5 text-white" />}
                    <span>Thêm Danh Mục Mới</span>
                  </button>
                </div>
              </div>

              {/* Category Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories
                  .filter(cat => {
                    if (!categorySearch.trim()) return true;
                    const q = categorySearch.toLowerCase();
                    const matchParent = cat.name.toLowerCase().includes(q) || (cat.description && cat.description.toLowerCase().includes(q));
                    const matchChild = cat.children?.some(ch => ch.name.toLowerCase().includes(q));
                    return matchParent || matchChild;
                  })
                  .map(cat => (
                    <div key={cat.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl hover:border-slate-700 transition-all group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                            <FolderTree className="w-5 h-5 text-rose-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-base">{cat.name}</h3>
                              <span className="text-[10px] bg-slate-950 border border-slate-800 text-rose-400 font-mono px-2 py-0.5 rounded-md">
                                /{cat.slug}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{cat.description || 'Chưa có mô tả'}</p>
                          </div>
                        </div>

                        {/* Top-Level Category Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              if (currentUser.role === 'STAFF') {
                                showToast('Chỉ Quản Trị Viên (ADMIN) mới có quyền sửa danh mục', 'error');
                                return;
                              }
                              setEditingCategory({ ...cat });
                              setIsCategoryModalOpen(true);
                            }}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
                            title="Chỉnh sửa danh mục này"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (currentUser.role === 'STAFF') {
                                showToast('Chỉ Quản Trị Viên (ADMIN) mới có quyền xóa danh mục', 'error');
                                return;
                              }
                              if (window.confirm(`Xác nhận xóa danh mục "${cat.name}" và tất cả danh mục con trực thuộc?`)) {
                                deleteCategory(cat.id);
                              }
                            }}
                            className="p-2 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 rounded-xl transition-colors"
                            title="Xóa danh mục này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Subcategories Section */}
                      <div className="pt-3 border-t border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Danh Mục Con Trực Thuộc ({cat.children?.length || 0}):
                          </span>
                          <button
                            onClick={() => {
                              if (currentUser.role === 'STAFF') {
                                showToast('Chỉ Quản Trị Viên (ADMIN) mới có quyền tạo danh mục con', 'error');
                                return;
                              }
                              setEditingCategory({
                                name: '',
                                slug: '',
                                parentId: cat.id,
                                description: '',
                              });
                              setIsCategoryModalOpen(true);
                            }}
                            className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Thêm con</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {cat.children && cat.children.length > 0 ? (
                            cat.children.map(sub => (
                              <div
                                key={sub.id}
                                className="group/sub px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-rose-500/40 text-xs text-slate-300 flex items-center gap-2 transition-all"
                              >
                                <span>{sub.name}</span>
                                <span className="text-[9px] text-slate-500 font-mono">/{sub.slug}</span>
                                
                                <div className="flex items-center gap-1 pl-1 border-l border-slate-800 opacity-60 group-hover/sub:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      if (currentUser.role === 'STAFF') {
                                        showToast('Chỉ ADMIN mới có quyền sửa danh mục', 'error');
                                        return;
                                      }
                                      setEditingCategory({
                                        id: sub.id,
                                        name: sub.name,
                                        slug: sub.slug,
                                        parentId: cat.id,
                                        description: sub.description,
                                      });
                                      setIsCategoryModalOpen(true);
                                    }}
                                    className="p-1 hover:text-white rounded hover:bg-slate-800"
                                    title="Sửa danh mục con"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (currentUser.role === 'STAFF') {
                                        showToast('Chỉ ADMIN mới có quyền xóa danh mục', 'error');
                                        return;
                                      }
                                      if (window.confirm(`Xác nhận xóa danh mục con "${sub.name}"?`)) {
                                        deleteCategory(sub.id);
                                      }
                                    }}
                                    className="p-1 hover:text-rose-400 rounded hover:bg-slate-800"
                                    title="Xóa danh mục con"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="w-full py-2 px-3 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-center">
                              <span className="text-xs text-slate-500">Chưa có danh mục con. Nhấn "Thêm con" ở trên để tạo.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: ORDER MANAGEMENT */}
          {adminActiveTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Quản Lý Đơn Hàng</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Xác nhận, cập nhật trạng thái vận đơn và in phiếu xuất kho</p>
                </div>

                <div className="flex gap-2 overflow-x-auto">
                  {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'].map(st => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                        orderStatusFilter === st
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {orders
                  .filter(o => orderStatusFilter === 'ALL' || o.orderStatus === orderStatusFilter)
                  .map(order => (
                    <div
                      key={order.id}
                      className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black text-white">{order.id}</span>
                            <span className="text-xs font-bold text-rose-400">
                              {order.totalAmount.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Khách: <strong>{order.shippingName}</strong> ({order.shippingPhone}) • Địa chỉ: {order.shippingAddress}
                          </p>
                        </div>

                        {/* Order status changer dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Trạng thái:</span>
                          <select
                            value={order.orderStatus}
                            onChange={e => updateOrderStatus(order.id, e.target.value as any)}
                            className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer"
                          >
                            <option value="PENDING">Chờ xác nhận</option>
                            <option value="CONFIRMED">Đã xác nhận</option>
                            <option value="SHIPPING">Đang giao hàng</option>
                            <option value="DELIVERED">Đã giao thành công</option>
                            <option value="CANCELLED">Hủy đơn</option>
                          </select>

                          <button
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" /> In Phiếu
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {order.items.map(it => (
                          <div key={it.productId} className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl">
                            <img src={it.productThumbnail} alt={it.productName} className="w-8 h-8 rounded-lg object-cover" />
                            <div className="truncate">
                              <span className="text-white font-medium truncate block">{it.productName}</span>
                              <span className="text-slate-400 text-[10px]">SL: {it.quantity} x {(it.unitPrice ?? it.price ?? 0).toLocaleString('vi-VN')}đ</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 5: REVIEWS MODERATION */}
          {adminActiveTab === 'reviews' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h1 className="text-2xl font-black text-white tracking-tight">Quản Lý & Phản Hồi Đánh Giá</h1>
                <p className="text-xs text-slate-400 mt-0.5">Kiểm duyệt đánh giá của khách hàng và gửi câu trả lời chính thức từ Shop</p>
              </div>

              <div className="space-y-4">
                {reviews.map(rev => (
                  <div key={rev.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{rev.userName}</span>
                        <div className="flex text-amber-400 text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <span className="text-slate-400 text-xs font-semibold">({rev.productName})</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pl-1">{rev.comment}</p>

                    {rev.sellerReply ? (
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-cyan-300 flex items-start gap-2">
                        <CornerDownRight className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                        <div>
                          <strong>Shop đã trả lời:</strong> {rev.sellerReply}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {activeReplyReviewId === rev.id ? (
                          <div className="flex gap-2 pt-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder="Nhập nội dung phản hồi từ Shop..."
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                            />
                            <button
                              onClick={() => {
                                if (replyText.trim()) {
                                  replyReview(rev.id, replyText);
                                  setActiveReplyReviewId(null);
                                  setReplyText('');
                                }
                              }}
                              className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl"
                            >
                              Gửi
                            </button>
                            <button
                              onClick={() => setActiveReplyReviewId(null)}
                              className="px-3 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveReplyReviewId(rev.id);
                              setReplyText('');
                            }}
                            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                          >
                            <CornerDownRight className="w-3.5 h-3.5" /> Trả lời đánh giá này
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: VOUCHERS & FLASH SALE */}
          {adminActiveTab === 'vouchers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Ticket className="w-6 h-6 text-rose-500" />
                    Mã Giảm Giá & Flash Sale
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">Tạo mã voucher khuyến mãi và kích hoạt flash sale giờ vàng cho sản phẩm</p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => {
                      if (currentUser.role === 'STAFF') {
                        showToast('Chỉ Quản Trị Viên (ADMIN) mới có quyền phát hành voucher mới', 'error');
                        return;
                      }
                      setIsVoucherModalOpen(true);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg ${
                      currentUser.role === 'STAFF'
                        ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    }`}
                  >
                    {currentUser.role === 'STAFF' ? <Lock className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-white" />}
                    <span>Tạo Mã Voucher Mới</span>
                  </button>

                  <button
                    onClick={() => {
                      if (currentUser.role === 'STAFF') {
                        showToast('Chỉ Quản Trị Viên (ADMIN) mới có quyền bật Flash Sale mới', 'error');
                        return;
                      }
                      const defaultProduct = products[0];
                      if (defaultProduct) {
                        setQuickFlashSaleProdId(defaultProduct.id);
                        setQuickFlashSalePrice(defaultProduct.priceSale);
                        setQuickFlashSaleStock(defaultProduct.stock || 10);
                        setQuickFlashSaleTab(defaultProduct.flashSaleTab || 'DEAL_PHIM_CHUOT');
                      }
                      setIsFlashSaleModalOpen(true);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg ${
                      currentUser.role === 'STAFF'
                        ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                    }`}
                  >
                    {currentUser.role === 'STAFF' ? <Lock className="w-4 h-4 text-amber-400" /> : <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />}
                    <span>Tạo Flash Sale Mới</span>
                  </button>
                </div>
              </div>

              {currentUser.role === 'STAFF' && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Chế độ Tra Cứu (STAFF):</strong> Bạn có quyền xem danh sách voucher & Flash Sale đang hiệu lực. Quyền Phát hành voucher và Kích hoạt Flash Sale thuộc về <strong>ADMIN</strong>.
                  </span>
                </div>
              )}

              {/* Vouchers Section */}
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-rose-400" />
                  Mã Voucher Khuyến Mãi Đang Hoạt Động ({vouchers.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vouchers.map(v => (
                    <div key={v.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-black text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-800/60">
                          {v.code}
                        </span>
                        <button
                          onClick={() => {
                            if (currentUser.role === 'STAFF') {
                              showToast('Chỉ Quản Trị Viên (ADMIN) mới có quyền xóa voucher', 'error');
                              return;
                            }
                            deleteVoucher(v.id);
                            showToast(`Đã xóa voucher ${v.code}`, 'success');
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title={currentUser.role === 'STAFF' ? 'Chỉ ADMIN mới có quyền xóa' : 'Xóa voucher'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 font-semibold">{v.description}</p>
                      <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                        <p>Đơn tối thiểu: <strong>{(((v.minOrder ?? v.minOrderAmount ?? 0)) / 1000000).toFixed(1)} Triệu</strong></p>
                        <p>Đã dùng: <strong>{v.usedCount} / {v.usageLimit} lượt</strong></p>
                        <p>Hạn dùng: <strong>{v.endDate}</strong></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FLASH SALE PRODUCTS SECTION */}
              <div className="pt-6 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2">
                      <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
                      Danh Sách Sản Phẩm Flash Sale Đang Khuyến Mãi
                    </h2>
                    <p className="text-xs text-slate-400">
                      Các sản phẩm được bật huy hiệu Flash Sale sẽ xuất hiện tại mục Khuyến Mãi & Flash Sale ở trang chủ.
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-rose-950 text-rose-300 px-3 py-1 rounded-full border border-rose-800/80">
                    {products.filter(p => p.isFlashSale || p.pinnedSection === 'FLASH_SALE').length} Sản phẩm
                  </span>
                </div>

                {products.filter(p => p.isFlashSale || p.pinnedSection === 'FLASH_SALE').length === 0 ? (
                  <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
                    <Flame className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-300">Chưa có sản phẩm nào được bật Flash Sale hôm nay</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Bạn có thể tích chọn mục "Bật huy hiệu và đưa vào danh sách Flash Sale hôm nay" khi chỉnh sửa sản phẩm, hoặc nhấn nút <strong>Tạo Flash Sale Mới</strong> để đưa sản phẩm vào khuyến mãi nhanh chóng.
                    </p>
                    <button
                      onClick={() => {
                        if (products.length > 0) {
                          setQuickFlashSaleProdId(products[0].id);
                          setQuickFlashSalePrice(products[0].priceSale);
                          setQuickFlashSaleStock(products[0].stock || 10);
                          setQuickFlashSaleTab(products[0].flashSaleTab || 'DEAL_PHIM_CHUOT');
                        }
                        setIsFlashSaleModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs inline-flex items-center gap-2 mt-2 shadow-lg shadow-amber-600/30"
                    >
                      <Plus className="w-4 h-4" />
                      Tạo Flash Sale Mới Ngay
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products
                      .filter(p => p.isFlashSale || p.pinnedSection === 'FLASH_SALE')
                      .map(p => (
                        <div key={p.id} className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 relative group hover:border-rose-500/40 transition-all">
                          <div className="flex gap-3">
                            <img
                              src={p.thumbnailUrl}
                              alt={p.name}
                              className="w-16 h-16 object-cover rounded-2xl bg-slate-950 border border-slate-800 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                {p.brand} • SKU: {p.sku}
                              </span>
                              <h3 className="text-xs font-bold text-white truncate hover:text-rose-400 transition-colors">
                                {p.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-black text-rose-500">
                                  {p.priceSale.toLocaleString('vi-VN')}đ
                                </span>
                                {p.priceOriginal && p.priceOriginal > p.priceSale && (
                                  <span className="text-[11px] text-slate-500 line-through">
                                    {p.priceOriginal.toLocaleString('vi-VN')}đ
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                            <span>Kho còn: <strong className={p.stock <= 5 ? 'text-amber-400' : 'text-emerald-400'}>{p.stock}</strong> cái</span>
                            <span>Đã bán: <strong className="text-amber-400">{p.soldCount}</strong></span>
                            <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-rose-300 font-medium">
                              {FLASH_SALE_TAB_OPTIONS.find(opt => opt.id === p.flashSaleTab)?.shortLabel || 'Hot Deal'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                setQuickFlashSaleProdId(p.id);
                                setQuickFlashSalePrice(p.priceSale);
                                setQuickFlashSaleStock(p.stock);
                                setQuickFlashSaleTab(p.flashSaleTab || 'DEAL_PHIM_CHUOT');
                                setIsFlashSaleModalOpen(true);
                              }}
                              className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                              <span>Sửa Flash Sale</span>
                            </button>
                            <button
                              onClick={() => {
                                if (currentUser.role === 'STAFF') {
                                  showToast('Chỉ ADMIN mới có quyền tắt Flash Sale', 'error');
                                  return;
                                }
                                updateProduct({ ...p, isFlashSale: false, pinnedSection: 'NONE' });
                                showToast(`Đã tắt Flash Sale cho "${p.name.slice(0, 25)}..."`, 'info');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-bold transition-colors border border-rose-800/50"
                              title="Tắt Flash Sale sản phẩm này"
                            >
                              Tắt Flash Sale
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: USER MANAGEMENT & ROLES */}
          {adminActiveTab === 'users' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Quản Lý Người Dùng & Phân Quyền</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Tài khoản ADMIN luôn luôn cố định. ADMIN có quyền chuyển đổi phân quyền giữa STAFF và USER, và kiểm soát trạng thái tài khoản.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Bạn đang đăng nhập:</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                    currentUser.role === 'ADMIN' ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {currentUser.role === 'STAFF' && (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-3">
                  <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold block">Chế độ Xem (Vai trò STAFF):</span>
                    <span>Bạn có quyền tra cứu thông tin khách hàng. Quyền đổi vai trò tài khoản (Role) và Khóa/Mở Khóa tài khoản được bảo vệ chỉ dành riêng cho <strong>ADMIN</strong>.</span>
                  </div>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="pb-3">Họ Tên</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">SĐT</th>
                      <th className="pb-3">Vai Trò</th>
                      <th className="pb-3">Điểm Thưởng</th>
                      <th className="pb-3">Trạng Thái</th>
                      <th className="pb-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/40">
                        <td className="py-3 font-bold text-white">{u.fullName}</td>
                        <td className="py-3">{u.email}</td>
                        <td className="py-3">{u.phone}</td>
                        <td className="py-3">
                          {u.role === 'ADMIN' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 select-none shadow-sm">
                              <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              ADMIN (Cố định)
                            </span>
                          ) : (
                            <select
                              disabled={currentUser.role === 'STAFF'}
                              value={u.role}
                              onChange={e => {
                                if (currentUser.role === 'STAFF') {
                                  showToast('Chỉ ADMIN mới có quyền thay đổi vai trò tài khoản', 'error');
                                  return;
                                }
                                updateUserRole(u.id, e.target.value as any);
                              }}
                              className={`border text-white rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                                currentUser.role === 'STAFF'
                                  ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                                  : 'bg-slate-950 border-slate-700 hover:border-rose-500 cursor-pointer'
                              }`}
                            >
                              <option value="USER" className="bg-slate-900 text-slate-200">USER (Khách hàng)</option>
                              <option value="STAFF" className="bg-slate-900 text-slate-200">STAFF (Nhân viên)</option>
                            </select>
                          )}
                        </td>
                        <td className="py-3 font-semibold text-amber-400">{u.points} pts</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {u.role === 'ADMIN' ? (
                            <span className="inline-block px-2.5 py-1 text-[11px] font-semibold text-slate-500 bg-slate-800/40 rounded-lg border border-slate-800/80">
                              Không thể khóa
                            </span>
                          ) : (
                            <button
                              disabled={currentUser.role === 'STAFF'}
                              onClick={() => {
                                if (currentUser.role === 'STAFF') {
                                  showToast('Chỉ ADMIN mới có quyền khóa/mở khóa tài khoản', 'error');
                                  return;
                                }
                                updateUserStatus(u.id, u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE');
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                                currentUser.role === 'STAFF'
                                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  : u.status === 'ACTIVE'
                                  ? 'bg-rose-950 text-rose-300 hover:bg-rose-900'
                                  : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900'
                              }`}
                            >
                              {currentUser.role === 'STAFF' ? 'Chỉ Xem' : u.status === 'ACTIVE' ? 'Khóa' : 'Mở Khóa'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: HOMEPAGE BUILDER */}
          {adminActiveTab === 'sections' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Cấu Hình Section Trang Chủ (Homepage Builder)</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Bật/tắt các khối nội dung, sản phẩm nổi bật hiển thị ngoài trang chủ website</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Bạn đang đăng nhập:</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                    currentUser.role === 'ADMIN' ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {currentUser.role === 'STAFF' && (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-3">
                  <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold block">Chế độ Xem (Vai trò STAFF):</span>
                    <span>Quyền điều chỉnh bật/tắt các khối layout hiển thị trang chủ được bảo vệ chỉ dành cho tài khoản <strong>ADMIN</strong>.</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {sections.map(sec => (
                  <div
                    key={sec.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{sec.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">[{sec.sectionType}]</span>
                      </div>
                      <span className="text-xs text-slate-400">Thứ tự hiển thị: {sec.sortOrder} • Filter: {sec.filterTag || 'Tất cả'}</span>
                    </div>

                    <button
                      disabled={currentUser.role === 'STAFF'}
                      onClick={() => {
                        if (currentUser.role === 'STAFF') {
                          showToast('Chỉ ADMIN mới có quyền bật/tắt các khối hiển thị trang chủ', 'error');
                          return;
                        }
                        toggleSection(sec.id);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        currentUser.role === 'STAFF'
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : sec.isActive
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {currentUser.role === 'STAFF' ? (sec.isActive ? 'Đang Bật' : 'Đã Tắt') : sec.isActive ? 'Đang Bật' : 'Đã Tắt'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: INVENTORY MANAGEMENT */}
          {adminActiveTab === 'inventory' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h1 className="text-2xl font-black text-white tracking-tight">Quản Lý Tồn Kho & Nhập Xuất</h1>
                <p className="text-xs text-slate-400 mt-0.5">Theo dõi số lượng hàng thực tế, cảnh báo tồn kho dưới 5 và nhập hàng bổ sung</p>
              </div>

              {/* Low Stock Warning Banner */}
              {lowStockProducts.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs text-rose-200">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>Phát hiện <strong>{lowStockProducts.length} sản phẩm</strong> đang có lượng tồn kho dưới ngưỡng tối thiểu (&lt; 5 cái). Hãy nhập thêm hàng ngay.</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Stock table */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tồn Kho Sản Phẩm Hiện Tại</h3>
                  <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto pr-1 text-xs">
                    {products.map(p => (
                      <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="truncate">
                          <span className="font-bold text-white block truncate">{p.name}</span>
                          <span className="text-[10px] text-slate-400">SKU: {p.sku} • {p.brand}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            p.stock < 5 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {p.stock} cái
                          </span>
                          <button
                            onClick={() => setRestockItem({ id: p.id, name: p.name, addQty: 20, note: 'Nhập lô hàng chính ngạch bổ sung kho' })}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-rose-600 hover:text-white rounded-lg text-slate-300 font-semibold text-[11px]"
                          >
                            + Nhập Hàng
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inventory Logs */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Lịch Sử Nhập / Xuất Kho Gần Nhất</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1 text-xs">
                    {inventoryLogs.map(log => (
                      <div key={log.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white truncate max-w-[200px]">{log.productName}</span>
                          <span className={`font-bold text-[11px] ${
                            log.changeType === 'IMPORT' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {log.changeType === 'IMPORT' ? `+${log.quantityChange}` : `-${log.quantityChange}`} cái
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{log.note}</p>
                        <span className="text-[10px] text-slate-500 block">{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: ADVANCED REPORTS & ANALYTICS */}
          {adminActiveTab === 'reports' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h1 className="text-2xl font-black text-white tracking-tight">Báo Cáo & Thống Kê Nâng Cao</h1>
                <p className="text-xs text-slate-400 mt-0.5">Phân tích tỷ lệ hủy đơn, doanh số kênh thanh toán VNPAY vs COD và top sản phẩm bán chạy nhất</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tỷ Lệ Thanh Toán VNPAY</span>
                  <p className="text-2xl font-black text-emerald-400">72.5%</p>
                  <span className="text-xs text-slate-400">Ưa chuộng quét mã QR giảm thiểu rủi ro COD</span>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tỷ Lệ Hủy Đơn</span>
                  <p className="text-2xl font-black text-rose-400">3.2%</p>
                  <span className="text-xs text-slate-400">Thấp hơn mức trung bình ngành thương mại điện tử</span>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Giá Trị Đơn Trung Bình (AOV)</span>
                  <p className="text-2xl font-black text-cyan-400">34.800.000đ</p>
                  <span className="text-xs text-slate-400">Khách hàng có xu hướng mua trọn bộ PC cao cấp</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: CUSTOMER CARE & STORE CHAT MANAGEMENT */}
          {adminActiveTab === 'chat' && (() => {
            const filteredConversations = conversations.filter(c => {
              if (chatFilter === 'UNREAD' && (c.unreadCountForStaff || 0) === 0) return false;
              if (chatFilter === 'READ' && (c.unreadCountForStaff || 0) > 0) return false;
              if (chatFilter === 'STARRED' && !c.isStarred) return false;

              if (chatSearch.trim()) {
                const q = chatSearch.toLowerCase().trim();
                const matchName = c.customerName.toLowerCase().includes(q);
                const matchPhone = c.customerPhone?.toLowerCase().includes(q);
                const matchEmail = c.customerEmail?.toLowerCase().includes(q);
                const matchMsg = c.messages.some(m => m.text.toLowerCase().includes(q));
                if (!matchName && !matchPhone && !matchEmail && !matchMsg) return false;
              }
              return true;
            });

            const currentConv = conversations.find(c => c.id === activeChatId) || filteredConversations[0] || null;

            const handleStaffSend = () => {
              if (!chatReplyInput.trim() || !currentConv) return;
              staffSendMessage(currentConv.id, chatReplyInput.trim());
              setChatReplyInput('');
              showToast('Đã gửi tin nhắn phản hồi tới khách hàng!');
            };

            return (
              <div className="space-y-6">
                {/* Header with Title and Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-black text-white tracking-tight">Hộp Thư & Chat Với Khách Hàng</h1>
                      {totalUnreadForStaff > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black shadow-lg shadow-rose-600/30">
                          {totalUnreadForStaff} tin chưa đọc
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Khách hàng được chat trực tuyến với cửa hàng, Admin/Nhân viên phản hồi tin nhắn và phân loại Đã đọc / Chưa đọc
                    </p>
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={chatSearch}
                      onChange={e => setChatSearch(e.target.value)}
                      placeholder="Tìm tên khách, SĐT, nội dung tin nhắn..."
                      className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 w-64 sm:w-72"
                    />
                  </div>
                </div>

                {/* Filter Tabs (Mục đã đọc và chưa đọc) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    { key: 'ALL', label: 'Tất Cả Cuộc Chat', count: conversations.length },
                    {
                      key: 'UNREAD',
                      label: 'Mục Chưa Đọc',
                      count: conversations.filter(c => (c.unreadCountForStaff || 0) > 0).length,
                      badgeColor: 'bg-rose-600 text-white',
                    },
                    {
                      key: 'READ',
                      label: 'Mục Đã Đọc',
                      count: conversations.filter(c => (c.unreadCountForStaff || 0) === 0).length,
                    },
                    {
                      key: 'STARRED',
                      label: 'Đã Gắn Sao',
                      count: conversations.filter(c => c.isStarred).length,
                    },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      id={`btn-chat-filter-${tab.key.toLowerCase()}`}
                      onClick={() => setChatFilter(tab.key as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                        chatFilter === tab.key
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                          tab.badgeColor || (chatFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400')
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* 2-Column Chat Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden min-h-[620px] shadow-xl">
                  {/* LEFT COLUMN: Conversation List */}
                  <div className="lg:col-span-5 xl:col-span-4 border-r border-slate-800/80 flex flex-col bg-slate-950/40">
                    <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-bold uppercase tracking-wider text-[11px] text-slate-300">
                        Danh Sách Hội Thoại ({filteredConversations.length})
                      </span>
                      <span className="text-[10px]">
                        {conversations.filter(c => (c.unreadCountForStaff || 0) > 0).length} hội thoại cần phản hồi
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 max-h-[580px]">
                      {filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 space-y-2">
                          <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
                          <p className="text-xs font-semibold">Không có cuộc trò chuyện nào trong mục này</p>
                        </div>
                      ) : (
                        filteredConversations.map(conv => {
                          const isSelected = currentConv?.id === conv.id;
                          const hasUnread = (conv.unreadCountForStaff || 0) > 0;

                          return (
                            <div
                              key={conv.id}
                              id={`conv-item-${conv.id}`}
                              onClick={() => {
                                setActiveChatId(conv.id);
                                if (hasUnread) {
                                  markConversationAsReadByStaff(conv.id);
                                }
                              }}
                              className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 relative hover:bg-slate-800/60 ${
                                isSelected
                                  ? 'bg-slate-800/90 border-l-4 border-l-rose-500 shadow-md'
                                  : hasUnread
                                  ? 'bg-rose-950/20 border-l-4 border-l-amber-500'
                                  : 'bg-transparent border-l-4 border-l-transparent'
                              }`}
                            >
                              {/* Avatar */}
                              <div className="relative shrink-0">
                                {conv.customerAvatar ? (
                                  <img
                                    src={conv.customerAvatar}
                                    alt={conv.customerName}
                                    className="w-10 h-10 rounded-2xl object-cover border border-slate-700"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow">
                                    {conv.customerName.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                {hasUnread && (
                                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-slate-900 rounded-full animate-pulse" />
                                )}
                              </div>

                              {/* Info & Last message */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className={`text-xs font-bold truncate ${hasUnread ? 'text-white' : 'text-slate-200'}`}>
                                    {conv.customerName}
                                  </span>
                                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                    {conv.lastMessageAt
                                      ? new Date(conv.lastMessageAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                                      : ''}
                                  </span>
                                </div>

                                <p className={`text-xs truncate ${hasUnread ? 'font-semibold text-rose-200' : 'text-slate-400'}`}>
                                  {conv.lastMessageText || 'Chưa có tin nhắn'}
                                </p>

                                <div className="flex items-center justify-between mt-1.5 pt-1">
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Phone className="w-2.5 h-2.5" />
                                    {conv.customerPhone || 'Chưa cập nhật SĐT'}
                                  </span>

                                  <div className="flex items-center gap-1">
                                    {hasUnread ? (
                                      <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-black">
                                        Chưa đọc
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 text-[9px]">
                                        Đã đọc
                                      </span>
                                    )}

                                    <button
                                      title={conv.isStarred ? 'Bỏ gắn sao' : 'Gắn sao hội thoại'}
                                      onClick={e => {
                                        e.stopPropagation();
                                        toggleStarConversation(conv.id);
                                      }}
                                      className="p-1 text-slate-500 hover:text-amber-400"
                                    >
                                      <Star className={`w-3 h-3 ${conv.isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Active Conversation & Reply */}
                  <div className="lg:col-span-7 xl:col-span-8 flex flex-col bg-slate-900/40">
                    {currentConv ? (
                      <>
                        {/* Conversation Header */}
                        <div className="p-4 border-b border-slate-800/80 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                              {currentConv.customerName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black text-white">{currentConv.customerName}</h3>
                                {(currentConv.unreadCountForStaff || 0) > 0 ? (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-600/90 text-white text-[10px] font-black">
                                    Chưa đọc ({currentConv.unreadCountForStaff})
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/50 text-emerald-400 text-[10px] font-semibold">
                                    Đã đọc ✓
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                                {currentConv.customerPhone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    {currentConv.customerPhone}
                                  </span>
                                )}
                                {currentConv.customerEmail && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    {currentConv.customerEmail}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Header Actions: Toggle Read/Unread & Star */}
                          <div className="flex items-center gap-2">
                            {(currentConv.unreadCountForStaff || 0) > 0 ? (
                              <button
                                id="btn-mark-conv-read"
                                onClick={() => markConversationAsReadByStaff(currentConv.id)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Đánh Dấu Đã Đọc</span>
                              </button>
                            ) : (
                              <button
                                id="btn-mark-conv-unread"
                                onClick={() => markConversationAsUnreadByStaff(currentConv.id)}
                                className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <Clock className="w-3.5 h-3.5 text-rose-400" />
                                <span>Đánh Dấu Chưa Đọc</span>
                              </button>
                            )}

                            <button
                              title="Xóa hội thoại"
                              onClick={() => {
                                if (confirm('Bạn có chắc chắn muốn xóa lịch sử cuộc hội thoại này?')) {
                                  deleteConversation(currentConv.id);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Message Thread Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[420px] bg-slate-950/30">
                          {currentConv.messages.map(msg => {
                            const isStaff = msg.sender === 'STORE';

                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                              >
                                <div className="flex items-center gap-1.5 mb-1 px-1">
                                  <span className="text-[11px] font-bold text-slate-300">
                                    {msg.senderName}
                                  </span>
                                  {isStaff && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-700/60 text-indigo-300 font-semibold">
                                      {msg.senderRole === 'ADMIN' ? 'Admin' : 'Nhân Viên CSKH'}
                                    </span>
                                  )}
                                </div>

                                <div
                                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                                    isStaff
                                      ? 'bg-indigo-600 text-white rounded-br-xs shadow-md shadow-indigo-600/20'
                                      : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-xs shadow-md'
                                  }`}
                                >
                                  {msg.text}
                                </div>

                                <div className="flex items-center gap-1 mt-1 px-1">
                                  <span className="text-[10px] text-slate-500">
                                    {new Date(msg.createdAt).toLocaleString('vi-VN', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      day: '2-digit',
                                      month: '2-digit',
                                    })}
                                  </span>
                                  {isStaff && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Quick Canned Replies */}
                        <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80">
                          <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                            Mẫu phản hồi nhanh cho nhân viên:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'Dạ GearTech xin chào quý khách! Em có thể hỗ trợ tư vấn sản phẩm gì cho mình ạ?',
                              'Dạ sản phẩm này bên em đang có sẵn hàng tại kho, hỗ trợ giao hỏa tốc 2H ạ!',
                              'Dạ đơn hàng của mình đã được xác nhận và kỹ thuật viên đang test máy trước khi đóng gói ạ.',
                              'Dạ sản phẩm được bảo hành chính hãng 36 tháng, cam kết 1 đổi 1 trong 30 ngày đầu ạ!',
                            ].map((canned, idx) => (
                              <button
                                key={idx}
                                onClick={() => setChatReplyInput(canned)}
                                className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-left"
                              >
                                {canned.length > 35 ? canned.slice(0, 35) + '...' : canned}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Reply Input Bar */}
                        <div className="p-4 bg-slate-950 border-t border-slate-800">
                          <div className="flex items-end gap-3">
                            <textarea
                              rows={2}
                              id="input-staff-chat-reply"
                              value={chatReplyInput}
                              onChange={e => setChatReplyInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleStaffSend();
                                }
                              }}
                              placeholder={`Nhập phản hồi gửi cho ${currentConv.customerName}... (Nhấn Enter để gửi)`}
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                            />

                            <button
                              type="button"
                              id="btn-staff-send-reply"
                              onClick={handleStaffSend}
                              disabled={!chatReplyInput.trim()}
                              className="px-5 py-3.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2 shrink-0"
                            >
                              <Send className="w-4 h-4" />
                              <span className="hidden sm:inline">Gửi Phản Hồi</span>
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
                        <MessageSquare className="w-12 h-12 text-slate-600" />
                        <h4 className="text-base font-bold text-slate-300">Chưa chọn cuộc hội thoại nào</h4>
                        <p className="text-xs max-w-sm">
                          Vui lòng chọn một cuộc hội thoại từ danh sách bên trái để xem tin nhắn và gửi phản hồi cho khách hàng.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 12: QUẢN LÝ BẢO HÀNH & SỬA CHỮA HỆ THỐNG */}
          {adminActiveTab === 'warranty' && (() => {
            const filteredRecords = warrantyRecords.filter(r => {
              if (warrantyStatusFilter === 'ACTIVE' && r.status !== 'ACTIVE') return false;
              if (warrantyStatusFilter === 'EXPIRED' && r.status === 'ACTIVE') return false;

              if (warrantySearch.trim()) {
                const q = warrantySearch.toLowerCase().trim();
                const qClean = q.replace(/\s+/g, '');
                const mSerial = r.serialNumber.toLowerCase().includes(q);
                const mProd = r.productName.toLowerCase().includes(q);
                const mCust = r.customerName.toLowerCase().includes(q);
                const mPhone = r.customerPhone.replace(/\s+/g, '').includes(qClean);
                const mOrder = (r.orderCode || '').toLowerCase().includes(q);
                if (!mSerial && !mProd && !mCust && !mPhone && !mOrder) return false;
              }
              return true;
            });

            return (
              <div className="space-y-6">
                {/* Header with quick stats */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-black text-white tracking-tight">
                        Quản Lý Bảo Hành & Nhật Ký Sửa Chữa
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold">
                        {warrantyRecords.length} thiết bị
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cơ sở dữ liệu bảo hành điện tử toàn hệ thống dành cho Ban Quản Trị & Nhân Viên Kỹ Thuật
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setCurrentView('warranty');
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700"
                    >
                      <span>Mở Trang Tra Cứu Khách Hàng</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setIsAdminAddWarrantyOpen(true)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/25 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Thiết Bị Bảo Hành</span>
                    </button>
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Tổng Thiết Bị Trong Hệ Thống</span>
                      <p className="text-2xl font-black text-white mt-1">{warrantyRecords.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Đang Còn Thời Hạn Bảo Hành</span>
                      <p className="text-2xl font-black text-emerald-400 mt-1">
                        {warrantyRecords.filter(r => r.status === 'ACTIVE').length}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Lượt Bảo Trì & Sửa Chữa Đã Xử Lý</span>
                      <p className="text-2xl font-black text-purple-400 mt-1">
                        {warrantyRecords.reduce((sum, r) => sum + (r.history?.length || 0), 0)}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <Wrench className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={warrantySearch}
                      onChange={e => setWarrantySearch(e.target.value)}
                      placeholder="Tìm kiếm: Số Serial, Tên sản phẩm, Tên/SĐT khách..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <span className="text-xs text-slate-400">Trạng thái:</span>
                    <select
                      value={warrantyStatusFilter}
                      onChange={e => setWarrantyStatusFilter(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    >
                      <option value="ALL">Tất cả ({warrantyRecords.length})</option>
                      <option value="ACTIVE">Đang còn hạn ({warrantyRecords.filter(r => r.status === 'ACTIVE').length})</option>
                      <option value="EXPIRED">Đã hết hạn ({warrantyRecords.filter(r => r.status !== 'ACTIVE').length})</option>
                    </select>
                  </div>
                </div>

                {/* Warranty Records Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3">Thiết Bị / Sản Phẩm</th>
                          <th className="px-4 py-3">Số Serial (S/N)</th>
                          <th className="px-4 py-3">Chủ Sở Hữu & SĐT</th>
                          <th className="px-4 py-3">Thời Hạn & Hết Hạn</th>
                          <th className="px-4 py-3">Trạng Thái</th>
                          <th className="px-4 py-3">Nhật Ký Bảo Trì</th>
                          <th className="px-4 py-3 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredRecords.map(record => (
                          <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={record.thumbnailUrl}
                                  alt={record.productName}
                                  className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0"
                                />
                                <div>
                                  <span className="text-[10px] font-bold text-cyan-400 uppercase">
                                    {record.brand}
                                  </span>
                                  <h4 className="font-bold text-white max-w-xs truncate">
                                    {record.productName}
                                  </h4>
                                  <span className="text-[10px] text-slate-500">
                                    Đơn: #{record.orderCode || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-emerald-400 font-bold">
                              {record.serialNumber}
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="font-semibold text-slate-200">{record.customerName}</p>
                              <p className="text-slate-400 font-mono text-[11px]">{record.customerPhone}</p>
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="text-slate-300">
                                {new Date(record.endDate).toLocaleDateString('vi-VN')}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {record.warrantyMonths || 36} tháng chính hãng
                              </p>
                            </td>
                            <td className="px-4 py-3.5">
                              {record.status === 'ACTIVE' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                                  <CheckCircle className="w-3 h-3" /> Còn hạn
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 text-[10px] font-bold border border-rose-800">
                                  <XCircle className="w-3 h-3" /> Hết hạn
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="px-2 py-1 rounded bg-slate-950 text-slate-300 font-medium text-[11px] border border-slate-800">
                                {record.history?.length || 0} lần ghi nhận
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedWarrantyRecord(record);
                                    setIsAdminAddHistoryOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300"
                                  title="Thêm nhật ký sửa chữa"
                                >
                                  <Wrench className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setCurrentView('warranty');
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                                  title="Xem giao diện chứng nhận"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MODAL: ADMIN ADD WARRANTY RECORD */}
                {isAdminAddWarrantyOpen && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-rose-500" />
                          <span>Thêm Phiếu Bảo Hành Mới</span>
                        </h3>
                        <button
                          onClick={() => setIsAdminAddWarrantyOpen(false)}
                          className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          if (!adminNewRecord.serialNumber.trim() || !adminNewRecord.productName.trim()) {
                            showToast('Vui lòng nhập Serial và Tên sản phẩm', 'error');
                            return;
                          }
                          addWarrantyRecord({
                            serialNumber: adminNewRecord.serialNumber.trim().toUpperCase(),
                            productName: adminNewRecord.productName.trim(),
                            brand: adminNewRecord.brand,
                            customerName: adminNewRecord.customerName.trim() || 'Khách Hàng',
                            customerPhone: adminNewRecord.customerPhone.trim() || '0900000000',
                            orderCode: adminNewRecord.orderCode.trim() || `GT-${Date.now().toString().slice(-6)}`,
                            startDate: adminNewRecord.startDate,
                            endDate: adminNewRecord.endDate,
                            warrantyMonths: Number(adminNewRecord.warrantyMonths) || 36,
                            status: 'ACTIVE',
                            thumbnailUrl: adminNewRecord.thumbnailUrl,
                            history: [],
                          });
                          setIsAdminAddWarrantyOpen(false);
                        }}
                        className="space-y-3 text-xs"
                      >
                        <div>
                          <label className="text-slate-300 font-semibold block mb-1">Số Serial (S/N) *</label>
                          <input
                            type="text"
                            value={adminNewRecord.serialNumber}
                            onChange={e => setAdminNewRecord({ ...adminNewRecord, serialNumber: e.target.value })}
                            placeholder="VD: SN-VGA-5090-001"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-slate-300 font-semibold block mb-1">Tên Sản Phẩm / Dàn Máy *</label>
                          <input
                            type="text"
                            value={adminNewRecord.productName}
                            onChange={e => setAdminNewRecord({ ...adminNewRecord, productName: e.target.value })}
                            placeholder="VD: VGA ASUS TUF Gaming GeForce RTX 4070 Ti SUPER"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-300 font-semibold block mb-1">Thương Hiệu</label>
                            <input
                              type="text"
                              value={adminNewRecord.brand}
                              onChange={e => setAdminNewRecord({ ...adminNewRecord, brand: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-slate-300 font-semibold block mb-1">Thời Hạn (Tháng)</label>
                            <input
                              type="number"
                              value={adminNewRecord.warrantyMonths}
                              onChange={e => setAdminNewRecord({ ...adminNewRecord, warrantyMonths: Number(e.target.value) })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-300 font-semibold block mb-1">Tên Khách Hàng</label>
                            <input
                              type="text"
                              value={adminNewRecord.customerName}
                              onChange={e => setAdminNewRecord({ ...adminNewRecord, customerName: e.target.value })}
                              placeholder="VD: Nguyễn Văn Nam"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-slate-300 font-semibold block mb-1">Số Điện Thoại</label>
                            <input
                              type="text"
                              value={adminNewRecord.customerPhone}
                              onChange={e => setAdminNewRecord({ ...adminNewRecord, customerPhone: e.target.value })}
                              placeholder="VD: 0987654321"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-300 font-semibold block mb-1">Ngày Mua Hàng</label>
                            <input
                              type="date"
                              value={adminNewRecord.startDate}
                              onChange={e => setAdminNewRecord({ ...adminNewRecord, startDate: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-slate-300 font-semibold block mb-1">Ngày Hết Hạn</label>
                            <input
                              type="date"
                              value={adminNewRecord.endDate}
                              onChange={e => setAdminNewRecord({ ...adminNewRecord, endDate: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3">
                          <button
                            type="button"
                            onClick={() => setIsAdminAddWarrantyOpen(false)}
                            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow"
                          >
                            Lưu Vào Hệ Thống
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* MODAL: ADMIN ADD HISTORY */}
                {isAdminAddHistoryOpen && selectedWarrantyRecord && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Wrench className="w-5 h-5 text-cyan-400" />
                          <span>Thêm Nhật Ký Tiếp Nhận / Sửa Chữa</span>
                        </h3>
                        <button
                          onClick={() => setIsAdminAddHistoryOpen(false)}
                          className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                        Sản phẩm: <strong>{selectedWarrantyRecord.productName}</strong>
                        <div className="font-mono text-emerald-400 mt-0.5">
                          S/N: {selectedWarrantyRecord.serialNumber} • Khách: {selectedWarrantyRecord.customerName}
                        </div>
                      </div>

                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          if (!adminNewHistory.issue.trim()) {
                            showToast('Vui lòng nhập mô tả sự cố', 'error');
                            return;
                          }
                          addWarrantyHistory(selectedWarrantyRecord.id, {
                            date: adminNewHistory.date,
                            issue: adminNewHistory.issue.trim(),
                            result: adminNewHistory.result.trim(),
                            staffName: adminNewHistory.staffName.trim(),
                          });
                          setIsAdminAddHistoryOpen(false);
                        }}
                        className="space-y-3 text-xs"
                      >
                        <div>
                          <label className="text-slate-300 font-semibold block mb-1">Ngày Tiếp Nhận</label>
                          <input
                            type="date"
                            value={adminNewHistory.date}
                            onChange={e => setAdminNewHistory({ ...adminNewHistory, date: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="text-slate-300 font-semibold block mb-1">Hiện Tượng / Sự Cố Tiếp Nhận *</label>
                          <textarea
                            rows={2}
                            value={adminNewHistory.issue}
                            onChange={e => setAdminNewHistory({ ...adminNewHistory, issue: e.target.value })}
                            placeholder="VD: Kiểm tra nhiệt độ VGA cao khi chơi game nặng..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-slate-300 font-semibold block mb-1">Kết Quả Xử Lý *</label>
                          <input
                            type="text"
                            value={adminNewHistory.result}
                            onChange={e => setAdminNewHistory({ ...adminNewHistory, result: e.target.value })}
                            placeholder="VD: Tra keo tản nhiệt gốm, test FurMark 15p max 67°C"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-slate-300 font-semibold block mb-1">Kỹ Thuật Viên Xử Lý</label>
                          <input
                            type="text"
                            value={adminNewHistory.staffName}
                            onChange={e => setAdminNewHistory({ ...adminNewHistory, staffName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-3">
                          <button
                            type="button"
                            onClick={() => setIsAdminAddHistoryOpen(false)}
                            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow"
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
          })()}
        </main>

        {/* Nút Trở Lại Đầu Trang khi cuộn trang Admin */}
        {showAdminBackToTop && (
          <button
            id="btn-admin-back-to-top"
            onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-40 px-3.5 py-2.5 bg-slate-900/95 hover:bg-rose-600 text-slate-200 hover:text-white rounded-2xl shadow-2xl border border-slate-700/80 hover:border-rose-500 transition-all duration-300 hover:scale-105 group flex items-center gap-2 text-xs font-bold backdrop-blur-md cursor-pointer"
            title="Cuộn trở lại đầu trang"
            aria-label="Cuộn trở lại đầu trang"
          >
            <div className="w-5 h-5 rounded-lg bg-rose-500/20 group-hover:bg-white/20 flex items-center justify-center transition-colors">
              <ArrowUp className="w-3.5 h-3.5 text-rose-400 group-hover:text-white transition-transform group-hover:-translate-y-0.5" />
            </div>
            <span className="hidden sm:inline">Lên đầu trang</span>
          </button>
        )}
      </div>

      {/* PRODUCT CREATE / EDIT MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingProduct.id ? 'Chỉnh Sửa Thông Tin Linh Kiện' : 'Thêm Sản Phẩm Mới Vào Hệ Thống'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  value={editingProduct.name || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="Ví dụ: VGA ASUS ROG Strix GeForce RTX 4090 24GB GDDR6X"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Mã SKU *</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Thương hiệu *</label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Giá gốc (VNĐ)</label>
                  <input
                    type="number"
                    value={editingProduct.priceOriginal || 0}
                    onChange={e => setEditingProduct({ ...editingProduct, priceOriginal: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Giá khuyến mãi (VNĐ) *</label>
                  <input
                    type="number"
                    value={editingProduct.priceSale || 0}
                    onChange={e => setEditingProduct({ ...editingProduct, priceSale: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Số lượng tồn kho</label>
                  <input
                    type="number"
                    value={editingProduct.stock || 0}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">URL Ảnh Đại Diện</label>
                <input
                  type="text"
                  value={editingProduct.thumbnailUrl || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, thumbnailUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Mô tả sản phẩm</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                />
              </div>

              <div className="space-y-3 p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk-flash-sale"
                    checked={!!editingProduct.isFlashSale}
                    onChange={e => setEditingProduct({ ...editingProduct, isFlashSale: e.target.checked })}
                    className="accent-rose-500 rounded w-4 h-4"
                  />
                  <label htmlFor="chk-flash-sale" className="text-slate-200 cursor-pointer font-bold text-xs flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>Bật huy hiệu và đưa vào danh sách Flash Sale hôm nay</span>
                  </label>
                </div>

                {editingProduct.isFlashSale && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    <label className="text-slate-300 font-semibold block text-xs">
                      Phân Loại Tab Flash Sale Trang Chủ
                    </label>
                    <select
                      value={editingProduct.flashSaleTab || 'ALL'}
                      onChange={e => setEditingProduct({ ...editingProduct, flashSaleTab: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-rose-500 font-medium"
                    >
                      {FLASH_SALE_TAB_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-200">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow"
                >
                  Lưu Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {restockItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Nhập Hàng Bổ Sung Kho</h3>
            <p className="text-xs text-slate-400">Sản phẩm: <strong className="text-white">{restockItem.name}</strong></p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Số lượng nhập thêm *</label>
                <input
                  type="number"
                  value={restockItem.addQty}
                  onChange={e => setRestockItem({ ...restockItem, addQty: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Ghi chú phiếu nhập</label>
                <input
                  type="text"
                  value={restockItem.note}
                  onChange={e => setRestockItem({ ...restockItem, note: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setRestockItem(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  restockProduct(restockItem.id, restockItem.addQty, restockItem.note);
                  setRestockItem(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Xác Nhận Nhập Kho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE / EXPORT MODAL */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-rose-500" />
                <span>Phiếu Xuất Kho & Hóa Đơn Bán Lẻ #{selectedOrderForInvoice.id}</span>
              </h3>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white text-slate-900 text-xs space-y-3 font-sans">
              <div className="flex justify-between items-start border-b pb-2">
                <div>
                  <h4 className="font-black text-sm">CÔNG TY CỔ PHẦN GEARTECH VIỆT NAM</h4>
                  <p className="text-[10px] text-slate-600">ĐC: 102 Duy Tân, Cầu Giấy, Hà Nội • Hotline: 1800 6868</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[11px]">PHIẾU XUẤT KHO</p>
                  <p className="text-[10px] text-slate-500">{new Date(selectedOrderForInvoice.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p>Khách hàng: <strong>{selectedOrderForInvoice.shippingName}</strong></p>
                <p>Số điện thoại: <strong>{selectedOrderForInvoice.shippingPhone}</strong></p>
                <p>Địa chỉ giao: {selectedOrderForInvoice.shippingAddress}</p>
                <p>Phương thức: {selectedOrderForInvoice.paymentMethod} ({selectedOrderForInvoice.paymentStatus})</p>
              </div>

              <table className="w-full text-left border-t border-b py-2 text-[11px]">
                <thead>
                  <tr className="border-b">
                    <th className="py-1">Mặt Hàng</th>
                    <th className="py-1">SL</th>
                    <th className="py-1 text-right">Đơn Giá</th>
                    <th className="py-1 text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrderForInvoice.items.map(it => (
                    <tr key={it.productId}>
                      <td className="py-1">{it.productName}</td>
                      <td className="py-1">{it.quantity}</td>
                      <td className="py-1 text-right">{(it.unitPrice ?? it.price ?? 0).toLocaleString('vi-VN')}đ</td>
                      <td className="py-1 text-right font-bold">{((it.unitPrice ?? it.price ?? 0) * it.quantity).toLocaleString('vi-VN')}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-baseline pt-1 font-bold">
                <span>Tổng Cộng Tiền Thanh Toán:</span>
                <span className="text-base text-rose-600">{selectedOrderForInvoice.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> In Phiếu Xuất Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE VOUCHER MODAL */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Tạo Mã Voucher Khuyến Mãi Mới</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Mã Voucher (Code) *</label>
                <input
                  type="text"
                  value={newVoucher.code}
                  onChange={e => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })}
                  placeholder="VD: GEARTECH1TRIEU"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Mô tả giảm giá *</label>
                <input
                  type="text"
                  value={newVoucher.description}
                  onChange={e => setNewVoucher({ ...newVoucher, description: e.target.value })}
                  placeholder="VD: Giảm 1.000.000đ cho đơn mua PC từ 25 triệu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Loại giảm giá</label>
                  <select
                    value={newVoucher.discountType}
                    onChange={e => setNewVoucher({ ...newVoucher, discountType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="PERCENT">Giảm theo %</option>
                    <option value="FIXED">Giảm tiền mặt (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Giá trị giảm *</label>
                  <input
                    type="number"
                    value={newVoucher.discountValue}
                    onChange={e => setNewVoucher({ ...newVoucher, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Đơn tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    value={newVoucher.minOrderAmount}
                    onChange={e => setNewVoucher({ ...newVoucher, minOrderAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Số lượt dùng tối đa</label>
                  <input
                    type="number"
                    value={newVoucher.usageLimit}
                    onChange={e => setNewVoucher({ ...newVoucher, usageLimit: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!newVoucher.code.trim()) {
                    showToast('Vui lòng nhập mã voucher', 'error');
                    return;
                  }
                  addVoucher(newVoucher);
                  setIsVoucherModalOpen(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Lưu Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK FLASH SALE MODAL */}
      {isFlashSaleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Flame className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Tạo Flash Sale / Cấu Hình Deal Mới</h3>
                  <p className="text-xs text-slate-400">Chọn sản phẩm và cài đặt giá khuyến mãi, số lượng giới hạn</p>
                </div>
              </div>
              <button
                onClick={() => setIsFlashSaleModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!quickFlashSaleProdId) {
                  showToast('Vui lòng chọn sản phẩm cần bật Flash Sale', 'error');
                  return;
                }
                const targetProduct = products.find(p => p.id === quickFlashSaleProdId);
                if (!targetProduct) return;

                updateProduct({
                  ...targetProduct,
                  priceSale: Number(quickFlashSalePrice) || targetProduct.priceSale,
                  stock: Number(quickFlashSaleStock) || targetProduct.stock,
                  flashSaleTab: quickFlashSaleTab,
                  isFlashSale: true,
                  pinnedSection: 'FLASH_SALE',
                });

                showToast(`Đã bật Flash Sale thành công cho "${targetProduct.name.slice(0, 30)}..."!`, 'success');
                setIsFlashSaleModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Chọn Sản Phẩm *</label>
                <select
                  value={quickFlashSaleProdId || ''}
                  onChange={e => {
                    const pid = Number(e.target.value);
                    setQuickFlashSaleProdId(pid);
                    const sel = products.find(p => p.id === pid);
                    if (sel) {
                      setQuickFlashSalePrice(sel.priceSale);
                      setQuickFlashSaleStock(sel.stock || 10);
                      setQuickFlashSaleTab(sel.flashSaleTab || 'DEAL_PHIM_CHUOT');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 font-medium"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                      [{p.brand}] {p.name} - Giá: {p.priceSale.toLocaleString('vi-VN')}đ {p.isFlashSale ? '(Đang Flash Sale)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {quickFlashSaleProdId && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  {(() => {
                    const sel = products.find(p => p.id === quickFlashSaleProdId);
                    if (!sel) return null;
                    return (
                      <>
                        <img src={sel.thumbnailUrl} alt={sel.name} className="w-12 h-12 rounded-xl object-cover border border-slate-800" />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white text-xs truncate">{sel.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Giá gốc: <span className="line-through">{sel.priceOriginal?.toLocaleString('vi-VN')}đ</span> | Giá bán: <span className="text-rose-400 font-bold">{sel.priceSale.toLocaleString('vi-VN')}đ</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Giá Flash Sale (VNĐ) *</label>
                  <input
                    type="number"
                    value={quickFlashSalePrice}
                    onChange={e => setQuickFlashSalePrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 font-bold text-rose-400"
                    placeholder="VD: 850000"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Số Lượng Flash Sale (Suất) *</label>
                  <input
                    type="number"
                    value={quickFlashSaleStock}
                    onChange={e => setQuickFlashSaleStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 font-bold text-amber-400"
                    placeholder="VD: 10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Phân Loại Tab Flash Sale Trang Chủ</label>
                <select
                  value={quickFlashSaleTab}
                  onChange={e => setQuickFlashSaleTab(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 font-medium"
                >
                  {FLASH_SALE_TAB_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-200">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFlashSaleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-lg shadow-amber-600/30 flex items-center gap-2"
                >
                  <Flame className="w-4 h-4 fill-white" />
                  <span>Kích Hoạt Flash Sale</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL (Thêm / Sửa Danh Mục) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-rose-500" />
                <span>
                  {editingCategory.id
                    ? 'Chỉnh Sửa Danh Mục'
                    : editingCategory.parentId
                    ? 'Thêm Danh Mục Con Mới'
                    : 'Thêm Danh Mục Cấp 1 Mới'}
                </span>
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async e => {
                e.preventDefault();
                if (!editingCategory.name || !editingCategory.name.trim()) {
                  showToast('Vui lòng nhập tên danh mục!', 'error');
                  return;
                }
                if (currentUser.role === 'STAFF') {
                  showToast('Chỉ Quản Trị Viên (ADMIN) mới có quyền tạo / sửa danh mục', 'error');
                  return;
                }
                await saveCategory(editingCategory);
                setIsCategoryModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tên Danh Mục *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={e => {
                    const name = e.target.value;
                    const slug = name
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/đ/g, 'd')
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)+/g, '');
                    setEditingCategory(prev => ({ ...prev, name, slug: prev.slug || slug }));
                  }}
                  placeholder="VD: Linh Kiện Máy Tính, Card Màn Hình..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Đường Dẫn Chuẩn SEO (Slug)
                </label>
                <input
                  type="text"
                  value={editingCategory.slug || ''}
                  onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  placeholder="VD: linh-kien-may-tinh"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Danh Mục Cấp Cha</label>
                <select
                  value={editingCategory.parentId || ''}
                  onChange={e =>
                    setEditingCategory({
                      ...editingCategory,
                      parentId: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="">-- Là Danh Mục Cấp 1 (Không Có Cha) --</option>
                  {categories
                    .filter(c => c.id !== editingCategory.id)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {!editingCategory.parentId && (
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Biểu Tượng (Icon)</label>
                  <select
                    value={editingCategory.icon || 'FolderTree'}
                    onChange={e => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="FolderTree">📁 FolderTree (Thư mục mặc định)</option>
                    <option value="Cpu">⚡ Cpu (Bộ vi xử lý)</option>
                    <option value="Laptop">💻 Laptop (Máy tính xách tay)</option>
                    <option value="Monitor">🖥️ Monitor (Màn hình)</option>
                    <option value="Keyboard">⌨️ Keyboard (Bàn phím & Chuột)</option>
                    <option value="Headphones">🎧 Headphones (Tai nghe & Loa)</option>
                    <option value="HardDrive">💽 HardDrive (SSD / HDD / Ổ cứng)</option>
                    <option value="Smartphone">📱 Smartphone (Điện thoại)</option>
                    <option value="Gamepad2">🎮 Gamepad2 (Thiết bị chơi game)</option>
                    <option value="Zap">⚡ Zap (Nguồn / Phụ kiện)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Mô Tả Danh Mục</label>
                <textarea
                  rows={3}
                  value={editingCategory.description || ''}
                  onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Nhập mô tả ngắn gọn về nhóm sản phẩm này..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCategory.id ? 'Lưu Cập Nhật' : 'Tạo Danh Mục'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Back to Top Button centered horizontally */}
      {showAdminBackToTop && (
        <button
          id="btn-back-to-top"
          onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 hover:bg-rose-600 text-slate-200 hover:text-white rounded-full shadow-2xl border border-slate-700/80 hover:border-rose-500 transition-all duration-300 hover:scale-105 group flex items-center gap-2 text-xs font-bold backdrop-blur-md cursor-pointer animate-fade-in"
          title="Trở lại đầu trang"
          aria-label="Trở lại đầu trang"
        >
          <div className="w-5 h-5 rounded-full bg-rose-500/20 group-hover:bg-white/20 flex items-center justify-center transition-colors">
            <ArrowUp className="w-3.5 h-3.5 text-rose-400 group-hover:text-white transition-transform group-hover:-translate-y-0.5" />
          </div>
          <span>Lên đầu trang</span>
        </button>
      )}
    </div>
  );
};
