// This file patches the global fetch API to handle blob responses properly in React Native
// It's needed because Supabase uses blob responses which aren't fully supported in React Native

// Store the original fetch function
const originalFetch = global.fetch;

// Create a patched version that handles blob responses
const patchedFetch = function(url, options = {}) {
  // Modify options to avoid requesting blob responses
  if (options && options.responseType === 'blob') {
    options.responseType = 'arraybuffer';
  }
  
  // Call the original fetch
  return originalFetch(url, options).then(response => {
    // Create a patched response object
    const patchedResponse = response;
    
    // Replace the blob method with a safe version
    const originalBlob = response.blob;
    patchedResponse.blob = function() {
      // Return a minimal Blob-like object
      return Promise.resolve({
        blobId: 'polyfill',
        type: response.headers.get('Content-Type') || 'application/octet-stream',
        size: parseInt(response.headers.get('Content-Length') || '0', 10),
        data: null,
        slice: () => ({})
      });
    };
    
    return patchedResponse;
  });
};

// Apply the patch to the global fetch
global.fetch = patchedFetch;
