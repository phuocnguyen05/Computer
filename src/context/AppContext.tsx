import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  CartItem,
  Order,
  Review,
  Voucher,
  HomepageSection,
  User,
  UserRole,
  InventoryTransaction,
  ChatConversation,
  ChatMessage,
  WarrantyRecord,
  WarrantyHistoryEntry,
  Notification,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_VOUCHERS,
  INITIAL_SECTIONS,
  INITIAL_USERS,
  INITIAL_CONVERSATIONS,
} from '../data/mockData';
import { db, auth } from '../firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export type ViewType =
  | 'home'
  | 'catalog'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'order-success'
  | 'account'
  | 'profile'
  | 'wishlist'
  | 'orders'
  | 'warranty-check'
  | 'warranty-lookup'
  | 'warranty'
  | 'pc-builder'
  | 'compare'
  | 'service-booking'
  | 'admin'
  | 'login';

export type AccountTab = 'orders' | 'profile' | 'wishlist' | 'loyalty' | 'addresses';

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'reviews'
  | 'vouchers'
  | 'users'
  | 'sections'
  | 'inventory'
  | 'reports'
  | 'chat'
  | 'warranty'
  | 'schema'
  | 'firebase'
  | 'soa';

interface AppContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  canGoBack: boolean;
  canGoNext: boolean;
  goBack: () => void;
  goNext: () => void;
  accountActiveTab: AccountTab;
  setAccountActiveTab: (tab: AccountTab) => void;
  navigateToAccountTab: (tab: AccountTab) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  adminActiveTab: string;
  setAdminActiveTab: (tab: string) => void;
  selectedProductId: number | null;
  setSelectedProductId: (id: number | null) => void;
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Data State
  products: Product[];
  categories: Category[];
  orders: Order[];
  reviews: Review[];
  vouchers: Voucher[];
  sections: HomepageSection[];
  users: User[];
  inventoryLogs: InventoryTransaction[];

  // Cart & Vouchers
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  appliedVoucher: Voucher | null;
  applyVoucher: (code: string) => boolean;
  removeVoucher: () => void;
  discountAmount: number;
  finalTotal: number;

  // Compare & Wishlist
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: number) => void;
  clearCompare: () => void;
  wishlist: number[];
  toggleWishlist: (productId: number) => void;

  // Warranty Records (Electronic Warranty)
  warrantyRecords: WarrantyRecord[];
  setWarrantyRecords: React.Dispatch<React.SetStateAction<WarrantyRecord[]>>;
  addWarrantyRecord: (record: Omit<WarrantyRecord, 'id'>) => void;
  addWarrantyHistory: (recordId: number, entry: Omit<WarrantyHistoryEntry, 'id'>) => void;

  // Active User & Auth
  currentUser: User;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isLoginPromptOpen: boolean;
  setIsLoginPromptOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'forgot';
  setAuthModalTab: (tab: 'login' | 'register' | 'forgot') => void;
  authPromptReason: 'checkout' | 'account' | 'buy_now' | 'review' | 'admin' | 'generic' | 'chat' | null;
  setAuthPromptReason: (reason: 'checkout' | 'account' | 'buy_now' | 'review' | 'admin' | 'generic' | 'chat' | null) => void;
  pendingGuestAction: (() => void) | null;
  setPendingGuestAction: React.Dispatch<React.SetStateAction<(() => void) | null>>;
  promptLoginOrGuest: (onGuestContinue?: () => void, reason?: 'checkout' | 'account' | 'buy_now' | 'review' | 'admin' | 'generic') => void;
  requireAuth: (action: () => void, reason?: 'checkout' | 'account' | 'buy_now' | 'review' | 'admin' | 'generic' | 'chat') => boolean;
  handleLoginPromptResponse: (choice: 'login' | 'no_login') => void;
  handleContinueAsGuest: () => void;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  register: (data: { fullName: string; email: string; phone: string; password?: string; address?: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (data: Partial<User>) => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (emailOrPhone: string, newPassword: string) => Promise<{ success: boolean; message: string; user?: User }>;

  // Orders Actions
  createOrder: (orderData: any) => Promise<Order>;
  placeOrder: (orderData: any) => Promise<Order>;
  updateOrderStatus: (orderId: number | string, status: Order['status']) => Promise<void>;
  cancelOrder: (orderId: number | string, reason?: string) => Promise<void>;

  // Reviews
  addReview: (reviewData: any) => Promise<void>;
  replyReview: (reviewId: number, reply: string) => Promise<void>;
  deleteReview: (reviewId: number) => Promise<void>;

  // Products CRUD
  addProduct: (productData: any) => Promise<void>;
  saveProduct: (productData: Partial<Product>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;

  // Categories CRUD
  saveCategory: (categoryData: Partial<Category>) => Promise<void>;
  addCategory: (categoryData: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: number) => Promise<void>;

  // Vouchers & Flash Sale
  addVoucher: (voucherData: any) => Promise<void>;
  saveVoucher: (voucherData: Partial<Voucher>) => Promise<void>;
  deleteVoucher: (voucherId: number) => Promise<void>;

  // Homepage Sections
  updateSection: (sectionId: number, data: Partial<HomepageSection>) => Promise<void>;
  toggleSection: (sectionId: number) => Promise<void>;

  // Inventory
  importStock: (data: any) => Promise<void>;
  restockProduct: (id: number, qty: number, note?: string) => Promise<void>;

  // User Management
  updateUserRole: (userId: number, role: UserRole) => Promise<void>;
  updateUserStatus: (userId: number, status: 'ACTIVE' | 'LOCKED') => Promise<void>;
  toggleUserStatus: (userId: number) => Promise<void>;

  // Customer Support & Store Chat
  conversations: ChatConversation[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  totalUnreadForStaff: number;
  totalUnreadForCustomer: number;
  customerSendMessage: (text: string, customerData?: { name?: string; phone?: string; email?: string }) => void;
  staffSendMessage: (conversationId: string, text: string) => void;
  markConversationAsReadByStaff: (conversationId: string) => void;
  markConversationAsUnreadByStaff: (conversationId: string) => void;
  markConversationAsReadByCustomer: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  toggleStarConversation: (conversationId: string) => void;

  // Account-Specific Notifications
  notifications: Notification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: number) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: number) => void;
  addNotification: (data: { title: string; message: string; type: Notification['type']; targetUserId?: number | string; linkView?: string }) => void;

  // UI Toasts & Modals
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  lastCreatedOrder: Order | null;
  setLastCreatedOrder: (order: Order | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to remove undefined values before writing to Firestore
const cleanUndefined = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  }
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      cleaned[key] = cleanUndefined(obj[key]);
    }
  }
  return cleaned;
};

