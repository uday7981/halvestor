const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

// Get the default Metro configuration
const defaultConfig = getDefaultConfig(__dirname);

// Create a custom configuration with all necessary Node.js polyfills
const config = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    // Add Node.js polyfills needed for Supabase and WebSocket
    extraNodeModules: {
      events: require.resolve('events'),
      stream: require.resolve('stream-browserify'),
      'readable-stream': require.resolve('readable-stream'),
      buffer: require.resolve('buffer'),
      process: require.resolve('process'),
      http: require.resolve('@tradle/react-native-http'),
      https: require.resolve('https-browserify'),
      net: require.resolve('react-native-tcp'),
      fs: require.resolve('react-native-level-fs'),
      path: require.resolve('path-browserify'),
      zlib: require.resolve('browserify-zlib'),
      crypto: require.resolve('react-native-crypto'),
      url: require.resolve('url'),
      util: require.resolve('util'),
      assert: require.resolve('assert'),
      tls: require.resolve('tls-browserify'),
    },
  },
};

module.exports = withNativeWind(config, { input: './app/globals.css' })