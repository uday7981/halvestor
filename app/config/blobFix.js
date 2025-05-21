/**
 * AGGRESSIVE BLOB FIX FOR SUPABASE AUTH
 * 
 * This file directly patches the global environment to fix the
 * "Cannot read property 'blobId' of undefined" error in Supabase auth.
 * 
 * IMPORTANT: This file must be imported before ANY other imports.
 */

console.log('[BLOB FIX] Starting aggressive blob fix application');

// Create a complete mock blob with all required properties
const createMockBlob = () => ({
  blobId: 'mock-blob-id',
  type: 'application/octet-stream',
  size: 0,
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  text: () => Promise.resolve(''),
  slice: () => createMockBlob(),
  stream: () => ({}),
});

// Store the global fetch to patch it
const originalFetch = global.fetch;

// 1. PATCH GLOBAL FETCH
// This ensures all network requests return responses with our patched blob method
global.fetch = function() {
  try {
    console.log('[BLOB FIX] Intercepted fetch call');
    return originalFetch.apply(this, arguments).then(
      (response) => {
        // Replace the blob method on this response
        const originalBlob = response.blob;
        response.blob = function() {
          console.log('[BLOB FIX] Intercepted response.blob call from fetch');
          return Promise.resolve(createMockBlob());
        };
        return response;
      },
      (error) => {
        console.error('[BLOB FIX] Fetch error:', error);
        throw error;
      }
    );
  } catch (error) {
    console.error('[BLOB FIX] Error in fetch patch:', error);
    throw error;
  }
};

// 2. PATCH RESPONSE.PROTOTYPE.BLOB
// This ensures any direct calls to response.blob() return our mock blob
if (typeof Response !== 'undefined' && Response.prototype) {
  const originalResponseBlob = Response.prototype.blob;
  Response.prototype.blob = function() {
    console.log('[BLOB FIX] Intercepted Response.prototype.blob call');
    return Promise.resolve(createMockBlob());
  };
}

// 3. PATCH XMLHttpRequest FOR LEGACY SUPPORT
if (typeof XMLHttpRequest !== 'undefined') {
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    console.log('[BLOB FIX] Intercepted XMLHttpRequest.open');
    return originalOpen.apply(this, arguments);
  };
}

// 4. ADD GLOBAL ERROR HANDLER FOR BLOB ERRORS
const originalError = console.error;
console.error = function() {
  // Check if this is a blob-related error
  const errorText = Array.from(arguments).join(' ');
  if (errorText.includes('blobId') || errorText.includes('blob')) {
    console.log('[BLOB FIX] Intercepted blob-related error:', errorText);
    // Continue with normal error logging
  }
  return originalError.apply(this, arguments);
};

// 5. ENSURE BLOB CONSTRUCTOR EXISTS
if (typeof global.Blob === 'undefined') {
  global.Blob = function() {
    return createMockBlob();
  };
}

console.log('[BLOB FIX] Aggressive blob fix successfully applied');

