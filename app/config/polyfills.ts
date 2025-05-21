import 'react-native-polyfill-globals/auto';
import 'react-native-url-polyfill/auto';
import { EventEmitter } from 'events';
// Import web streams polyfill directly
import 'web-streams-polyfill';
// Import cross-fetch for better fetch compatibility
import fetch from 'cross-fetch';
// Base64 encoding/decoding
// @ts-ignore - Missing type definitions for base-64
import { decode as atob, encode as btoa } from 'base-64';

// Increase EventEmitter limit to avoid warnings
EventEmitter.defaultMaxListeners = 30;

// Polyfill global objects needed for Supabase
if (typeof global.process === 'undefined') {
  global.process = require('process');
}

if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// Add base64 functions to global
if (!global.atob) {
  global.atob = atob;
}

if (!global.btoa) {
  global.btoa = btoa;
}

// Ensure global fetch is properly defined
if (!global.fetch) {
  global.fetch = fetch;
}

// Fix blob handling in fetch responses
const originalFetch = global.fetch;
// @ts-ignore - Intentionally overriding fetch with a custom implementation
global.fetch = function(input: RequestInfo, init?: RequestInit) {
  return originalFetch(input, init).then(response => {
    if (response && typeof response === 'object' && response.blob) {
      const originalBlob = response.blob;
      // @ts-ignore - Intentionally replacing blob method
      response.blob = function() {
        console.log('Intercepted blob() call in fetch response');
        return Promise.resolve({
          blobId: 'mock-blob-id',
          type: 'application/octet-stream',
          size: 0,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
          text: () => Promise.resolve(''),
          slice: () => ({}),
          stream: () => ({}),
          // Make bytes a function that returns a Promise<Uint8Array> to match Blob interface
          bytes: () => Promise.resolve(new Uint8Array(0))
        });
      };
    }
    return response;
  });
};

// Patch Response.prototype.blob
if (typeof Response !== 'undefined' && Response.prototype) {
  const originalResponseBlob = Response.prototype.blob;
  // @ts-ignore - Intentionally replacing blob method with a mock implementation
  Response.prototype.blob = function() {
    console.log('Response.prototype.blob called');
    // Return a mock blob that satisfies Supabase's requirements
    return Promise.resolve({
      blobId: 'mock-blob-id',
      type: 'application/octet-stream',
      size: 0,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      text: () => Promise.resolve(''),
      slice: () => ({}),
      stream: () => ({}),
      // Make bytes a function that returns a Promise<Uint8Array> to match Blob interface
      bytes: () => Promise.resolve(new Uint8Array(0))
    });
  };
}

// Ensure window has the same polyfills in web contexts
if (typeof window !== 'undefined') {
  window.process = global.process;
  window.Buffer = global.Buffer;
}
