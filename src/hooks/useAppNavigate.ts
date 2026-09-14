import { useCallback } from 'react';
import { useNavigate, type NavigateOptions, type To } from 'react-router';

/**
 * 全局导航 hook：默认为每次路由切换开启 View Transitions。
 *
 * react-router 8 的 viewTransition 是 per-navigation opt-in（无路由级开关），
 * 在此统一注入 `{ viewTransition: true }`，让 Layout 的快照边界接管页面过渡。
 * 页内 hash/锚点等不需要过渡的导航，传 `{ viewTransition: false }` 退出。
 */
export function useAppNavigate() {
  const navigate = useNavigate();
  return useCallback(
    (to: To | number, opts?: NavigateOptions) => {
      if (typeof to === 'number') return navigate(to);
      return navigate(to, { viewTransition: true, ...opts });
    },
    [navigate],
  );
}
