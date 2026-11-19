import { useCallback, useMemo, useState, type ReactNode } from "react";
import { CssBaseline, ThemeProvider, type PaletteMode } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { LucideProvider } from "lucide-react";
import { useTranslation } from "react-i18next";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { createAppTheme } from "./theme";
import { ColorModeContext } from "./colorModeContext";

const STORAGE_KEY = "color-mode";

// In Arabic the styles are flipped (margin-left becomes margin-right, and so on).
const ltrCache = createCache({ key: "mui" });
const rtlCache = createCache({ key: "mui-rtl", stylisPlugins: [prefixer, rtlPlugin] });

const getInitialMode = (): PaletteMode => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // storage unavailable, fall back to system preference
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const ColorModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<PaletteMode>(getInitialMode);

  const toggleColorMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore write failures
      }
      return next;
    });
  }, []);

  const { i18n } = useTranslation();
  const direction = i18n.dir();
  const theme = useMemo(
    () => createAppTheme(mode, direction, i18n.language),
    [mode, direction, i18n.language],
  );
  const value = useMemo(() => ({ mode, toggleColorMode }), [mode, toggleColorMode]);

  return (
    <ColorModeContext.Provider value={value}>
      <CacheProvider value={direction === "rtl" ? rtlCache : ltrCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {/* Every Lucide icon in the app: thin honey outline, one size. */}
          <LucideProvider size={22} strokeWidth={1.75} color={theme.palette.warning.main}>
            {children}
          </LucideProvider>
        </ThemeProvider>
      </CacheProvider>
    </ColorModeContext.Provider>
  );
};
