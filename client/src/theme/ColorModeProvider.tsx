import { useCallback, useMemo, useState, type ReactNode } from "react";
import { CssBaseline, ThemeProvider, type PaletteMode } from "@mui/material";
import { IconContext } from "@phosphor-icons/react";
import { createAppTheme } from "./theme";
import { ColorModeContext } from "./colorModeContext";

const STORAGE_KEY = "color-mode";

// Defaults for every Phosphor icon in the app (the honey fill is set in theme.ts).
const iconDefaults = { weight: "duotone", size: 22, className: "app-icon" } as const;

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

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleColorMode }), [mode, toggleColorMode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <IconContext.Provider value={iconDefaults}>{children}</IconContext.Provider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
