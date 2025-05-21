// Polyfill for Blob API in React Native
if (typeof global.Blob === 'undefined') {
  const Blob = require('react-native').Blob;
  global.Blob = Blob || class Blob {
    constructor(parts, options) {
      this.parts = parts;
      this.options = options;
      this.size = parts.reduce((acc, part) => {
        if (typeof part === 'string') {
          return acc + part.length;
        }
        return acc + part.byteLength || part.size || 0;
      }, 0);
      this.type = options && options.type ? options.type : '';
    }
  };
}

// Ensure fetch API properly handles blob responses
if (typeof global.fetch !== 'undefined') {
  const originalFetch = global.fetch;
  global.fetch = function(url, options) {
    return originalFetch(url, options).then(response => {
      const originalBlob = response.blob;
      response.blob = function() {
        return originalBlob.call(this)
          .then(blob => {
            // Return a simple object if the native Blob is not fully supported
            if (!blob.blobId) {
              return {
                blobId: 'polyfill',
                type: blob.type || 'application/octet-stream',
                size: blob.size || 0,
                data: blob.data || null,
                slice: () => ({})
              };
            }
            return blob;
          });
      };
      return response;
    });
  };
}
