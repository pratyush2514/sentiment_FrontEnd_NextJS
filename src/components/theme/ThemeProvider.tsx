"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  useState,
} from "react";
import {
  getThemeColor,
  isThemePreference,
  resolveThemePreference,
  THEME_PREFERENCE_COOKIE,
  THEME_PREFERENCE_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

interface ThemeContextValue {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  isHydrated: boolean;
  setThemePreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
} {
  if (typeof document === "undefined") {
    return {
      themePreference: "system",
      resolvedTheme: "light",
    };
  }

  const root = document.documentElement;
  const rawPreference = root.dataset.theme;
  const rawResolved = root.dataset.resolvedTheme;

  return {
    themePreference: isThemePreference(rawPreference) ? rawPreference : "system",
    resolvedTheme: rawResolved === "dark" ? "dark" : "light",
  };
}

function shouldReduceMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setPreferenceCookie(preference: ThemePreference) {
  document.cookie = `${THEME_PREFERENCE_COOKIE}=${encodeURIComponent(preference)}; path=/; max-age=31536000; samesite=lax`;
}

function syncThemeDom(preference: ThemePreference, resolvedTheme: ResolvedTheme) {
  const root = document.documentElement;
  root.dataset.theme = preference;
  root.dataset.resolvedTheme = resolvedTheme;
  root.style.colorScheme = resolvedTheme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", getThemeColor(resolvedTheme));
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [{ themePreference, resolvedTheme }, setThemeState] = useState(() =>
    getInitialTheme(),
  );
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const transitionTimerRef = useRef<number | null>(null);

  const applyTheme = useCallback(
    (preference: ThemePreference, shouldAnimate: boolean) => {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const nextResolvedTheme = resolveThemePreference(preference, systemPrefersDark);

      if (shouldAnimate && !shouldReduceMotion()) {
        document.documentElement.classList.add("theme-transitioning");
        if (transitionTimerRef.current) {
          window.clearTimeout(transitionTimerRef.current);
        }
        transitionTimerRef.current = window.setTimeout(() => {
          document.documentElement.classList.remove("theme-transitioning");
          transitionTimerRef.current = null;
        }, 220);
      }

      syncThemeDom(preference, nextResolvedTheme);
      try {
        window.localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, preference);
        setPreferenceCookie(preference);
      } catch {
        // Ignore storage failures and continue with in-memory theme state.
      }
      setThemeState({
        themePreference: preference,
        resolvedTheme: nextResolvedTheme,
      });
    },
    [],
  );

  useEffect(() => {
    syncThemeDom(themePreference, resolvedTheme);
    try {
      window.localStorage.setItem(
        THEME_PREFERENCE_STORAGE_KEY,
        themePreference,
      );
      setPreferenceCookie(themePreference);
    } catch {
      // Ignore storage failures and continue with in-memory theme state.
    }

    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
      document.documentElement.classList.remove("theme-transitioning");
    };
  }, [resolvedTheme, themePreference]);

  useEffect(() => {
    if (!isHydrated) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleChange() {
      if (themePreference !== "system") {
        return;
      }

      const nextResolvedTheme = resolveThemePreference("system", mediaQuery.matches);
      syncThemeDom("system", nextResolvedTheme);
      setThemeState((current) => {
        if (current.themePreference !== "system" || current.resolvedTheme === nextResolvedTheme) {
          return current;
        }

        return {
          ...current,
          resolvedTheme: nextResolvedTheme,
        };
      });
    }

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themePreference, isHydrated]);

  const setThemePreference = useCallback(
    (preference: ThemePreference) => {
      applyTheme(preference, isHydrated);
    },
    [applyTheme, isHydrated],
  );

  const value = useMemo(
    () => ({
      themePreference,
      resolvedTheme,
      isHydrated,
      setThemePreference,
    }),
    [isHydrated, resolvedTheme, setThemePreference, themePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
