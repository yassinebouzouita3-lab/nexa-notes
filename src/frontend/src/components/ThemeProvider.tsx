import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Light / dark / system theming, persisted to localStorage by next-themes.
 * The `dark` class is applied to <html>, matching the `.dark` token block in
 * index.css and `darkMode: ["class"]` in tailwind.config.js.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="nexa-notes-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
