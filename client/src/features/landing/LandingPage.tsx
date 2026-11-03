import { HeroSection } from "./HeroSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { ServicesSection } from "./ServicesSection";

// Sections are added here as they are built (6.9, 6.10, 6.6, 6.5); 6.11 finishes the page.
export const LandingPage = () => (
  <>
    <HeroSection />
    <ServicesSection />
    <HowItWorksSection />
  </>
);
