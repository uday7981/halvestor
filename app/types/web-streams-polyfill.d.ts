declare module 'web-streams-polyfill/ponyfill/es6' {
  export class ReadableStream {
    constructor(underlyingSource?: any, strategy?: any);
    getReader(): any;
    // Add other methods as needed
  }

  export class WritableStream {
    constructor(underlyingSink?: any, strategy?: any);
    getWriter(): any;
    // Add other methods as needed
  }

  export class TransformStream {
    constructor(transformer?: any, writableStrategy?: any, readableStrategy?: any);
    readonly readable: ReadableStream;
    readonly writable: WritableStream;
    // Add other methods as needed
  }
}

// Add a default export to satisfy Expo Router's requirement
// This is just a dummy component that will never be rendered
import React from 'react';
export default function WebStreamsPolyfill() {
  return null;
}
