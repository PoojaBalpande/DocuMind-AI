// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DocuMind AI — Theme Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const colors = {
  primary: '#001736',
  primaryContainer: '#0c2c55',
  secondary: '#2c6577',
  secondaryContainer: '#b3ebff',
  surface: '#fbfbdc',
  surfaceDim: '#dcdcbe',
  surfaceContainer: '#f0f0d1',
  surfaceContainerLow: '#f6f6d6',
  surfaceContainerHigh: '#eaeacb',
  surfaceContainerLowest: '#ffffff',
  onSurface: '#1b1d0a',
  onSurfaceVariant: '#43474f',
  onPrimary: '#ffffff',
  onSecondary: '#ffffff',
  outline: '#74777f',
  outlineVariant: '#c4c6d0',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  // Dark mode
  darkBg: '#0a0f1a',
  darkSurface: '#102030',
  darkCard: '#102e55',
} as const;

export const typography = {
  display: { fontSize: '48px', lineHeight: '56px', fontWeight: '700', letterSpacing: '-0.02em' },
  headlineLg: { fontSize: '32px', lineHeight: '40px', fontWeight: '600', letterSpacing: '-0.01em' },
  headlineMd: { fontSize: '24px', lineHeight: '32px', fontWeight: '600' },
  headlineSm: { fontSize: '20px', lineHeight: '28px', fontWeight: '600' },
  bodyLg: { fontSize: '18px', lineHeight: '28px', fontWeight: '400' },
  bodyMd: { fontSize: '16px', lineHeight: '24px', fontWeight: '400' },
  bodySm: { fontSize: '14px', lineHeight: '20px', fontWeight: '400' },
  labelLg: { fontSize: '14px', lineHeight: '20px', fontWeight: '600', letterSpacing: '0.05em' },
  labelMd: { fontSize: '12px', lineHeight: '16px', fontWeight: '500' },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  unit: '4px',
  gutter: '24px',
  marginMobile: '16px',
  marginDesktop: '40px',
} as const;

export const elevation = {
  level0: 'transparent',
  level1: '0 12px 40px rgba(12, 44, 85, 0.08)',
  level2: '0 4px 16px rgba(12, 44, 85, 0.12)',
  level3: '0 8px 32px rgba(12, 44, 85, 0.16)',
} as const;

export const sidebarNavItems = [
  { label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
  { label: 'Knowledge Base', icon: 'folder_shared', href: '/documents' },
  { label: 'Chat AI', icon: 'forum', href: '/chat' },
  { label: 'Analytics', icon: 'query_stats', href: '/admin' },
  { label: 'Members', icon: 'group', href: '/admin' },
  { label: 'Settings', icon: 'settings', href: '/settings' },
] as const;
