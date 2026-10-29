import { createTheme, type Direction, type PaletteMode } from "@mui/material/styles";

export const createAppTheme = (mode: PaletteMode, direction: Direction = "ltr") =>
  createTheme({
    direction,
    palette: {
      mode,
      primary: { main: mode === "light" ? "#0b7a75" : "#4fd1c5" },
      secondary: { main: mode === "light" ? "#3d5a80" : "#9db4d6" },
      background:
        mode === "light"
          ? { default: "#f6f8fa", paper: "#ffffff" }
          : { default: "#0f1417", paper: "#171d21" },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Inter", "Noto Sans Arabic", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiAppBar: { defaultProps: { elevation: 0 } },
    },
  });
