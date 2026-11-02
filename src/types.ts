export type UserRole = 'ADMIN' | 'STAFF' | 'USER';

export interface User {
  id: number;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  role: UserRole;
  address: string;
  points: number;
  status: 'ACTIVE' | 'LOCKED';
  avatar?: string;
  password?: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  icon?: string;
  description?: string;
  children?: Category[];
}

export interface ProductSpec {
  group?: string;
  name: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  priceOriginal: number;
  priceSale: number;
  stock: number;
  minStockThreshold: number;
  categoryId: number;
  categoryName?: string;
  brand: string;
  warrantyMonths: number;
  thumbnailUrl: string;
  images: string[];
  pinnedSection: string | null; // e.g. 'FLASH_SALE', 'PC_HOT', 'HIGH_END', 'VGA_TREND', 'ACCESSORIES'
  specs: ProductSpec[];
  description: string;
  ratingAvg: number;
  reviewCount: number;
  soldCount: number;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  flashSaleTab?: string;
  flashSaleEnd?: string;
  status: 'ACTIVE' | 'HIDDEN' | 'OUT_OF_STOCK';
  createdAt: string;
}

export interface FlashSaleTabOption {
  id: string;
  label: string;
  shortLabel: string;
}

export const FLASH_SALE_TAB_OPTIONS: FlashSaleTabOption[] = [
  { id: 'ALL', label: 'Tất Cả Hot Deal', shortLabel: 'Tất Cả Hot Deal' },
  { id: 'DEAL_MAN_HINH', label: 'Deal Màn Hình', shortLabel: 'Màn Hình' },
  { id: 'DEAL_CPU', label: 'Deal CPU / Vi Xử Lý', shortLabel: 'CPU' },
  { id: 'DEAL_RAM', label: 'Deal RAM / Bộ Nhớ', shortLabel: 'RAM' },
  { id: 'DEAL_VGA', label: 'Deal Card Màn Hình (VGA)', shortLabel: 'Card VGA' },
  { id: 'DEAL_LAPTOP', label: 'Deal Laptop Gaming & VP', shortLabel: 'Laptop' },
  { id: 'DEAL_PC', label: 'Deal PC / Máy Tính Bộ', shortLabel: 'PC Bộ' },
  { id: 'DEAL_PHIM_CHUOT', label: 'Deal Bàn Phím & Chuột', shortLabel: 'Phím & Chuột' },
  { id: 'DEAL_LOA_TAI_NGHE', label: 'Deal Loa & Tai Nghe', shortLabel: 'Loa & Tai Nghe' },
  { id: 'DEAL_OCUNG_SSD', label: 'Deal Ổ Cứng SSD & HDD', shortLabel: 'SSD / HDD' },
  { id: 'DEAL_MAINBOARD', label: 'Deal Bo Mạch Chủ (Mainboard)', shortLabel: 'Mainboard' },
  { id: 'DEAL_NGUON_TANNHIET', label: 'Deal Nguồn & Tản Nhiệt', shortLabel: 'Nguồn & Tản Nhiệt' },
  { id: 'DEAL_LINH_KIEN', label: 'Deal Phụ Kiện & Khác', shortLabel: 'Phụ Kiện' },
];

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'VNPAY_QR' | string;
export type PaymentStatus = 'PENDING' | 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED' | string;

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productThumbnail: string;
  quantity: number;
  unitPrice: number;
  price?: number;
  totalPrice: number;
  warrantyMonths: number;
  warrantyEndDate: string;
}

export interface Order {
  id: number;
  orderCode: string;
  userId: number;
  orderDate: string;
  receiverName: string;
  shippingName?: string;
  phone: string;
  shippingPhone?: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  shippingAddress?: string;
  shippingMethod?: string;
  note?: string;
  orderNote?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  voucherCode?: string;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  orderStatus?: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  vatInvoice?: {
    companyName: string;
    taxCode: string;
    email: string;
  };
}

export interface Review {
  id: number;
  productId: number;
  productName?: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  sellerReply?: string;
  sellerReplyAt?: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

export interface Voucher {
  id: number;
  code: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT' | 'FIXED' | 'FREE_SHIPPING';
  discountMode?: 'ORDER' | 'PRODUCT';
  value: number; // percentage (e.g. 10%) or fixed amount (e.g. 100000)
  discountValue?: number;
  maxDiscount?: number;
  maxDiscountAmount?: number;
  minOrder: number;
  minOrderAmount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
}

export interface HomepageSection {
  id: number;
  title: string;
  sectionKey: string;
  sectionType: 'FLASH_SALE' | 'GRID_PRODUCTS' | 'BANNER_CAROUSEL' | 'BRAND_LIST' | string;
  displayOrder: number;
  sortOrder?: number;
  isActive: boolean;
  filterTag: string;
}

export interface InventoryTransaction {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  transactionType: 'IMPORT' | 'EXPORT' | 'ADJUSTMENT';
  changeType?: 'IMPORT' | 'EXPORT';
  quantityChange?: number;
  batchNumber: string;
  quantity: number;
  unitCost: number;
  supplierName: string;
  note: string;
  createdByName: string;
  createdAt: string;
}

export interface WarrantyItemInfo {
  orderCode: string;
  orderDate: string;
  productName: string;
  sku: string;
  thumbnailUrl: string;
  warrantyMonths: number;
  warrantyEndDate: string;
  isExpired: boolean;
  monthsRemaining: number;
  daysRemaining: number;
  customerName: string;
  customerPhone: string;
}

export interface WarrantyHistoryEntry {
  id: number;
  date: string;
  issue: string;
  result: string;
  staffName?: string;
}

export interface WarrantyRecord {
  id: number;
  serialNumber: string;
  productName: string;
  brand: string;
  customerName: string;
  customerPhone: string;
  orderCode?: string;
  startDate: string;
  endDate: string;
  warrantyMonths: number;
  status: 'ACTIVE' | 'EXPIRED';
  thumbnailUrl: string;
  history: WarrantyHistoryEntry[];
}

export interface PCBuilderSlot {
  type: 'CPU' | 'MAINBOARD' | 'RAM' | 'VGA' | 'SSD' | 'PSU' | 'CASE' | 'COOLING';
  title: string;
  iconName: string;
  recommendedCategory: string;
  selectedProduct?: Product;
}

export interface ChatMessage {
  id: string;
  sender: 'CUSTOMER' | 'STORE';
  senderRole?: 'USER' | 'STAFF' | 'ADMIN';
  senderName: string;
  senderAvatar?: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  customerId: number | string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAvatar?: string;
  messages: ChatMessage[];
  lastMessageText: string;
  lastMessageAt: string;
  unreadCountForStaff: number; // Number of unread customer messages
  unreadCountForCustomer: number; // Number of unread store replies
  status: 'ACTIVE' | 'ARCHIVED';
  isStarred?: boolean;
  notes?: string;
}

export interface Notification {
  id: number;
  userId: number | string; // Tied to specific user account id (e.g. '1', '2', '3', 'guest')
  title: string;
  message: string;
  type: 'ORDER' | 'WARRANTY' | 'SYSTEM' | 'SECURITY' | 'PROMO';
  timestamp: string;
  isRead: boolean;
  linkView?: string;
}
