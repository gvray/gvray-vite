import 'styled-components';
import type { GlobalToken } from 'antd/es/theme';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends GlobalToken {}
}
