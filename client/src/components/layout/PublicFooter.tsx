import { Box, ButtonBase, Link, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useColorMode } from "@/theme/colorModeContext";
import { landingSections } from "./landingSections";

// Four photos of the clinic for the strip at the top of the footer (the same ones
// as the gallery).
const strip = [
  { key: "treatment", src: "/images/gallery/treatment.webp?v=2" },
  { key: "waiting", src: "/images/gallery/waiting.webp?v=2" },
  { key: "exercise", src: "/images/gallery/exercise.webp?v=2" },
  { key: "reception", src: "/images/gallery/reception.webp?v=2" },
] as const;

// The bottom of public pages, on the page's own beige: a strip of clinic photos
// (each opens the gallery), then the logo and tagline on one side and the section
// links, phone and hours on the other, and the copyright under a honey line.
export const PublicFooter = () => {
  const { t } = useTranslation();
  const { mode } = useColorMode();
  const phone = t("landing.contact.phone");

  return (
    <Box component="footer" sx={{ px: { xs: 2, md: 4 }, pt: { xs: 5, md: 7 }, pb: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: { xs: 1.5, md: 2 },
          }}
        >
          {strip.map((photo) => (
            <ButtonBase
              key={photo.key}
              href="/#gallery"
              aria-label={t(`landing.gallery.${photo.key}`)}
              sx={{
                display: "block",
                borderRadius: "16px",
                overflow: "hidden",
                "& img": { transition: "transform 400ms ease-out" },
                "&:hover img": { transform: "scale(1.04)" },
                "&.Mui-focusVisible": {
                  outline: 2,
                  outlineColor: "primary.main",
                  outlineOffset: 3,
                },
                "@media (prefers-reduced-motion: reduce)": {
                  "& img": { transition: "none" },
                },
              }}
            >
              <Box
                component="img"
                src={photo.src}
                alt=""
                loading="lazy"
                sx={{ display: "block", width: "100%", aspectRatio: "4 / 3", objectFit: "cover" }}
              />
            </ButtonBase>
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { md: "flex-start" },
            gap: 4,
            mt: { xs: 4, md: 5 },
          }}
        >
          <Box>
            <Box
              component="img"
              src={mode === "dark" ? "/logo-full-dark.png?v=3" : "/logo-full.png?v=3"}
              alt={t("brand.name")}
              sx={{ height: 60, width: "auto", display: "block" }}
            />
            <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: "1.1rem" }}>
              {t("landing.footer.tagline")}
            </Typography>
          </Box>

          <Box sx={{ textAlign: { md: "end" } }}>
            <Box component="nav" aria-label={t("landing.footer.pages")}>
              <Box
                component="ul"
                sx={{
                  m: 0,
                  p: 0,
                  listStyle: "none",
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: { md: "flex-end" },
                  gap: { xs: 2, md: 4 },
                }}
              >
                {landingSections.map((section) => (
                  <li key={section.id}>
                    <Link
                      href={`/#${section.id}`}
                      underline="hover"
                      color="text.primary"
                      sx={{ fontSize: "1.1rem" }}
                    >
                      {t(`nav.${section.labelKey}`)}
                    </Link>
                  </li>
                ))}
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: { md: "flex-end" },
                gap: { xs: 1, md: 4 },
                mt: 2,
                color: "text.secondary",
              }}
            >
              {/* Phone numbers read left to right in Arabic too. */}
              <Link
                href={`tel:${phone.replace(/\s/g, "")}`}
                underline="hover"
                color="text.secondary"
                dir="ltr"
              >
                {phone}
              </Link>
              <span>{t("landing.contact.hours")}</span>
            </Box>
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: { xs: 4, md: 5 }, pt: 2.5, borderTop: 1, borderColor: "warning.main" }}
        >
          {t("landing.footer.rights", { year: new Date().getFullYear() })}
        </Typography>
      </Box>
    </Box>
  );
};
