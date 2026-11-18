import { AvailabilitySection } from "./AvailabilitySection";
import { BookingSection } from "./BookingSection";
import { ContactSection } from "./ContactSection";
import { FaqSection } from "./FaqSection";
import { GallerySection } from "./GallerySection";
import { HeroSection } from "./HeroSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { ServicesSection } from "./ServicesSection";

// Booking comes right after "How it works", which explains it, and today's
// availability sits just above the form, so a visitor sees what is free before booking.
export const LandingPage = () => (
  <>
    <HeroSection />
    <ServicesSection />
    <HowItWorksSection />
    <AvailabilitySection />
    <BookingSection />
    <GallerySection />
    <FaqSection />
    <ContactSection />
  </>
);
