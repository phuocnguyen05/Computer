import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_VOUCHERS,
  INITIAL_SECTIONS,
  INITIAL_INVENTORY_LOGS,
  INITIAL_USERS,
} from './src/data/mockData.ts';
import { MYSQL_SCHEMA_DDL, SCHEMA_EXPLANATION } from './src/data/mysqlSchema.ts';
import { Product, Order, Review, Voucher, HomepageSection, InventoryTransaction, User, Category } from './src/types.ts';

dotenv.config();

// In-Memory Database Store (Simulating MySQL in-memory layer with persistent state across turns)
let products: Product[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let categories: Category[] = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
let orders: Order[] = JSON.parse(JSON.stringify(INITIAL_ORDERS));
let reviews: Review[] = JSON.parse(JSON.stringify(INITIAL_REVIEWS));
let vouchers: Voucher[] = JSON.parse(JSON.stringify(INITIAL_VOUCHERS));
let sections: HomepageSection[] = JSON.parse(JSON.stringify(INITIAL_SECTIONS));
let inventoryLogs: InventoryTransaction[] = JSON.parse(JSON.stringify(INITIAL_INVENTORY_LOGS));
let users: User[] = JSON.parse(JSON.stringify(INITIAL_USERS));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // REST API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // 1. PRODUCTS
  app.get('/api/products', (req, res) => {
    const { category, brand, search, section, minPrice, maxPrice, sort } = req.query;
    let list = [...products];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    if (category) {
      const catId = Number(category);
      list = list.filter(p => p.categoryId === catId || p.categoryId.toString().startsWith(catId.toString()));
    }
    if (brand) {
      list = list.filter(p => p.brand.toLowerCase() === String(brand).toLowerCase());
    }
    if (section) {
      list = list.filter(p => p.pinnedSection === section || (section === 'FLASH_SALE' && p.isFlashSale));
    }
    if (minPrice) {
      list = list.filter(p => p.priceSale >= Number(minPrice));
    }
    if (maxPrice) {
      list = list.filter(p => p.priceSale <= Number(maxPrice));
    }

    if (sort === 'price-asc') {
      list.sort((a, b) => a.priceSale - b.priceSale);
    } else if (sort === 'price-desc') {
      list.sort((a, b) => b.priceSale - a.priceSale);
    } else if (sort === 'rating') {
      list.sort((a, b) => b.ratingAvg - a.ratingAvg);
    } else if (sort === 'bestseller') {
      list.sort((a, b) => b.soldCount - a.soldCount);
    } else {
      // newest
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(list);
  });

  app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === Number(req.params.id));
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  });

  app.post('/api/products', (req, res) => {
    const body = req.body;
    const newProduct: Product = {
      ...body,
      id: Date.now(),
      ratingAvg: 5.0,
      reviewCount: 0,
      soldCount: 0,
      createdAt: new Date().toISOString(),
      images: body.images && body.images.length ? body.images : [body.thumbnailUrl],
      specs: body.specs || [],
    };
    products.unshift(newProduct);
    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
  });

  app.delete('/api/products/:id', (req, res) => {
    const id = Number(req.params.id);
    products = products.filter(p => p.id !== id);
    res.json({ success: true, message: 'Đã xóa sản phẩm' });
  });

  // 2. CATEGORIES
  app.get('/api/categories', (req, res) => {
    res.json(categories);
  });

  app.post('/api/categories', (req, res) => {
    const { name, slug, parentId, icon, description } = req.body;
    const newCat: Category = {
      id: Date.now(),
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      parentId: parentId ? Number(parentId) : null,
      icon: icon || 'Folder',
      description,
      children: [],
    };

    if (newCat.parentId) {
      const parent = categories.find(c => c.id === newCat.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(newCat);
      }
    } else {
      categories.push(newCat);
    }
    res.status(201).json(newCat);
  });

  app.delete('/api/categories/:id', (req, res) => {
    const id = Number(req.params.id);
    categories = categories.filter(c => c.id !== id);
    res.json({ success: true, message: 'Đã xóa danh mục' });
  });

  // 3. ORDERS
  app.get('/api/orders', (req, res) => {
    const { userId, status } = req.query;
    let list = [...orders];
    if (userId) list = list.filter(o => o.userId === Number(userId));
    if (status) list = list.filter(o => o.status === status);
    res.json(list);
  });

  app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === Number(req.params.id) || o.orderCode === req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.json(order);
  });

  app.post('/api/orders', (req, res) => {
    const body = req.body;
    const orderDate = new Date();
    const orderCode = `GT-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const items = body.items.map((item: any, idx: number) => {
      // Calculate warranty end date
      const warrantyMonths = item.warrantyMonths || 24;
      const endDate = new Date(orderDate);
      endDate.setMonth(endDate.getMonth() + warrantyMonths);

      // Decrease product stock & increment sold count
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        prod.soldCount += item.quantity;
      }

      return {
        id: Date.now() + idx,
        orderId: 0,
        productId: item.productId,
        productName: item.productName || (prod ? prod.name : 'Sản phẩm'),
        productThumbnail: item.productThumbnail || (prod ? prod.thumbnailUrl : ''),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
        warrantyMonths,
        warrantyEndDate: endDate.toISOString().split('T')[0],
      };
    });

    const newOrder: Order = {
      id: Date.now(),
      orderCode,
      userId: body.userId || 3, // Default to current user
      orderDate: orderDate.toISOString(),
      receiverName: body.receiverName,
      phone: body.phone,
      province: body.province,
      district: body.district,
      ward: body.ward,
      addressDetail: body.addressDetail,
      note: body.note || '',
      paymentMethod: body.paymentMethod || 'COD',
      paymentStatus: body.paymentMethod === 'VNPAY_QR' ? 'PAID' : 'PENDING',
      voucherCode: body.voucherCode,
      discountAmount: body.discountAmount || 0,
      shippingFee: body.shippingFee || 0,
      totalAmount: body.totalAmount,
      status: 'PENDING',
      items,
      createdAt: orderDate.toISOString(),
    };

    // Update voucher used count if applied
    if (body.voucherCode) {
      const v = vouchers.find(v => v.code === body.voucherCode);
      if (v) v.usedCount += 1;
    }

    orders.unshift(newOrder);
    res.status(201).json(newOrder);
  });

  app.put('/api/orders/:id/status', (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    const order = orders.find(o => o.id === id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    order.status = status;
    if (status === 'COMPLETED' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'PAID';
    }
    res.json(order);
  });

  // 4. REVIEWS
  app.get('/api/reviews', (req, res) => {
    const { productId, rating, status } = req.query;
    let list = [...reviews];
    if (productId) list = list.filter(r => r.productId === Number(productId));
    if (rating) list = list.filter(r => r.rating === Number(rating));
    if (status) list = list.filter(r => r.status === status);
    res.json(list);
  });

  app.post('/api/reviews', (req, res) => {
    const body = req.body;
    const newReview: Review = {
      id: Date.now(),
      productId: Number(body.productId),
      productName: body.productName,
      userId: body.userId || 3,
      userName: body.userName || 'Khách hàng GearTech',
      userAvatar: body.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      rating: Number(body.rating),
      comment: body.comment,
      imageUrl: body.imageUrl,
      status: 'APPROVED', // Default approved for instant customer delight
      createdAt: new Date().toISOString(),
    };
    reviews.unshift(newReview);

    // Recalculate product rating
    const prodReviews = reviews.filter(r => r.productId === newReview.productId && r.status === 'APPROVED');
    const prod = products.find(p => p.id === newReview.productId);
    if (prod && prodReviews.length > 0) {
      const sum = prodReviews.reduce((acc, curr) => acc + curr.rating, 0);
      prod.ratingAvg = Number((sum / prodReviews.length).toFixed(2));
      prod.reviewCount = prodReviews.length;
    }

    res.status(201).json(newReview);
  });

  app.put('/api/reviews/:id/reply', (req, res) => {
    const id = Number(req.params.id);
    const { sellerReply } = req.body;
    const review = reviews.find(r => r.id === id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    review.sellerReply = sellerReply;
    review.sellerReplyAt = new Date().toISOString();
    res.json(review);
  });

  app.delete('/api/reviews/:id', (req, res) => {
    const id = Number(req.params.id);
    reviews = reviews.filter(r => r.id !== id);
    res.json({ success: true, message: 'Đã xóa đánh giá' });
  });

  // 5. VOUCHERS
  app.get('/api/vouchers', (req, res) => {
    res.json(vouchers);
  });

  app.post('/api/vouchers/apply', (req, res) => {
    const { code, orderTotal } = req.body;
    const voucher = vouchers.find(v => v.code.toUpperCase() === String(code).trim().toUpperCase() && v.status === 'ACTIVE');
    if (!voucher) {
      return res.status(400).json({ valid: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' });
    }
    if (orderTotal < voucher.minOrder) {
      return res.status(400).json({
        valid: false,
        message: `Đơn hàng chưa đạt giá trị tối thiểu ${voucher.minOrder.toLocaleString('vi-VN')}đ để dùng mã này.`,
      });
    }
    if (voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ valid: false, message: 'Mã giảm giá đã hết lượt sử dụng.' });
    }

    let discount = 0;
    if (voucher.discountType === 'FIXED_AMOUNT' || voucher.discountType === 'FREE_SHIPPING') {
      discount = voucher.value;
    } else if (voucher.discountType === 'PERCENT') {
      discount = (orderTotal * voucher.value) / 100;
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    }

    res.json({
      valid: true,
      voucher,
      discountAmount: Math.round(discount),
      message: `Áp dụng thành công mã ${voucher.code}! Giảm ${Math.round(discount).toLocaleString('vi-VN')}đ`,
    });
  });

  app.post('/api/vouchers', (req, res) => {
    const newV: Voucher = {
      ...req.body,
      id: Date.now(),
      usedCount: 0,
      status: 'ACTIVE',
    };
    vouchers.unshift(newV);
    res.status(201).json(newV);
  });

  app.delete('/api/vouchers/:id', (req, res) => {
    const id = Number(req.params.id);
    vouchers = vouchers.filter(v => v.id !== id);
    res.json({ success: true, message: 'Đã xóa voucher' });
  });

  // 6. HOMEPAGE SECTIONS
  app.get('/api/homepage-sections', (req, res) => {
    res.json(sections.sort((a, b) => a.displayOrder - b.displayOrder));
  });

  app.put('/api/homepage-sections/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ message: 'Không tìm thấy section' });
    sections[index] = { ...sections[index], ...req.body };
    res.json(sections[index]);
  });

  // 7. INVENTORY & TRANSACTIONS
  app.get('/api/inventory/logs', (req, res) => {
    res.json(inventoryLogs);
  });

  app.post('/api/inventory/import', (req, res) => {
    const { productId, quantity, unitCost, supplierName, note, createdByName } = req.body;
    const prod = products.find(p => p.id === Number(productId));
    if (!prod) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    prod.stock += Number(quantity);
    const log: InventoryTransaction = {
      id: Date.now(),
      productId: prod.id,
      productName: prod.name,
      productSku: prod.sku,
      transactionType: 'IMPORT',
      batchNumber: `LO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      quantity: Number(quantity),
      unitCost: Number(unitCost),
      supplierName: supplierName || 'Tổng kho chính hãng',
      note: note || 'Nhập hàng bổ sung kho',
      createdByName: createdByName || 'Admin',
      createdAt: new Date().toISOString(),
    };
    inventoryLogs.unshift(log);
    res.status(201).json({ success: true, log, currentStock: prod.stock });
  });

  // 8. WARRANTY LOOKUP
  app.get('/api/warranty/lookup', (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Vui lòng cung cấp số điện thoại hoặc mã đơn hàng' });

    const q = String(query).trim().toLowerCase();
    const matchedOrders = orders.filter(
      o => o.phone.toLowerCase().includes(q) || o.orderCode.toLowerCase().includes(q)
    );

    const now = new Date();
    const results: any[] = [];

    matchedOrders.forEach(order => {
      order.items.forEach(item => {
        const endDate = new Date(item.warrantyEndDate);
        const diffTime = endDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const monthsRemaining = Math.max(0, Math.ceil(daysRemaining / 30));
        const isExpired = daysRemaining <= 0;

        results.push({
          orderCode: order.orderCode,
          orderDate: order.orderDate,
          productName: item.productName,
          sku: item.id.toString(),
          thumbnailUrl: item.productThumbnail,
          warrantyMonths: item.warrantyMonths,
          warrantyEndDate: item.warrantyEndDate,
          isExpired,
          monthsRemaining,
          daysRemaining: Math.max(0, daysRemaining),
          customerName: order.receiverName,
          customerPhone: order.phone,
        });
      });
    });

    res.json(results);
  });

  // 9. USERS & ROLES
  app.get('/api/users', (req, res) => {
    res.json(users);
  });

  app.put('/api/users/:id/role', (req, res) => {
    const id = Number(req.params.id);
    const { role } = req.body;
    const user = users.find(u => u.id === id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    user.role = role;
    res.json(user);
  });

  app.put('/api/users/:id/status', (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    const user = users.find(u => u.id === id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    user.status = status;
    res.json(user);
  });

  // 10. DATABASE SCHEMA METADATA (MySQL DDL endpoint)
  app.get('/api/database-schema', (req, res) => {
    res.json({
      ddl: MYSQL_SCHEMA_DDL,
      tables: SCHEMA_EXPLANATION,
      stats: {
        totalTables: 12,
        totalTriggers: 3,
        storageEngine: 'InnoDB',
        charset: 'utf8mb4_unicode_ci',
      },
    });
  });

  // 11. ADMIN DASHBOARD STATS
  app.get('/api/stats', (req, res) => {
    const totalRevenue = orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;
    const lowStockProducts = products.filter(p => p.stock <= p.minStockThreshold);

    // Monthly revenue simulation data
    const monthlyRevenue = [
      { month: 'T10', revenue: 245000000, orders: 42 },
      { month: 'T11', revenue: 310000000, orders: 58 },
      { month: 'T12', revenue: 480000000, orders: 86 },
      { month: 'T01', revenue: 410000000, orders: 74 },
      { month: 'T02', revenue: 360000000, orders: 65 },
      { month: 'T03 (Nay)', revenue: 520000000, orders: 98 },
    ];

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalCustomers: users.length,
      pendingOrdersCount,
      lowStockProducts,
      monthlyRevenue,
    });
  });

  // 12. AI CONSULTANT ENDPOINT (Fallback rule-based + Gemini if available)
  app.post('/api/ai-consultant', async (req, res) => {
    const { message, budget, purpose } = req.body;
    const userMsg = String(message || '').toLowerCase();

    let reply = '';
    let suggestedProductIds: number[] = [];

    if (userMsg.includes('i9') || userMsg.includes('4090') || userMsg.includes('khủng') || userMsg.includes('ultra')) {
      reply = 'Chào bạn! Với nhu cầu hiệu năng đỉnh cao, GearTech đề xuất cấu hình PC Gaming Cyberpunk Ultra Core i9 14900K kèm RTX 4090 24GB. Cấu hình này sở hữu tản nhiệt nước NZXT Kraken 360 LCD, 64GB RAM Dominator DDR5 và 2TB Gen4 cực mạnh, chơi mượt 4K Ray Tracing mọi tựa game AAA.';
      suggestedProductIds = [1, 3, 8];
    } else if (userMsg.includes('phím') || userMsg.includes('chuột') || userMsg.includes('gear')) {
      reply = 'Về Gaming Gear, bộ đôi bàn phím cơ FL-Esports OG87 switch TTC Ice V2 gõ cực êm và chuột siêu nhẹ Razer DeathAdder V3 Pro (63g) đang có ưu đãi Flash Sale giảm sâu. Bạn có thể xem ngay dưới đây nhé!';
      suggestedProductIds = [5, 6, 7];
    } else if (userMsg.includes('laptop') || userMsg.includes('di động')) {
      reply = 'Nếu bạn cần một chiếc laptop gaming mỏng nhẹ, sang trọng nhưng cấu hình "quái vật", ASUS ROG Zephyrus G16 (2024) với Core Ultra 9 và màn hình OLED 240Hz là lựa chọn hoàn hảo nhất hiện tại.';
      suggestedProductIds = [9];
    } else {
      reply = 'Chào bạn! Tôi là Trợ Lý AI của GearTech. Với ngân sách ' + (budget ? `${budget} triệu` : 'của bạn') + ' và nhu cầu ' + (purpose || 'chơi game & làm việc') + ', tôi đề xuất bạn tham khảo dàn PC Phoenix Ryzen 7 7800X3D kết hợp RTX 4070 Ti Super 16GB. Đây là cấu hình "quốc dân" có hiệu năng trên giá thành xuất sắc nhất!';
      suggestedProductIds = [2, 11, 12];
    }

    const suggestedProducts = products.filter(p => suggestedProductIds.includes(p.id));
    res.json({ reply, suggestedProducts });
  });

  // ==========================================
  // VITE & STATIC SERVING MIDDLEWARE
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GearTech E-Commerce Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
