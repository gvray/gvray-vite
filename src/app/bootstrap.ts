import { buildPreferences } from '@/constants/runtime-settings';
import { queryMe, queryMenus } from '@/services/auth';
import { getDictionaryItemsByTypeCodes } from '@/services/dictionary';
import { getRuntimeConfig } from '@/services/system';
import { useAuthStore, useDictStore, useSettingStore } from '@/stores';
import { logger, tokenManager } from '@/utils';
import { runtimeConfig } from '@/utils/runtime-config';
import { wrapToBizError } from '@/utils/errors';

/**
 * 装载登录态数据：身份信息、菜单、用户偏好、常用字典。
 * bootstrap（已登录）与登录成功后共用，避免逻辑重复。
 *
 * @returns 是否成功装载 profile。bootstrap 忽略此值（保留原凭证以体现韧性）；
 *   登录流程据此决定是否提示失败，避免"登录成功"却因 profile 缺失被守卫弹回。
 */
export async function loadAuthData(): Promise<boolean> {
  let me: API.CurrentUserResponseDto | undefined;
  let menus: API.MenuResponseDto[] | undefined;

  try {
    const [meRes, menusRes] = await Promise.all([
      queryMe({ skipErrorHandler: true }),
      queryMenus({ skipErrorHandler: true }),
    ]);
    me = meRes.data;
    menus = menusRes.data;
  } catch (error) {
    const bizError = wrapToBizError(error);
    // 只有真正的未授权/凭证过期才清凭证；
    // 网络抖动或服务端异常保留原凭证，避免误踢用户
    if (bizError.details?.status === 401) {
      tokenManager.clearTokens();
    } else {
      logger.error('获取初始化用户信息失败', error);
    }
  }

  // preferences：运行时默认值 → persist 恢复值 → 服务端用户偏好（优先级最高）
  useSettingStore.setState((state) => ({
    ...buildPreferences(runtimeConfig.get().ui),
    ...state,
    ...(me?.preferences || {}),
  }));

  if (me) {
    useAuthStore.getState().setAuth(me, menus);
  }

  // 字典预加载失败不阻塞登录态判定，profile 在即视为成功

  // 预加载常用字典到全局缓存
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

  return !!me;
}

/**
 * 应用启动入口：persist 恢复 → 运行时配置 → （已登录时）装载认证数据。
 * runtimeConfig 全应用只在此拉取一次，登录后复用 loadAuthData 装载认证态。
 */
export async function bootstrap() {
  // 等待 zustand persist 从 localStorage 恢复完成，避免 bootstrap 覆盖用户本地设置
  if (!useSettingStore.persist?.hasHydrated?.()) {
    await useSettingStore.persist?.rehydrate?.();
  }

  // 获取运行时配置（无需登录）
  try {
    const res = await getRuntimeConfig();
    runtimeConfig.set(res.data);
  } catch (error) {
    logger.error(error);
  }

  // 已登录时装载身份信息、偏好与字典
  if (tokenManager.isAuthenticated()) {
    await loadAuthData();
  }

  logger.info('App 初始化完成');
}
