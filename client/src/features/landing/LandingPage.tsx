import { BookingSection } from "./BookingSection";
import { ContactSection } from "./ContactSection";
import { FaqSection } from "./FaqSection";
import { GallerySection } from "./GallerySection";
import { HeroSection } from "./HeroSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { ServicesSection } from "./ServicesSection";

// Sections are added here as they are built (6.6); 6.11 finishes the page.
// Booking comes right after "How it works", which explains it.
export const LandingPage = () => (
  <>
    <HeroSection />
    <ServicesSection />
    <HowItWorksSection />
    <BookingSection />
    <GallerySection />
    <FaqSection />
    <ContactSection />
  </>
);
