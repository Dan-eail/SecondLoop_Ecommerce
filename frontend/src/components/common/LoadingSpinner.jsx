import React from 'react';
const sizes = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' };
const LoadingSpinner = ({ size = 'md', className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className={`loading-spinner ${sizes[size]}`} />
  </div>
);
export default LoadingSpinner;
