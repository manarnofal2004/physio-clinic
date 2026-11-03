import { useState } from "react";
import { Box, ButtonBase, Dialog, IconButton, Typography } from "@mui/material";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";

type PhotoKey = keyof Translation["landing"]["gallery"];

interface Photo {
  key: PhotoKey; // caption and alt text
  src: string;
  area: string; // grid area on wide screens
}

const photos: Photo[] = [
  { key: "treatment", src: "/images/gallery/treatment.webp", area: "a" },
  { key: "handsOn", src: "/images/gallery/hands-on.webp", area: "b" },
  { key: "exercise", src: "/images/gallery/exercise.webp", area: "c" },
  { key: "reception", src: "/images/gallery/reception.webp", area: "d" },
  { key: "waiting", src: "/images/gallery/waiting.webp", area: "e" },
];

// An uneven grid of photos (one large, two tall, two wide) with a caption under each.
// Clicking a photo opens it large; Escape or the cross closes it.
export const GallerySection = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<Photo | null>(null);

  return (
    <LandingSection
      id="gallery"
      title={t("landing.gallery.title")}
      intro={t("landing.gallery.intro")}
    >
      <Box
        component="ul"
        sx={{
          m: 0,
          p: 0,
          listStyle: "none",
          display: "grid",
          gap: { xs: 2, md: 2.5 },
          gridTemplateColumns: { xs: "1fr 1fr", md: "2fr 1fr 1fr" },
          gridTemplateAreas: {
            xs: '"a a" "b e" "c c" "d d"',
            md: '"a b e" "a b e" "c c d"',
          },
          gridAutoRows: { xs: 200, md: "clamp(110px, calc((100svh - 400px) / 3), 190px)" },
        }}
      >
        {photos.map((photo) => (
          <Box
            component="li"
            key={photo.key}
            sx={{ gridArea: photo.area, display: "flex", flexDirection: "column", minHeight: 0 }}
          >
            <ButtonBase
              onClick={() => setOpen(photo)}
              aria-label={`${t("landing.gallery.open")}: ${t(`landing.gallery.${photo.key}`)}`}
              sx={{
                flex: 1,
                minHeight: 0,
                borderRadius: 3,
                overflow: "hidden",
                "&:focus-visible": { outline: 2, outlineColor: "primary.main", outlineOffset: 2 },
                "& img": { transition: "transform 400ms ease-out" },
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
            </ButtonBase>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t(`landing.gallery.${photo.key}`)}
            </Typography>
          </Box>
        ))}
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
