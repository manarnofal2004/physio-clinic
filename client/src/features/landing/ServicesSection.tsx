import { Box, Typography } from "@mui/material";
import { Activity, Bone, Brain, Dumbbell, Hand, PersonStanding } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";

type ServiceKey = keyof Translation["landing"]["services"];

const services: { icon: ReactNode; title: ServiceKey; text: ServiceKey }[] = [
  { icon: <PersonStanding size={30} />, title: "backNeck", text: "backNeckText" },
  { icon: <Dumbbell size={30} />, title: "sports", text: "sportsText" },
  { icon: <Activity size={30} />, title: "surgery", text: "surgeryText" },
  { icon: <Bone size={30} />, title: "joints", text: "jointsText" },
  { icon: <Brain size={30} />, title: "neuro", text: "neuroText" },
  { icon: <Hand size={30} />, title: "manual", text: "manualText" },
];

// A plain grid: each service is an icon, a title and one line, separated by a thin
// line on top instead of a card.
export const ServicesSection = () => {
  const { t } = useTranslation();

  return (
    <LandingSection
      id="services"
      title={t("landing.services.title")}
      intro={t("landing.services.intro")}
    >
      <Box
        component="ul"
        sx={{
          m: 0,
          p: 0,
          listStyle: "none",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
          columnGap: 5,
          rowGap: { xs: 4, md: 6 },
        }}
      >
        {services.map((service) => (
          <Box
            component="li"
            key={service.title}
            sx={{ borderTop: 1, borderColor: "divider", pt: 3 }}
          >
            {service.icon}
            <Typography variant="h5" component="h3" sx={{ mt: 2 }}>
              {t(`landing.services.${service.title}`)}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {t(`landing.services.${service.text}`)}
            </Typography>
          </Box>
        ))}
      </Box>
    </LandingSection>
  );
};
