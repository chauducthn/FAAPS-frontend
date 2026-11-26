import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { IconContext } from "@phosphor-icons/react";
import { Toaster } from "./shared/components/ui/sonner";
import { AuthProvider } from "./modules/auth/providers/AuthProvider";
import { ErrorBoundary } from "./shared/components/common/ErrorBoundary";
import { router } from "./routes";
import "./index.css";

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IconContext.Provider value={{ weight: "duotone" }}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {/* Chặn lỗi render ở tầng gốc: một màn hình lỗi không được làm trắng cả app. */}
            <ErrorBoundary>
              <RouterProvider router={router} />
            </ErrorBoundary>
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </IconContext.Provider>
  </StrictMode>,
);
