const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now();
};

const calculateFees = (amount) => {
  const platformFee = Math.min(Math.max(amount * 0.05, 10), 500);
  const sellerPayout = amount - platformFee;
  return { platformFee, sellerPayout };
};

const formatPhoneNumber = (phone) => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('251')) cleaned = '+' + cleaned;
  else if (cleaned.startsWith('0')) cleaned = '+251' + cleaned.substring(1);
  else if (cleaned.length === 9) cleaned = '+251' + cleaned;
  return cleaned;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('am-ET', { style: 'currency', currency: 'ETB' }).format(amount);
};

module.exports = { generateSlug, calculateFees, formatPhoneNumber, formatCurrency };
