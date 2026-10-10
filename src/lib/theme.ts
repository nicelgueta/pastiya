import { useColorScheme } from 'react-native';

const light = {
  background: '#F6F7F9',
  card: '#FFFFFF',
  text: '#111418',
  muted: '#6B7280',
  border: '#E1E4E8',
  primary: '#2563EB',
  onPrimary: '#FFFFFF',
  danger: '#DC2626',
  success: '#16A34A',
  neutral: '#9CA3AF',
  disabled: '#D1D5DB',
  onDisabled: '#8B93A0',
  overlay: 'rgba(0,0,0,0.45)',
};

const dark: typeof light = {
  background: '#0B0D10',
  card: '#171A1F',
  text: '#F3F4F6',
  muted: '#9CA3AF',
  border: '#2A2F36',
  primary: '#5B8DEF',
  onPrimary: '#0B0D10',
  danger: '#F87171',
  success: '#4ADE80',
  neutral: '#6B7280',
  disabled: '#2A2F36',
  onDisabled: '#6B7280',
  overlay: 'rgba(0,0,0,0.65)',
};

export type Colors = typeof light;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}
