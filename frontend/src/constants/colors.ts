export const USER_COLORS = [
  { name: '파란색', value: '#5B9FFF' },
  { name: '분홍색', value: '#E91E63' },
  { name: '주황색', value: '#FF9800' },
  { name: '초록색', value: '#4CAF50' },
  { name: '보라색', value: '#9C27B0' },
  { name: '노란색', value: '#FFC107' },
  { name: '빨간색', value: '#F44336' },
  { name: '청록색', value: '#00BCD4' },
];

export const SCHEDULE_CATEGORIES = [
  { label: '📅 약속', value: 'APPOINTMENT' },
  { label: '🎂 기념일', value: 'ANNIVERSARY' },
  { label: '💼 업무', value: 'WORK' },
  { label: '🏥 병원', value: 'HOSPITAL' },
  { label: '✈️ 여행', value: 'TRAVEL' },
  { label: '📦 기타', value: 'ETC' },
];

export const REPEAT_OPTIONS = [
  { label: '반복 없음', value: 'NONE' },
  { label: '매일', value: 'DAILY' },
  { label: '매주', value: 'WEEKLY' },
  { label: '매월', value: 'MONTHLY' },
  { label: '매년', value: 'YEARLY' },
];

export const CATEGORY_EMOJI: Record<string, string> = {
  APPOINTMENT: '📅',
  ANNIVERSARY: '🎂',
  WORK: '💼',
  HOSPITAL: '🏥',
  TRAVEL: '✈️',
  ETC: '📦',
  '식비': '🍚',
  '카페/간식': '☕',
  '교통': '🚌',
  '주거/통신': '🏠',
  '쇼핑': '👕',
  '선물': '🎁',
  '의료/건강': '💊',
  '교육': '📚',
  '문화/여가': '🎬',
  '반려동물': '🐶',
  '미용': '✂️',
  '급여': '💰',
  '부수입': '💵',
  '용돈/선물': '🎊',
  '투자수익': '📈',
  '환급': '💸',
  '기타': '📦',
};

export const CHART_COLORS = ['#5B9FFF', '#FF9800', '#4CAF50', '#E91E63', '#9C27B0', '#FFC107', '#00BCD4', '#F44336'];

export const ASSET_SOURCE_TYPES = [
  { label: '현금', value: 'CASH', emoji: '💵' },
  { label: '카드', value: 'CARD', emoji: '💳' },
  { label: '통장', value: 'ACCOUNT', emoji: '🏦' },
];
