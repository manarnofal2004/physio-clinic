import { useEffect, useState } from "react";
import { Box, ButtonBase, IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";

type PhotoKey = "reception" | "treatment" | "handsOn" | "exercise" | "waiting";
type GalleryKey = keyof Translation["landing"]["gallery"];

const photos: { key: PhotoKey; src: string }[] = [
  { key: "reception", src: "/images/gallery/reception.webp?v=2" },
  { key: "treatment", src: "/images/gallery/treatment.webp?v=2" },
  { key: "handsOn", src: "/images/gallery/hands-on.webp?v=2" },
  { key: "exercise", src: "/images/gallery/exercise.webp?v=2" },
  { key: "waiting", src: "/images/gallery/waiting.webp?v=2" },
];

const AUTO_MS = 5000;
const FEATURE_HEIGHT = "calc(100svh - 236px)";

export const GallerySection = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);

  const photo = photos[active] ?? photos[0];
  const number = new Intl.NumberFormat(i18n.language, {
    minimumIntegerDigits: 2,
  });
  const text = (key: GalleryKey) => t(`landing.gallery.${key}`);
  const go = (step: 1 | -1) => {
    setActive((current) => (current + step + photos.length) % photos.length);
  };

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(preference.matches);

    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (hovered || focused || reduceMotion) return;

    const id = window.setTimeout(() => {
      setActive((current) => (current + 1) % photos.length);
    }, AUTO_MS);

    return () => window.clearTimeout(id);
  }, [active, hovered, focused, reduceMotion]);

  if (!photo) return null;

  const Prev = isRtl ? ChevronRight : ChevronLeft;
  const Next = isRtl ? ChevronLeft : ChevronRight;
  const arrow = {
    width: 44,
    height: 44,
    border: 1,
    borderColor: "divider",
    color: "primary.dark",
    "&:hover": {
      bgcolor: "action.selected",
      borderColor: "primary.main",
    },
    "&.Mui-focusVisible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: 3,
    },
  };

  return (
    <LandingSection
      id="gallery"
      title={t("landing.gallery.title")}
      intro={t("landing.gallery.intro")}
      alignTop
    >
      <Box
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setFocused(false);
          }
        }}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: `min(calc(${FEATURE_HEIGHT} * 1.38), calc(100% - 380px)) minmax(0, 1fr)`,
          },
          alignItems: "center",
          gap: { xs: 2.5, md: 4 },
          "@keyframes galleryFade": {
            from: { opacity: 0.4 },
            to: { opacity: 1 },
          },
        }}
      >
        <Box
          key={photo.key}
          component="img"
          src={photo.src}
          alt={text(photo.key)}
          sx={{
            display: "block",
            width: "100%",
            aspectRatio: "3 / 2",
            objectFit: "cover",
            borderRadius: 4,
            animation: "galleryFade 350ms ease-out",
            "@media (prefers-reduced-motion: reduce)": {
              animation: "none",
            },
          }}
        />

        <Box
          sx={{
            position: "relative",
            minWidth: 0,
            boxSizing: "border-box",
            height: {
              xs: "auto",
              md: `min(${FEATURE_HEIGHT}, 560px)`,
            },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: { xs: 2.5, md: "clamp(12px, 2svh, 22px)" },
            paddingInlineStart: { xs: 0, md: 3 },
            "&::before": {
              content: '""',
              display: { xs: "none", md: "block" },
              position: "absolute",
              insetInlineStart: 0,
              insetBlock: 0,
              width: "1px",
              bgcolor: "divider",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 2,
              pb: { xs: 1.5, md: 2 },
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                gap: 1,
                color: "primary.main",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontFamily: "inherit",
                  fontWeight: 300,
                  fontSize: {
                    xs: "3.5rem",
                    md: "clamp(3.5rem, 9svh, 6rem)",
                  },
                  lineHeight: 0.85,
                  letterSpacing: "-0.065em",
                }}
              >
                <bdi>{number.format(active + 1)}</bdi>
              </Typography>
              <Typography component="span" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                <bdi>/ {number.format(photos.length)}</bdi>
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                pb: 0.25,
              }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "warning.main",
                }}
              />
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.8rem",
                  lineHeight: 1.4,
                }}
              >
                {t("landing.gallery.photos")}
              </Typography>
            </Box>
          </Box>

          <Box
            aria-live={hovered || focused || reduceMotion ? "polite" : "off"}
            aria-atomic="true"
            sx={{
              position: "relative",
              paddingInlineStart: { xs: 0, md: 2 },
              "&::before": {
                content: '""',
                display: { xs: "none", md: "block" },
                position: "absolute",
                insetInlineStart: "-25px",
                top: "0.35em",
                width: 3,
                height: 36,
                borderRadius: 2,
                bgcolor: "warning.main",
              },
            }}
          >
            <Typography
              variant="h3"
              component="h3"
              sx={{
                color: "primary.dark",
                fontSize: {
                  xs: "1.8rem",
                  md: "clamp(1.65rem, 3.6svh, 2.5rem)",
                },
                fontWeight: 400,
                lineHeight: 1.15,
                overflowWrap: "anywhere",
                mb: { xs: 1, md: "clamp(8px, 1.5svh, 16px)" },
              }}
            >
              {text(photo.key)}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{
                fontSize: { xs: "1rem", md: "clamp(0.9rem, 1.65svh, 1.05rem)" },
                lineHeight: 1.6,
                overflowWrap: "anywhere",
                maxWidth: "36ch",
              }}
            >
              {text(`${photo.key}Text`)}
            </Typography>
          </Box>

          <Box>
            <Box
              role="group"
              aria-label={t("landing.gallery.photos")}
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                gap: { xs: 1, md: 0.75 },
              }}
            >
              {photos.map((item, index) => {
                const selected = index === active;

                return (
                  <ButtonBase
                    key={item.key}
                    onClick={() => setActive(index)}
                    aria-label={`${number.format(index + 1)}: ${text(item.key)}`}
                    aria-pressed={selected}
                    sx={{
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      gap: 1,
                      borderRadius: 0.5,
                      "&.Mui-focusVisible": {
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: 4,
                      },
                      "&:hover .gallery-marker": {
                        bgcolor: "primary.main",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={item.src}
                      alt=""
                      loading="lazy"
                      sx={{
                        display: "block",
                        width: "100%",
                        aspectRatio: "3 / 2",
                        objectFit: "contain",
                        borderRadius: 0.5,
                        opacity: selected ? 1 : 0.65,
                        transition: "opacity 180ms ease",
                        "@media (prefers-reduced-motion: reduce)": {
                          transition: "none",
                        },
                      }}
                    />
                    <Box
                      className="gallery-marker"
                      aria-hidden="true"
                      sx={{
                        height: 2,
                        bgcolor: selected ? "warning.main" : "divider",
                        borderRadius: 1,
                      }}
                    />
                  </ButtonBase>
                );
              })}
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                mt: { xs: 2, md: "clamp(12px, 2svh, 22px)" },
              }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  maxWidth: 100,
                  gap: 0.75,
                }}
              >
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                  }}
                />
                <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    border: 1,
                    borderColor: "primary.main",
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  onClick={() => go(-1)}
                  aria-label={t("landing.gallery.previous")}
                  sx={arrow}
                >
                  <Prev size={20} />
                </IconButton>
                <IconButton onClick={() => go(1)} aria-label={t("landing.gallery.next")} sx={arrow}>
                  <Next size={20} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </LandingSection>
  );
};
