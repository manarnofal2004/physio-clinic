import type { ReactNode } from "react";
import { Box, Button, Link, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LandingSection } from "./LandingSection";

// Where the clinic is. For now the centre of Nablus: put the clinic's real
// coordinates here (right-click the place in Google Maps to copy them).
const CLINIC_LOCATION = { lat: 32.2211, lng: 35.2544 };

// Height of the map on wide screens: the screen minus the heading above it.
const MAP_HEIGHT = "calc(100svh - 230px)";

interface DetailProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}

const Detail = ({ icon, label, children }: DetailProps) => (
  <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
    <Box aria-hidden sx={{ pt: 0.25 }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ mt: 0.25, fontSize: "1.1rem" }}>{children}</Box>
    </Box>
  </Box>
);

// How to reach the clinic: the details and two buttons on one side, and a live
// Google map on the other that visitors can move and zoom, in a pale olive frame
// like the other framed pictures. The texts live in the translation files.
export const ContactSection = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const phone = t("landing.contact.phone");
  const email = t("landing.contact.email");
  const { lat, lng } = CLINIC_LOCATION;
  const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=16&hl=${i18n.language}&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <LandingSection
      id="contact"
      title={t("landing.contact.title")}
      intro={t("landing.contact.intro")}
      alignTop
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 2fr) minmax(0, 3fr)" },
          gap: { xs: 4, md: 6 },
          alignItems: "center",
          mt: { md: 1 },
        }}
      >
        <Box>
          <Stack sx={{ gap: { xs: 3, md: 3.5 } }}>
            <Detail icon={<MapPin />} label={t("landing.contact.addressLabel")}>
              {t("landing.contact.address")}
            </Detail>
            <Detail icon={<Phone />} label={t("landing.contact.phoneLabel")}>
              {/* Phone numbers read left to right in Arabic too. */}
              <Link href={`tel:${phone.replace(/\s/g, "")}`} underline="hover" dir="ltr">
                {phone}
              </Link>
            </Detail>
            <Detail icon={<Mail />} label={t("landing.contact.emailLabel")}>
              <Link href={`mailto:${email}`} underline="hover">
                {email}
              </Link>
            </Detail>
            <Detail icon={<Clock />} label={t("landing.contact.hoursLabel")}>
              {t("landing.contact.hours")}
              <Typography color="text.secondary" sx={{ mt: 0.25 }}>
                {t("landing.contact.closed")}
              </Typography>
            </Detail>
          </Stack>

          <Stack direction="row" sx={{ mt: { xs: 4, md: 5 }, gap: 1.5, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<Navigation size={18} />}
              sx={{ px: 2.5 }}
            >
              {t("landing.contact.directions")}
            </Button>
            <Button
              variant="outlined"
              href={`tel:${phone.replace(/\s/g, "")}`}
              startIcon={<Phone size={18} />}
              sx={{ px: 2.5 }}
            >
              {t("landing.contact.call")}
            </Button>
          </Stack>
        </Box>

        {/* The live map in a pale olive frame. In dark mode the map's colours are
            turned around so it is not a bright square on the dark page. */}
        <Box
          sx={{
            p: "10px",
            borderRadius: "24px",
            bgcolor: "action.selected",
          }}
        >
          <Box
            component="iframe"
            title={t("landing.contact.mapTitle")}
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sx={{
              display: "block",
              width: "100%",
              height: { xs: 320, md: MAP_HEIGHT },
              border: 0,
              borderRadius: "16px",
              // Softer colours that sit with the beige and olive of the page.
              filter:
                theme.palette.mode === "light"
                  ? "saturate(0.75) sepia(0.12)"
                  : "invert(0.9) hue-rotate(180deg) saturate(0.6)",
            }}
          />
        </Box>
      </Box>
    </LandingSection>
  );
};
