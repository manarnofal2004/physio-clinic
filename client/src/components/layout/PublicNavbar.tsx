import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import type { Translation } from "@/i18n/locales/en";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NAVBAR_HEIGHT } from "./navbarHeight";
import { ThemeToggle } from "./ThemeToggle";

// Sections of the landing page (6.8 and 6.9 give them these ids).
const sections: { id: string; labelKey: keyof Translation["nav"] }[] = [
  { id: "services", labelKey: "services" },
  { id: "how-it-works", labelKey: "howItWorks" },
  { id: "gallery", labelKey: "gallery" },
  { id: "faq", labelKey: "faq" },
  { id: "contact", labelKey: "contact" },
];

const BOOKING_ID = "booking";

export const PublicNavbar = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });
  const [menuOpen, setMenuOpen] = useState(false);

  const brand = (
    <Link
      component={RouterLink}
      to="/"
      underline="none"
      color="inherit"
      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
    >
      <Box component="img" src="/logo-mark.png" alt="" sx={{ width: 40, height: 40 }} />
      <Typography
        component="span"
        sx={{ fontSize: "1.25rem", fontWeight: 700, color: "primary.main" }}
      >
        {t("brand.name")}
      </Typography>
    </Link>
  );

  const bookButton = (
    <Button variant="contained" href={`/#${BOOKING_ID}`} onClick={() => setMenuOpen(false)}>
      {t("nav.book")}
    </Button>
  );

  const loginButton = (
    <Button component={RouterLink} to="/login" color="inherit" onClick={() => setMenuOpen(false)}>
      {t("nav.logIn")}
    </Button>
  );

  return (
    <AppBar
      position="sticky"
      color="inherit"
      sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.default" }}
    >
      <Toolbar sx={{ gap: 3, px: { md: 4 }, minHeight: NAVBAR_HEIGHT }}>
        {brand}

        {isDesktop && (
          <Stack
            component="nav"
            aria-label={t("nav.sections")}
            direction="row"
            spacing={3}
            sx={{ marginInlineStart: 3 }}
          >
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`/#${section.id}`}
                underline="none"
                color="text.secondary"
                sx={{ "&:hover": { color: "primary.main" } }}
              >
                {t(`nav.${section.labelKey}`)}
              </Link>
            ))}
          </Stack>
        )}

        <Stack direction="row" spacing={1} sx={{ alignItems: "center", marginInlineStart: "auto" }}>
          <LanguageSwitcher />
          <ThemeToggle />
          {isDesktop && loginButton}
          {isDesktop && bookButton}
          {!isDesktop && (
            <IconButton edge="end" onClick={() => setMenuOpen(true)} aria-label={t("nav.openMenu")}>
              <MenuIcon />
            </IconButton>
          )}
        </Stack>
      </Toolbar>

      {/* Mobile: the same links and actions in a side panel. */}
      <Drawer
        anchor="right"
        open={!isDesktop && menuOpen}
        onClose={() => setMenuOpen(false)}
        slotProps={{ paper: { sx: { width: 280, p: 2 } } }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}
        >
          {brand}
          <IconButton onClick={() => setMenuOpen(false)} aria-label={t("nav.closeMenu")}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <List component="nav" aria-label={t("nav.sections")}>
          {sections.map((section) => (
            <ListItemButton
              key={section.id}
              component="a"
              href={`/#${section.id}`}
              onClick={() => setMenuOpen(false)}
            >
              <ListItemText primary={t(`nav.${section.labelKey}`)} />
            </ListItemButton>
          ))}
        </List>
        <Stack spacing={1} sx={{ mt: 2 }}>
          {bookButton}
          {loginButton}
        </Stack>
      </Drawer>
    </AppBar>
  );
};
