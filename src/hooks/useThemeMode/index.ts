import { useSettingStore } from '@/stores';
import { resolveThemeMode } from '@/utils';
import { useMemo } from 'react';

const useThemeMode = () => {
  const { theme } = useSettingStore();
  const mode = useMemo(() => resolveThemeMode(theme), [theme]);
  return mode;
};

export default useThemeMode;
