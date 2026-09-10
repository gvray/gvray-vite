import { AppProviders } from '@/providers';
import { router } from '@/router';
import { RouterProvider } from 'react-router';

/**
 * 应用组装根：Provider 栈 + 路由。
 * main.tsx 仅负责 createRoot，具体组装在此。
 */
const App: React.FC = () => (
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
);

export default App;
