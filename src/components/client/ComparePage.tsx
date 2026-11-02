import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Scale,
  Trash2,
  ShoppingCart,
  CheckCircle,
  Plus,
  ArrowRight,
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare, addToCart, setCurrentView } = useApp();

  if (compareList.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-5 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl font-sans">
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">Chưa Có Sản Phẩm Nào Trong Danh Sách So Sánh</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Nhấn vào biểu tượng cân so sánh trên bất kỳ card sản phẩm nào ở trang danh mục để so sánh chi tiết thông số kỹ thuật song song.
        </p>
        <button
          onClick={() => setCurrentView('catalog')}
          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow inline-flex items-center gap-2"
        >
          <span>Xem Danh Mục Sản Phẩm</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Collect all unique spec names across products in comparison
  const allSpecNames = Array.from(
    new Set(
      compareList.flatMap(p => (p.specs || []).map(s => s.name))
    )
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">So Sánh Thông Số Kỹ Thuật</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            So sánh song song thông số cấu hình và giá bán giữa các model ({compareList.length}/3 sản phẩm)
          </p>
        </div>
        <button
          onClick={clearCompare}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Xóa danh sách so sánh
        </button>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header row with Product Photos & Names */}
          <div className="grid grid-cols-4 gap-4 pb-6 border-b border-slate-800 items-start">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider self-center">
              Thông Tin Tổng Quan
            </div>

            {compareList.map(product => (
              <div key={product.id} className="space-y-3 relative p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-400 rounded-lg"
                  title="Gỡ khỏi bảng so sánh"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <img
                  src={product.thumbnailUrl}
                  alt={product.name}
                  className="w-full h-36 object-cover rounded-xl bg-slate-900"
                />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {product.brand}
                </span>
                <h4 className="text-xs font-bold text-white line-clamp-2">{product.name}</h4>
                <div className="text-sm font-black text-rose-500">
                  {product.priceSale.toLocaleString('vi-VN')}đ
                </div>
                <button
                  onClick={() => addToCart(product, 1)}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Mua Sản Phẩm Này</span>
                </button>
              </div>
            ))}

            {/* Empty slots up to 3 items */}
            {Array.from({ length: 3 - compareList.length }).map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentView('catalog')}
                className="h-full border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <Plus className="w-8 h-8 text-slate-600 group-hover:text-rose-400 transition-colors mb-2" />
                <span className="text-xs font-semibold text-slate-400 group-hover:text-white">
                  Thêm sản phẩm khác để so sánh
                </span>
              </div>
            ))}
          </div>

          {/* Pricing comparison row */}
          <div className="grid grid-cols-4 gap-4 py-4 border-b border-slate-800/80 text-xs items-center">
            <span className="font-bold text-slate-300">Giá Bán Khuyến Mãi</span>
            {compareList.map(p => (
              <span key={p.id} className="font-bold text-rose-400">
                {p.priceSale.toLocaleString('vi-VN')}đ
              </span>
            ))}
          </div>

          {/* Warranty row */}
          <div className="grid grid-cols-4 gap-4 py-4 border-b border-slate-800/80 text-xs items-center">
            <span className="font-bold text-slate-300">Thời Hạn Bảo Hành</span>
            {compareList.map(p => (
              <span key={p.id} className="font-medium text-emerald-400">
                {p.warrantyMonths} Tháng chính hãng
              </span>
            ))}
          </div>

          {/* Detailed specs rows */}
          {allSpecNames.map(specName => {
            // Check if values differ among products to highlight differences
            const values = compareList.map(p => (p.specs || []).find(s => s.name === specName)?.value || '-');
            const isDifferent = new Set(values).size > 1;

            return (
              <div
                key={specName}
                className={`grid grid-cols-4 gap-4 py-3 border-b border-slate-800/60 text-xs items-center ${
                  isDifferent ? 'bg-indigo-950/20' : ''
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`font-semibold ${isDifferent ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {specName}
                  </span>
                  {isDifferent && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1 rounded font-bold">
                      Khác biệt
                    </span>
                  )}
                </div>

                {compareList.map(p => {
                  const val = (p.specs || []).find(s => s.name === specName)?.value || '-';
                  return (
                    <span key={p.id} className="text-slate-200 font-medium">
                      {val}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
