export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 0 }).format(amount);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-ET', { year: 'numeric', month: 'short', day: 'numeric' });

export const formatRelative = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};

export const getConditionLabel = (condition) =>
  ({ new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', for_parts: 'For Parts' })[condition] || condition;

export const getConditionColor = (condition) =>
  ({ new: 'badge-success', like_new: 'badge-success', good: 'badge-info', fair: 'badge-warning', for_parts: 'badge-error' })[condition] || 'badge-info';

export const getStatusColor = (status) =>
  ({ pending_payment: 'badge-warning', payment_verified: 'badge-info', processing: 'badge-info', shipped: 'badge-info',
     delivered: 'badge-success', completed: 'badge-success', cancelled: 'badge-error', disputed: 'badge-error',
     refunded: 'badge-warning' })[status] || 'badge-info';

export const getStatusLabel = (status) =>
  status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
