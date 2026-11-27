export const getProductStockStatus = value => {
  const stock = value === null || value === undefined || value === ''
    ? null
    : Number(value);
  if (!Number.isSafeInteger(stock) || stock < 0) return 'Stock not set';
  if (stock === 0) return 'Out of Stock';
  if (stock <= 5) return 'Critical Stock';
  if (stock <= 10) return 'Low Stock';
  return 'In Stock';
};

export const getStockStatusClass = status => ({
  'Out of Stock': 'bg-red-50 text-red-800 border-red-200',
  'Critical Stock': 'bg-orange-50 text-orange-800 border-orange-200',
  'Low Stock': 'bg-amber-50 text-amber-800 border-amber-200',
  'In Stock': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Stock not set': 'bg-slate-100 text-slate-600 border-slate-200'
}[status] || 'bg-slate-100 text-slate-600 border-slate-200');