// Helper to normalize initial orders
const normalizeOrders = (rawOrders: any[]): Order[] => {
  return rawOrders.map(o => ({
    ...o,
    shippingName: o.receiverName || o.shippingName || 'Khách Hàng',
    shippingPhone: o.phone || o.shippingPhone || '0988667788',
    shippingAddress: o.addressDetail ? `${o.addressDetail}, ${o.ward || ''}, ${o.district || ''}, ${o.province || ''}` : o.shippingAddress || 'Hà Nội',
    orderStatus: o.status || o.orderStatus || 'PENDING',
    status: o.status || o.orderStatus || 'PENDING',
    items: (o.items || []).map((it: any) => ({
      ...it,
      price: it.unitPrice ?? it.price ?? 0,
      unitPrice: it.unitPrice ?? it.price ?? 0,
    })),
  }));
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation History Stack (Back / Next functionality)
  const [viewHistory, setViewHistory] = useState<ViewType[]>(['home']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [currentView, setCurrentViewState] = useState<ViewType>('home');

  const setCurrentView = (newView: ViewType) => {
    if (newView === currentView) return;
    setCurrentViewState(newView);
    setViewHistory(prev => {
      const truncated = prev.slice(0, historyIndex + 1);
      return [...truncated, newView];
    });
    setHistoryIndex(prev => prev + 1);
  };

  const canGoBack = historyIndex > 0;
  const canGoNext = historyIndex < viewHistory.length - 1;

  const goBack = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setCurrentViewState(viewHistory[prevIdx]);
    }
  };

  const goNext = () => {
    if (historyIndex < viewHistory.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setCurrentViewState(viewHistory[nextIdx]);
    }
  };

  const [accountActiveTab, setAccountActiveTab] = useState<AccountTab>('orders');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [adminActiveTab, setAdminActiveTab] = useState<string>('dashboard');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local storage persisted state fallback
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(() => normalizeOrders(INITIAL_ORDERS));
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [sections, setSections] = useState<HomepageSection[]>(INITIAL_SECTIONS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  // Firestore Auto-seeding and Syncing on mount
  useEffect(() => {
    const syncWithFirestore = async () => {
      try {
        const prodSnap = await getDocs(collection(db, 'products'));
        if (prodSnap.empty) {
          for (const p of INITIAL_PRODUCTS) {
            await setDoc(doc(db, 'products', String(p.id)), cleanUndefined(p));
          }
        } else {
          const cloudProds = prodSnap.docs.map(d => d.data() as Product);
          if (cloudProds.length > 0) {
            setProducts(cloudProds);
          }
        }

        const catSnap = await getDocs(collection(db, 'categories'));
        if (catSnap.empty) {
          for (const c of INITIAL_CATEGORIES) {
            await setDoc(doc(db, 'categories', String(c.id)), cleanUndefined(c));
          }
        } else {
          const cloudCats = catSnap.docs.map(d => d.data() as Category);
          if (cloudCats.length > 0) {
            setCategories(cloudCats);
          }
        }

        const userSnap = await getDocs(collection(db, 'users'));
        if (userSnap.empty) {
          for (const u of INITIAL_USERS) {
            await setDoc(doc(db, 'users', String(u.id)), cleanUndefined(u));
          }
        } else {
          const cloudUsers = userSnap.docs.map(d => d.data() as User);
          if (cloudUsers.length > 0) {
            setUsers(cloudUsers);
          }
        }

        const orderSnap = await getDocs(collection(db, 'orders'));
        if (orderSnap.empty) {
          const normOrders = normalizeOrders(INITIAL_ORDERS);
          for (const o of normOrders) {
            await setDoc(doc(db, 'orders', String(o.id)), cleanUndefined(o));
          }
        } else {
          const cloudOrders = orderSnap.docs.map(d => d.data() as Order);
          if (cloudOrders.length > 0) {
            setOrders(cloudOrders);
          }
        }

        const voucherSnap = await getDocs(collection(db, 'vouchers'));
        if (voucherSnap.empty) {
          for (const v of INITIAL_VOUCHERS) {
            await setDoc(doc(db, 'vouchers', String(v.id)), cleanUndefined(v));
          }
        } else {
          const cloudVouchers = voucherSnap.docs.map(d => d.data() as Voucher);
          if (cloudVouchers.length > 0) {
            setVouchers(cloudVouchers);
          }
        }

        const convSnap = await getDocs(collection(db, 'conversations'));
        if (convSnap.empty) {
          for (const c of INITIAL_CONVERSATIONS) {
            await setDoc(doc(db, 'conversations', String(c.id)), cleanUndefined(c));
          }
        } else {
          const cloudConvs = convSnap.docs.map(d => d.data() as ChatConversation);
          if (cloudConvs.length > 0) {
            setConversations(cloudConvs);
          }
        }
      } catch (err) {
        console.error('Error syncing with Firestore:', err);
      }
    };
    syncWithFirestore();
  }, []);

  // Applied Voucher State
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

  // Inventory logs state
  const [inventoryLogs, setInventoryLogs] = useState<InventoryTransaction[]>([
    {
      id: 1,
      productId: 1,
      productName: 'VGA ASUS ROG Strix GeForce RTX 4090 24GB GDDR6X',
      productSku: 'VGA-ASUS-4090-24G',
      transactionType: 'IMPORT',
      changeType: 'IMPORT',
      quantityChange: 10,
      batchNumber: 'BATCH-202603-01',
      quantity: 10,
      unitCost: 52000000,
      supplierName: 'ASUS Việt Nam Distribution',
      note: 'Nhập lô hàng chính ngạch bổ sung kho đợt 1',
      createdByName: 'Nguyễn Quản Trị (ADMIN)',
      createdAt: '2026-03-15T09:30:00Z',
    },
    {
      id: 2,
      productId: 2,
      productName: 'PC Gaming GearTech Ultra Pro Ryzen 7 7800X3D',
      productSku: 'PC-GT-7800X3D-4080S',
      transactionType: 'EXPORT',
      changeType: 'EXPORT',
      quantityChange: 1,
      batchNumber: 'ORD-GT-20260318',
      quantity: 1,
      unitCost: 65000000,
      supplierName: 'Kho Tổng GearTech',
      note: 'Xuất lắp ráp theo đơn hàng #ORD-GT-20260318-001',
      createdByName: 'Trần Kỹ Thuật (STAFF)',
      createdAt: '2026-03-18T10:15:00Z',
    },
  ]);

  // Warranty Records state
  const [warrantyRecords, setWarrantyRecords] = useState<WarrantyRecord[]>([
    {
      id: 1,
      serialNumber: 'SN-VGA-4090-001',
      productName: 'VGA ASUS ROG Strix GeForce RTX 4090 24GB GDDR6X',
      brand: 'ASUS ROG',
      customerName: 'Nguyễn Văn An',
      customerPhone: '0988123456',
      orderCode: 'GT-20250301-8891',
      startDate: '2025-06-15',
      endDate: '2028-06-15',
      warrantyMonths: 36,
      status: 'ACTIVE',
      thumbnailUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
      history: [
        {
          id: 1,
          date: '2025-11-10',
          issue: 'Khách hàng nhờ vệ sinh bụi và kiểm tra nhiệt độ hotspot',
          result: 'Đã vệ sinh, thay keo tản nhiệt gốm, nhiệt độ full load 64°C',
          staffName: 'Trần Kỹ Thuật',
        },
      ],
    },
    {
      id: 2,
      serialNumber: 'SN-CYBER-4090-8891',
      productName: 'PC Gaming GearTech Cyberpunk Ultra i9 14900K | RTX 4090 24GB',
      brand: 'GearTech HighEnd',
      customerName: 'Nguyễn Văn An',
      customerPhone: '0988123456',
      orderCode: 'GT-20250301-8891',
      startDate: '2025-03-01',
      endDate: '2028-03-01',
      warrantyMonths: 36,
      status: 'ACTIVE',
      thumbnailUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
      history: [
        {
          id: 1,
          date: '2025-09-15',
          issue: 'Bảo dưỡng định kỳ 6 tháng miễn phí: thổi bụi, cân chỉnh quạt tản nhiệt nước',
          result: 'Máy hoạt động hoàn hảo, nhiệt độ CPU nhàn rỗi 38°C, cinebench R23 đạt 39.500 điểm',
          staffName: 'Lê Chuyên Viên',
        },
      ],
    },
    {
      id: 3,
      serialNumber: 'SN-KB-FL-OG87-7734',
      productName: 'Bàn Phím Cơ Không Dây FL-Esports OG87 Retro White',
      brand: 'FL-Esports',
      customerName: 'Nguyễn Văn An',
      customerPhone: '0988123456',
      orderCode: 'GT-20250310-7734',
      startDate: '2025-03-10',
      endDate: '2026-03-10',
      warrantyMonths: 12,
      status: 'ACTIVE',
      thumbnailUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      history: [],
    },
    {
      id: 4,
      serialNumber: 'SN-MOUSE-RAZER-V3-7734',
      productName: 'Chuột Gaming Siêu Nhẹ Razer DeathAdder V3 Pro Wireless',
      brand: 'Razer',
      customerName: 'Nguyễn Văn An',
      customerPhone: '0988123456',
      orderCode: 'GT-20250310-7734',
      startDate: '2025-03-10',
      endDate: '2027-03-10',
      warrantyMonths: 24,
      status: 'ACTIVE',
      thumbnailUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
      history: [],
    },
    {
      id: 5,
      serialNumber: 'SN-PC-7800-002',
      productName: 'PC Gaming GearTech Phoenix Ryzen 7 7800X3D | RTX 4070 Ti Super 16GB',
      brand: 'GearTech Gaming',
      customerName: 'Trần Văn Khách',
      customerPhone: '0912345678',
      orderCode: 'GT-20250312-6611',
      startDate: '2025-08-20',
      endDate: '2028-08-20',
      warrantyMonths: 36,
      status: 'ACTIVE',
      thumbnailUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
      history: [],
    },
    {
      id: 6,
      serialNumber: 'SN-MON-OLED-240-009',
      productName: 'Màn Hình Gaming ASUS ROG Swift OLED PG27AQDM 27 inch 240Hz 0.03ms',
      brand: 'ASUS ROG',
      customerName: 'Hoàng Minh Tuấn',
      customerPhone: '0933123456',
      orderCode: 'GT-20250218-1290',
      startDate: '2024-02-18',
      endDate: '2027-02-18',
      warrantyMonths: 36,
      status: 'ACTIVE',
      thumbnailUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
      history: [],
    },
  ]);

  const addWarrantyRecord = (record: Omit<WarrantyRecord, 'id'>) => {
    const newRecord: WarrantyRecord = {
      ...record,
      id: Date.now(),
      history: record.history || [],
    };
    setWarrantyRecords(prev => [newRecord, ...prev]);
    showToast(`Đã thêm thiết bị ${newRecord.serialNumber} vào hệ thống bảo hành`, 'success');
  };

  const addWarrantyHistory = (recordId: number, entry: Omit<WarrantyHistoryEntry, 'id'>) => {
    setWarrantyRecords(prev =>
      prev.map(r => {
        if (r.id === recordId) {
          const newEntry: WarrantyHistoryEntry = {
            ...entry,
            id: Date.now(),
          };
          return {
            ...r,
            history: [newEntry, ...(r.history || [])],
          };
        }
        return r;
      })
    );
    showToast('Đã cập nhật nhật ký bảo trì / sửa chữa thiết bị', 'success');
  };

  // Current User & Auth State
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Per-Account Data Isolation (Database riêng cho mỗi tài khoản)
  const currentUserId = isLoggedIn ? String(currentUser.id) : 'guest';

  const [userCarts, setUserCarts] = useState<Record<string, CartItem[]>>(() => {
    try {
      const saved = localStorage.getItem('geartech_user_carts');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      guest: [],
      '1': [{ product: INITIAL_PRODUCTS[0], quantity: 1 }],
      '2': [{ product: INITIAL_PRODUCTS[1], quantity: 1 }],
      '3': [{ product: INITIAL_PRODUCTS[4], quantity: 1 }],
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('geartech_user_carts', JSON.stringify(userCarts));
    } catch {}
  }, [userCarts]);

  const [userWishlists, setUserWishlists] = useState<Record<string, number[]>>(() => {
    try {
      const saved = localStorage.getItem('geartech_user_wishlists');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      guest: [1, 6],
      '1': [1, 2, 6],
      '2': [3, 4],
      '3': [1, 6],
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('geartech_user_wishlists', JSON.stringify(userWishlists));
    } catch {}
  }, [userWishlists]);

  // Account-Specific Notifications State
  const [userNotifications, setUserNotifications] = useState<Record<string, Notification[]>>({
    guest: [
      {
        id: 100,
        userId: 'guest',
        title: 'Chào mừng bạn đến với GearTech!',
        message: 'Đăng ký tài khoản ngay để nhận 50 điểm thưởng tích lũy và ưu đãi mua sắm độc quyền.',
        type: 'PROMO',
        timestamp: new Date().toISOString(),
        isRead: false,
      },
    ],
    '1': [
      {
        id: 1,
        userId: '1',
        title: 'Xác nhận đơn hàng #GT-20250301-8891',
        message: 'Đơn hàng PC Gaming & VGA RTX 4090 của bạn đã được tiếp nhận và chuẩn bị đóng gói.',
        type: 'ORDER',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        isRead: false,
        linkView: 'orders',
      },
      {
        id: 2,
        userId: '1',
        title: 'Bảo hành điện tử kích hoạt thành công',
        message: 'Thiết bị ASUS ROG Strix GeForce RTX 4090 đã được kích hoạt bảo hành 36 tháng đến 15/06/2028.',
        type: 'WARRANTY',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        isRead: false,
        linkView: 'warranty-lookup',
      },
      {
        id: 3,
        userId: '1',
        title: 'Cảnh báo bảo mật tài khoản',
        message: 'Tài khoản của bạn vừa đăng nhập thành công từ trình duyệt Chrome trên Windows (Hà Nội, VN).',
        type: 'SECURITY',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        isRead: true,
      },
    ],
    '2': [
      {
        id: 201,
        userId: '2',
        title: 'Đơn hàng #GT-20250312-6611 đang giao',
        message: 'Đơn hàng PC Gaming Phoenix của bạn đang được shipper vận chuyển.',
        type: 'ORDER',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        isRead: false,
        linkView: 'orders',
      },
    ],
    '3': [
      {
        id: 301,
        userId: '3',
        title: 'Chào mừng Quản Trị Viên (ADMIN)',
        message: 'Hệ thống e-commerce GearTech hoạt động hoàn hảo với cơ chế phân quyền bảo mật cao.',
        type: 'SYSTEM',
        timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
        isRead: false,
      },
    ],
  });

  const notifications = userNotifications[currentUserId] || [];
  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  const markNotificationAsRead = (id: number) => {
    setUserNotifications(prev => ({
      ...prev,
      [currentUserId]: (prev[currentUserId] || []).map(n => (n.id === id ? { ...n, isRead: true } : n)),
    }));
  };

  const markAllNotificationsAsRead = () => {
    setUserNotifications(prev => ({
      ...prev,
      [currentUserId]: (prev[currentUserId] || []).map(n => ({ ...n, isRead: true })),
    }));
    showToast('Đã đánh dấu tất cả thông báo là đã đọc', 'success');
  };

  const deleteNotification = (id: number) => {
    setUserNotifications(prev => ({
      ...prev,
      [currentUserId]: (prev[currentUserId] || []).filter(n => n.id !== id),
    }));
  };

  const addNotification = (data: { title: string; message: string; type: Notification['type']; targetUserId?: number | string; linkView?: string }) => {
    const tId = data.targetUserId ? String(data.targetUserId) : currentUserId;
    const newNotif: Notification = {
      id: Date.now(),
      userId: tId,
      title: data.title,
      message: data.message,
      type: data.type,
      timestamp: new Date().toISOString(),
      isRead: false,
      linkView: data.linkView,
    };
    setUserNotifications(prev => {
      const existing = prev[tId] || [];
      return {
        ...prev,
        [tId]: [newNotif, ...existing],
      };
    });
  };

  // Derived current cart and wishlist for logged-in / guest user
  const cart = userCarts[currentUserId] || [];
  const wishlist = userWishlists[currentUserId] || [];

  const setCart = (updater: React.SetStateAction<CartItem[]>) => {
    setUserCarts(prev => {
      const currentCart = prev[currentUserId] || [];
      const nextCart = typeof updater === 'function' ? updater(currentCart) : updater;
      return {
        ...prev,
        [currentUserId]: nextCart,
      };
    });
  };

  const setWishlist = (updater: React.SetStateAction<number[]>) => {
    setUserWishlists(prev => {
      const currentWishlist = prev[currentUserId] || [];
      const nextWishlist = typeof updater === 'function' ? updater(currentWishlist) : updater;
      return {
        ...prev,
        [currentUserId]: nextWishlist,
      };
    });
  };

  // Compare List
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [authPromptReason, setAuthPromptReason] = useState<'checkout' | 'account' | 'buy_now' | 'review' | 'admin' | 'generic' | 'chat' | null>(null);
  const [pendingGuestAction, setPendingGuestAction] = useState<(() => void) | null>(null);
  const [pendingWishlistProductId, setPendingWishlistProductId] = useState<number | null>(null);

  // Trigger login prompt question ("Bạn có muốn đăng nhập không?") or execute action directly if already logged in
  const promptLoginOrGuest = (
    onSuccessAction?: () => void,
    reason: 'checkout' | 'account' | 'buy_now' | 'review' | 'admin' | 'generic' = 'generic'
  ) => {
    if (isLoggedIn) {
      if (onSuccessAction) onSuccessAction();
      return;
    }
    setAuthPromptReason(reason);
    setPendingGuestAction(() => onSuccessAction || null);
    setIsLoginPromptOpen(true);
  };

  // Auth Guard Wrapper / Middleware function (Early Return if not logged in)
  const requireAuth = (
    action: () => void,
    reason: 'checkout' | 'account' | 'buy_now' | 'review' | 'admin' | 'generic' | 'chat' = 'generic'
  ): boolean => {
    if (!isLoggedIn) {
      setAuthPromptReason(reason);
      setPendingGuestAction(() => action);
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      showToast('Vui lòng đăng nhập để thực hiện hành động này', 'info');
      return false; // Chặn triệt để tiến trình (Early Return)
    }
    action();
    return true;
  };

  // Handle choice from LoginPromptModal ("Bạn có muốn đăng nhập không?")
  const handleLoginPromptResponse = (choice: 'login' | 'no_login') => {
    setIsLoginPromptOpen(false);
    if (choice === 'login') {
      setIsAuthModalOpen(true);
      setAuthModalTab('login');
    } else {
      // User chose "Không đăng nhập": cancel action, clear pending action
      setPendingGuestAction(null);
      setAuthPromptReason(null);
      showToast('Đã hủy hành động yêu cầu đăng nhập', 'info');
    }
  };

  // Continue action after login
  const handleContinueAsGuest = () => {
    setIsAuthModalOpen(false);
    setIsLoginPromptOpen(false);
    if (authPromptReason === 'checkout') {
      setPendingGuestAction(null);
      setAuthPromptReason(null);
      setCurrentView('cart');
      showToast('Thanh toán không thành công do chưa đăng nhập', 'error');
      return;
    }
    if (pendingGuestAction) {
      pendingGuestAction();
      setPendingGuestAction(null);
    } else {
      setCurrentView('checkout');
    }
    setAuthPromptReason(null);
  };

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  // Customer Support & Store Chat State
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState<string | null>(INITIAL_CONVERSATIONS[0]?.id || null);

  const totalUnreadForStaff = conversations.reduce((sum, c) => sum + (c.unreadCountForStaff || 0), 0);
  const totalUnreadForCustomer = conversations.reduce((sum, c) => sum + (c.unreadCountForCustomer || 0), 0);

  // Customer sends message
  const customerSendMessage = (
    text: string,
    customerData?: { name?: string; phone?: string; email?: string }
  ) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const customerId = currentUser ? String(currentUser.id) : 'guest-current';
    const customerName = customerData?.name || currentUser?.fullName || 'Khách Hàng';
    const customerPhone = customerData?.phone || currentUser?.phone || '';
    const customerEmail = customerData?.email || currentUser?.email || '';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: 'CUSTOMER',
      senderRole: currentUser?.role || 'USER',
      senderName: customerName,
      senderAvatar: currentUser?.avatar,
      text: trimmed,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setConversations(prev => {
      const existingIndex = prev.findIndex(
        c => c.customerId === customerId || (customerPhone && c.customerPhone === customerPhone)
      );

      if (existingIndex >= 0) {
        const target = prev[existingIndex];
        const updatedTarget: ChatConversation = {
          ...target,
          customerName: customerName || target.customerName,
          customerPhone: customerPhone || target.customerPhone,
          customerEmail: customerEmail || target.customerEmail,
          lastMessageText: trimmed,
          lastMessageAt: new Date().toISOString(),
          unreadCountForStaff: (target.unreadCountForStaff || 0) + 1,
          messages: [...target.messages, newMsg],
        };
        const updatedList = [...prev];
        updatedList.splice(existingIndex, 1);
        return [updatedTarget, ...updatedList];
      } else {
        const newConv: ChatConversation = {
          id: `conv-${Date.now()}`,
          customerId,
          customerName,
          customerPhone,
          customerEmail,
          status: 'ACTIVE',
          isStarred: false,
          unreadCountForStaff: 1,
          unreadCountForCustomer: 0,
          lastMessageText: trimmed,
          lastMessageAt: new Date().toISOString(),
          messages: [newMsg],
        };
        return [newConv, ...prev];
      }
    });
  };

  // Staff / Admin sends reply
  const staffSendMessage = (conversationId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const staffName = currentUser?.fullName || (currentUser?.role === 'ADMIN' ? 'Quản Trị Viên' : 'Nhân Viên CSKH');
    const staffRole = currentUser?.role === 'ADMIN' ? 'ADMIN' : 'STAFF';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: 'STORE',
      senderRole: staffRole,
      senderName: staffName,
      senderAvatar: currentUser?.avatar,
      text: trimmed,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessageText: trimmed,
            lastMessageAt: new Date().toISOString(),
            unreadCountForStaff: 0,
            unreadCountForCustomer: (c.unreadCountForCustomer || 0) + 1,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );
  };

  const markConversationAsReadByStaff = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            unreadCountForStaff: 0,
            messages: c.messages.map(m => (m.sender === 'CUSTOMER' ? { ...m, isRead: true } : m)),
          };
        }
        return c;
      })
    );
  };

  const markConversationAsUnreadByStaff = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            unreadCountForStaff: Math.max(1, (c.unreadCountForStaff || 0) + 1),
          };
        }
        return c;
      })
    );
  };

  const markConversationAsReadByCustomer = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            unreadCountForCustomer: 0,
            messages: c.messages.map(m => (m.sender === 'STORE' ? { ...m, isRead: true } : m)),
          };
        }
        return c;
      })
    );
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (activeChatId === conversationId) {
      setActiveChatId(null);
    }
    showToast('Đã xóa hội thoại chat', 'info');
  };

  const toggleStarConversation = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, isStarred: !c.isStarred } : c))
    );
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Login handler
  const login = async (identifier: string, password?: string): Promise<{ success: boolean; message: string }> => {
    const trimmed = identifier.trim().toLowerCase();
    const foundUser = users.find(
      u => u.email.toLowerCase() === trimmed || u.username.toLowerCase() === trimmed || u.phone === trimmed
    );

    if (!foundUser) {
      showToast('Tài khoản không tồn tại trên hệ thống', 'error');
      return { success: false, message: 'Tài khoản không tồn tại trên hệ thống' };
    }

    if (foundUser.status === 'LOCKED') {
      showToast('Tài khoản này đã bị khóa do vi phạm chính sách', 'error');
      return { success: false, message: 'Tài khoản đã bị tạm khóa' };
    }

    // Check password if set
    if (password && foundUser.password && foundUser.password !== password) {
      showToast('Mật khẩu không chính xác, vui lòng thử lại', 'error');
      return { success: false, message: 'Mật khẩu không chính xác' };
    }

    setCurrentUser(foundUser);
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);
    showToast(`Chào mừng ${foundUser.fullName} (${foundUser.role}) quay trở lại!`, 'success');

    if (pendingWishlistProductId !== null) {
      if (!wishlist.includes(pendingWishlistProductId)) {
        setWishlist(prev => [...prev, pendingWishlistProductId]);
        showToast('Đã tự động thêm sản phẩm vào danh sách yêu thích của bạn!', 'success');
      }
      setPendingWishlistProductId(null);
    }

    if (pendingGuestAction) {
      pendingGuestAction();
      setPendingGuestAction(null);
    }

    return { success: true, message: 'Đăng nhập thành công' };
  };

  // Google Sign-In handler (Role = USER, Points = 0)
  const loginWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      const email = googleUser.email || 'user@gmail.com';
      const fullName = googleUser.displayName || email.split('@')[0];
      const avatar = googleUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

      let existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!existingUser) {
        existingUser = {
          id: Date.now(),
          username: email.split('@')[0],
          fullName,
          email,
          phone: googleUser.phoneNumber || '0988667788',
          role: 'USER', // Khách hàng
          address: 'Việt Nam',
          points: 0, // Điểm tích lũy = 0đ theo yêu cầu
          status: 'ACTIVE',
          avatar,
          createdAt: new Date().toISOString(),
        };
        setUsers(prev => [...prev, existingUser!]);
        try {
          await setDoc(doc(db, 'users', String(existingUser.id)), existingUser);
        } catch (e) {
          console.error("Firestore sync user error:", e);
        }
      }

      setCurrentUser(existingUser);
      setIsLoggedIn(true);
      setIsAuthModalOpen(false);
      showToast(`Đăng nhập Google thành công! Chào mừng ${existingUser.fullName}`, 'success');

      if (pendingGuestAction) {
        pendingGuestAction();
        setPendingGuestAction(null);
      }

      return { success: true, message: 'Đăng nhập Google thành công' };
    } catch (err: any) {
      const errorCode = err?.code || '';
      const errorMsg = err?.message || String(err);
      if (
        errorCode === 'auth/popup-closed-by-user' ||
        errorCode === 'auth/cancelled-popup-request' ||
        errorMsg.includes('closed') ||
        errorMsg.includes('cancelled')
      ) {
        showToast('Đã hủy đăng nhập Google', 'info');
        return { success: false, message: 'Đã hủy đăng nhập Google' };
      }

      console.error('Google Sign-In Error:', err);
      showToast(`Đăng nhập Google thất bại: ${errorMsg}`, 'error');
      return { success: false, message: errorMsg };
    }
  };

  // Register handler
  const register = async (data: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    address?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const emailTrim = data.email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === emailTrim)) {
      showToast('Email này đã được đăng ký, vui lòng đăng nhập', 'error');
      return { success: false, message: 'Email đã tồn tại' };
    }

    const newUser: User = {
      id: Date.now(),
      username: emailTrim.split('@')[0],
      fullName: data.fullName.trim(),
      email: emailTrim,
      phone: data.phone.trim(),
      password: data.password || '123456',
      role: 'USER',
      address: data.address || 'Hà Nội, Việt Nam',
      points: 50, // Welcome bonus points
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);
    showToast(`Đăng ký thành công! Tặng ngay 50 điểm thưởng cho ${newUser.fullName}`, 'success');
    return { success: true, message: 'Đăng ký thành công' };
  };

  // Logout handler
  const logout = () => {
    setIsLoggedIn(false);
    // When logged out, stay as guest user or reset
    if (currentView === 'admin') {
      setCurrentView('home');
    }
    showToast('Đã đăng xuất khỏi tài khoản', 'info');
  };

  // Switch role quickly for review / admin testing
  const switchRole = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role) || users[0];
    setCurrentUser(targetUser);
    setIsLoggedIn(true);
    if (role === 'ADMIN') {
      showToast(`Đã chuyển sang tài khoản ADMIN: ${targetUser.fullName} (Toàn quyền quản trị)`, 'info');
    } else if (role === 'STAFF') {
      showToast(`Đã chuyển sang tài khoản STAFF: ${targetUser.fullName} (Nhân viên kỹ thuật/đơn hàng)`, 'info');
    } else {
      showToast(`Đã chuyển sang tài khoản KHÁCH HÀNG: ${targetUser.fullName}`, 'info');
    }
  };

  const updateUserProfile = (data: Partial<User>) => {
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
    showToast('Cập nhật thông tin tài khoản thành công!');
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    // Default fallback demo passwords: 'admin' for ADMIN, 'staff' for STAFF, 'user' for USER
    const defaultPasswordForRole = currentUser.role === 'ADMIN' ? 'admin' : currentUser.role === 'STAFF' ? 'staff' : 'user';
    const currentExpectedPassword = currentUser.password || defaultPasswordForRole;

    if (!oldPassword || oldPassword.trim() === '') {
      showToast('Vui lòng nhập mật khẩu hiện tại', 'error');
      return { success: false, message: 'Vui lòng nhập mật khẩu hiện tại' };
    }

    if (oldPassword !== currentExpectedPassword) {
      showToast('Mật khẩu hiện tại không chính xác, vui lòng thử lại', 'error');
      return { success: false, message: 'Mật khẩu hiện tại không chính xác' };
    }

    if (!newPassword || newPassword.trim().length < 6) {
      showToast('Mật khẩu mới phải có tối thiểu 6 ký tự', 'error');
      return { success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' };
    }

    if (newPassword === oldPassword) {
      showToast('Mật khẩu mới không được trùng với mật khẩu hiện tại', 'error');
      return { success: false, message: 'Mật khẩu mới trùng với mật khẩu hiện tại' };
    }

    const updated = { ...currentUser, password: newPassword };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
    showToast('Đổi mật khẩu thành công! Mật khẩu mới đã có hiệu lực.', 'success');
    return { success: true, message: 'Đổi mật khẩu thành công' };
  };

  const resetPassword = async (emailOrPhone: string, newPassword: string): Promise<{ success: boolean; message: string; user?: User }> => {
    const trimmed = emailOrPhone.trim().toLowerCase();
    if (!trimmed) {
      showToast('Vui lòng nhập email hoặc số điện thoại tài khoản', 'error');
      return { success: false, message: 'Vui lòng nhập thông tin tài khoản' };
    }

    const foundUser = users.find(
      u => u.email.toLowerCase() === trimmed || u.phone.toLowerCase() === trimmed || u.username.toLowerCase() === trimmed
    );

    if (!foundUser) {
      showToast('Không tìm thấy tài khoản với thông tin này trên hệ thống', 'error');
      return { success: false, message: 'Tài khoản không tồn tại trên hệ thống' };
    }

    if (!newPassword || newPassword.trim().length < 6) {
      showToast('Mật khẩu mới phải có tối thiểu 6 ký tự', 'error');
      return { success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' };
    }

    const updatedUser = { ...foundUser, password: newPassword };
    setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));

    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }

    showToast(`Đặt lại mật khẩu thành công cho tài khoản ${foundUser.fullName}!`, 'success');
    return { success: true, message: 'Đặt lại mật khẩu thành công', user: updatedUser };
  };

  // Cart operations
  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    // Find live product from state to ensure updated stock
    const liveProduct = products.find(p => p.id === product.id) || product;
    const maxStock = liveProduct.stock ?? 0;

    // Check if out of stock
    if (maxStock <= 0) {
      showToast(`Sản phẩm "${liveProduct.name.slice(0, 30)}..." hiện đã HẾT HÀNG!`, 'error');
      return;
    }

    const existingItem = cart.find(item => item.product.id === liveProduct.id);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const requestedTotal = currentQtyInCart + quantityToAdd;

    // Check if already reached max stock
    if (currentQtyInCart >= maxStock) {
      showToast(
        `Không thể thêm! Giỏ hàng đã có ${currentQtyInCart} sản phẩm (đạt tối đa số lượng kho còn tồn: ${maxStock} sản phẩm).`,
        'error'
      );
      return;
    }

    // Check if total requested exceeds available stock
    if (requestedTotal > maxStock) {
      const allowedAdd = maxStock - currentQtyInCart;
      setCart(prev => {
        const exists = prev.some(item => item.product.id === liveProduct.id);
        if (exists) {
          return prev.map(item =>
            item.product.id === liveProduct.id ? { ...item, quantity: maxStock, product: liveProduct } : item
          );
        }
        return [...prev, { product: liveProduct, quantity: maxStock }];
      });
      showToast(
        `Kho chỉ còn ${maxStock} sản phẩm! Đã tự động điều chỉnh thêm ${allowedAdd} sản phẩm để vừa đủ số lượng tồn kho.`,
        'error'
      );
      return;
    }

    // Normal add to cart
    setCart(prev => {
      const existing = prev.find(item => item.product.id === liveProduct.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === liveProduct.id
            ? { ...item, quantity: item.quantity + quantityToAdd, product: liveProduct }
            : item
        );
      }
      return [...prev, { product: liveProduct, quantity: quantityToAdd }];
    });
    showToast(`Đã thêm "${liveProduct.name.slice(0, 32)}..." vào giỏ hàng!`, 'success');
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  };

  const updateCartQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const liveProduct = products.find(p => p.id === productId);
    const maxStock = liveProduct ? liveProduct.stock : 999;

    if (liveProduct && newQuantity > maxStock) {
      setCart(prev =>
        prev.map(item => (item.product.id === productId ? { ...item, quantity: maxStock } : item))
      );
      showToast(
        `Rất tiếc, kho chỉ còn ${maxStock} sản phẩm! Đã tự động giới hạn tối đa ${maxStock} sản phẩm.`,
        'error'
      );
      return;
    }

    setCart(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedVoucher(null);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.priceSale * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Voucher Calculation
  const calculateDiscount = () => {
    if (!appliedVoucher) return 0;
    const minOrderVal = appliedVoucher.minOrder ?? appliedVoucher.minOrderAmount ?? 0;
    if (cartTotal < minOrderVal) return 0;

    let discount = 0;
    const val = appliedVoucher.value ?? appliedVoucher.discountValue ?? 0;
    if (appliedVoucher.discountType === 'PERCENT') {
      discount = Math.round((cartTotal * val) / 100);
      const maxD = appliedVoucher.maxDiscount ?? appliedVoucher.maxDiscountAmount;
      if (maxD && discount > maxD) {
        discount = maxD;
      }
    } else {
      discount = val;
    }
    return Math.min(discount, cartTotal);
  };

  const discountAmount = calculateDiscount();
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const applyVoucher = (code: string): boolean => {
    const found = vouchers.find(
      v => v.code.toUpperCase() === code.trim().toUpperCase() && v.status === 'ACTIVE'
    );
    if (!found) {
      showToast('Mã giảm giá không hợp lệ hoặc đã hết hạn', 'error');
      return false;
    }
    const minOrderVal = found.minOrder ?? found.minOrderAmount ?? 0;
    if (cartTotal < minOrderVal) {
      showToast(`Đơn hàng cần tối thiểu ${(minOrderVal / 1000000).toFixed(1)} Triệu để dùng mã này`, 'error');
      return false;
    }
    setAppliedVoucher(found);
    showToast(`Áp dụng thành công mã voucher "${found.code}"!`, 'success');
    return true;
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    showToast('Đã gỡ mã giảm giá', 'info');
  };

  // Compare & Wishlist
  const addToCompare = (product: Product) => {
    if (compareList.find(p => p.id === product.id)) {
      showToast('Sản phẩm đã có trong danh sách so sánh', 'info');
      return;
    }
    if (compareList.length >= 4) {
      showToast('Tối đa so sánh cùng lúc 4 sản phẩm', 'error');
      return;
    }
    setCompareList(prev => [...prev, product]);
    showToast(`Đã thêm "${product.name.slice(0, 24)}..." vào bộ so sánh!`);
  };

  const removeFromCompare = (productId: number) => {
    setCompareList(prev => prev.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
    showToast('Đã xóa toàn bộ danh sách so sánh', 'info');
  };

  const toggleWishlist = (productId: number) => {
    if (!isLoggedIn) {
      setPendingWishlistProductId(productId);
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      showToast('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích. Sản phẩm sẽ được tự động thêm sau khi đăng nhập!', 'info');
      return;
    }
    if (wishlist.includes(productId)) {
      setWishlist(prev => prev.filter(id => id !== productId));
      showToast('Đã xóa khỏi danh sách yêu thích', 'info');
    } else {
      setWishlist(prev => [...prev, productId]);
      showToast('Đã thêm vào danh sách yêu thích!');
    }
  };

  // Order Placement
  const createOrder = async (orderData: any): Promise<Order> => {
    const orderDate = new Date();
    const orderCode = `GT-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const items = (orderData.items || cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      productThumbnail: item.product.thumbnailUrl,
      quantity: item.quantity,
      unitPrice: item.product.priceSale,
      price: item.product.priceSale,
      warrantyMonths: item.product.warrantyMonths,
    }))).map((item: any, idx: number) => {
      const warrantyMonths = item.warrantyMonths || 24;
      const endDate = new Date(orderDate);
      endDate.setMonth(endDate.getMonth() + warrantyMonths);

      // Decrease stock
      setProducts(prev =>
        prev.map(p =>
          p.id === item.productId
            ? { ...p, stock: Math.max(0, p.stock - item.quantity), soldCount: p.soldCount + item.quantity }
            : p
        )
      );

      const priceVal = item.unitPrice ?? item.price ?? 0;

      return {
        id: Date.now() + idx,
        orderId: 0,
        productId: item.productId,
        productName: item.productName,
        productThumbnail: item.productThumbnail,
        quantity: item.quantity,
        unitPrice: priceVal,
        price: priceVal,
        totalPrice: priceVal * item.quantity,
        warrantyMonths,
        warrantyEndDate: endDate.toISOString().split('T')[0],
      };
    });

    const newTotal = orderData.totalAmount || finalTotal + (orderData.shippingFee || 0);

    const newOrder: Order = {
      id: Date.now(),
      orderCode,
      userId: currentUser.id,
      orderDate: orderDate.toISOString(),
      receiverName: orderData.shippingName || orderData.receiverName || currentUser.fullName,
      shippingName: orderData.shippingName || orderData.receiverName || currentUser.fullName,
      phone: orderData.shippingPhone || orderData.phone || currentUser.phone,
      shippingPhone: orderData.shippingPhone || orderData.phone || currentUser.phone,
      province: orderData.province || 'Hà Nội',
      district: orderData.district || 'Cầu Giấy',
      ward: orderData.ward || 'Dịch Vọng Hậu',
      addressDetail: orderData.shippingAddress || orderData.addressDetail || '102 Duy Tân',
      shippingAddress: orderData.shippingAddress || orderData.addressDetail || '102 Duy Tân, Cầu Giấy, Hà Nội',
      shippingMethod: orderData.shippingMethod || 'Tiêu Chuẩn Toàn Quốc',
      note: orderData.orderNote || orderData.note || '',
      orderNote: orderData.orderNote || orderData.note || '',
      paymentMethod: orderData.paymentMethod || 'COD',
      paymentStatus: orderData.paymentStatus || (orderData.paymentMethod === 'VNPAY_QR' ? 'PAID' : 'UNPAID'),
      voucherCode: appliedVoucher?.code || orderData.voucherCode || null,
      discountAmount: discountAmount || orderData.discountAmount || 0,
      shippingFee: orderData.shippingFee || 0,
      totalAmount: newTotal,
      status: 'PENDING',
      orderStatus: 'PENDING',
      items,
      createdAt: orderDate.toISOString(),
      vatInvoice: orderData.vatInvoice || null,
    };

    setOrders(prev => [newOrder, ...prev]);
    setLastCreatedOrder(newOrder);
    clearCart();

    // Add notification for user
    addNotification({
      title: `Đặt hàng thành công #${orderCode}`,
      message: `Đơn hàng trị giá ${newTotal.toLocaleString('vi-VN')}đ của bạn đã được ghi nhận. Trạng thái: Chờ xác nhận.`,
      type: 'ORDER',
      linkView: 'orders',
    });

    // Reward points (100k = 1 point)
    const earnedPoints = Math.floor(newOrder.totalAmount / 100000);
    setCurrentUser(prev => ({ ...prev, points: prev.points + earnedPoints }));

    return newOrder;
  };

  const placeOrder = createOrder;

  const updateOrderStatus = async (orderId: number | string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(o =>
        String(o.id) === String(orderId) || o.orderCode === String(orderId)
          ? {
              ...o,
              status,
              orderStatus: status,
              paymentStatus: status === 'DELIVERED' || status === 'COMPLETED' ? 'PAID' : o.paymentStatus,
            }
          : o
      )
    );
    showToast(`Đã cập nhật trạng thái đơn hàng thành "${status}"`);
  };

  const cancelOrder = async (orderId: number | string, reason?: string) => {
    const targetOrder = orders.find(o => String(o.id) === String(orderId) || o.orderCode === String(orderId));
    if (targetOrder && targetOrder.items) {
      setProducts(prevProds =>
        prevProds.map(p => {
          const matchedItem = targetOrder.items.find(it => it.productId === p.id);
          if (matchedItem) {
            return {
              ...p,
              stock: p.stock + matchedItem.quantity,
              soldCount: Math.max(0, p.soldCount - matchedItem.quantity),
            };
          }
          return p;
        })
      );
    }

    setOrders(prev =>
      prev.map(o =>
        String(o.id) === String(orderId) || o.orderCode === String(orderId)
          ? {
              ...o,
              status: 'CANCELLED',
              orderStatus: 'CANCELLED',
              note: reason ? `${o.note ? o.note + ' | ' : ''}Lý do hủy: ${reason}` : o.note,
            }
          : o
      )
    );
    showToast('Đã hủy đơn hàng thành công!', 'info');
  };

  // Reviews
  const addReview = async (reviewData: any) => {
    const newRev: Review = {
      id: Date.now(),
      productId: reviewData.productId,
      productName: reviewData.productName,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      rating: reviewData.rating,
      comment: reviewData.comment,
      imageUrl: reviewData.imageUrl,
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
    };

    setReviews(prev => [newRev, ...prev]);
    // update product rating
    setProducts(prev =>
      prev.map(p => {
        if (p.id === reviewData.productId) {
          const newReviewCount = p.reviewCount + 1;
          const newRatingAvg = Number(
            ((p.ratingAvg * p.reviewCount + reviewData.rating) / newReviewCount).toFixed(2)
          );
          return { ...p, ratingAvg: newRatingAvg, reviewCount: newReviewCount };
        }
        return p;
      })
    );
    showToast('Cảm ơn bạn đã gửi đánh giá cho sản phẩm!');
  };

  const replyReview = async (reviewId: number, sellerReply: string) => {
    setReviews(prev =>
      prev.map(r =>
        r.id === reviewId
          ? { ...r, sellerReply, sellerReplyAt: new Date().toISOString() }
          : r
      )
    );
    showToast('Đã gửi phản hồi chính thức từ GearTech!');
  };

  const deleteReview = async (reviewId: number) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    showToast('Đã xóa đánh giá vi phạm', 'info');
  };

  // Products CRUD
  const saveProduct = async (productData: Partial<Product>) => {
    if (productData.id) {
      setProducts(prev =>
        prev.map(p => (p.id === productData.id ? ({ ...p, ...productData } as Product) : p))
      );
      showToast('Đã cập nhật thông tin sản phẩm thành công!');
    } else {
      const newProd: Product = {
        id: Date.now(),
        name: productData.name || 'Sản phẩm mới',
        slug: (productData.name || 'san-pham').toLowerCase().replace(/\s+/g, '-'),
        sku: productData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        priceOriginal: productData.priceOriginal || 1000000,
        priceSale: productData.priceSale || 850000,
        stock: productData.stock || 10,
        minStockThreshold: productData.minStockThreshold || 5,
        categoryId: productData.categoryId || 31,
        categoryName: productData.categoryName || 'Linh Kiện',
        brand: productData.brand || 'GearTech',
        warrantyMonths: productData.warrantyMonths || 24,
        thumbnailUrl:
          productData.thumbnailUrl ||
          'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
        images: productData.images || [
          'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
        ],
        pinnedSection: productData.pinnedSection || null,
        specs: productData.specs || [],
        description: productData.description || 'Mô tả sản phẩm linh kiện chính hãng tại GearTech.',
        ratingAvg: 5.0,
        reviewCount: 0,
        soldCount: 0,
        status: 'ACTIVE',
        isFlashSale: !!productData.isFlashSale,
        createdAt: new Date().toISOString(),
      };
      setProducts(prev => [newProd, ...prev]);
      showToast('Đã thêm sản phẩm mới thành công!');
    }
  };

  const addProduct = saveProduct;
  const updateProduct = async (p: Product) => saveProduct(p);

  const deleteProduct = async (productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Đã xóa sản phẩm khỏi kho', 'info');
  };

  // Categories CRUD
  const saveCategory = async (catData: Partial<Category>) => {
    const rawName = (catData.name || '').trim();
    if (!rawName) {
      showToast('Tên danh mục không được để trống!', 'error');
      return;
    }

    const generateSlug = (text: string) =>
      text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const slug = (catData.slug && catData.slug.trim()) ? generateSlug(catData.slug) : generateSlug(rawName);

    if (catData.id) {
      // EDITING EXISTING CATEGORY
      const catId = catData.id;
      setCategories(prev => {
        // Case 1: Target category is top-level
        const isTopLevel = prev.some(c => c.id === catId);

        if (isTopLevel) {
          // If moving a top-level category to become a child under another parent
          if (catData.parentId) {
            const currentCat = prev.find(c => c.id === catId)!;
            const updatedAsChild: Category = {
              id: catId,
              name: rawName,
              slug,
              parentId: catData.parentId,
              description: catData.description || currentCat.description || '',
            };
            return prev
              .filter(c => c.id !== catId)
              .map(p => {
                if (p.id === catData.parentId) {
                  return {
                    ...p,
                    children: [...(p.children || []), updatedAsChild],
                  };
                }
                return p;
              });
          }

          // Otherwise stays top-level
          return prev.map(c => {
            if (c.id === catId) {
              return {
                ...c,
                name: rawName,
                slug,
                description: catData.description !== undefined ? catData.description : c.description,
                icon: catData.icon || c.icon || 'FolderTree',
                parentId: null,
                children: c.children || [],
              };
            }
            return c;
          });
        }

        // Case 2: Target category is a subcategory inside some parent.children
        const currentParent = prev.find(p => p.children?.some(ch => ch.id === catId));
        if (currentParent) {
          // If promoted to top-level
          if (!catData.parentId) {
            const childObj = currentParent.children?.find(ch => ch.id === catId)!;
            const promotedToTop: Category = {
              id: catId,
              name: rawName,
              slug,
              parentId: null,
              icon: catData.icon || 'FolderTree',
              description: catData.description || childObj.description || '',
              children: [],
            };
            return [
              ...prev.map(p => {
                if (p.id === currentParent.id) {
                  return {
                    ...p,
                    children: p.children?.filter(ch => ch.id !== catId) || [],
                  };
                }
                return p;
              }),
              promotedToTop,
            ];
          }

          // If moved to a different parent
          if (catData.parentId !== currentParent.id) {
            const childObj = currentParent.children?.find(ch => ch.id === catId)!;
            const updatedChild: Category = {
              id: catId,
              name: rawName,
              slug,
              parentId: catData.parentId,
              description: catData.description !== undefined ? catData.description : childObj.description || '',
            };
            return prev.map(p => {
              if (p.id === currentParent.id) {
                return {
                  ...p,
                  children: p.children?.filter(ch => ch.id !== catId) || [],
                };
              }
              if (p.id === catData.parentId) {
                return {
                  ...p,
                  children: [...(p.children || []), updatedChild],
                };
              }
              return p;
            });
          }

          // Same parent, update fields
          return prev.map(p => {
            if (p.id === currentParent.id) {
              return {
                ...p,
                children: p.children?.map(ch => {
                  if (ch.id === catId) {
                    return {
                      ...ch,
                      name: rawName,
                      slug,
                      description: catData.description !== undefined ? catData.description : ch.description,
                    };
                  }
                  return ch;
                }) || [],
              };
            }
            return p;
          });
        }

        return prev;
      });
      showToast('Đã cập nhật danh mục thành công!');
    } else {
      // CREATING NEW CATEGORY
      const newId = Date.now();
      if (catData.parentId) {
        // New subcategory
        const newSubCat: Category = {
          id: newId,
          name: rawName,
          slug,
          parentId: catData.parentId,
          description: catData.description || '',
        };
        setCategories(prev =>
          prev.map(p => {
            if (p.id === catData.parentId) {
              return {
                ...p,
                children: [...(p.children || []), newSubCat],
              };
            }
            return p;
          })
        );
        showToast(`Đã thêm danh mục con "${rawName}" thành công!`);
      } else {
        // New top-level category
        const newCat: Category = {
          id: newId,
          name: rawName,
          slug,
          parentId: null,
          icon: catData.icon || 'FolderTree',
          description: catData.description || '',
          children: [],
        };
        setCategories(prev => [...prev, newCat]);
        showToast(`Đã tạo danh mục mới "${rawName}" thành công!`);
      }
    }
  };

  const addCategory = saveCategory;

  const deleteCategory = async (catId: number) => {
    setCategories(prev => {
      // Check if top-level
      const isTopLevel = prev.some(c => c.id === catId);
      if (isTopLevel) {
        return prev.filter(c => c.id !== catId);
      }
      // Check if child
      return prev.map(p => ({
        ...p,
        children: p.children?.filter(ch => ch.id !== catId) || [],
      }));
    });
    showToast('Đã xóa danh mục thành công!', 'info');
  };

  // Vouchers
  const saveVoucher = async (vData: Partial<Voucher>) => {
    if (vData.id) {
      setVouchers(prev =>
        prev.map(v => (v.id === vData.id ? ({ ...v, ...vData } as Voucher) : v))
      );
      showToast('Đã cập nhật mã giảm giá!');
    } else {
      const newV: Voucher = {
        id: Date.now(),
        code: (vData.code || 'CODE').toUpperCase(),
        description: vData.description || '',
        discountType: vData.discountType || 'FIXED_AMOUNT',
        discountMode: 'ORDER',
        value: vData.value || vData.discountValue || 100000,
        discountValue: vData.value || vData.discountValue || 100000,
        minOrder: vData.minOrder || vData.minOrderAmount || 1000000,
        minOrderAmount: vData.minOrder || vData.minOrderAmount || 1000000,
        usageLimit: vData.usageLimit || 100,
        usedCount: 0,
        startDate: vData.startDate || new Date().toISOString(),
        endDate: vData.endDate || '2026-12-31T23:59:59Z',
        status: 'ACTIVE',
      };
      setVouchers(prev => [newV, ...prev]);
      showToast('Đã tạo mã giảm giá mới!');
    }
  };

  const addVoucher = saveVoucher;

  const deleteVoucher = async (voucherId: number) => {
    setVouchers(prev => prev.filter(v => v.id !== voucherId));
    showToast('Đã xóa mã voucher', 'info');
  };

  // Sections
  const updateSection = async (sectionId: number, data: Partial<HomepageSection>) => {
    setSections(prev =>
      prev.map(s => (s.id === sectionId ? { ...s, ...data } : s))
    );
    showToast('Đã cập nhật cấu hình khối trang chủ!');
  };

  const toggleSection = async (sectionId: number) => {
    setSections(prev =>
      prev.map(s => (s.id === sectionId ? { ...s, isActive: !s.isActive } : s))
    );
    showToast('Đã thay đổi trạng thái hiển thị section trang chủ!');
  };

  // Inventory
  const importStock = async (data: any) => {
    const { productId, quantity, note } = data;
    const prod = products.find(p => p.id === Number(productId));
    const qty = Number(quantity);

    setProducts(prev =>
      prev.map(p =>
        p.id === Number(productId) ? { ...p, stock: p.stock + qty } : p
      )
    );

    setInventoryLogs(prev => [
      {
        id: Date.now(),
        productId: Number(productId),
        productName: prod?.name || 'Sản phẩm',
        productSku: prod?.sku || 'SKU',
        transactionType: 'IMPORT',
        changeType: 'IMPORT',
        quantityChange: qty,
        batchNumber: `BATCH-${Date.now().toString().slice(-6)}`,
        quantity: qty,
        unitCost: (prod?.priceSale || 1000000) * 0.8,
        supplierName: 'Nhà Phân Phối Chính Hãng',
        note: note || 'Nhập thêm hàng bổ sung kho',
        createdByName: `${currentUser.fullName} (${currentUser.role})`,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    showToast(`Đã nhập kho thêm ${qty} sản phẩm thành công!`);
  };

  const restockProduct = async (id: number, qty: number, note?: string) => {
    await importStock({ productId: id, quantity: qty, note });
  };

  // User management
  const updateUserRole = async (userId: number, role: UserRole) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (targetUser.role === 'ADMIN') {
      showToast('Tài khoản ADMIN luôn luôn là Quản trị viên, không thể đổi quyền!', 'error');
      return;
    }

    if (role === 'ADMIN') {
      showToast('Không thể gán quyền ADMIN. Chỉ được chuyển quyền giữa STAFF và USER!', 'error');
      return;
    }

    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, role } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, role }));
    }
    showToast(`Đã chuyển vai trò tài khoản thành ${role === 'STAFF' ? 'STAFF (Nhân viên)' : 'USER (Khách hàng)'}`);
  };

  const updateUserStatus = async (userId: number, status: 'ACTIVE' | 'LOCKED') => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.role === 'ADMIN' && status === 'LOCKED') {
      showToast('Không thể khóa tài khoản Quản trị viên (ADMIN)!', 'error');
      return;
    }

    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, status } : u))
    );
    showToast(`Đã chuyển trạng thái tài khoản thành ${status}`);
  };

  const toggleUserStatus = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const nextStatus = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
      await updateUserStatus(userId, nextStatus);
    }
  };

  const handleSetCurrentView = (view: ViewType) => {
    if (view === 'wishlist') {
      setAccountActiveTab('wishlist');
    } else if (view === 'profile') {
      setAccountActiveTab('profile');
    } else if (view === 'orders') {
      setAccountActiveTab('orders');
    }
    setCurrentView(view);
  };

  const navigateToAccountTab = (tab: AccountTab) => {
    setAccountActiveTab(tab);
    if (tab === 'wishlist') {
      setCurrentView('wishlist');
    } else if (tab === 'profile') {
      setCurrentView('profile');
    } else if (tab === 'orders') {
      setCurrentView('orders');
    } else {
      setCurrentView('account');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        canGoBack,
        canGoNext,
        goBack,
        goNext,
        accountActiveTab,
        setAccountActiveTab,
        navigateToAccountTab,
        adminTab,
        setAdminTab,
        adminActiveTab,
        setAdminActiveTab,
        selectedProductId,
        setSelectedProductId,
        selectedCategoryId,
        setSelectedCategoryId,
        searchQuery,
        setSearchQuery,
        products,
        categories,
        orders,
        reviews,
        vouchers,
        sections,
        users,
        inventoryLogs,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        appliedVoucher,
        applyVoucher,
        removeVoucher,
        discountAmount,
        finalTotal,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        wishlist,
        toggleWishlist,
        currentUser,
        isLoggedIn,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isLoginPromptOpen,
        setIsLoginPromptOpen,
        authModalTab,
        setAuthModalTab,
        authPromptReason,
        setAuthPromptReason,
        pendingGuestAction,
        setPendingGuestAction,
        promptLoginOrGuest,
        requireAuth,
        handleLoginPromptResponse,
        handleContinueAsGuest,
        login,
        loginWithGoogle,
        register,
        logout,
        switchRole,
        updateUserProfile,
        changePassword,
        resetPassword,
        createOrder,
        placeOrder,
        updateOrderStatus,
        cancelOrder,
        addReview,
        replyReview,
        deleteReview,
        addProduct,
        saveProduct,
        updateProduct,
        deleteProduct,
        saveCategory,
        addCategory,
        deleteCategory,
        addVoucher,
        saveVoucher,
        deleteVoucher,
        updateSection,
        toggleSection,
        importStock,
        restockProduct,
        updateUserRole,
        updateUserStatus,
        toggleUserStatus,
        toast,
        showToast,
        lastCreatedOrder,
        setLastCreatedOrder,
        conversations,
        activeChatId,
        setActiveChatId,
        totalUnreadForStaff,
        totalUnreadForCustomer,
        customerSendMessage,
        staffSendMessage,
        warrantyRecords,
        setWarrantyRecords,
        addWarrantyRecord,
        addWarrantyHistory,
        markConversationAsReadByStaff,
        markConversationAsUnreadByStaff,
        markConversationAsReadByCustomer,
        deleteConversation,
        toggleStarConversation,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        addNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
