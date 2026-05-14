import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { initMercadoPago } from '@mercadopago/sdk-react';
import './index.css';
import AppRouter from './router';

initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'es-AR' });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos en lugar de 60 segundos
      retry: 1,
      refetchOnWindowFocus: false, // No refetchar cuando vuelve el foco a la ventana
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);
