import { Box, Link, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import type { Translation } from "@/i18n/locales/en";

type SectionKey = keyof Translation["privacy"]["sections"];

// In page order; each has a title and a body in the translation files.
const sections: SectionKey[] = [
  "collect",
  "google",
  "use",
  "browser",
  "sharing",
  "keep",
  "rights",
  "contact",
];

// The privacy policy (linked from the footer). Google asks for one before "Sign in with
// Google" can be used by everyone. Plain reading text on the page's own beige.
export const PrivacyPage = () => {
  const { t } = useTranslation();

  return (
    <Box
      component="article"
      sx={{ maxWidth: 720, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 5, md: 8 } }}
    >
      <Typography
        variant="h2"
        component="h1"
        sx={{
          color: "primary.dark",
          fontFamily: '"Redaction", "El Messiri", serif',
          fontStyle: "italic",
          "&:lang(ar)": { fontStyle: "normal", fontWeight: 600 },
        }}
      >
        {t("privacy.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        {t("privacy.updated")}
      </Typography>
      <Typography sx={{ mt: 3, fontSize: "1.1rem", lineHeight: 1.8 }}>
        {t("privacy.intro")}
      </Typography>

      {sections.map((key) => (
        <Box component="section" key={key} sx={{ mt: 4 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ color: "primary.dark", fontWeight: 600, mb: 1 }}
          >
            {t(`privacy.sections.${key}.title`)}
          </Typography>
          {/* Paragraphs are separated by an empty line in the translation files. */}
          {t(`privacy.sections.${key}.body`)
            .split("\n\n")
            .map((paragraph) => (
              <Typography key={paragraph} sx={{ lineHeight: 1.8, mt: 1 }}>
                {paragraph}
              </Typography>
            ))}
          {key === "contact" && (
            <Link
              component={RouterLink}
              to="/#contact"
              underline="hover"
              sx={{ mt: 1.5, display: "inline-block" }}
            >
              {t("privacy.contactLink")}
            </Link>
          )}
        </Box>
      ))}
    </Box>
  );
};
