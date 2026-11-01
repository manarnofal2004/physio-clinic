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
  landing: {
    hero: {
      title: "Move without pain, one session at a time",
      subtitle:
        "Sanad is a physiotherapy clinic for back pain, sports injuries and recovery after surgery. Book a session online in a minute, no account needed.",
      book: "Book a session",
      howItWorks: "How it works",
      hours: "Sunday to Thursday, 8:00 to 19:00",
      session: "45-minute sessions",
      imageAlt: "A physiotherapist examining a patient's knee",
    },
    services: {
      title: "What we treat",
      intro: "Every plan starts with an assessment and is built around your goals.",
      backNeck: "Back and neck pain",
      backNeckText: "Posture, disc problems and long-standing pain.",
      sports: "Sports injuries",
      sportsText: "Sprains, strains and a safe return to training.",
      surgery: "Recovery after surgery",
      surgeryText: "Knee, hip and shoulder rehabilitation.",
      joints: "Joints and arthritis",
      jointsText: "Less stiffness and easier movement every day.",
      neuro: "Neurological rehabilitation",
      neuroText: "Balance, walking and strength after stroke.",
      manual: "Manual therapy",
      manualText: "Hands-on treatment, massage and stretching.",
    },
    how: {
      title: "How it works",
      bookTitle: "Book online",
      bookText: "Choose a day and a free time. You only need your name and phone number.",
      confirmTitle: "We confirm",
      confirmText: "The clinic reviews your request and confirms the time with you.",
      visitTitle: "Your session",
      visitText: "Meet your physiotherapist for 45 minutes and leave with a plan.",
    },
  },
  notFound: {
    message: "This page could not be found.",
    backHome: "Back to home",
  },
};

export type Translation = typeof en;
