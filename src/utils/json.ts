/**
 * 安全地解析 JSON 字符串。
 * @param value - 待解析的值
 * @param fallback - 解析失败时的返回值
 */
export const safeJsonParse = <T = unknown>(
  value: unknown,
  fallback?: T,
): T | undefined => {
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};
