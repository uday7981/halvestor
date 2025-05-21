// global.js - Polyfills for React Native environment

// Required for Supabase and WebSocket support
global.process = require('process');
global.process.env = require('process').env;
global.Buffer = require('buffer').Buffer;

// Handle WebSocket polyfill
if (typeof window !== 'undefined') {
  window.process = global.process;
  window.Buffer = global.Buffer;
}

// Increase EventEmitter limit to avoid warnings
require('events').EventEmitter.defaultMaxListeners = 30;

// Ensure SVG files are properly handled
// This is needed because we're using react-native-svg-transformer
// which transforms SVG files into React components
if (!global.__METRO_GLOBAL_PREFIX__) {
  global.__METRO_GLOBAL_PREFIX__ = '';
}

// Import the actual entry point
module.exports = require('./node_modules/expo/AppEntry');
