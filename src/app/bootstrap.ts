import { buildPreferences } from '@/constants/runtime-settings';
import { queryMe, queryMenus } from '@/services/auth';
import { getDictionaryItemsByTypeCodes } from '@/services/dictionary';
import { getRuntimeConfig } from '@/services/system';
import { useAuthStore, useDictStore, useSettingStore } from '@/stores';
import { logger, tokenManager } from '@/utils';
import { runtimeConfig } from '@/utils/runtime-config';
import { wrapToBizError } from '@/utils/errors';

/**
 * 应用启动时的数据获取入口，获取完后分发到各 Store。
 * UI 层不直接消费 initialState，统一通过 Store 读取。
 */
export async function bootstrap() {
  // 等待 zustand persist 从 localStorage 恢复完成，避免 bootstrap 覆盖用户本地设置
  if (!useSettingStore.persist?.hasHydrated?.()) {
    await useSettingStore.persist?.rehydrate?.();
  }

  let runtimeConfigData: Record<string, unknown> | undefined;
  let me: API.CurrentUserResponseDto | undefined;
  let menus: API.MenuResponseDto[] | undefined;

  // 获取运行时配置（无需登录）
  try {
    const res = await getRuntimeConfig();
    runtimeConfigData = res.data;
    runtimeConfig.set(runtimeConfigData);
  } catch (error) {
    logger.error(error);
  }

  // 已登录时并行获取身份信息和菜单
  if (tokenManager.isAuthenticated()) {
    try {
      const [meRes, menusRes] = await Promise.all([
        queryMe({ skipErrorHandler: true }),
        queryMenus({ skipErrorHandler: true }),
      ]);
      me = meRes.data;
      menus = menusRes.data;
    } catch (error) {
      const bizError = wrapToBizError(error);
      // 只有真正的未授权/凭证过期才清凭证并跳转登录；
      // 网络抖动或服务端异常保留原凭证，避免误踢用户
      if (bizError.details?.status === 401) {
        tokenManager.clearTokens();
      } else {
        logger.error('获取初始化用户信息失败', error);
      }
    }
  }

  // 初始化 preferences：运行时默认值 → persist 恢复值 → 服务端用户偏好（优先级最高）
  useSettingStore.setState((state) => ({
    ...buildPreferences(runtimeConfig.get().ui),
    ...state,
    ...(me?.preferences || {}),
  }));

  // 认证数据 → AuthStore
  if (me) {
    useAuthStore.getState().setAuth(me, menus);
  }

  // 已登录时预加载常用字典到全局缓存
  if (tokenManager.isAuthenticated()) {
    try {
      if (!useDictStore.getState().getDict('common_status')) {
        const dictRes = await getDictionaryItemsByTypeCodes(
          {
            typeCodes: 'common_status',
          },
          { skipErrorHandler: true },
        );
        if (dictRes.data?.common_status) {
          useDictStore
            .getState()
            .setDict('common_status', dictRes.data.common_status);
        }
      }
    } catch (error) {
      logger.error('预加载 common_status 字典失败', error);
    }
  }

  logger.info('App 初始化完成');
}
