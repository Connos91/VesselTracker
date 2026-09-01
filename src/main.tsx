import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { makeQueryClient } from './app/queryClient';
import './index.css';
import { makeStore } from './store/store';

const container = document.getElementById('root');
if (container === null) throw new Error('Root container #root is missing from index.html');

createRoot(container).render(
  <StrictMode>
    <Provider store={makeStore()}>
      <QueryClientProvider client={makeQueryClient()}>
        <App />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
