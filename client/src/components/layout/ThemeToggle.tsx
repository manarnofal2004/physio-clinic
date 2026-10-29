import { IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useColorMode } from "@/theme/colorModeContext";

export const ThemeToggle = () => {
  const { mode, toggleColorMode } = useColorMode();
  const label = mode === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Tooltip title={label}>
      <IconButton color="inherit" onClick={toggleColorMode} aria-label={label}>
        {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
};
