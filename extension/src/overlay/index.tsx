import React from 'react';
import { createRoot } from 'react-dom/client';
import OverlayApp from './OverlayApp';

export function mountOverlay(container: HTMLElement) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <OverlayApp />
    </React.StrictMode>
  );
  return root;
}
