import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";

// One button that switches between English and Arabic. It shows the other
// language's name in that language ("العربية" / "English"), so anyone can find it.
export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const next = i18n.language === "ar" ? "en" : "ar";

  return (
    <Button
      color="inherit"
      lang={next}
      onClick={() => void i18n.changeLanguage(next)}
      aria-label={t("settings.switchLanguage")}
      sx={{ minWidth: 0 }}
    >
      {t("settings.otherLanguage")}
    </Button>
  );
};
