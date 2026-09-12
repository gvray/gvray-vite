export type DateInput = string | number | Date | null | undefined;

export interface FormatDateTimeOptions {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short' | 'none';
  fallback?: string;
}

const DEFAULT_DATETIME_OPTIONS: Required<
  Pick<FormatDateTimeOptions, 'dateStyle' | 'timeStyle' | 'fallback'>
> = {
  dateStyle: 'short',
  timeStyle: 'medium',
  fallback: '-',
};

/**
 * 使用浏览器本地时间格式化日期时间。
 * 输入为空或非法时返回 fallback。
 */
export const formatDateTime = (
  value: DateInput,
  options?: FormatDateTimeOptions,
): string => {
  const { dateStyle, timeStyle, fallback } = {
    ...DEFAULT_DATETIME_OPTIONS,
    ...options,
  };

  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return fallback;
    }

    if (timeStyle === 'none') {
      return d.toLocaleDateString(undefined, { dateStyle });
    }

    return d.toLocaleString(undefined, { dateStyle, timeStyle });
  } catch {
    return fallback;
  }
};

export interface FormatRelativeTimeOptions {
  justNow?: string;
  minuteAgo?: string;
  hourAgo?: string;
  dayAgo?: string;
  thresholdDays?: number;
}

const DEFAULT_RELATIVE_OPTIONS: Required<FormatRelativeTimeOptions> = {
  justNow: '刚刚',
  minuteAgo: '分钟前',
  hourAgo: '小时前',
  dayAgo: '天前',
  thresholdDays: 7,
};

/**
 * 相对时间格式化：刚刚 / N 分钟前 / N 小时前 / N 天前 / 日期。
 * 输入非法时返回原始字符串。
 */
export const formatRelativeTime = (
  value: DateInput,
  options?: FormatRelativeTimeOptions,
): string => {
  if (value === null || value === undefined || value === '') return '';

  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);

    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    const opts = { ...DEFAULT_RELATIVE_OPTIONS, ...options };

    if (minutes < 1) return opts.justNow;
    if (minutes < 60) return `${minutes} ${opts.minuteAgo}`;
    if (hours < 24) return `${hours} ${opts.hourAgo}`;
    if (days < opts.thresholdDays) return `${days} ${opts.dayAgo}`;
    return d.toLocaleDateString();
  } catch {
    return String(value);
  }
};
