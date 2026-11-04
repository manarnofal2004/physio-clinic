import { useState, type MouseEvent } from "react";
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
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { landingSections } from "./landingSections";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NAVBAR_HEIGHT } from "./navbarHeight";
import { useColorMode } from "@/theme/colorModeContext";
import { ThemeToggle } from "./ThemeToggle";
import { useActiveSection } from "./useActiveSection";

const sections = landingSections;
const sectionIds = sections.map((section) => section.id);

const BOOKING_ID = "booking";

export const PublicNavbar = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });
  const [menuOpen, setMenuOpen] = useState(false);
  const { mode } = useColorMode();
  const active = useActiveSection(sectionIds);
  const location = useLocation();

  // On the home page the logo scrolls back to the top (and clears "#services" etc.);
  // on other pages it is a normal link home.
  const backToTop = (event: MouseEvent) => {
    setMenuOpen(false);
    if (location.pathname !== "/") return;
    event.preventDefault();
    window.history.replaceState(null, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const brand = (
    <Link
      component={RouterLink}
      to="/"
      underline="none"
      color="inherit"
      onClick={backToTop}
      sx={{ display: "flex", alignItems: "center" }}
    >
      {/* The full logo (a figure with a spine held by a hand, "SANAD" and "سَنَد");
          dark mode uses a copy in lighter colours so it stays readable on the dark bar. */}
      <Box
        component="img"
        src={mode === "dark" ? "/logo-full-dark.png?v=3" : "/logo-full.png?v=3"}
        alt={t("brand.name")}
        sx={{ height: 54, width: "auto", display: "block" }}
      />
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
            spacing={0.5}
            sx={{ marginInlineStart: 2 }}
          >
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`/#${section.id}`}
                underline="none"
                aria-current={section.id === active ? "location" : undefined}
                sx={{
                  px: 1.75,
                  py: 0.75,
                  borderRadius: 999,
                  color: "text.secondary",
                  transition: "color 150ms, background-color 200ms",
                  "&:hover": { color: "primary.main", bgcolor: "action.hover" },
                  // The current section sits on a soft olive pill, with a small honey
                  // dot before it.
                  "&[aria-current]": {
                    color: "primary.main",
                    bgcolor: "action.selected",
                    "&::before": {
                      content: '""',
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "warning.main",
                      marginInlineEnd: 1,
                      verticalAlign: "middle",
                    },
                  },
                }}
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
              selected={section.id === active}
              aria-current={section.id === active ? "location" : undefined}
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
