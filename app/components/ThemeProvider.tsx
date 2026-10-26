"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Light mode only — dark theme is disabled app-wide. */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="vcm-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
