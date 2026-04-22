import React from 'react';
const RatingStars = ({ rating = 0, size = 16, showNumber = false }) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.floor(rating);
    const half = !filled && i < rating;
    return (
      <span key={i} style={{ fontSize: size }} className={filled ? 'text-yellow-400' : half ? 'text-yellow-300' : 'text-gray-300'}>
        ★
      </span>
    );
  });
  return (
    <span className="inline-flex items-center gap-0.5">
      {stars}
      {showNumber && <span className="text-sm text-gray-500 ml-1">({rating.toFixed(1)})</span>}
    </span>
  );
};
export default RatingStars;
