import { createContext, useContext } from "react";
import type { PaletteMode } from "@mui/material/styles";

export interface ColorModeContextValue {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextValue | null>(null);

export const useColorMode = (): ColorModeContextValue => {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used inside ColorModeProvider");
  }
  return context;
};
