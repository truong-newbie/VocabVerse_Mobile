import { colors } from './colors';
import { spacing, radius, shadow } from './spacing';
import { typography } from './typography';

export { colors } from './colors';
export { spacing, radius, shadow } from './spacing';
export { typography } from './typography';

export const theme = {
  colors,
  spacing,
  radius,
  shadow,
  typography,
} as const;