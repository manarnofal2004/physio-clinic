# 1. Landing page

| | |
| - | - |
| Route | `/` |
| Access | Public |
| Built by | Manar (all sections, navbar, footer, announcement bar). The booking section's form logic is Bayan's, see [report 2](02-booking.md). |
| Tasks | 1.6 (theme), 1.8 (i18n/RTL), 6.5, 6.7, 6.8, 6.9, 6.11 |

## Purpose

The clinic's public face: what Sanad treats, how booking works, what the clinic looks like, common questions and how to reach it, with a way to book a session without an account.

## Page structure

```
PublicLayout
├── AnnouncementBar          banners from the API, above the navbar
├── PublicNavbar             logo, section links, language, dark mode, log in / account menu, book button
├── LandingPage
│   ├── HeroSection          #top
│   ├── ServicesSection      #services
│   ├── HowItWorksSection    #how-it-works
│   ├── BookingSection       #booking
│   ├── GallerySection       #gallery
│   ├── FaqSection           #faq
│   └── ContactSection       #contact
└── PublicFooter
```

## Files

| File | Role |
| ---- | ---- |
| `features/landing/LandingPage.tsx` | Puts the sections in order |
| `features/landing/LandingSection.tsx` | Shared frame: one screen tall on wide screens, `SectionTitle` (italic Redaction / El Messiri), intro line |
| `features/landing/HeroSection.tsx` | Headline, buttons, opening hours; photo clipped by a wave (`wave.tsx`) |
| `features/landing/ServicesSection.tsx` | Six services as folder tabs over an olive panel with a photo |
| `features/landing/HowItWorksSection.tsx` | Three steps placed along a spine drawing |
| `features/landing/GallerySection.tsx` | Large photo that changes every 5 s, beside a torn-paper sheet with the other photos and handwritten names |
| `features/landing/FaqSection.tsx` | FAQ as a chat with the clinic: question bubbles, typing dots, answer bubbles |
| `features/landing/ContactSection.tsx` | Open/closed status in clinic time, week strip, details, Google map with a custom pin |
| `components/layout/PublicNavbar.tsx`, `UserMenu.tsx`, `useActiveSection.ts` | Navbar, account menu, highlighting the section in view |
| `components/layout/PublicFooter.tsx` | Footer with four clinic photos, links, phone, hours |
| `components/layout/useScrollToHash.ts` | New pages open at the top; `/#section` links land on the section |
| `features/banners/AnnouncementBar.tsx` | The announcement bar |

## Data and API

| Call | Used by | Notes |
| ---- | ------- | ----- |
| `GET /public/banners` | `AnnouncementBar` | React Query key `["banners","public"]`, cached 5 minutes |
| Booking calls | `BookingSection` | See [report 2](02-booking.md) |

All other content (texts, FAQ answers, opening hours, address) lives in the translation files, so it changes with the language and can be edited without touching components.

## How it works

- **One screen per section.** On wide screens each section is `calc(100svh - 50px)` tall (`SCREEN_HEIGHT`). When the announcement bar shows, it sets the CSS variable `--banner-height` and the hero shrinks by that amount. Media queries for short screens (`max-height: 700px`) tighten spacing. Checked at 1366×650, 1366×768, 1440×900 and 1920×1080.
- **Navbar.** `useActiveSection` uses an `IntersectionObserver` to know which section is on screen; that link gets a pale olive pill and a honey dot (`aria-current="location"`). Logged-in users see their initials and a menu (dashboard, log out) instead of "Log in". On phones the links move into a `Drawer`.
- **Announcement bar.** Rotates banners every 6 s (paused on hover/focus and for reduced motion). Two looks: announcement (olive, megaphone) and schedule update (honey, clock). Closing it stores `id:updatedAt` in `localStorage`, so an edited banner shows again.
- **Gallery.** `setTimeout` advances the photo every 5 s; paused on hover/focus and when the user prefers reduced motion. The paper sheet is a real torn-paper image (light and dark versions).
- **FAQ.** Tapping a question sets `typing` for 700 ms (dots), then shows the answer bubble. One answer open at a time. The background is a doodle pattern used as a CSS mask, so its colour follows the theme.
- **Contact.** `Intl.DateTimeFormat` with `Asia/Hebron` gives the clinic's weekday and hour; "Open now" / "Opens tomorrow at 8:00" is recomputed every minute. The map is a Google Maps embed; the red pin is replaced by the clinic's own pin (`pointer-events: none`, so the map stays usable).
- **Scrolling.** A new page starts at the top. A link such as "Book a session" from another page scrolls to `#booking` and re-checks for 1.5 s while images load, unless the visitor scrolls.

## States

| State | Handling |
| ----- | -------- |
| No banners / API down | The bar does not render; the rest of the page is unaffected |
| Reduced motion | Gallery, banner rotation and pulsing dots stop |
| Dark mode | Every colour comes from the theme; images have dark versions where needed (paper, logo) |

## Languages and direction

Every string is in `en.ts` / `ar.ts`. In Arabic the layout mirrors (photos, arrows, the spine drawing, the paper sheet). Section titles use El Messiri, intros Amiri, handwriting Aref Ruqaa.

## Responsive

Sections stack on phones (`xs`) and drop the one-screen rule; the navbar collapses into a drawer; no horizontal scrolling at 390 px.

## Accessibility

Landmarks (`header`, `nav`, `main`, `section` with `aria-labelledby`), `aria-live` on the banner text and FAQ answers, keyboard focus outlines on every control, alt text on content images (decorative images use `alt=""`).

## Known limitations

- The clinic's real address, phone, email and map coordinates are placeholders (`CLINIC_LOCATION` in `ContactSection.tsx`, texts in the translation files).
- The JavaScript bundle is about 1 MB; splitting the admin pages into separate chunks would make the first load faster.
- Section 6.6 "sessions running now" (Bayan) is not built yet.
