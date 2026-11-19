import { useTranslation } from "react-i18next";
import { BookingForm } from "@/features/booking/BookingForm";
import { LandingSection } from "./LandingSection";

// The booking form beside an appointment card that fills in as the visitor types.
export const BookingSection = () => {
  const { t } = useTranslation();

  return (
    <LandingSection id="booking" title={t("booking.title")} intro={t("booking.intro")} alignTop>
      <BookingForm />
    </LandingSection>
  );
};
