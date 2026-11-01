import { IconButton, Tooltip } from "@mui/material";
import { DarkModeIcon, LightModeIcon } from "@/components/icons/icons";
import { useTranslation } from "react-i18next";
import { useColorMode } from "@/theme/colorModeContext";

export const ThemeToggle = () => {
  const { t } = useTranslation();
  const { mode, toggleColorMode } = useColorMode();
  const label = mode === "dark" ? t("settings.lightMode") : t("settings.darkMode");

  return (
    <Tooltip title={label}>
      <IconButton color="inherit" onClick={toggleColorMode} aria-label={label}>
        {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
};
