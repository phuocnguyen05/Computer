import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Ticket,
  ShieldCheck,
  Check,
  ChevronLeft,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    appliedVoucher,
    applyVoucher,
    removeVoucher,
    discountAmount,
    finalTotal,
    setCurrentView,
    vouchers,
    requireAuth,
    showToast,
  } = useApp();

  const [voucherCodeInput, setVoucherCodeInput] = useState('');

  const shippingFee = cartTotal >= 1000000 || cartTotal === 0 ? 0 : 35000;
  const grandTotal = finalTotal + shippingFee;

  const handleApplyVoucher = (codeToApply?: string) => {
    const code = codeToApply || voucherCodeInput;
    if (code.trim()) {
      applyVoucher(code.trim().toUpperCase());
      setVoucherCodeInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-8 font-sans shadow-2xl">
        <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">Giỏ Hàng Của Bạn Đang Trống</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Chưa có sản phẩm linh kiện hoặc máy tính nào trong giỏ hàng. Hãy khám phá hàng trăm linh kiện chính hãng tại GearTech!
          </p>
        </div>
        <button
          onClick={() => setCurrentView('catalog')}
          className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all inline-flex items-center gap-2"
        >
          <span>Khám Phá Sản Phẩm Ngay</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Giỏ Hàng Của Bạn</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Có {cart.reduce((s, i) => s + i.quantity, 0)} sản phẩm đang chờ thanh toán
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl divide-y divide-slate-800/80">
            {cart.map(item => (
              <div
                key={item.product.id}
                id={`cart-item-${item.product.id}`}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Image & Title */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img
                    src={item.product.thumbnailUrl}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-xl bg-slate-950 border border-slate-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {item.product.brand} • SKU: {item.product.sku}
                    </span>
                    <h3 className="text-xs font-bold text-white truncate max-w-sm hover:text-rose-400 transition-colors">
                      {item.product.name}
                    </h3>
                    <div className="text-xs font-bold text-rose-500 mt-1 flex items-center gap-2">
                      <span>{item.product.priceSale.toLocaleString('vi-VN')}đ</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        (Kho còn: <strong className={item.product.stock <= 5 ? 'text-amber-400' : 'text-emerald-400'}>{item.product.stock}</strong> sản phẩm)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 self-end sm:self-center">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Giảm số lượng"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                      <button
                        disabled={item.quantity >= item.product.stock}
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className={`p-2 transition-colors ${
                          item.quantity >= item.product.stock
                            ? 'text-slate-600 bg-slate-900 cursor-not-allowed'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer'
                        }`}
                        title={item.quantity >= item.product.stock ? 'Đã đạt giới hạn số lượng tồn kho' : 'Tăng số lượng'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {item.quantity >= item.product.stock && (
                      <span className="text-[9px] text-amber-400 font-semibold">Max số lượng kho</span>
                    )}
                  </div>

                  <div className="text-right min-w-[110px]">
                    <span className="text-xs text-slate-400 block text-[10px]">Thành tiền:</span>
                    <span className="text-sm font-black text-white">
                      {(item.product.priceSale * item.quantity).toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors"
                    title="Xóa khỏi giỏ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentView('catalog')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors pt-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Tiếp tục chọn thêm linh kiện khác</span>
          </button>
        </div>

        {/* Right: Order Summary & Voucher (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Voucher Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Ticket className="w-4 h-4 text-rose-500" />
              <span>Mã Giảm Giá / Voucher</span>
            </div>

            <div className="flex gap-2">
              <input
                id="cart-voucher-input"
                type="text"
                value={voucherCodeInput}
                onChange={e => setVoucherCodeInput(e.target.value)}
                placeholder="Nhập mã voucher (vd: GEARTECH500K)..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder:normal-case placeholder-slate-400 focus:outline-none"
              />
              <button
                id="btn-apply-voucher"
                onClick={() => handleApplyVoucher()}
                className="px-4 py-2 bg-slate-800 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Áp Dụng
              </button>
            </div>

            {/* Currently Applied Voucher */}
            {appliedVoucher && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Đã áp dụng: {appliedVoucher.code}
                  </span>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5">{appliedVoucher.description}</p>
                </div>
                <button
                  onClick={removeVoucher}
                  className="text-rose-400 hover:text-rose-300 text-[11px] font-bold underline"
                >
                  Gỡ bỏ
                </button>
              </div>
            )}

            {/* Quick Select Available Vouchers */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-semibold block">Gợi ý mã có sẵn:</span>
              <div className="space-y-1">
                {vouchers.map(v => (
                  <div
                    key={v.id}
                    onClick={() => handleApplyVoucher(v.code)}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800/70 hover:border-slate-700 cursor-pointer flex items-center justify-between text-[11px] group transition-colors"
                  >
                    <div>
                      <strong className="text-amber-400 group-hover:text-rose-400">{v.code}</strong>
                      <span className="text-slate-400 ml-2">Đơn từ {(((v.minOrder ?? v.minOrderAmount ?? 0)) / 1000000).toFixed(0)}Tr</span>
                    </div>
                    <span className="text-rose-400 font-bold group-hover:underline">Dùng ngay</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Calculations */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-white pb-3 border-b border-slate-800 uppercase tracking-tight">
              Tóm Tắt Đơn Hàng
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-semibold text-white">{cartTotal.toLocaleString('vi-VN')}đ</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Giảm giá voucher:</span>
                  <span className="font-bold">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="flex justify-between text-slate-300">
                <span>Phí vận chuyển:</span>
                <span className={shippingFee === 0 ? 'text-emerald-400 font-bold' : 'font-semibold text-white'}>
                  {shippingFee === 0 ? 'Miễn Phí Toàn Quốc' : `${shippingFee.toLocaleString('vi-VN')}đ`}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Tổng cộng thanh toán:</span>
                <span className="text-xl font-black text-rose-500">
                  {grandTotal.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            <button
              id="btn-proceed-to-checkout"
              onClick={() => {
                requireAuth(() => {
                  setCurrentView('checkout');
                }, 'checkout');
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-rose-600/30 transition-all text-center uppercase tracking-wide flex items-center justify-center gap-2"
            >
              <span>Tiến Hành Thanh Toán</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Bảo mật thanh toán SSL 256-bit chuẩn PCI-DSS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
