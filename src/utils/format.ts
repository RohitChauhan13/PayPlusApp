export const money = (value?: number | string | null) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number.isFinite(amount) ? amount : 0);
};

export const numberText = (value?: number | string | null) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed.toFixed(2).replace(/\.00$/, '') : '0';
};

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const prettyDate = (iso?: string) => {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  }).format(new Date(`${iso}T00:00:00`));
};
