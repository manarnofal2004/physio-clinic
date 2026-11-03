import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { BookingForm } from "@/features/booking/BookingForm";
import { LandingSection } from "./LandingSection";

export const BookingSection = () => {
  const { t } = useTranslation();

  return (
    <LandingSection id="booking" title={t("booking.title")} intro={t("booking.intro")}>
      <Box sx={{ maxWidth: 720 }}>
        <BookingForm />
      </Box>
    </LandingSection>
  );
};
