import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ShoppingCart,
  Heart,
  Scale,
  MessageSquare,
  Send,
  Camera,
  CornerDownRight,
  ChevronRight,
  Share2,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const {
    products,
    selectedProductId,
    setSelectedProductId,
    setCurrentView,
    addToCart,
    wishlist,
    toggleWishlist,
    addToCompare,
    reviews,
    addReview,
    showToast,
    promptLoginOrGuest,
    isLoggedIn,
  } = useApp();

  const product = products.find(p => p.id === selectedProductId) || products[0];

  // Gallery Active Image
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Review Filter & Form State
  const [reviewFilterRating, setReviewFilterRating] = useState<number | 'ALL'>('ALL');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnailUrl];

  // Product reviews
  const productReviews = reviews.filter(r => r.productId === product.id);
  const filteredReviews = productReviews.filter(r => {
    if (reviewFilterRating === 'ALL') return true;
    return r.rating === reviewFilterRating;
  });

  // Similar Products in the same category
  const similarProducts = products
    .filter(p => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 4);

  const discountPct = Math.round(((product.priceOriginal - product.priceSale) / product.priceOriginal) * 100);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      showToast('Vui lòng nhập nội dung nhận xét', 'error');
      return;
    }
    setIsSubmittingReview(true);
    await addReview({
      productId: product.id,
      productName: product.name,
      rating: newRating,
      comment: newComment,
      imageUrl: newImageUrl || undefined,
    });
    setNewComment('');
    setNewImageUrl('');
    setIsSubmittingReview(false);
  };

  return (
    <div className="space-y-12 font-sans">
      {/* 1. BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <button onClick={() => setCurrentView('home')} className="hover:text-rose-400">
          Trang Chủ
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => setCurrentView('catalog')} className="hover:text-rose-400">
          {product.categoryName || 'Sản phẩm'}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-200 truncate max-w-md">{product.name}</span>
      </nav>

      {/* 2. PRODUCT MAIN OVERVIEW (Gallery + Buy Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 h-[380px] sm:h-[420px] flex items-center justify-center">
            <img
              src={images[activeImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {discountPct > 0 && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-lg">
                Giảm {discountPct}%
              </span>
            )}
            {isLoggedIn && (
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-colors ${
                  wishlist.includes(product.id)
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-900/80 text-slate-300 hover:text-rose-400'
                }`}
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>
            )}
          </div>

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border-2 shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-rose-500 scale-105 shadow' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Commitment Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-300">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center text-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Chính Hãng</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center text-center gap-1">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>Freeship Toàn Quốc</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center text-center gap-1">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>1 Đổi 1 Trong 30 Ngày</span>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Purchase Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Brand, SKU, Warranty */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="bg-rose-500/20 text-rose-400 font-bold px-2.5 py-0.5 rounded-lg border border-rose-500/30">
                {product.brand}
              </span>
              <span className="text-slate-400">Mã SKU: <strong className="text-slate-200">{product.sku}</strong></span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400">Bảo hành: <strong className="text-emerald-400">{product.warrantyMonths} Tháng</strong></span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Sold */}
            <div className="flex items-center gap-3 text-xs text-slate-400 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-sm text-white">{product.ratingAvg}</span>
                <span className="text-slate-400">({product.reviewCount} đánh giá)</span>
              </div>
              <span>•</span>
              <span>Đã bán: <strong className="text-slate-200">{product.soldCount}</strong></span>
              <span>•</span>
              <span className={product.stock > 0 ? 'text-emerald-400 font-bold' : 'text-rose-500 font-bold'}>
                {product.stock > 0 ? `Còn hàng (${product.stock} trong kho)` : 'Tạm hết hàng'}
              </span>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-baseline gap-4 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-rose-500">
                {product.priceSale.toLocaleString('vi-VN')}đ
              </span>
              {product.priceOriginal > product.priceSale && (
                <>
                  <span className="text-sm sm:text-base text-slate-400 line-through">
                    {product.priceOriginal.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-800/60">
                    Tiết kiệm {(product.priceOriginal - product.priceSale).toLocaleString('vi-VN')}đ
                  </span>
                </>
              )}
            </div>

            {/* Special Gift Offers */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Quà Tặng & Ưu Đãi Đặc Quyền
              </span>
              <ul className="text-xs text-slate-300 space-y-1 pl-1">
                <li>• Tặng gói dịch vụ vệ sinh máy và tra keo tản nhiệt trọn đời trị giá 1.500.000đ</li>
                <li>• Tặng voucher giảm 500.000đ khi mua thêm Màn hình Gaming hoặc Bàn phím cơ</li>
                <li>• Hỗ trợ trả góp 0% qua thẻ tín dụng và đối tác tài chính</li>
              </ul>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-semibold text-slate-300">Số lượng:</span>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons: Buy Now & Add To Cart */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <button
              id="btn-buy-now-detail"
              onClick={() => {
                addToCart(product, quantity);
                promptLoginOrGuest(() => setCurrentView('checkout'), 'buy_now');
              }}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 transition-all text-center uppercase tracking-wide"
            >
              Mua Ngay (Giao Nhanh 2H)
            </button>
            <button
              id="btn-add-cart-detail"
              onClick={() => addToCart(product, quantity)}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4 text-rose-400" />
              <span>Thêm Vào Giỏ Hàng</span>
            </button>
            <button
              id="btn-compare-detail"
              onClick={() => addToCompare(product)}
              className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-700 transition-colors"
              title="So sánh với sản phẩm khác"
            >
              <Scale className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. TECHNICAL SPECIFICATIONS & RICH DESCRIPTION TABS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Detailed Rich Description (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-white pb-3 border-b border-slate-800 uppercase tracking-tight">
              Mô Tả Chi Tiết Sản Phẩm
            </h3>
            <div className="prose prose-invert text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4">
              <p>{product.description}</p>
              <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 my-4">
                <img
                  src={images[0]}
                  alt="Minh họa tính năng"
                  className="w-full h-72 object-cover"
                />
              </div>
              <p>
                Được kiểm định chất lượng nghiêm ngặt bởi các chuyên gia kỹ thuật phần cứng của GearTech trước khi bàn giao. Hỗ trợ lắp đặt tận nơi, kiểm tra độ tương thích tuyệt đối cho mọi dàn máy tính.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Technical Specifications Table (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-white pb-3 border-b border-slate-800 uppercase tracking-tight">
              Bảng Thông Số Kỹ Thuật
            </h3>

            {product.specs && product.specs.length > 0 ? (
              <div className="divide-y divide-slate-800/80 text-xs">
                {product.specs.map((spec, idx) => (
                  <div key={idx} className="py-2.5 flex items-start justify-between gap-4">
                    <span className="text-slate-400 font-medium shrink-0 max-w-[40%]">{spec.name}</span>
                    <span className="text-slate-200 font-semibold text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Thông số kỹ thuật đang được cập nhật...</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. CUSTOMER REVIEWS & SHOP REPLIES */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              Đánh Giá & Phản Hồi Từ Khách Hàng
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Đánh giá thực tế từ người dùng đã mua sản phẩm tại GearTech
            </p>
          </div>

          {/* Filter stars button row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setReviewFilterRating('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                reviewFilterRating === 'ALL'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Tất cả ({productReviews.length})
            </button>
            {[5, 4, 3, 2, 1].map(stars => (
              <button
                key={stars}
                onClick={() => setReviewFilterRating(stars)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                  reviewFilterRating === stars
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{stars}</span>
                <Star className="w-3 h-3 fill-current text-amber-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map(rev => (
              <div
                key={rev.id}
                id={`review-item-${rev.id}`}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={rev.userName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">{rev.userName}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-1">{rev.comment}</p>

                {rev.imageUrl && (
                  <div className="mt-2 pl-1">
                    <img
                      src={rev.imageUrl}
                      alt="Ảnh từ khách hàng"
                      className="w-24 h-24 object-cover rounded-xl border border-slate-800"
                    />
                  </div>
                )}

                {/* Seller Official Reply */}
                {rev.sellerReply && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800/90 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Phản hồi chính thức từ GearTech</span>
                      {rev.sellerReplyAt && (
                        <span className="text-[10px] text-slate-400 font-normal ml-auto">
                          {new Date(rev.sellerReplyAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 pl-5 leading-relaxed">{rev.sellerReply}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
              Chưa có nhận xét nào phù hợp với bộ lọc số sao này.
            </div>
          )}
        </div>

        {/* Review Submission Form */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-rose-500" />
            <span>Gửi Đánh Giá Cho Sản Phẩm Này</span>
          </h4>

          <form onSubmit={handleSubmitReview} className="space-y-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
            {/* Rating Stars Selection */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-medium">Đánh giá số sao:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(stars => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setNewRating(stars)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        stars <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs text-amber-400 font-bold ml-2">({newRating} sao)</span>
            </div>

            {/* Comment Text Area */}
            <textarea
              id="review-comment-input"
              rows={3}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Chia sẻ cảm nhận thực tế về chất lượng sản phẩm, tốc độ xử lý, đóng gói..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />

            {/* Optional Image Link */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  placeholder="Dán link ảnh mở hộp / test hiệu năng (tùy chọn)..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                />
                <Camera className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi Đánh Giá</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 5. SIMILAR / RELATED PRODUCTS */}
      {similarProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              Sản Phẩm Tương Tự Cùng Phân Khúc
            </h3>
            <button
              onClick={() => setCurrentView('catalog')}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold"
            >
              Xem thêm &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {similarProducts.map(p => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProductId(p.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <img
                    src={p.thumbnailUrl}
                    alt={p.name}
                    className="w-full h-40 object-cover rounded-xl bg-slate-950 mb-3 group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {p.brand}
                  </span>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-rose-400 line-clamp-2 mt-1 transition-colors">
                    {p.name}
                  </h4>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-baseline justify-between">
                  <span className="text-xs font-black text-rose-500">
                    {p.priceSale.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-[10px] text-slate-400">Xem ngay &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
