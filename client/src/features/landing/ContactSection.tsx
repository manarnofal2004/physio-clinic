import { useEffect, useState, type ReactNode } from "react";
import { Box, Button, Link, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Mail, MapPin, Navigation, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LandingSection } from "./LandingSection";

// Where the clinic is. For now the centre of Nablus: put the clinic's real
// coordinates here (right-click the place in Google Maps to copy them).
const CLINIC_LOCATION = { lat: 32.2211, lng: 35.2544 };

// Height of the map on wide screens: the screen minus the heading above it.
const MAP_HEIGHT = "calc(100svh - 230px)";

// Opening hours in the clinic's time zone: Sunday (0) to Thursday (4), 8:00–19:00.
const OPEN_DAYS = [0, 1, 2, 3, 4];
const OPEN_HOUR = 8;
const CLOSE_HOUR = 19;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Today's weekday (0 = Sunday) and hour at the clinic, wherever the visitor is.
const clinicNow = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Hebron",
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: WEEKDAYS.indexOf(part("weekday")), hour: Number(part("hour")) };
};

// A day's name in the page language (4 January 2026 was a Sunday).
const dayName = (day: number, language: string, width: "short" | "long") =>
  new Intl.DateTimeFormat(language, { weekday: width, timeZone: "UTC" }).format(
    new Date(Date.UTC(2026, 0, 4 + day)),
  );

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
  // "ll" centres the map without Google's red pin; our own pin sits in the middle.
  const mapSrc = `https://maps.google.com/maps?ll=${lat},${lng}&z=16&hl=${i18n.language}&output=embed`;

  // Whether the clinic is open right now, checked again every minute.
  const [now, setNow] = useState(clinicNow);
  useEffect(() => {
    const id = window.setInterval(() => setNow(clinicNow()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const isOpenDay = OPEN_DAYS.includes(now.day);
  const isOpen = isOpenDay && now.hour >= OPEN_HOUR && now.hour < CLOSE_HOUR;
  const nextOpen = () => {
    if (isOpenDay && now.hour < OPEN_HOUR) return t("landing.contact.opensToday");
    let ahead = 1;
    while (!OPEN_DAYS.includes((now.day + ahead) % 7)) ahead += 1;
    if (ahead === 1) return t("landing.contact.opensTomorrow");
    return t("landing.contact.opensOn", {
      day: dayName((now.day + ahead) % 7, i18n.language, "long"),
    });
  };
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
          {/* Open or closed right now, then the week with today marked. */}
          <Box aria-live="polite">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box
                aria-hidden
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: isOpen ? "primary.main" : "text.disabled",
                  flexShrink: 0,
                  ...(isOpen && {
                    "@keyframes contactPulse": {
                      "0%": { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.45)}` },
                      "100%": { boxShadow: `0 0 0 10px ${alpha(theme.palette.primary.main, 0)}` },
                    },
                    animation: "contactPulse 1.8s ease-out infinite",
                    "@media (prefers-reduced-motion: reduce)": { animation: "none" },
                  }),
                }}
              />
              <Typography
                component="p"
                variant="h3"
                sx={{ color: "primary.dark", fontSize: { xs: "1.8rem", md: "2.1rem" } }}
              >
                {isOpen ? t("landing.contact.openNow") : t("landing.contact.closedNow")}
              </Typography>
            </Box>
            <Typography color="text.secondary" sx={{ mt: 0.25, ms: 3.25, fontSize: "1.1rem" }}>
              {isOpen ? t("landing.contact.closesAt") : nextOpen()}
            </Typography>
          </Box>

          <Box
            component="ol"
            aria-label={t("landing.contact.week")}
            sx={{ display: "flex", gap: 0.75, listStyle: "none", p: 0, m: 0, mt: 2.5, mb: 3.5 }}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((day) => {
              const open = OPEN_DAYS.includes(day);
              const today = day === now.day;
              return (
                <Box
                  component="li"
                  key={day}
                  aria-current={today ? "date" : undefined}
                  sx={{
                    flex: 1,
                    textAlign: "center",
                    py: 0.75,
                    borderRadius: 2,
                    fontSize: "0.9rem",
                    bgcolor: today ? "primary.main" : open ? "action.selected" : "transparent",
                    color: today ? "primary.contrastText" : open ? "primary.dark" : "text.disabled",
                    border: open || today ? 0 : "1px dashed",
                    borderColor: "divider",
                  }}
                >
                  {dayName(day, i18n.language, "short")}
                </Box>
              );
            })}
          </Box>

          <Stack sx={{ gap: { xs: 2.5, md: 2.25 } }}>
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
          </Stack>

          <Stack direction="row" sx={{ mt: 4, gap: 1.5, flexWrap: "wrap" }}>
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
            position: "relative",
            p: "10px",
            borderRadius: "24px",
            bgcolor: "action.selected",
          }}
        >
          {/* Our own pin in the middle of the map: a bubble with the logo saying
              "Sanad is here", pointing at a honey dot that pulses. It lets clicks
              through to the map. */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, calc(-100% + 9px))",
              zIndex: 1,
              pointerEvents: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                ps: 0.75,
                pe: 2,
                py: 0.75,
                borderRadius: 999,
                bgcolor: "#fbf7ef",
                color: "#3f5622",
                fontWeight: 700,
                whiteSpace: "nowrap",
                boxShadow: "0 8px 20px -8px rgba(60, 50, 20, 0.45)",
              }}
            >
              <Box
                component="img"
                src="/favicon.png?v=3"
                alt=""
                sx={{ width: 30, height: 30, borderRadius: "50%", bgcolor: "#fff", p: "3px" }}
              />
              {t("landing.contact.here")}
            </Box>
            <Box sx={{ width: 2, height: 14, bgcolor: "#fbf7ef" }} />
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                bgcolor: "warning.main",
                border: "3px solid #fbf7ef",
                "@keyframes pinPulse": {
                  "0%": { boxShadow: "0 0 0 0 rgba(154, 107, 31, 0.5)" },
                  "100%": { boxShadow: "0 0 0 16px rgba(154, 107, 31, 0)" },
                },
                animation: "pinPulse 1.8s ease-out infinite",
                "@media (prefers-reduced-motion: reduce)": { animation: "none" },
              }}
            />
          </Box>
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
