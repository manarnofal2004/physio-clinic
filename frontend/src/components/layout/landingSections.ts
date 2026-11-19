import type { Translation } from "@/i18n/locales/en";

// Sections of the landing page, in page order. The navbar and the footer link to
// "/#id", and each section uses the same id.
export const landingSections: { id: string; labelKey: keyof Translation["nav"] }[] = [
  { id: "services", labelKey: "services" },
  { id: "how-it-works", labelKey: "howItWorks" },
  { id: "gallery", labelKey: "gallery" },
  { id: "faq", labelKey: "faq" },
  { id: "contact", labelKey: "contact" },
];
