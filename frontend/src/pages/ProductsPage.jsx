import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { productService } from '../services/productService';
import ProductGrid from '../components/product/ProductGrid';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

const CATEGORIES = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Home Appliances', 'Vehicles', 'Sports & Outdoors', 'Baby & Kids'];
const CONDITIONS = ['new', 'like_new', 'good', 'fair', 'for_parts'];
const CITIES = ['Addis Ababa', 'Dire Dawa', 'Hawassa', 'Bahir Dar', 'Mekelle'];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') || 'desc',
    page: Number(searchParams.get('page') || 1),
  });

  const queryKey = ['products', filters];
  const { data, isLoading } = useQuery(queryKey, () => productService.getProducts({ ...filters, limit: 20 }), { keepPreviousData: true });

  const updateFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ q: '', category: '', condition: '', city: '', minPrice: '', maxPrice: '', sort: 'createdAt', order: 'desc', page: 1 });
    setSearchParams({});
  };

  const activeFilterCount = [filters.category, filters.condition, filters.city, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  return (
    <>
      <Helmet><title>Browse Products | ተና SecondLoop</title></Helmet>
      <div className="container-custom py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-xl shadow-md p-5 sticky top-24">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-lg">Filters</h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-primary-orange hover:underline flex items-center gap-1">
                    <FiX size={12} /> Clear all
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} className="input-field text-sm py-2">
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Condition */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Condition</label>
                <div className="space-y-1.5">
                  {CONDITIONS.map(c => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="condition" value={c} checked={filters.condition === c}
                        onChange={() => updateFilter('condition', c)}
                        className="accent-primary-orange" />
                      <span className="text-sm text-gray-600 group-hover:text-primary-orange capitalize">{c.replace('_', ' ')}</span>
                    </label>
                  ))}
                  {filters.condition && (
                    <button onClick={() => updateFilter('condition', '')} className="text-xs text-gray-400 hover:text-primary-orange">
                      Clear condition
                    </button>
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range (ETB)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="input-field text-sm py-2 w-1/2" />
                  <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="input-field text-sm py-2 w-1/2" />
                </div>
              </div>

              {/* City */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <select value={filters.city} onChange={(e) => updateFilter('city', e.target.value)} className="input-field text-sm py-2">
                  <option value="">All Cities</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </aside>

          {/* Products Area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-primary-orange hover:text-primary-orange">
                  <FiFilter size={16} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
                <p className="text-sm text-gray-500">
                  {isLoading ? 'Loading…' : `${data?.pagination?.totalItems || 0} items found`}
                  {filters.q && <span className="font-medium text-gray-700"> for "{filters.q}"</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort:</span>
                <select value={`${filters.sort}:${filters.order}`}
                  onChange={(e) => { const [sort, order] = e.target.value.split(':'); setFilters(f => ({ ...f, sort, order })); }}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-orange">
                  <option value="createdAt:desc">Newest First</option>
                  <option value="price:asc">Price: Low to High</option>
                  <option value="price:desc">Price: High to Low</option>
                  <option value="viewCount:desc">Most Viewed</option>
                </select>
              </div>
            </div>

            <ProductGrid products={data?.products} loading={isLoading} />

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setFilters(f => ({ ...f, page }))}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition ${filters.page === page ? 'bg-primary-orange text-white' : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'}`}>
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default ProductsPage;
