// English texts. ar.ts must have the same keys (TypeScript checks it).
export const en = {
  brand: {
    name: "Sanad",
    fullName: "Sanad Physiotherapy",
  },
  nav: {
    sections: "Page sections",
    services: "Services",
    howItWorks: "How it works",
    gallery: "Gallery",
    faq: "FAQ",
    contact: "Contact",
    logIn: "Log in",
    book: "Book a session",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  admin: {
    navigation: "Admin navigation",
    dashboard: "Dashboard",
    patients: "Patients",
    reports: "Reports",
    reservations: "Reservations",
    therapists: "Therapists",
    users: "Users",
    banners: "Banners",
  },
  settings: {
    lightMode: "Switch to light mode",
    darkMode: "Switch to dark mode",
    // The switcher shows the language you can switch to, written in that language.
    otherLanguage: "العربية",
    switchLanguage: "التبديل إلى العربية",
  },
  notFound: {
    message: "This page could not be found.",
    backHome: "Back to home",
  },
};

export type Translation = typeof en;
