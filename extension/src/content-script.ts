import { Readability } from '@mozilla/readability';
import { mountOverlay } from './overlay';
import { useExtensionStore } from './store/useExtensionStore';
import cssText from './index.css?inline';

console.log('[The Last Honest Ad] Content script injected successfully!');

// State to keep track of the injected shadow root
let overlayContainer: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTRACT_PAGE') {
    try {
      // Clone the document safely using DOMParser to avoid Custom Element (__CE_registry) errors on sites like Amazon
      const documentClone = new DOMParser().parseFromString(document.documentElement.outerHTML, 'text/html');
      
      // Use Readability to extract the main content
      const reader = new Readability(documentClone);
      const article = reader.parse();
      
      // Return the clean text
      if (article && article.textContent) {
        sendResponse({ success: true, text: article.textContent });
      } else {
        // Fallback to basic text if Readability fails
        sendResponse({ success: true, text: document.body.innerText });
      }
    } catch (error: any) {
      console.error('[The Last Honest Ad] Extraction error:', error);
      sendResponse({ success: false, error: error.message });
    }
  } else if (message.type === 'SHOW_OVERLAY') {
    injectOverlay();
    sendResponse({ success: true });
  } else if (message.type === 'HIDE_OVERLAY') {
    if (overlayContainer) {
      overlayContainer.remove();
      overlayContainer = null;
      shadowRoot = null;
    }
    sendResponse({ success: true });
  } else if (message.type === 'START_GENERATION') {
    injectOverlay();
    
    const { text, categoryId } = message.payload;
    const store = useExtensionStore.getState();
    store.setGenerating(true);
    store.setError(null);
    
    fetch('http://localhost:4000/api/ads/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalCopy: text.substring(0, 5000), categoryId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          store.setGeneratedAd(data.data);
        } else {
          let errorMsg = 'Failed to generate honest ad';
          if (typeof data.error === 'string') {
            errorMsg = data.error;
          } else if (data.error && typeof data.error === 'object' && data.error.message) {
            errorMsg = data.error.message;
          }
          store.setError(errorMsg);
        }
      })
      .catch(err => {
        console.error('Generation Error:', err);
        store.setError(err.message);
      })
      .finally(() => {
        store.setGenerating(false);
      });
      
    sendResponse({ success: true });
  }
  
  return true; // Indicates asynchronous response
});

function injectOverlay() {
  if (overlayContainer) return; // Already injected

  // Create a host element for the shadow DOM
  overlayContainer = document.createElement('div');
  overlayContainer.id = 'the-last-honest-ad-overlay-root';
  
  // Style the host element to overlay the whole screen
  Object.assign(overlayContainer.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '2147483647', // Maximum z-index
    pointerEvents: 'none', // Let clicks pass through if not on our UI
  });

  // Attach shadow DOM
  shadowRoot = overlayContainer.attachShadow({ mode: 'open' });

  // Create a container inside the shadow root for our React app
  const appContainer = document.createElement('div');
  appContainer.id = 'app';
  appContainer.style.pointerEvents = 'auto'; // Re-enable pointer events for our app
  appContainer.style.width = '100%';
  appContainer.style.height = '100%';

  shadowRoot.appendChild(appContainer);
  document.body.appendChild(overlayContainer);

  // Inject the Tailwind CSS directly into the shadow root
  const styleTag = document.createElement('style');
  styleTag.textContent = cssText;
  shadowRoot.appendChild(styleTag);

  // Mount the React app inside the shadow DOM
  mountOverlay(appContainer);
}

// Instead of waiting for another script, let's render the React app right here
// Let's import the OverlayApp and render it
