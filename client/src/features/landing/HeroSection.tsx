import { Box, Button, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

// The photo fills the far half of the hero. Its edge facing the text is a soft
// S-shaped wave, drawn as an SVG clip path in 0..1 units so it scales with the box.
// Arabic needs the mirror image (wave on the other side), so x becomes 1 - x.
const WAVE_LTR = "M0.1,0 C0.02,0.16 0.01,0.36 0.07,0.52 C0.13,0.68 0.11,0.86 0.04,1 L1,1 L1,0 Z";
const WAVE_RTL = "M0.9,0 C0.98,0.16 0.99,0.36 0.93,0.52 C0.87,0.68 0.89,0.86 0.96,1 L0,1 L0,0 Z";

export const HeroSection = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const wave = isRtl ? WAVE_RTL : WAVE_LTR;

  const details = [
    { label: t("landing.hero.hoursLabel"), value: t("landing.hero.hours") },
    { label: t("landing.hero.sessionLabel"), value: t("landing.hero.session") },
  ];

  return (
    <Box
      component="section"
      id="top"
      sx={{ position: "relative", overflow: "hidden", bgcolor: "background.wash" }}
    >
      <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
        <clipPath id="hero-wave" clipPathUnits="objectBoundingBox">
          <path d={wave} />
        </clipPath>
      </svg>

      {/* Photo with a pale olive band following the wave just outside it. */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "absolute",
          top: 0,
          bottom: 0,
          insetInlineEnd: 0,
          width: "52%",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            insetInlineEnd: 0,
            width: "calc(100% + 28px)",
            bgcolor: "action.selected",
            clipPath: "url(#hero-wave)",
          }}
        />
        <Box
          component="img"
          src="/images/hero.webp"
          alt={t("landing.hero.imageAlt")}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            // Keep the therapist (left of the photo) clear of the wave in both directions.
            objectPosition: isRtl ? "35% 50%" : "20% 50%",
            clipPath: "url(#hero-wave)",
          }}
        />
      </Box>

      <Box
        sx={{
          position: "relative",
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 7, md: 10 },
          minHeight: { md: 600 },
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: { md: "44%" } }}>
          <Typography variant="h1" sx={{ fontSize: { xs: "2.4rem", md: "3.25rem" } }}>
            {t("landing.hero.title")}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 3, fontSize: "1.15rem", lineHeight: 1.7, maxWidth: "34em" }}
          >
            {t("landing.hero.subtitle")}
          </Typography>

          <Stack direction="row" sx={{ mt: 5, gap: 1, flexWrap: "wrap" }}>
            <Button variant="contained" size="large" href="/#booking" sx={{ px: 3.5, py: 1.25 }}>
              {t("landing.hero.book")}
            </Button>
            <Button size="large" href="/#how-it-works" sx={{ px: 2.5, py: 1.25 }}>
              {t("landing.hero.howItWorks")}
            </Button>
          </Stack>

          {/* Practical details a visitor checks before booking, as a small
              label/value list under a thin line. */}
          <Box
            component="dl"
            sx={{
              mt: { xs: 6, md: 8 },
              mb: 0,
              pt: 3,
              borderTop: 1,
              borderColor: "divider",
              display: "grid",
              gridTemplateColumns: { sm: "auto auto" },
              justifyContent: "start",
              rowGap: 3,
              columnGap: 6,
            }}
          >
            {details.map((detail) => (
              <div key={detail.label}>
                <Typography component="dt" variant="body2" color="text.secondary">
                  {detail.label}
                </Typography>
                <Typography component="dd" sx={{ m: 0, mt: 0.5, fontWeight: 500 }}>
                  {detail.value}
                </Typography>
              </div>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
