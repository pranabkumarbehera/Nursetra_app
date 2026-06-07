import Colorpath from './Colorpath';
import Fonts from './Fonts';
import Imagepath from './Imagepath';

const colors = {
  primary: Colorpath.Primary,
  secondary: Colorpath.Secondary,
  accent: Colorpath.Tertiary,
  background: Colorpath.Background,
  text: Colorpath.Black,
  textLight: Colorpath.TextSecondary,
  white: Colorpath.White,
  border: Colorpath.Border,
  error: Colorpath.Danger,
  success: Colorpath.Success,
  warning: Colorpath.Warning,
  card: Colorpath.White,
  info: '#6A5AE0',
} as const;

const borderRadius = {
  small: 8,
  medium: 16,
  input: 16,
  button: 16,
  card: 20,
  large: 20,
  container: 24,
  xlarge: 24,
  round: 9999,
} as const;

const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
} as const;

const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  }
} as const;

const typography = {
  h1: { fontSize: 28, fontWeight: 'bold' as const, color: Colorpath.Black },
  h2: { fontSize: 24, fontWeight: 'bold' as const, color: Colorpath.Black },
  h3: { fontSize: 20, fontWeight: '600' as const, color: Colorpath.Black },
  body: { fontSize: 16, color: Colorpath.Black },
  caption: { fontSize: 14, color: '#6B7A99' },
  small: { fontSize: 12, color: '#6B7A99' },
} as const;

const theme = {
  colors,
  borderRadius,
  spacing,
  typography,
  shadows,
} as const;

export { Colorpath, Fonts, Fonts as Font, Imagepath, colors, borderRadius, spacing, typography, theme };
