import { Box, Button, Link, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { landingSections } from "./landingSections";

// The footer's own colours: deep olive with light text in both modes.
const FOOTER_BG = { light: "#3a4f1e", dark: "#161c12" };
const CREAM = "#f5eee3";
const HONEY = "#d4a24c";
const HAND = '"Caveat", "Aref Ruqaa", cursive';

// A soft wave along the top edge; the part above it takes the page colour.
const WAVE = "M0 0 H1440 V28 C1200 70 960 6 720 34 C480 62 240 8 0 40 Z";

// The bottom of public pages: a deep olive band with a wave on top, a last call to
// book with a handwritten "see you soon", the logo, the section links and how to
// reach the clinic, and the name "سَنَد" set very large and faint at the very bottom.
export const PublicFooter = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const phone = t("landing.contact.phone");
  const muted = alpha(CREAM, 0.7);

  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: FOOTER_BG[theme.palette.mode],
        color: CREAM,
        px: { xs: 2, md: 4 },
        pt: { xs: 10, md: 13 },
      }}
    >
      <Box
        component="svg"
        aria-hidden
        viewBox="0 0 1440 70"
        preserveAspectRatio="none"
        sx={{ position: "absolute", top: -1, left: 0, width: "100%", height: { xs: 40, md: 70 } }}
      >
        <path d={WAVE} fill={theme.palette.background.default} />
      </Box>

      <Box sx={{ position: "relative", maxWidth: 1200, mx: "auto" }}>
        {/* The last call to book. */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { md: "flex-end" },
            justifyContent: "space-between",
            gap: 3,
            pb: { xs: 5, md: 6 },
            borderBottom: 1,
            borderColor: alpha(CREAM, 0.15),
          }}
        >
          <Box>
            <Typography
              component="p"
              variant="h2"
              sx={{
                color: CREAM,
                fontFamily: '"Redaction", "El Messiri", serif',
                fontStyle: "italic",
                "&:lang(ar)": { fontStyle: "normal", fontWeight: 600 },
              }}
            >
              {t("landing.footer.ready")}
            </Typography>
            <Box
              component="p"
              sx={{ m: 0, mt: 0.5, fontFamily: HAND, fontSize: "1.8rem", color: HONEY }}
            >
              {t("landing.footer.seeYou")}
            </Box>
          </Box>
          <Button
            href="/#booking"
            size="large"
            sx={{
              alignSelf: { xs: "flex-start", md: "auto" },
              px: 3.5,
              py: 1.25,
              bgcolor: CREAM,
              color: "#3a4f1e",
              "&:hover": { bgcolor: "#fff" },
            }}
          >
            {t("landing.hero.book")}
          </Button>
        </Box>

        {/* Logo, the section links, and how to reach the clinic. */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr 1fr" },
            gap: { xs: 4, md: 6 },
            py: { xs: 5, md: 6 },
          }}
        >
          <Box>
            <Box
              component="img"
              src="/logo-full-dark.png?v=3"
              alt={t("brand.name")}
              sx={{ height: 56, width: "auto", display: "block" }}
            />
            <Typography sx={{ mt: 1.5, color: muted }}>{t("landing.footer.tagline")}</Typography>
          </Box>

          <Box component="nav" aria-labelledby="footer-pages">
            <Typography id="footer-pages" variant="body2" sx={{ mb: 1.5, color: HONEY }}>
              {t("landing.footer.pages")}
            </Typography>
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "grid", gap: 1 }}>
              {landingSections.map((section) => (
                <li key={section.id}>
                  <Link href={`/#${section.id}`} underline="hover" sx={{ color: CREAM }}>
                    {t(`nav.${section.labelKey}`)}
                  </Link>
                </li>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1.5, color: HONEY }}>
              {t("landing.footer.reach")}
            </Typography>
            <Box sx={{ display: "grid", gap: 1 }}>
              {/* Phone numbers read left to right in Arabic too. */}
              <Link
                href={`tel:${phone.replace(/\s/g, "")}`}
                underline="hover"
                dir="ltr"
                sx={{ color: CREAM, justifySelf: "start" }}
              >
                {phone}
              </Link>
              <Typography sx={{ color: muted }}>{t("landing.contact.address")}</Typography>
              <Typography sx={{ color: muted }}>{t("landing.contact.hours")}</Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: alpha(CREAM, 0.55), position: "relative" }}>
          {t("landing.footer.rights", { year: new Date().getFullYear() })}
        </Typography>
      </Box>

      {/* The clinic's name, very large and faint, cut off by the bottom edge. */}
      <Box
        aria-hidden
        sx={{
          fontFamily: '"El Messiri", serif',
          fontWeight: 600,
          fontSize: "clamp(7rem, 26vw, 22rem)",
          lineHeight: 0.8,
          textAlign: "center",
          color: alpha(CREAM, 0.07),
          mt: { xs: 4, md: 6 },
          mb: { xs: "-0.18em", md: "-0.2em" },
          userSelect: "none",
        }}
      >
        سَنَد
      </Box>
    </Box>
  );
};
