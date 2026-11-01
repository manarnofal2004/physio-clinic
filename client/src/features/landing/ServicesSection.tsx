import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Activity, Bone, Brain, Dumbbell, Hand, PersonStanding } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";

type ServiceKey = keyof Translation["landing"]["services"];

interface Service {
  icon: ReactNode;
  image?: string; // a service without a photo yet shows a pale olive area instead
  title: ServiceKey;
  text: ServiceKey;
}

const ICON_SIZE = 24;

const services: Service[] = [
  {
    icon: <PersonStanding size={ICON_SIZE} />,
    image: "/images/services/back-neck.webp",
    title: "backNeck",
    text: "backNeckText",
  },
  {
    icon: <Dumbbell size={ICON_SIZE} />,
    image: "/images/services/sports.webp",
    title: "sports",
    text: "sportsText",
  },
  { icon: <Activity size={ICON_SIZE} />, title: "surgery", text: "surgeryText" },
  { icon: <Bone size={ICON_SIZE} />, title: "joints", text: "jointsText" },
  {
    icon: <Brain size={ICON_SIZE} />,
    image: "/images/services/neuro.webp",
    title: "neuro",
    text: "neuroText",
  },
  {
    icon: <Hand size={ICON_SIZE} />,
    image: "/images/services/manual.webp",
    title: "manual",
    text: "manualText",
  },
];

// One card per service: a photo inset at the top, an olive badge with the
// service's icon overlapping the photo's lower edge, then the title and one line.
export const ServicesSection = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const paper = theme.palette.background.paper;

  return (
    <LandingSection
      id="services"
      title={t("landing.services.title")}
      intro={t("landing.services.intro")}
      wash
    >
      <Box
        component="ul"
        sx={{
          m: 0,
          p: 0,
          listStyle: "none",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
          gap: 3,
        }}
      >
        {services.map((service) => (
          <Box
            component="li"
            key={service.title}
            sx={{ bgcolor: "background.paper", borderRadius: 4, p: 1.25 }}
          >
            <Box sx={{ position: "relative" }}>
              {service.image ? (
                <Box
                  component="img"
                  src={service.image}
                  alt=""
                  loading="lazy"
                  width={800}
                  height={600}
                  sx={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    aspectRatio: "4 / 3",
                    objectFit: "cover",
                    borderRadius: 3,
                  }}
                />
              ) : (
                <Box sx={{ aspectRatio: "4 / 3", borderRadius: 3, bgcolor: "action.selected" }} />
              )}
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  insetInlineStart: 16,
                  bottom: -26,
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  border: `4px solid ${paper}`,
                  // The icon follows the badge's text colour, not the global honey.
                  "& svg": { stroke: "currentColor" },
                }}
              >
                {service.icon}
              </Box>
            </Box>
            <Box sx={{ px: 1.5, pt: 5, pb: 2 }}>
              <Typography variant="h5" component="h3">
                {t(`landing.services.${service.title}`)}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {t(`landing.services.${service.text}`)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </LandingSection>
  );
};
