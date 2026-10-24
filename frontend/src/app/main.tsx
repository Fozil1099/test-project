import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { env } from '@/shared/config';
import { App } from './app';
import './styles/index.css';

async function enableMocks() {
  if (!env.useMocks) return;
  // Loaded only in mock mode, so MSW and fake data never reach the production bundle.
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
}

enableMocks().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
