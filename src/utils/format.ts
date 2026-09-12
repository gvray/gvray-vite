import { formatDuration as formatKitDuration, formatFileSize } from '@gvray/formatkit';

/**
 * 字节数转换为可读格式
 * @param bytes 字节数
 * @returns 如 "1.23 GB"
 */
export function formatBytes(bytes: number): string {
  return formatFileSize(bytes);
}

/**
 * 根据使用率获取颜色
 * @param percent 使用率百分比
 * @returns 颜色值
 */
export function getUsageColor(percent: number): string {
  if (percent < 60) return '#52c41a'; // 绿
  if (percent < 80) return '#faad14'; // 黄
  return '#f5222d'; // 红
}

/**
 * 秒级时长格式化为 "Xh Xm Xs"。
 * @param seconds 秒数
 */
export function formatDuration(seconds: number): string {
  return formatKitDuration(seconds);
}

/**
 * 计算 part / total 的百分比。
 * @param part 部分值
 * @param total 总值
 * @param options fallback 在 total 无效时返回
 */
export function calculatePercentage(
  part: number,
  total: number,
  options: { fallback?: number } = {},
): number {
  if (!total || total <= 0) return options.fallback ?? 0;
  return (part / total) * 100;
}

/**
 * 根据命中率（0-1）获取阈值颜色。
 */
export function getRateColor(rate: number): string {
  if (rate >= 0.9) return '#52c41a';
  if (rate >= 0.7) return '#faad14';
  return '#ff4d4f';
}
