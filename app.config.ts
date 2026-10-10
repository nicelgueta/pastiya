import type { ConfigContext, ExpoConfig } from 'expo/config';

// Account-specific values live in .env.local (gitignored). See .env.example.
const { EAS_PROJECT_ID, EXPO_OWNER, IOS_BUNDLE_IDENTIFIER } = process.env;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  owner: EXPO_OWNER,
  ios: {
    ...config.ios,
    bundleIdentifier: IOS_BUNDLE_IDENTIFIER,
  },
  extra: {
    ...config.extra,
    ...(EAS_PROJECT_ID && { eas: { projectId: EAS_PROJECT_ID } }),
  },
  ...(EAS_PROJECT_ID && { updates: { url: `https://u.expo.dev/${EAS_PROJECT_ID}` } }),
});
