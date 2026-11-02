import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  Truck,
  QrCode,
  Receipt,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartTotal,
    discountAmount,
    finalTotal,
    appliedVoucher,
    currentUser,
    placeOrder,
    setCurrentView,
    navigateToAccountTab,
    showToast,
  } = useApp();

  // Shipping Form State
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone || '0988667788');
  const [email, setEmail] = useState(currentUser.email || '');
  const [province, setProvince] = useState('Hà Nội');
  const [district, setDistrict] = useState('Quận Cầu Giấy');
  const [ward, setWard] = useState('Phường Dịch Vọng Hậu');
  const [addressDetail, setAddressDetail] = useState('Số 102 Đường Duy Tân');
  const [orderNote, setOrderNote] = useState('Gọi trước khi giao 15 phút, yêu cầu kiểm hàng');

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY_QR'>('VNPAY_QR');

  // VAT Invoice state
  const [needsVatInvoice, setNeedsVatInvoice] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [vatEmail, setVatEmail] = useState('');

  // Processing & VNPay QR Modal state
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVnPayModal, setShowVnPayModal] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const baseShippingFee = cartTotal >= 1000000 || cartTotal === 0 ? 0 : 35000;
  const expressFee = shippingMethod === 'EXPRESS' ? 45000 : 0;
  const totalShippingFee = baseShippingFee + expressFee;
  const grandTotal = finalTotal + totalShippingFee;

  const fullShippingAddress = `${addressDetail}, ${ward}, ${district}, ${province}`;

  const handleCreateOrder = async () => {
    if (!fullName.trim() || !phoneNumber.trim() || !addressDetail.trim()) {
      showToast('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng', 'error');
      return;
    }

    if (needsVatInvoice && (!companyName.trim() || !taxCode.trim())) {
      showToast('Vui lòng nhập tên công ty và mã số thuế để xuất hóa đơn VAT', 'error');
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === 'VNPAY_QR') {
      // Show simulated VNPAY QR Payment Modal
      setShowVnPayModal(true);
      setIsProcessing(false);
    } else {
      // COD Order Direct Placement
      const order = await placeOrder({
        shippingName: fullName,
        shippingPhone: phoneNumber,
        shippingAddress: fullShippingAddress,
        paymentMethod: 'COD',
        paymentStatus: 'UNPAID',
        shippingMethod: shippingMethod === 'EXPRESS' ? 'Hỏa Tốc 2H' : 'Tiêu Chuẩn Toàn Quốc',
        shippingFee: totalShippingFee,
        orderNote,
        vatInvoice: needsVatInvoice
          ? {
              companyName,
              taxCode,
              email: vatEmail || email,
            }
          : undefined,
      });

      setIsProcessing(false);
      setPlacedOrderId(order.orderCode || String(order.id));
    }
  };

  const handleConfirmVnPaySuccess = async () => {
    setIsProcessing(true);
    const order = await placeOrder({
      shippingName: fullName,
      shippingPhone: phoneNumber,
      shippingAddress: fullShippingAddress,
      paymentMethod: 'VNPAY_QR',
      paymentStatus: 'PAID',
      shippingMethod: shippingMethod === 'EXPRESS' ? 'Hỏa Tốc 2H' : 'Tiêu Chuẩn Toàn Quốc',
      shippingFee: totalShippingFee,
      orderNote,
      vatInvoice: needsVatInvoice
        ? {
            companyName,
            taxCode,
            email: vatEmail || email,
          }
        : undefined,
    });
    setShowVnPayModal(false);
    setIsProcessing(false);
    setPlacedOrderId(order.orderCode || String(order.id));
  };

  // SUCCESS CONFIRMATION SCREEN
  if (placedOrderId) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-6 shadow-2xl font-sans">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
          <CheckCircle className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Đặt Hàng Thành Công
          </span>
          <h2 className="text-2xl font-black text-white">Cảm Ơn Quý Khách Đã Mua Hàng!</h2>
          <p className="text-xs text-slate-300">
            Mã đơn hàng của bạn là: <strong className="text-rose-400 font-mono text-sm">{placedOrderId}</strong>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 text-slate-300">
          <p><strong>Người nhận:</strong> {fullName} ({phoneNumber})</p>
          <p><strong>Địa chỉ giao:</strong> {fullShippingAddress}</p>
          <p><strong>Phương thức:</strong> {paymentMethod === 'VNPAY_QR' ? 'Đã thanh toán qua VNPAY-QR' : 'Thanh toán tiền mặt khi nhận hàng (COD)'}</p>
          <p><strong>Tổng tiền:</strong> <span className="text-rose-400 font-bold">{grandTotal.toLocaleString('vi-VN')}đ</span></p>
          {needsVatInvoice && (
            <p className="text-cyan-400"><strong>Hóa đơn VAT:</strong> Đã ghi nhận phát hành tới MST {taxCode}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => navigateToAccountTab('orders')}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Xem Lịch Sử Đơn Hàng
          </button>
          <button
            onClick={() => setCurrentView('home')}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow"
          >
            Tiếp Tục Mua Sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex items-center gap-2 text-xs text-slate-400 pb-2 border-b border-slate-800">
        <button onClick={() => setCurrentView('cart')} className="hover:text-rose-400 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Quay lại giỏ hàng
        </button>
        <span>/</span>
        <span className="text-white font-semibold">Xác nhận thanh toán đơn hàng</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Shipping & Payment Forms (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. SHIPPING INFO FORM */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <Truck className="w-5 h-5 text-rose-500" />
              <span>1. Thông Tin Nhận Hàng</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Họ và tên người nhận *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Số điện thoại liên hệ *</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="Ví dụ: 0988667788"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email nhận thông báo đơn hàng</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Ví dụ: an.nguyen@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Tỉnh / Thành phố *</label>
                <select
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Quận / Huyện *</label>
                <input
                  type="text"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  placeholder="Ví dụ: Quận Cầu Giấy"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Địa chỉ số nhà, ngõ, tên đường cụ thể *</label>
                <input
                  type="text"
                  value={addressDetail}
                  onChange={e => setAddressDetail(e.target.value)}
                  placeholder="Ví dụ: Số 102 Đường Duy Tân, Phường Dịch Vọng Hậu"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Ghi chú giao hàng</label>
                <input
                  type="text"
                  value={orderNote}
                  onChange={e => setOrderNote(e.target.value)}
                  placeholder="Ví dụ: Giao giờ hành chính, gọi điện trước khi tới"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. SHIPPING METHOD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <Truck className="w-5 h-5 text-cyan-500" />
              <span>2. Phương Thức Vận Chuyển</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setShippingMethod('STANDARD')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  shippingMethod === 'STANDARD'
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Giao Hàng Tiêu Chuẩn</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {baseShippingFee === 0 ? 'Miễn Phí' : '35.000đ'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Dự kiến giao 2-3 ngày toàn quốc qua GHN / ViettelPost</p>
              </label>

              <label
                onClick={() => setShippingMethod('EXPRESS')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  shippingMethod === 'EXPRESS'
                    ? 'bg-rose-950/40 border-rose-500 shadow-md'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Hỏa Tốc 2 Giờ</span>
                  <span className="text-xs font-bold text-rose-400">+45.000đ</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Giao hỏa tốc nội thành Hà Nội & TP.HCM nhận ngay trong ngày</p>
              </label>
            </div>
          </div>

          {/* 3. PAYMENT METHOD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <CreditCard className="w-5 h-5 text-amber-500" />
              <span>3. Phương Thức Thanh Toán</span>
            </h2>

            <div className="space-y-3">
              <label
                onClick={() => setPaymentMethod('VNPAY_QR')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-4 transition-all ${
                  paymentMethod === 'VNPAY_QR'
                    ? 'bg-rose-950/40 border-rose-500 shadow-md'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-500 shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Thanh toán VNPAY-QR (Sandbox Sandbox)</span>
                    <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/30">
                      Khuyên Dùng
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Quét mã QR qua app ngân hàng (Vietcombank, MBBank, BIDV, Techcombank, Momo, VNPay...)
                  </p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-4 transition-all ${
                  paymentMethod === 'COD'
                    ? 'bg-amber-950/40 border-amber-500 shadow-md'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500 shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-white">Thanh toán khi nhận hàng (COD)</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Kiểm tra hàng và thanh toán tiền mặt cho nhân viên giao vận tại nhà
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 4. VAT INVOICE SECTION */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={needsVatInvoice}
                  onChange={e => setNeedsVatInvoice(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded"
                />
                <Receipt className="w-4 h-4 text-cyan-400" />
                <span>Yêu cầu xuất hóa đơn điện tử VAT (Doanh Nghiệp)</span>
              </label>
            </div>

            {needsVatInvoice && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 pt-4 animate-in fade-in duration-300">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Tên đầy đủ công ty / tổ chức *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="Ví dụ: Công ty Cổ phần Công nghệ ABC Việt Nam"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Mã số thuế doanh nghiệp *</label>
                    <input
                      type="text"
                      value={taxCode}
                      onChange={e => setTaxCode(e.target.value)}
                      placeholder="Ví dụ: 0101234567"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email nhận file HĐĐT (.pdf, .xml)</label>
                    <input
                      type="email"
                      value={vatEmail}
                      onChange={e => setVatEmail(e.target.value)}
                      placeholder="ketoan@congty.com"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Review & Submission (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-white pb-3 border-b border-slate-800 uppercase tracking-tight">
              Sản Phẩm Đang Đặt ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h3>

            <div className="divide-y divide-slate-800/80 max-h-80 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.product.id} className="py-3 first:pt-0 flex items-center justify-between gap-3">
                  <img
                    src={item.product.thumbnailUrl}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{item.product.name}</p>
                    <span className="text-[11px] text-slate-400 block">
                      Số lượng: {item.quantity} x {item.product.priceSale.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white">
                    {(item.product.priceSale * item.quantity).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Tiền hàng:</span>
                <span>{cartTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Giảm giá voucher ({appliedVoucher?.code}):</span>
                  <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Phí vận chuyển ({shippingMethod === 'EXPRESS' ? 'Hỏa Tốc' : 'Tiêu Chuẩn'}):</span>
                <span>{totalShippingFee === 0 ? 'Miễn Phí' : `${totalShippingFee.toLocaleString('vi-VN')}đ`}</span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Tổng cộng thanh toán:</span>
                <span className="text-2xl font-black text-rose-500">
                  {grandTotal.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            <button
              id="btn-confirm-order"
              onClick={handleCreateOrder}
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 transition-all uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isProcessing ? 'Đang Xử Lý Đơn Hàng...' : 'Xác Nhận Đặt Hàng'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cam kết chính sách mua sắm</span>
              </div>
              <p>Khách hàng được quyền đồng kiểm cùng bưu tá, kiểm tra đúng linh kiện và tem bảo hành trước khi thanh toán.</p>
            </div>
          </div>
        </div>
      </div>

      {/* VNPAY-QR SIMULATION MODAL */}
      {showVnPayModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold">
                VN
              </div>
              <h3 className="text-lg font-black text-white">Cổng Thanh Toán VNPAY-QR</h3>
            </div>
            <p className="text-xs text-slate-300">
              Quét mã QR dưới đây bằng ứng dụng ngân hàng hoặc ví điện tử bất kỳ để thanh toán sandbox:
            </p>

            {/* QR Code display */}
            <div className="p-4 bg-white rounded-2xl w-56 h-56 mx-auto flex flex-col items-center justify-center shadow-lg">
              <QrCode className="w-44 h-44 text-slate-900" />
              <span className="text-[10px] text-slate-600 font-mono font-bold mt-1">
                GEARTECH-{Date.now().toString().slice(-6)}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Số tiền thanh toán:</span>
                <span className="font-bold text-rose-400">{grandTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px] mt-1">
                <span>Nội dung chuyển khoản:</span>
                <span className="font-mono text-white">GT THANH TOAN {fullName}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowVnPayModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Hủy Giao Dịch
              </button>
              <button
                id="btn-simulate-vnpay-success"
                onClick={handleConfirmVnPaySuccess}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-colors"
              >
                Giả Lập Quét Thành Công
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
