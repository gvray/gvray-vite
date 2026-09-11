import { lazy, type ComponentType } from 'react';
import { progress } from './progress';

export const NProgress = progress;

/**
 * 包裹 React.lazy，把 chunk 加载状态接入顶部进度条。
 *
 * - 首次渲染某 chunk 时 inc() 开始进度；解析后 dec()，计数归零再延迟 finish()。
 * - 多层 lazy（Layout + 页面）嵌套时，finish 经去抖延后，直到最深层 chunk 就绪才真正结束，
 *   避免「外壳一加载完进度条就结束、内层页面还在转」的问题。
 * - chunk 已缓存（路由重访）时工厂不再被调用，不产生进度条——瞬时切换无干扰。
 *
 * 不依赖 React Router 的导航状态，纯 React.lazy + Suspense 机制即可工作。
 */
export function lazyProgress<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  let started = false;

  const wrapped = () => {
    const promise = factory();
    if (!started) {
      started = true;
      queueMicrotask(() => NProgress.inc());
      void promise.finally(() => NProgress.dec());
    }
    return promise;
  };

  return lazy(wrapped);
}
