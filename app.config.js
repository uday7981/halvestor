module.exports = ({ config }) => {
  // Get the EAS_BUILD_PROFILE from the environment
  const buildProfile = process.env.EAS_BUILD_PROFILE || 'development';
  
  // Set bundle identifiers based on build profile
  const bundleId = buildProfile === 'production' ? 'com.halvestor.app' : 'com.halvestor.app.dev';
  
  return {
    ...config,
    ios: {
      ...config.ios,
      bundleIdentifier: bundleId,
    },
    android: {
      ...config.android,
      package: bundleId,
    },
  };
};
