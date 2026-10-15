import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './providers/AuthProvider';
import { router } from './routes';
import './index.css';
import { setupMockApi } from './lib/mockApi';
import { Toaster } from './components/ui/sonner';

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

setupMockApi();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);