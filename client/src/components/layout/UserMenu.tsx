import { useState } from "react";
import {
  Avatar,
  Box,
  ButtonBase,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import type { User } from "@shared/api-types";
import { homePathFor } from "@/features/auth/homePath";
import { useAuth } from "@/features/auth/useAuth";

// The first letter of the first and last name, e.g. "Lina Haddad" -> "LH".
const initials = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
};

// The user's initials in a pale olive circle.
export const UserAvatar = ({ user, size = 32 }: { user: User; size?: number }) => (
  <Avatar
    sx={{
      width: size,
      height: size,
      fontSize: size * 0.4,
      fontWeight: 700,
      bgcolor: "action.selected",
      color: "primary.dark",
    }}
  >
    {initials(user.fullName)}
  </Avatar>
);

// For a logged-in user, in place of the "Log in" button: their initials and first
// name, opening a menu with their name and role, a link to their dashboard (admins
// and physiotherapists) and "Log out".
export const UserMenu = ({ user }: { user: User }) => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  // The menu lines up with the outer edge of the button: right in English, left in Arabic.
  const side = useTheme().direction === "rtl" ? "left" : "right";
  const home = homePathFor(user.role);
  const close = () => setAnchor(null);

  return (
    <>
      <ButtonBase
        onClick={(event) => setAnchor(event.currentTarget)}
        aria-label={t("nav.account")}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          paddingInlineStart: "4px",
          paddingInlineEnd: "8px",
          py: 0.5,
          borderRadius: 999,
          fontFamily: "inherit",
          color: "text.primary",
          "&:hover": { bgcolor: "action.hover" },
          "&.Mui-focusVisible": { outline: 2, outlineColor: "primary.main" },
        }}
      >
        <UserAvatar user={user} />
        <Box component="span" sx={{ fontSize: "0.95rem" }}>
          {user.fullName.split(" ")[0]}
        </Box>
        <ChevronDown size={16} />
      </ButtonBase>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: side }}
        transformOrigin={{ vertical: "top", horizontal: side }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 220, borderRadius: 2 } } }}
      >
        <Box sx={{ px: 2, py: 1.25 }}>
          <Typography sx={{ fontWeight: 700 }}>{user.fullName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t(`roles.${user.role}`)}
          </Typography>
        </Box>
        <Divider />
        {home !== "/" && (
          <MenuItem component={RouterLink} to={home} onClick={close}>
            <ListItemIcon>
              <LayoutDashboard size={18} />
            </ListItemIcon>
            {t("nav.dashboard")}
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            close();
            logout();
            navigate("/");
          }}
        >
          <ListItemIcon>
            <LogOut size={18} />
          </ListItemIcon>
          {t("nav.logOut")}
        </MenuItem>
      </Menu>
    </>
  );
};
