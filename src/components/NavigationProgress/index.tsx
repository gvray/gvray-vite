import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { progress } from './progress';

export const NProgress = progress;

const NavigationProgress = () => {
  const location = useLocation();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    NProgress.start();
    timer = setTimeout(() => {
      NProgress.finish();
    }, 80);

    return () => {
      if (timer) clearTimeout(timer);
      NProgress.finish();
    };
  }, [location.pathname]);

  return null;
};

export default NavigationProgress;
