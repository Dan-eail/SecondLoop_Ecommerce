import React from 'react';
import ProductCard from './ProductCard';
import SkeletonCard from '../common/SkeletonCard';

const ProductGrid = ({ products, loading, columns = 4 }) => {
  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  if (loading) return (
    <div className={`grid ${gridClass} gap-6`}>
      {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
  if (!products?.length) return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">📦</div>
      <h3 className="text-xl font-semibold text-gray-600">No products found</h3>
      <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
    </div>
  );
  return (
    <div className={`grid ${gridClass} gap-6`}>
      {products.map(p => <ProductCard key={p._id} product={p} />)}
    </div>
  );
};
export default ProductGrid;
