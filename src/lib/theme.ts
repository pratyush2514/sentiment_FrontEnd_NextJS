export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_PREFERENCE_STORAGE_KEY = "pb_theme_preference";
export const THEME_PREFERENCE_COOKIE = "pb_theme_preference";

const LIGHT_THEME_COLOR = "#f5f7fb";
const DARK_THEME_COLOR = "#0b1020";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function resolveThemePreference(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }

  return preference;
}

export function getThemeColor(theme: ResolvedTheme): string {
  return theme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
}

export function buildThemeBootstrapScript(): string {
  return `(() => {
    try {
      const STORAGE_KEY = "${THEME_PREFERENCE_STORAGE_KEY}";
      const COOKIE_KEY = "${THEME_PREFERENCE_COOKIE}";
      const readCookie = (name) => {
        const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]+)"));
        return match ? decodeURIComponent(match[2]) : null;
      };

      const storedPreference = window.localStorage.getItem(STORAGE_KEY);
      const cookiePreference = readCookie(COOKIE_KEY);
      const rawPreference = storedPreference || cookiePreference || "system";
      const preference = /^(light|dark|system)$/.test(rawPreference) ? rawPreference : "system";
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolvedTheme = preference === "system"
        ? (systemPrefersDark ? "dark" : "light")
        : preference;
      const root = document.documentElement;

      root.dataset.theme = preference;
      root.dataset.resolvedTheme = resolvedTheme;
      root.style.colorScheme = resolvedTheme;

      const themeColor = resolvedTheme === "dark" ? "${DARK_THEME_COLOR}" : "${LIGHT_THEME_COLOR}";
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute("content", themeColor);
      }
    } catch (_) {
      // Ignore bootstrap failures and fall back to CSS/media query behavior.
    }
  })();`;
}
