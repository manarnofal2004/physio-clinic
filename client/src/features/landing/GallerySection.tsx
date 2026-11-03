import { useState } from "react";
import { Box, ButtonBase, IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";

type PhotoKey = "reception" | "treatment" | "handsOn" | "exercise" | "waiting";
type GalleryKey = keyof Translation["landing"]["gallery"];

// All photos are wide (3:2), so the large frame shows each one whole. "?v=2" makes
// browsers fetch the new versions instead of the copies they kept.
const photos: { key: PhotoKey; src: string }[] = [
  { key: "reception", src: "/images/gallery/reception.webp?v=2" },
  { key: "treatment", src: "/images/gallery/treatment.webp?v=2" },
  { key: "handsOn", src: "/images/gallery/hands-on.webp?v=2" },
  { key: "exercise", src: "/images/gallery/exercise.webp?v=2" },
  { key: "waiting", src: "/images/gallery/waiting.webp?v=2" },
];

// Height of the large photo on wide screens: the screen minus the heading above and
// the caption under it.
const FEATURE_HEIGHT = "calc(100svh - 286px)";

// One large photo with its name and a line about the place, and the other photos as
// a list beside it: picking one (or the arrows) shows it large. The photos keep
// their natural shape.
export const GallerySection = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const [active, setActive] = useState(0);
  const photo = photos[active] ?? photos[0]!;
  const number = new Intl.NumberFormat(i18n.language, { minimumIntegerDigits: 2 });
  const text = (key: string) => t(`landing.gallery.${key as GalleryKey}`);

  const go = (step: 1 | -1) => setActive((a) => (a + step + photos.length) % photos.length);
  const Prev = isRtl ? ChevronRight : ChevronLeft;
  const Next = isRtl ? ChevronLeft : ChevronRight;

  return (
    <LandingSection
      id="gallery"
      title={t("landing.gallery.title")}
      intro={t("landing.gallery.intro")}
      alignTop
    >
      <Box
        sx={{
          display: "grid",
          // The photo column is exactly as wide as a 3:2 photo of the full height, so
          // the photo is never cut; the list takes the rest.
          gridTemplateColumns: {
            xs: "1fr",
            md: `min(calc(${FEATURE_HEIGHT} * 1.5), calc(100% - 300px)) 1fr`,
          },
          gap: { xs: 2.5, md: 4 },
        }}
      >
        {/* The large photo and its caption, as tall as the screen allows. */}
        <Box>
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
              "@keyframes galleryFade": { from: { opacity: 0.4 }, to: { opacity: 1 } },
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          />
          <Box
            sx={{
              mt: 2,
              pb: 1.5,
              display: "flex",
              alignItems: "flex-end",
              gap: 3,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Box sx={{ flex: 1 }} aria-live="polite">
              <Typography
                variant="h4"
                component="h3"
                sx={{ fontSize: { xs: "1.5rem", md: "1.9rem" }, color: "primary.dark" }}
              >
                {text(photo.key)}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {text(`${photo.key}Text`)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
              <IconButton onClick={() => go(-1)} aria-label={t("landing.gallery.previous")}>
                <Prev />
              </IconButton>
              <Typography sx={{ minWidth: 64, textAlign: "center" }} dir="ltr">
                {number.format(active + 1)} / {number.format(photos.length)}
              </Typography>
              <IconButton onClick={() => go(1)} aria-label={t("landing.gallery.next")}>
                <Next />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* The names of all the places, split by hairlines; the one shown large is
            olive with its number, the others are quiet. */}
        <Box
          role="list"
          aria-label={t("landing.gallery.photos")}
          sx={{
            alignSelf: "center",
            display: "flex",
            flexDirection: { xs: "row", md: "column" },
            flexWrap: { xs: "wrap", md: "nowrap" },
            gap: { xs: 1, md: 0 },
          }}
        >
          {photos.map((item, index) => {
            const isActive = index === active;
            return (
              <ButtonBase
                key={item.key}
                role="listitem"
                onClick={() => setActive(index)}
                aria-current={isActive || undefined}
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  fontFamily: "inherit",
                  justifyContent: "flex-start",
                  gap: 2,
                  py: { xs: 0.75, md: 2 },
                  px: { xs: 1.5, md: 0 },
                  textAlign: "start",
                  borderBottom: { md: 1 },
                  borderColor: { md: "divider" },
                  borderRadius: { xs: 999, md: 0 },
                  bgcolor: { xs: isActive ? "action.selected" : "transparent", md: "transparent" },
                  color: isActive ? "primary.dark" : "text.secondary",
                  transition: "color 200ms",
                  "&:first-of-type": { borderTop: { md: 1 }, borderColor: { md: "divider" } },
                  "&:hover": { color: "primary.dark" },
                  "&:focus-visible": { outline: 2, outlineColor: "primary.main" },
                }}
              >
                <Box
                  component="span"
                  aria-hidden
                  sx={{
                    display: { xs: "none", md: "inline" },
                    width: 28,
                    fontSize: "1rem",
                    color: "warning.main",
                    opacity: isActive ? 1 : 0,
                    transition: "opacity 200ms",
                  }}
                >
                  {number.format(index + 1)}
                </Box>
                <Box component="span" sx={{ fontSize: { xs: "1rem", md: "1.45rem" } }}>
                  {text(item.key)}
                </Box>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>
    </LandingSection>
  );
};
