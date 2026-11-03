import { useRef, useState } from "react";
import { Box, ButtonBase, Dialog, IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";

type PhotoKey = keyof Translation["landing"]["gallery"];

interface Photo {
  key: PhotoKey; // caption and alt text
  src: string;
}

const photos: Photo[] = [
  { key: "reception", src: "/images/gallery/reception.webp" },
  { key: "treatment", src: "/images/gallery/treatment.webp" },
  { key: "handsOn", src: "/images/gallery/hands-on.webp" },
  { key: "exercise", src: "/images/gallery/exercise.webp" },
  { key: "waiting", src: "/images/gallery/waiting.webp" },
];

// Tall photos fill the screen below the heading; on phones they are a bit shorter.
const PHOTO_HEIGHT = { xs: "62svh", md: "calc(100svh - 300px)" };
const GAP = 20;

// A strip of tall photos, like walking through the clinic: about two and a half
// show at once and the next one peeks in from the edge. Arrows, a drag or a swipe
// move along; clicking a photo opens it large.
export const GallerySection = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const stripRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState<Photo | null>(null);

  // Moves the strip by one photo. In Arabic "next" is towards the left.
  const move = (step: 1 | -1) => {
    const strip = stripRef.current;
    const first = strip?.firstElementChild as HTMLElement | null;
    if (!strip || !first) return;
    const distance = (first.offsetWidth + GAP) * step * (isRtl ? -1 : 1);
    strip.scrollBy({ left: distance, behavior: "smooth" });
  };

  const Back = isRtl ? ArrowRight : ArrowLeft;
  const Next = isRtl ? ArrowLeft : ArrowRight;
  const arrow = {
    border: 1,
    borderColor: "divider",
    "&:hover": { bgcolor: "action.selected" },
  };

  return (
    <LandingSection
      id="gallery"
      title={t("landing.gallery.title")}
      intro={t("landing.gallery.intro")}
      alignTop
    >
      <Box
        component="ul"
        ref={stripRef}
        sx={{
          m: 0,
          p: 0,
          listStyle: "none",
          display: "flex",
          gap: `${GAP}px`,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {photos.map((photo) => (
          <Box
            component="li"
            key={photo.key}
            sx={{
              flexShrink: 0,
              height: PHOTO_HEIGHT,
              aspectRatio: "3 / 4",
              scrollSnapAlign: "start",
            }}
          >
            <ButtonBase
              onClick={() => setOpen(photo)}
              aria-label={`${t("landing.gallery.open")}: ${t(`landing.gallery.${photo.key}`)}`}
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: 4,
                overflow: "hidden",
                "&:focus-visible": { outline: 2, outlineColor: "primary.main", outlineOffset: 2 },
                "& img": { transition: "transform 500ms ease-out" },
                "&:hover img": { transform: "scale(1.03)" },
                "@media (prefers-reduced-motion: reduce)": { "& img": { transition: "none" } },
              }}
            >
              <Box
                component="img"
                src={photo.src}
                alt={t(`landing.gallery.${photo.key}`)}
                loading="lazy"
                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              {/* The name of the place, on a soft dark fade at the bottom. */}
              <Box
                sx={{
                  position: "absolute",
                  insetInline: 0,
                  bottom: 0,
                  pt: 8,
                  pb: 2.5,
                  px: 3,
                  textAlign: "start",
                  color: "common.white",
                  fontSize: "1.3rem",
                  background: "linear-gradient(to top, rgba(20, 26, 12, 0.6), transparent)",
                }}
              >
                {t(`landing.gallery.${photo.key}`)}
              </Box>
            </ButtonBase>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 1, mt: 2.5, justifyContent: "flex-end" }}>
        <IconButton onClick={() => move(-1)} aria-label={t("landing.gallery.previous")} sx={arrow}>
          <Back />
        </IconButton>
        <IconButton onClick={() => move(1)} aria-label={t("landing.gallery.next")} sx={arrow}>
          <Next />
        </IconButton>
      </Box>

      <Dialog
        open={open !== null}
        onClose={() => setOpen(null)}
        maxWidth="lg"
        slotProps={{
          paper: { sx: { bgcolor: "transparent", boxShadow: "none", m: 2, position: "relative" } },
        }}
      >
        {open && (
          <>
            <Box
              component="img"
              src={open.src}
              alt={t(`landing.gallery.${open.key}`)}
              sx={{ display: "block", maxWidth: "100%", maxHeight: "85vh", borderRadius: 3 }}
            />
            <Typography
              sx={{ position: "absolute", bottom: 16, insetInlineStart: 20, color: "common.white" }}
            >
              {t(`landing.gallery.${open.key}`)}
            </Typography>
            <IconButton
              onClick={() => setOpen(null)}
              aria-label={t("landing.gallery.close")}
              sx={{
                position: "absolute",
                top: 12,
                insetInlineEnd: 12,
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              <X />
            </IconButton>
          </>
        )}
      </Dialog>
    </LandingSection>
  );
};
