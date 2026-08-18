import { type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/shared/theme";
import { ToastContainer } from "@/shared/ui";

// Provides global application context such as theme, routing, and notifications.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="system_mechatronics_theme">
      {/* Provides client-side routing for the application. */}
      <BrowserRouter>
        {children}

        {/* Displays global toast notifications. */}
        <ToastContainer />
      </BrowserRouter>
    </ThemeProvider>
  );
}