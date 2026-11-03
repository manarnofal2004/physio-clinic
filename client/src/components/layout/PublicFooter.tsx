import { Box, Link, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useColorMode } from "@/theme/colorModeContext";
import { landingSections } from "./landingSections";

// The bottom of public pages: logo and tagline, links to the landing sections, and
// the copyright line.
export const PublicFooter = () => {
  const { t } = useTranslation();
  const { mode } = useColorMode();

  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        px: { xs: 2, md: 4 },
        pt: { xs: 5, md: 6 },
        pb: 4,
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          gap: 4,
        }}
      >
        <Box>
          <Box
            component="img"
            src={mode === "dark" ? "/logo-full-dark.png" : "/logo-full.png"}
            alt={t("brand.name")}
            sx={{ height: 56, width: "auto", display: "block" }}
          />
          <Typography color="text.secondary" sx={{ mt: 1.5 }}>
            {t("landing.footer.tagline")}
          </Typography>
        </Box>

        <Box component="nav" aria-labelledby="footer-pages">
          <Typography id="footer-pages" variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {t("landing.footer.pages")}
          </Typography>
          <Box
            component="ul"
            sx={{
              m: 0,
              p: 0,
              listStyle: "none",
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 2, md: 3 },
            }}
          >
            {landingSections.map((section) => (
              <li key={section.id}>
                <Link href={`/#${section.id}`} underline="hover" color="text.primary">
                  {t(`nav.${section.labelKey}`)}
                </Link>
              </li>
            ))}
          </Box>
        </Box>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 1200, mx: "auto", mt: { xs: 4, md: 5 } }}
      >
        {t("landing.footer.rights", { year: new Date().getFullYear() })}
      </Typography>
    </Box>
  );
};
