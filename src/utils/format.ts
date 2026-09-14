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
 * 根据命中率（0-1）获取阈值颜色。
 */
export function getRateColor(rate: number): string {
  if (rate >= 0.9) return '#52c41a';
  if (rate >= 0.7) return '#faad14';
  return '#ff4d4f';
}
