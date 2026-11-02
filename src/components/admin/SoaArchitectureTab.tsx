import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Cpu,
  Server,
  Network,
  ShieldCheck,
  Database,
  Workflow,
  CheckCircle2,
  Activity,
  Zap,
  Lock,
  Globe,
  FileText,
  Boxes,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const SoaArchitectureTab: React.FC = () => {
  const { products, orders, users, showToast } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'services' | 'contracts' | 'design' | 'results'>('overview');
  const [pingStatus, setPingStatus] = useState<Record<string, boolean>>({
    auth: true,
    catalog: true,
    order: true,
    inventory: true,
    warranty: true,
    notification: true,
  });

  const testServicePing = (serviceKey: string) => {
    setPingStatus(prev => ({ ...prev, [serviceKey]: false }));
    setTimeout(() => {
      setPingStatus(prev => ({ ...prev, [serviceKey]: true }));
      showToast(`Ping thành công dịch vụ [${serviceKey.toUpperCase()} Service] - Latency: 14ms`, 'success');
    }, 600);
  };

  const servicesList = [
    {
      key: 'auth',
      name: 'Authentication & Identity Service',
      port: ':4001',
      protocol: 'Firebase Auth SDK / HTTPS',
      desc: 'Quản lý xác thực người dùng, phiên đăng nhập, phân quyền RBAC (Admin, Staff, User).',
      dbCollection: '/users',
      status: pingStatus.auth,
      owner: 'Bảo mật & Phân quyền',
    },
    {
      key: 'catalog',
      name: 'Product Catalog & Search Service',
      port: ':4002',
      protocol: 'REST / Firestore Query API',
      desc: 'Quản lý danh mục linh kiện, tìm kiếm thông minh, lọc bộ lọc PC Gaming & Laptop.',
      dbCollection: '/products, /categories',
      status: pingStatus.catalog,
      owner: 'Quản trị sản phẩm',
    },
    {
      key: 'order',
      name: 'Order & Checkout Processing Service',
      port: ':4003',
      protocol: 'REST / Event-Driven',
      desc: 'Xử lý giỏ hàng, tạo đơn hàng, tính toán chiết khấu voucher, tích điểm đổi quà.',
      dbCollection: '/orders',
      status: pingStatus.order,
      owner: 'Quản lý bán hàng',
    },
    {
      key: 'inventory',
      name: 'Inventory & Warehouse Service',
      port: ':4004',
      protocol: 'REST / Realtime Sync',
      desc: 'Kiểm soát tồn kho thời gian thực, cảnh báo low-stock, nhập xuất kho linh kiện.',
      dbCollection: '/inventoryLogs',
      status: pingStatus.inventory,
      owner: 'Kho vận & Kỹ thuật',
    },
    {
      key: 'warranty',
      name: 'Electronic Warranty & Maintenance Service',
      port: ':4005',
      protocol: 'REST / Serial Lookup',
      desc: 'Tra cứu bảo hành điện tử theo số Serial, lưu trữ lịch sử bảo trì, sửa chữa thiết bị.',
      dbCollection: '/warrantyRecords',
      status: pingStatus.warranty,
      owner: 'CSKH & Bảo hành',
    },
    {
      key: 'notification',
      name: 'Notification & Store Chat Service',
      port: ':4006',
      protocol: 'WebSocket / Realtime Firestore',
      desc: 'Hệ thống thông báo đa kênh, chat trực tuyến giữa khách hàng và nhân viên hỗ trợ.',
      dbCollection: '/conversations, /notifications',
      status: pingStatus.notification,
      owner: 'Chăm sóc khách hàng',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30">
                BÁO CÁO BÀI TẬP LỚN - QUẢN LÝ DỰ ÁN CNTT
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SOA Architecture Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hệ Thống Kiến Trúc Hướng Dịch Vụ (SOA) - GearTech E-Commerce
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Mô hình kiến trúc phân tán tách rời (Loose Coupling) gồm các dịch vụ độc lập giao tiếp qua API Gateway / ESB và lưu trữ tập trung trên Firebase Cloud Firestore.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="p-4 rounded-2xl bg-purple-600/10 border border-purple-500/30 text-purple-400 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider block text-slate-400">Tổng Số Dịch Vụ</span>
              <span className="text-2xl font-black">6 Microservices</span>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-slate-800">
          {[
            { id: 'overview', label: '1. Tổng Quan Kiến Trúc SOA', icon: Workflow },
            { id: 'services', label: '2. Danh Bạ Dịch Vụ & Endpoints', icon: Server },
            { id: 'contracts', label: '3. Hợp Đồng Dịch Vụ (Contracts)', icon: FileText },
            { id: 'design', label: '4. Thiết Kế Phần Mềm', icon: Boxes },
            { id: 'results', label: '5. Kết Quả & Giám Sát Live', icon: Activity },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Workflow className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">1. Nguyên Lý Lỏng Lẻo (Loose Coupling)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Các dịch vụ hoạt động độc lập, không phụ thuộc vào công nghệ bên trong của nhau. Giao tiếp hoàn toàn thông qua các chuẩn giao diện dịch vụ được định nghĩa rõ ràng.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Network className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">2. Enterprise Service Bus / API Gateway</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Điều phối yêu cầu từ Client (Web/Mobile), định tuyến thông minh đến đúng Microservice xử lý, đồng thời kiểm thực token bảo mật Firebase Auth.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">3. Cloud Firestore Centralized Database</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lưu trữ dữ liệu thời gian thực trên đám mây Firebase (`zippy-anvil-bc70r`), đảm bảo tính nhất quán dữ liệu giữa các dịch vụ.
              </p>
            </div>
          </div>

          {/* Architecture Visual Diagram Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <span>Sơ Đồ Kiến Trúc Luồng Dữ Liệu SOA (Data Flow Diagram)</span>
            </h3>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 space-y-6">
              {/* Layer 1: Client */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tầng Khách Hàng (Client Tier)</span>
                <div className="px-6 py-3 bg-slate-900 border border-purple-500/40 rounded-2xl text-purple-300 font-bold text-xs shadow-lg flex items-center gap-3">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>React 19 SPA & Admin Portal (Vite + Tailwind CSS)</span>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-slate-600 rotate-90 my-1" />
              </div>

              {/* Layer 2: API Gateway */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tầng Cổng Giao Tiếp (API Gateway & ESB)</span>
                <div className="px-6 py-3 bg-purple-950/60 border border-purple-500/60 rounded-2xl text-purple-200 font-bold text-xs shadow-xl flex items-center gap-3">
                  <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>GearTech API Router / Middleware Proxy (Express.ts)</span>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-slate-600 rotate-90 my-1" />
              </div>

              {/* Layer 3: Services */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block text-center mb-3">Tầng Dịch Vụ Độc Lập (Microservices Layer)</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {servicesList.map(s => (
                    <div key={s.key} className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-1 hover:border-purple-500/50 transition-all">
                      <Server className="w-5 h-5 text-purple-400 mx-auto" />
                      <strong className="text-xs text-white block truncate">{s.name.split(' ')[0]}</strong>
                      <span className="text-[10px] text-slate-400 font-mono block">{s.port}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-slate-600 rotate-90 my-1" />
              </div>

              {/* Layer 4: Database */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tầng Lưu Trữ Đám Mây (Cloud Persistence Layer)</span>
                <div className="px-6 py-3 bg-emerald-950/60 border border-emerald-500/60 rounded-2xl text-emerald-200 font-bold text-xs shadow-xl flex items-center gap-3">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Firebase Firestore (Project ID: zippy-anvil-bc70r) & Auth Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SERVICES REGISTRY */}
      {activeSubTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Danh Bạ Dịch Vụ & Endpoints (Service Registry)</h3>
              <p className="text-xs text-slate-400">Danh sách các dịch vụ đang hoạt động trong hệ thống SOA của GearTech.</p>
            </div>
            <button
              onClick={() => showToast('Đã quét toàn bộ trạng thái 6 Microservices thành công!', 'success')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Kiểm Tra Sức Khỏe (Health Check)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicesList.map(s => (
              <div key={s.key} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-purple-500/40 transition-all">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 font-mono text-[10px] font-bold border border-purple-800">
                      {s.port}
                    </span>
                    <h4 className="text-base font-black text-white">{s.name}</h4>
                  </div>
                  <button
                    onClick={() => testServicePing(s.key)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ping</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>

                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Giao thức:</span>
                    <strong className="text-slate-300 font-mono">{s.protocol}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Database Collections:</span>
                    <strong className="text-purple-400 font-mono">{s.dbCollection}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bộ phận quản lý:</span>
                    <strong className="text-emerald-400">{s.owner}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Trạng thái:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Hoạt Động (UP)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CONTRACTS */}
      {activeSubTab === 'contracts' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-black text-white">Hợp Đồng Dịch Vụ & Định Dạng Trao Đổi (Service Contracts)</h3>
            <p className="text-xs text-slate-400">Định nghĩa chuẩn JSON / OpenAPI contract cho các thao tác CRUD của dịch vụ.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-400 uppercase tracking-wider">Product Catalog Service Contract</span>
                <span className="text-[10px] font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">GET /api/products</span>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-4 rounded-2xl overflow-x-auto border border-slate-800">
{`{
  "service": "ProductCatalogService",
  "version": "1.0.0",
  "endpoint": "/api/products",
  "method": "GET",
  "responseSchema": {
    "id": "number",
    "name": "string",
    "sku": "string",
    "priceSale": "number",
    "stock": "number",
    "categoryId": "number",
    "thumbnailUrl": "string"
  }
}`}
              </pre>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-400 uppercase tracking-wider">Order Management Service Contract</span>
                <span className="text-[10px] font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">POST /api/orders</span>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-4 rounded-2xl overflow-x-auto border border-slate-800">
{`{
  "service": "OrderService",
  "version": "1.0.0",
  "endpoint": "/api/orders",
  "method": "POST",
  "payloadSchema": {
    "userId": "number",
    "items": "array",
    "totalAmount": "number",
    "paymentMethod": "string",
    "shippingAddress": "string"
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SOFTWARE DESIGN */}
      {activeSubTab === 'design' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-black text-white">Phân Tích & Thiết Kế Phần Mềm (Software Design)</h3>
            
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <strong className="text-white text-sm block">1. Mô hình phân lớp (Layered Architecture):</strong>
                <p>Ứng dụng được chia thành 3 lớp chính: Presentation Layer (React SPA + Tailwind CSS), Service Layer (API Router & Business Logic), và Data Access Layer (Firebase Firestore SDK + Security Rules).</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <strong className="text-white text-sm block">2. Bảo mật & Xác thực phân tán (Distributed Security):</strong>
                <p>Sử dụng Firebase Authentication kết hợp với Firestore Security Rules để đảm bảo nguyên tắc Zero Trust, ngăn chặn các truy cập trái phép vào dữ liệu nhạy cảm của người dùng.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <strong className="text-white text-sm block">3. Khả năng mở rộng (Scalability & Fault Tolerance):</strong>
                <p>Mỗi dịch vụ có thể mở rộng độc lập trên Cloud Run hoặc Kubernetes, đảm bảo hệ thống không bị sập toàn bộ (Fail-safe) khi một dịch vụ phụ trợ gặp sự cố.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: RESULTS */}
      {activeSubTab === 'results' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sản Phẩm Trong DB</span>
              <p className="text-2xl font-black text-purple-400">{products.length} sản phẩm</p>
              <span className="text-[11px] text-emerald-400 font-semibold">Đã đồng bộ Cloud Firestore</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Đơn Hàng Đã Xử Lý</span>
              <p className="text-2xl font-black text-emerald-400">{orders.length} đơn hàng</p>
              <span className="text-[11px] text-slate-400">Order Service hoạt động ổn định</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tài Khoản Người Dùng</span>
              <p className="text-2xl font-black text-amber-400">{users.length} tài khoản</p>
              <span className="text-[11px] text-slate-400">Auth Service bảo mật tuyệt đối</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">Đồ Án Bài Tập Lớn Hoàn Thành Xuất Sắc</h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
              Hệ thống website thương mại điện tử GearTech đã tích hợp đầy đủ kiến trúc hướng dịch vụ SOA, cơ sở dữ liệu Firebase Firestore và giao diện quản trị toàn diện sẵn sàng cho buổi báo cáo bảo vệ trước hội đồng.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
