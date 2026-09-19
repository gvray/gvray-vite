/**
 * 把 public/ 下静态资源的逻辑路径解析为带 base 前缀的实际 URL。
 *
 * public/ 下的文件不经 Vite 处理，引用路径不会被 base 自动改写，
 * 子路径部署（如 GitHub Pages）或 CDN 下需手动拼接前缀。
 * 完整 URL（http(s)://、协议相对 //、data:）原样返回。
 */
export function publicAsset(path: string): string {
  if (!path) return path;
  if (/^(?:https?:)?\/\//i.test(path) || path.startsWith('data:')) {
    return path;
  }
  const base = __APP_CDN_URL__ || import.meta.env.BASE_URL || '/';
  const trimmed = path.replace(/^\/+/, '');
  return `${base.endsWith('/') ? base : `${base}/`}${trimmed}`;
}
