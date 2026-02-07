export const formatCurrency = (amount: number): string => {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('ko-KR');
  if (amount < 0) return `-${formatted}원`;
  if (amount > 0) return `+${formatted}원`;
  return `${formatted}원`;
};

export const formatAmount = (amount: number): string =>
  Math.abs(amount).toLocaleString('ko-KR') + '원';

export const formatCompactAmount = (amount: number): string => {
  const abs = Math.abs(amount);
  if (abs >= 1000000) return `${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${(abs / 1000).toFixed(0)}K`;
  return String(abs);
};
