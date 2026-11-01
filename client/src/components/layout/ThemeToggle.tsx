import { IconButton, Tooltip } from "@mui/material";
import { Moon, Sun } from "@phosphor-icons/react";
import { useColorMode } from "@/theme/colorModeContext";

export const ThemeToggle = () => {
  const { mode, toggleColorMode } = useColorMode();
  const label = mode === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Tooltip title={label}>
      <IconButton color="inherit" onClick={toggleColorMode} aria-label={label}>
        {mode === "dark" ? <Sun /> : <Moon />}
      </IconButton>
    </Tooltip>
  );
};
