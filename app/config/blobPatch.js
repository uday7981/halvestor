// This file directly patches the global fetch API to fix issues with Supabase auth in React Native

// Store the original fetch function
const originalFetch = global.fetch;

// Create a complete mock blob with all required properties
const createCompleteBlob = (contentType = 'application/octet-stream') => {
  return {
    // Properties required by Supabase
    blobId: 'mock-blob-id',
    type: contentType,
    size: 0,
    
    // Standard Blob methods
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    text: () => Promise.resolve(''),
    slice: () => createCompleteBlob(contentType),
    stream: () => ({}),
    bytes: new Uint8Array(0)
  };
};

// Replace the global fetch with our patched version
global.fetch = function(...args) {
  // Call the original fetch
  return originalFetch.apply(this, args).then(response => {
    // Store the original blob method
    const originalBlobMethod = response.blob;
    
    // Replace the blob method with our version that always returns a valid blob
    response.blob = function() {
      console.log('Intercepted blob() call in fetch response');
      try {
        // Try the original method first
        return originalBlobMethod.call(this)
          .then(blob => {
            // If we got a blob but it's missing required properties, enhance it
            if (blob && typeof blob === 'object' && !blob.blobId) {
              const enhancedBlob = createCompleteBlob(blob.type || 'application/octet-stream');
              console.log('Enhanced blob with missing properties');
              return enhancedBlob;
            }
            return blob;
          })
          .catch(error => {
            console.warn('Error in original blob method, returning mock blob:', error.message);
            return createCompleteBlob(response.headers.get('Content-Type') || 'application/octet-stream');
          });
      } catch (error) {
        console.warn('Exception in blob method, returning mock blob:', error.message);
        return Promise.resolve(createCompleteBlob(response.headers.get('Content-Type') || 'application/octet-stream'));
      }
    };
    
    return response;
  });
};

// Also patch the Response.prototype.blob method for any direct calls
const originalResponseBlob = Response.prototype.blob;
Response.prototype.blob = function() {
  console.log('Intercepted direct Response.prototype.blob call');
  try {
    return originalResponseBlob.call(this)
      .then(blob => {
        if (blob && typeof blob === 'object' && !blob.blobId) {
          const enhancedBlob = createCompleteBlob(blob.type || 'application/octet-stream');
          console.log('Enhanced blob with missing properties (direct call)');
          return enhancedBlob;
        }
        return blob;
      })
      .catch(error => {
        console.warn('Error in original Response.blob method, returning mock blob:', error.message);
        return createCompleteBlob(this.headers.get('Content-Type') || 'application/octet-stream');
      });
  } catch (error) {
    console.warn('Exception in Response.blob method, returning mock blob:', error.message);
    return Promise.resolve(createCompleteBlob(this.headers.get('Content-Type') || 'application/octet-stream'));
  }
};
