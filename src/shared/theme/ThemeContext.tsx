import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { local } from "@/shared/lib/Storage/localstorage";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "system_mechatronics_theme",
}: ThemeProviderProps) {
  const isFirstRender = useRef(true);
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = local.get<Theme>(storageKey);
      if (stored && ["light", "dark", "system"].includes(stored)) {
        return stored;
      }
    }
    return defaultTheme;
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  // Track system theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    return theme === "system" ? systemTheme : theme;
  }, [theme, systemTheme]);

  // Sync class on <html> element cleanly without flickering
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    const updateDOM = () => {
      if (resolvedTheme === "dark") {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
      }
    };

    // On initial mount, sync immediately without animation/flicker
    if (isFirstRender.current) {
      isFirstRender.current = false;
      updateDOM();
      return;
    }

    // Use View Transitions API if supported for zero-flicker native crossfade
    if (
      "startViewTransition" in document &&
      typeof (document as any).startViewTransition === "function"
    ) {
      root.classList.add("no-transitions");
      const transition = (document as any).startViewTransition(() => {
        updateDOM();
      });
      transition.finished.finally(() => {
        root.classList.remove("no-transitions");
      });
    } else {
      // Fallback: Temporarily disable transitions during class toggle to prevent FOUC / flicker
      root.classList.add("no-transitions");
      updateDOM();
      const timer = setTimeout(() => {
        root.classList.remove("no-transitions");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      if (typeof window !== "undefined") {
        local.set(storageKey, newTheme);
      }
    },
    [storageKey],
  );

  const toggleTheme = useCallback(() => {
    const currentResolved = theme === "system" ? systemTheme : theme;
    const nextTheme: Theme = currentResolved === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [setTheme, theme, systemTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
