import { useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Menu as MenuIcon, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import type { PanelNavItem } from "./panelNavItem";

const DRAWER_WIDTH = 190;
const COLLAPSED_WIDTH = 76; // icons only, the names in tooltips
const COLLAPSED_KEY = "panel-collapsed";
const CURVE = 22; // radius of the curves where the chosen tab meets the page

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
};
// The sidebar's deep olive, a shade darker at night; its text is cream.
const SIDEBAR_BG = { light: "#3f5622", dark: "#10150c" };
const CREAM = "#f5eee3";

// The shell of the staff panels: a deep olive sidebar with the logo and links, and the
// page on a beige sheet with rounded corners beside it. The chosen link is a beige tab
// that joins the sheet, with curved corners above and below it. Each panel passes its
// links.
export const PanelLayout = ({ navItems }: { navItems: PanelNavItem[] }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  // The narrow sidebar is a desktop choice, remembered between visits.
  const [collapsedChoice, setCollapsedChoice] = useState(readCollapsed);
  const collapsed = isDesktop && collapsedChoice;
  const width = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;
  const sheet = theme.palette.background.default;
  const sidebarBg = SIDEBAR_BG[theme.palette.mode];

  const closeMobile = () => setMobileOpen(false);
  const toggleCollapsed = () => {
    const next = !collapsedChoice;
    setCollapsedChoice(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
    } catch {
      // Private windows may refuse; the choice then lasts for this visit only.
    }
  };

  const drawerContent = (
    <Box sx={{ py: 3, color: CREAM }}>
      <Box
        component={RouterLink}
        to="/"
        sx={{
          display: "block",
          px: collapsed ? 0 : 2.5,
          mb: 4,
          textAlign: collapsed ? "center" : "start",
        }}
        aria-label={t("brand.name")}
      >
        {collapsed ? (
          <Box component="img" src="/favicon.png?v=3" alt="" sx={{ height: 40 }} />
        ) : (
          <Box component="img" src="/logo-full-dark.png?v=3" alt="" sx={{ height: 48 }} />
        )}
      </Box>
      <List
        component="nav"
        aria-label={t("panel.navigation")}
        sx={{ paddingInlineStart: "16px", py: 0 }}
      >
        {navItems.map((item) => (
          <Tooltip
            key={item.path}
            title={collapsed ? t(`panel.${item.labelKey}`) : ""}
            placement="right"
          >
            <ListItemButton
              component={NavLink}
              to={item.path}
              end={item.path === "/admin" || item.path === "/therapist"}
              onClick={closeMobile}
              disableRipple
              aria-label={collapsed ? t(`panel.${item.labelKey}`) : undefined}
              sx={{
                position: "relative",
                mb: 0.5,
                py: 1.25,
                ...(collapsed && { justifyContent: "center", paddingInlineStart: "8px" }),
                color: "inherit",
                opacity: 0.85,
                borderTopLeftRadius: 999,
                borderBottomLeftRadius: 999,
                ...(!isDesktop && { borderRadius: 999, marginInlineEnd: "16px" }),
                "&:hover": { bgcolor: "rgba(245, 238, 227, 0.08)", opacity: 1 },
                // The chosen page: a beige tab joined to the sheet.
                "&.active": {
                  bgcolor: sheet,
                  color: "primary.dark",
                  opacity: 1,
                  fontWeight: 700,
                  // The curves above and below where the tab meets the sheet.
                  ...(isDesktop && {
                    "&::before, &::after": {
                      content: '""',
                      position: "absolute",
                      right: 0,
                      width: CURVE,
                      height: CURVE,
                      pointerEvents: "none",
                    },
                    "&::before": {
                      top: -CURVE,
                      borderBottomRightRadius: CURVE,
                      boxShadow: `${CURVE / 2}px ${CURVE / 2}px 0 ${CURVE / 2}px ${sheet}`,
                    },
                    "&::after": {
                      bottom: -CURVE,
                      borderTopRightRadius: CURVE,
                      boxShadow: `${CURVE / 2}px -${CURVE / 2}px 0 ${CURVE / 2}px ${sheet}`,
                    },
                  }),
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: collapsed ? 0 : 34 }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={t(`panel.${item.labelKey}`)}
                  slotProps={{ primary: { sx: { fontWeight: "inherit", whiteSpace: "nowrap" } } }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: sidebarBg }}>
      <Box
        component="aside"
        sx={{
          width: { md: width },
          flexShrink: { md: 0 },
          transition: "width 200ms ease",
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        }}
      >
        <Drawer
          variant={isDesktop ? "permanent" : "temporary"}
          anchor="left"
          open={isDesktop || mobileOpen}
          onClose={closeMobile}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: isDesktop ? width : DRAWER_WIDTH,
              transition: "width 200ms ease",
              "@media (prefers-reduced-motion: reduce)": { transition: "none" },
              boxSizing: "border-box",
              bgcolor: sidebarBg,
              border: 0,
              // Let the tab's curves show over the sheet's edge.
              overflow: "visible",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* The page on a beige sheet, rounded on the side by the sidebar. */}
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
          my: { md: 1.5 },
          marginInlineEnd: { md: "12px" },
          borderRadius: { md: "28px" },
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            px: { xs: 2, md: 3 },
            py: 1.5,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          {isDesktop ? (
            <Tooltip title={collapsed ? t("panel.expand") : t("panel.collapse")}>
              <IconButton
                edge="start"
                onClick={toggleCollapsed}
                aria-label={collapsed ? t("panel.expand") : t("panel.collapse")}
                aria-pressed={collapsed}
                sx={{ "[dir=rtl] & svg": { transform: "scaleX(-1)" } }}
              >
                {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
              </IconButton>
            </Tooltip>
          ) : (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              aria-label={t("nav.openMenu")}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <LanguageSwitcher />
          <ThemeToggle />
          {user && <UserMenu user={user} />}
        </Stack>
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
