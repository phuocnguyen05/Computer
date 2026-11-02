import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Star,
  ShoppingCart,
  Heart,
  Scale,
  RotateCcw,
  Check,
  Grid3X3,
  List,
  Sparkles,
  Layers,
  FolderTree,
  Tag,
  Search,
  History,
  X,
} from 'lucide-react';

const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả mức giá', min: 0, max: Infinity },
  { id: 'under-5m', label: 'Dưới 5 Triệu', min: 0, max: 5000000 },
  { id: '5m-15m', label: 'Từ 5 đến 15 Triệu', min: 5000000, max: 15000000 },
  { id: '15m-30m', label: 'Từ 15 đến 30 Triệu', min: 15000000, max: 30000000 },
  { id: 'above-30m', label: 'Trên 30 Triệu', min: 30000000, max: Infinity },
];

const CPU_OPTIONS = ['Tất cả', 'Intel Core i9', 'Intel Core i7', 'Intel Core i5', 'AMD Ryzen 7', 'AMD Ryzen 5'];
const RAM_OPTIONS = ['Tất cả', '64GB', '32GB', '16GB', '8GB'];

export const CatalogPage: React.FC = () => {
  const {
    products,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    setSelectedProductId,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    addToCart,
    wishlist,
    toggleWishlist,
    addToCompare,
    isLoggedIn,
  } = useApp();

  // Filters State
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('Tất cả');
  const [selectedCpu, setSelectedCpu] = useState<string>('Tất cả');
  const [selectedRam, setSelectedRam] = useState<string>('Tất cả');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'bestseller' | 'rating'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Recent Search History State
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('geartech_recent_searches');
      return saved ? JSON.parse(saved) : ['RTX 4090', 'PC Gaming', 'Laptop ROG', 'Màn hình 240Hz'];
    } catch {
      return ['RTX 4090', 'PC Gaming', 'Laptop ROG'];
    }
  });
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);

  const addRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('geartech_recent_searches', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const removeRecentSearch = (term: string) => {
    setRecentSearches(prev => {
      const next = prev.filter(t => t !== term);
      try {
        localStorage.setItem('geartech_recent_searches', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('geartech_recent_searches');
    } catch {}
  };

  // Subcategories expansion state (default all open so subcategories are easily accessible)
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<number[]>([1, 2, 3, 4, 5, 6]);

  const toggleExpandCategory = (catId: number) => {
    setExpandedCategoryIds(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  // Pagination State - 12 items per page ensures all 6 products of any subcategory fit on 1 page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Resolve active category info (parent and subcategory)
  const resolvedCategoryInfo = useMemo(() => {
    if (!selectedCategoryId) return { parent: null, sub: null, title: 'Tất Cả Linh Kiện & Máy Tính' };

    // Check parent
    const parent = categories.find(c => c.id === selectedCategoryId);
    if (parent) {
      return { parent, sub: null, title: parent.name };
    }

    // Check subcategory
    for (const cat of categories) {
      const sub = cat.children?.find(s => s.id === selectedCategoryId);
      if (sub) {
        return { parent: cat, sub, title: sub.name };
      }
    }

    return { parent: null, sub: null, title: 'Danh Mục Sản Phẩm' };
  }, [categories, selectedCategoryId]);

  // Determine active parent and relevant subcategories
  const activeParentCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    const parent = categories.find(c => c.id === selectedCategoryId);
    if (parent) return parent;
    for (const cat of categories) {
      if (cat.children?.some(s => s.id === selectedCategoryId)) {
        return cat;
      }
    }
    return null;
  }, [categories, selectedCategoryId]);

  const relevantSubCategories = useMemo(() => {
    if (activeParentCategory) {
      return activeParentCategory.children || [];
    }
    return [];
  }, [activeParentCategory]);

  // Dynamic available brands based on current category pool
  const availableBrands = useMemo(() => {
    let pool = products;
    if (selectedCategoryId) {
      const parentCat = categories.find(c => c.id === selectedCategoryId);
      if (parentCat && parentCat.children && parentCat.children.length > 0) {
        const childIds = parentCat.children.map(ch => ch.id);
        pool = products.filter(p => p.categoryId === selectedCategoryId || childIds.includes(p.categoryId));
      } else {
        pool = products.filter(p => p.categoryId === selectedCategoryId);
      }
    }
    const brandSet = new Set<string>();
    pool.forEach(p => {
      if (p.brand && p.brand.trim()) brandSet.add(p.brand.trim());
    });
    return ['Tất cả', ...Array.from(brandSet).sort()];
  }, [products, selectedCategoryId, categories]);

  // Check if CPU/RAM filters are applicable (only for PC, Laptop, CPU, RAM)
  const isSpecsFilterApplicable = useMemo(() => {
    if (!selectedCategoryId) return true;
    if ([1, 2, 3, 11, 12, 13, 14, 21, 22, 23, 24, 31, 34].includes(selectedCategoryId)) {
      return true;
    }
    return false;
  }, [selectedCategoryId]);

  // Reset pagination and incompatible filters on category change, and auto expand parent
  useEffect(() => {
    setCurrentPage(1);
    setSelectedBrand('Tất cả');
    setSelectedPriceRange('all');
    setSelectedCpu('Tất cả');
    setSelectedRam('Tất cả');
    if (selectedCategoryId) {
      for (const cat of categories) {
        if (cat.id === selectedCategoryId || cat.children?.some(s => s.id === selectedCategoryId)) {
          setExpandedCategoryIds(prev => prev.includes(cat.id) ? prev : [...prev, cat.id]);
          break;
        }
      }
    }
  }, [selectedCategoryId, categories]);

  // Filter logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategoryId) {
      const parentCat = categories.find(c => c.id === selectedCategoryId);
      if (parentCat && parentCat.children && parentCat.children.length > 0) {
        const childIds = parentCat.children.map(ch => ch.id);
        result = result.filter(p => p.categoryId === selectedCategoryId || childIds.includes(p.categoryId));
      } else {
        result = result.filter(p => p.categoryId === selectedCategoryId);
      }
    }

    // Price range
    const range = PRICE_RANGES.find(r => r.id === selectedPriceRange);
    if (range && range.id !== 'all') {
      result = result.filter(p => p.priceSale >= range.min && p.priceSale <= range.max);
    }

    // Brand
    if (selectedBrand !== 'Tất cả') {
      result = result.filter(p => p.brand.toLowerCase().includes(selectedBrand.toLowerCase()));
    }

    // CPU filter in specs
    if (selectedCpu !== 'Tất cả') {
      result = result.filter(p =>
        p.specs.some(s => s.value.toLowerCase().includes(selectedCpu.toLowerCase())) ||
        p.name.toLowerCase().includes(selectedCpu.toLowerCase())
      );
    }

    // RAM filter in specs
    if (selectedRam !== 'Tất cả') {
      result = result.filter(p =>
        p.specs.some(s => s.value.toLowerCase().includes(selectedRam.toLowerCase())) ||
        p.name.toLowerCase().includes(selectedRam.toLowerCase())
      );
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.priceSale - b.priceSale);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.priceSale - a.priceSale);
    } else if (sortBy === 'bestseller') {
      result.sort((a, b) => b.soldCount - a.soldCount);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.ratingAvg - a.ratingAvg);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [products, searchQuery, selectedCategoryId, selectedPriceRange, selectedBrand, selectedCpu, selectedRam, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const catalogTopRef = useRef<HTMLDivElement>(null);

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    // Smoothly scroll back to the top of the product catalog
    if (catalogTopRef.current) {
      catalogTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSelectedPriceRange('all');
    setSelectedBrand('Tất cả');
    setSelectedCpu('Tất cả');
    setSelectedRam('Tất cả');
    setSearchQuery('');
    setSelectedCategoryId(null);
    setCurrentPage(1);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <div ref={catalogTopRef} className="space-y-6 font-sans scroll-mt-24">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 flex-wrap">
            <span
              className="hover:text-rose-400 cursor-pointer"
              onClick={() => {
                setSelectedCategoryId(null);
                setCurrentView('home');
              }}
            >
              Trang Chủ
            </span>
            <span>/</span>
            {resolvedCategoryInfo.parent ? (
              <>
                <span
                  className={`${resolvedCategoryInfo.sub ? 'hover:text-rose-400 cursor-pointer text-slate-400' : 'text-slate-200'}`}
                  onClick={() => {
                    if (resolvedCategoryInfo.sub) {
                      setSelectedCategoryId(resolvedCategoryInfo.parent!.id);
                      setCurrentPage(1);
                    }
                  }}
                >
                  {resolvedCategoryInfo.parent.name}
                </span>
                {resolvedCategoryInfo.sub && (
                  <>
                    <span>/</span>
                    <span className="text-rose-400 font-semibold">
                      {resolvedCategoryInfo.sub.name}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="text-slate-200">Danh Mục Sản Phẩm</span>
            )}
            {searchQuery && (
              <>
                <span>/</span>
                <span className="text-rose-400">Tìm kiếm: "{searchQuery}"</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {resolvedCategoryInfo.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hiển thị {filteredProducts.length} sản phẩm chính hãng sẵn hàng
          </p>
        </div>

        {/* Sorting & Layout View Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <span className="text-slate-400 hidden sm:inline">Sắp xếp:</span>
            <select
              id="catalog-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-slate-900">Mới nhất</option>
              <option value="bestseller" className="bg-slate-900">Bán chạy nhất</option>
              <option value="price-asc" className="bg-slate-900">Giá: Thấp đến Cao</option>
              <option value="price-desc" className="bg-slate-900">Giá: Cao đến Thấp</option>
              <option value="rating" className="bg-slate-900">Đánh giá cao nhất</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR FILTERS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <SlidersHorizontal className="w-4 h-4 text-rose-500" />
                <span>Bộ Lọc Sản Phẩm</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Đặt lại
              </button>
            </div>

            {/* 1. Filter: Categories with Sub-categories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Danh Mục Sản Phẩm
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {categories.length} nhóm lớn
                </span>
              </div>
              <div className="space-y-1">
                <button
                  id="cat-btn-all"
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategoryId === null
                      ? 'bg-rose-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>Tất Cả Danh Mục</span>
                  <span className="text-[10px] opacity-75">({products.length})</span>
                </button>

                {categories.map(cat => {
                  const isParentSelected = selectedCategoryId === cat.id;
                  const isChildSelected = cat.children?.some(c => c.id === selectedCategoryId);
                  const isExpanded = expandedCategoryIds.includes(cat.id);
                  const childIds = cat.children ? cat.children.map(ch => ch.id) : [];
                  const parentProductCount = products.filter(
                    p => p.categoryId === cat.id || childIds.includes(p.categoryId)
                  ).length;

                  return (
                    <div key={cat.id} className="space-y-0.5 pt-0.5">
                      <div className="flex items-center gap-1">
                        <button
                          id={`cat-btn-${cat.id}`}
                          onClick={() => {
                            setSelectedCategoryId(cat.id);
                            setCurrentPage(1);
                            if (!expandedCategoryIds.includes(cat.id)) {
                              setExpandedCategoryIds(prev => [...prev, cat.id]);
                            }
                          }}
                          className={`flex-1 text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                            isParentSelected
                              ? 'bg-rose-600 text-white font-bold shadow-sm'
                              : isChildSelected
                              ? 'bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/30'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span className="truncate pr-1">{cat.name}</span>
                          <span className="text-[10px] opacity-70 shrink-0">
                            ({parentProductCount})
                          </span>
                        </button>

                        {cat.children && cat.children.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpandCategory(cat.id);
                            }}
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title={isExpanded ? 'Thu gọn mục con' : 'Xem mục con'}
                            aria-label={isExpanded ? `Thu gọn ${cat.name}` : `Mở rộng ${cat.name}`}
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isExpanded ? 'transform rotate-180 text-rose-400' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Sub-categories nested under parent */}
                      {cat.children && cat.children.length > 0 && isExpanded && (
                        <div className="pl-3 ml-2.5 border-l-2 border-slate-800 space-y-1 py-1">
                          {cat.children.map(subCat => {
                            const isSubSelected = selectedCategoryId === subCat.id;
                            const subProductCount = products.filter(p => p.categoryId === subCat.id).length;

                            return (
                              <button
                                key={subCat.id}
                                id={`subcat-btn-${subCat.id}`}
                                onClick={() => {
                                  setSelectedCategoryId(subCat.id);
                                  setCurrentPage(1);
                                }}
                                className={`w-full text-left pl-2.5 pr-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between group ${
                                  isSubSelected
                                    ? 'bg-rose-600 text-white font-bold shadow'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                              >
                                <span className="truncate flex items-center gap-1.5">
                                  <span
                                    className={`text-[11px] font-bold ${
                                      isSubSelected ? 'text-white' : 'text-slate-500 group-hover:text-rose-400'
                                    }`}
                                  >
                                    ↳
                                  </span>
                                  <span className="truncate">{subCat.name}</span>
                                </span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold shrink-0 ml-1.5 ${
                                    isSubSelected ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {subProductCount}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Filter: Price Range */}
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider">
                Khoảng Giá (VNĐ)
              </span>
              <div className="space-y-1.5">
                {PRICE_RANGES.map(range => (
                  <label
                    key={range.id}
                    className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="price-range"
                      checked={selectedPriceRange === range.id}
                      onChange={() => {
                        setSelectedPriceRange(range.id);
                        setCurrentPage(1);
                      }}
                      className="accent-rose-500 rounded"
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Filter: Brand */}
            {availableBrands.length > 1 && (
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider">
                  Hãng Sản Xuất ({availableBrands.length - 1} hãng)
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {availableBrands.map(b => (
                    <button
                      key={b}
                      onClick={() => {
                        setSelectedBrand(b);
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                        selectedBrand === b
                          ? 'bg-rose-600 text-white font-bold shadow'
                          : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Filter: CPU Type (Only when applicable) */}
            {isSpecsFilterApplicable && (
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider">
                  Dòng CPU (Vi Xử Lý)
                </span>
                <div className="space-y-1.5">
                  {CPU_OPTIONS.map(c => (
                    <label key={c} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="cpu-filter"
                        checked={selectedCpu === c}
                        onChange={() => {
                          setSelectedCpu(c);
                          setCurrentPage(1);
                        }}
                        className="accent-rose-500"
                      />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Filter: RAM (Only when applicable) */}
            {isSpecsFilterApplicable && (
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider">
                  Dung Lượng RAM
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {RAM_OPTIONS.map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        setSelectedRam(r);
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                        selectedRam === r
                          ? 'bg-rose-600 text-white font-bold'
                          : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PRODUCTS GRID OR LIST */}
        <div className="lg:col-span-3 space-y-6">
          {/* Catalog Search Bar with Recent Search History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3 relative">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4 text-rose-500" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      addRecentSearch(searchQuery.trim());
                      setShowRecentDropdown(false);
                    }
                  }}
                  onFocus={() => setShowRecentDropdown(true)}
                  placeholder="Tìm kiếm nhanh trong danh mục (VD: RTX 4090, Ryzen 7, Màn hình 240Hz...)"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-20 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    title="Xóa tìm kiếm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (searchQuery.trim()) {
                      addRecentSearch(searchQuery.trim());
                      setShowRecentDropdown(false);
                    }
                  }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Tìm
                </button>
              </div>
            </div>

            {/* Recent Searches Dropdown / Chips */}
            {showRecentDropdown && recentSearches.length > 0 && (
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mr-2">
                  <History className="w-3.5 h-3.5 text-rose-400" />
                  <span>Tìm kiếm gần đây:</span>
                </div>
                {recentSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      addRecentSearch(term);
                      setShowRecentDropdown(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-xs border border-slate-700 transition-all flex items-center gap-1.5 group"
                  >
                    <span>{term}</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(term);
                      }}
                      className="text-slate-500 group-hover:text-white hover:bg-rose-700 rounded p-0.5"
                      title="Xóa từ khóa này"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  </button>
                ))}
                <button
                  onClick={clearRecentSearches}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold ml-auto underline"
                >
                  Xóa lịch sử
                </button>
              </div>
            )}
          </div>
          {/* Subcategory Pills Bar: When parent or subcategory is active */}
          {activeParentCategory && relevantSubCategories.length > 0 && (
            <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Mục Nhỏ Thuộc: {activeParentCategory.name}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {relevantSubCategories.length} mục nhỏ • Mỗi mục tối thiểu 5+ sản phẩm
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  id={`subpill-parent-${activeParentCategory.id}`}
                  onClick={() => {
                    setSelectedCategoryId(activeParentCategory.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    selectedCategoryId === activeParentCategory.id
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <span>Tất cả {activeParentCategory.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/30 opacity-80">
                    {products.filter(p => p.categoryId === activeParentCategory.id || relevantSubCategories.some(c => c.id === p.categoryId)).length}
                  </span>
                </button>

                {relevantSubCategories.map(sub => {
                  const isSelected = selectedCategoryId === sub.id;
                  const subCount = products.filter(p => p.categoryId === sub.id).length;
                  return (
                    <button
                      key={sub.id}
                      id={`subpill-child-${sub.id}`}
                      onClick={() => {
                        setSelectedCategoryId(sub.id);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400/40'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      <span>{sub.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        isSelected ? 'bg-rose-700 text-white' : 'bg-slate-700/80 text-rose-300'
                      }`}>
                        {subCount} sp
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {paginatedProducts.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedProducts.map(p => {
                  const discountPct = Math.round(((p.priceOriginal - p.priceSale) / p.priceOriginal) * 100);
                  return (
                    <div
                      key={p.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image */}
                        <div className="relative rounded-xl overflow-hidden bg-slate-950 h-48 mb-3">
                          <img
                            src={p.thumbnailUrl}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {discountPct > 0 && (
                            <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow">
                              -{discountPct}%
                            </span>
                          )}
                          <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                            {isLoggedIn && (
                              <button
                                onClick={() => toggleWishlist(p.id)}
                                className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                                  wishlist.includes(p.id)
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-900/80 text-slate-300 hover:text-rose-400'
                                }`}
                              >
                                <Heart className="w-3.5 h-3.5 fill-current" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title & Brand */}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {p.brand} • Bảo hành {p.warrantyMonths}T
                        </span>
                        <h3
                          onClick={() => {
                            setSelectedProductId(p.id);
                            setCurrentView('product-detail');
                          }}
                          className="text-xs font-bold text-slate-200 hover:text-rose-400 cursor-pointer line-clamp-2 mt-1 transition-colors leading-snug"
                        >
                          {p.name}
                        </h3>

                        {/* Star Rating */}
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                          <div className="flex items-center text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span className="ml-1 font-bold">{p.ratingAvg}</span>
                          </div>
                          <span>•</span>
                          <span>Đã bán {p.soldCount}</span>
                        </div>

                        {/* Price */}
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-sm font-black text-rose-500">
                            {p.priceSale.toLocaleString('vi-VN')}đ
                          </span>
                          {p.priceOriginal > p.priceSale && (
                            <span className="text-[11px] text-slate-400 line-through">
                              {p.priceOriginal.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                        <button
                          onClick={() => addToCart(p, 1)}
                          className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow flex items-center justify-center gap-1.5"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Thêm vào giỏ</span>
                        </button>
                        <button
                          onClick={() => addToCompare(p)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                          title="So sánh"
                        >
                          <Scale className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {paginatedProducts.map(p => (
                  <div
                    key={p.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-slate-700 transition-all"
                  >
                    <img
                      src={p.thumbnailUrl}
                      alt={p.name}
                      className="w-full sm:w-44 h-36 object-cover rounded-xl bg-slate-950"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {p.brand} • Bảo hành {p.warrantyMonths} Tháng
                      </span>
                      <h3
                        onClick={() => {
                          setSelectedProductId(p.id);
                          setCurrentView('product-detail');
                        }}
                        className="text-sm font-bold text-slate-200 hover:text-rose-400 cursor-pointer mt-1"
                      >
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1.5">{p.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-base font-black text-rose-500">
                          {p.priceSale.toLocaleString('vi-VN')}đ
                        </span>
                        {p.priceOriginal > p.priceSale && (
                          <span className="text-xs text-slate-400 line-through">
                            {p.priceOriginal.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                        <span className="text-xs text-emerald-400 font-semibold ml-auto">
                          Còn {p.stock} sản phẩm
                        </span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => addToCart(p, 1)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow"
                      >
                        Thêm Giỏ Hàng
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProductId(p.id);
                          setCurrentView('product-detail');
                        }}
                        className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors text-center"
                      >
                        Xem Chi Tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <Filter className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Hãy thử chọn lại tiêu chí lọc theo giá, hãng hoặc bấm đặt lại bộ lọc để xem toàn bộ danh mục linh kiện.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Đặt Lại Tất Cả Bộ Lọc
              </button>
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-800">
              <button
                id="btn-catalog-prev-page"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-white transition-all shadow-sm"
              >
                Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  id={`btn-catalog-page-${page}`}
                  onClick={() => goToPage(page)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    currentPage === page
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-500/50'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                id="btn-catalog-next-page"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-white transition-all shadow-sm"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
