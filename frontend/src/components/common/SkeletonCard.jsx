import React from 'react';
const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="skeleton h-48 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <div className="skeleton h-4 w-1/3" />
      <div className="skeleton h-5 w-4/5" />
      <div className="skeleton h-6 w-1/2" />
      <div className="skeleton h-4 w-full" />
    </div>
  </div>
);
export default SkeletonCard;
