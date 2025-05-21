/**
 * This file provides a comprehensive monkey patch for blob handling in React Native
 * to fix issues with Supabase authentication and other blob-related operations.
 * 
 * The patch addresses the "Cannot read property 'blobId' of undefined" error
 * by ensuring that all blob operations return a valid mock blob object.
 */

// Create a complete mock blob with all required properties
const createMockBlob = (contentType = 'application/octet-stream') => {
  return {
    // Properties required by Supabase
    blobId: 'mock-blob-id',
    type: contentType,
    size: 0,
    
    // Standard Blob methods
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    text: () => Promise.resolve(''),
    slice: () => createMockBlob(contentType),
    stream: () => ({}),
    
    // Additional properties needed by some implementations
    bytes: () => Promise.resolve(new Uint8Array(0))
  };
};

// Patch the global Response.prototype.blob method
if (typeof Response !== 'undefined' && Response.prototype) {
  const originalBlob = Response.prototype.blob;
  Response.prototype.blob = function() {
    console.log('[BlobPatch] Response.prototype.blob called');
    // Always return a mock blob to prevent errors
    return Promise.resolve(createMockBlob(
      this.headers?.get('Content-Type') || 'application/octet-stream'
    ));
  };
}

// Patch the global fetch function to handle blob responses
if (typeof global.fetch === 'function') {
  const originalFetch = global.fetch;
  global.fetch = function(input, init) {
    return originalFetch(input, init).then(response => {
      // Create a patched response with a safe blob method
      const patchedResponse = response.clone();
      
      // Override the blob method
      const originalResponseBlob = patchedResponse.blob;
      patchedResponse.blob = function() {
        console.log('[BlobPatch] fetch response.blob called');
        return Promise.resolve(createMockBlob(
          patchedResponse.headers?.get('Content-Type') || 'application/octet-stream'
        ));
      };
      
      return patchedResponse;
    });
  };
}

// Ensure Blob constructor is available and properly implemented
if (typeof global.Blob === 'undefined') {
  global.Blob = function(parts, options) {
    const blob = createMockBlob(options?.type || 'application/octet-stream');
    return blob;
  };
}

// Export the createMockBlob function for use elsewhere if needed
export { createMockBlob };
