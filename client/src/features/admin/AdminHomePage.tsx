import { Box, ButtonBase, Paper, Stack, Typography } from "@mui/material";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { adminNavItems } from "@/components/layout/adminNavItems";
import { useAuth } from "@/features/auth/useAuth";

// The pages that work today; the dashboard (7.x) will take this page's place.
const shortcuts = ["users", "therapists", "reports", "banners"] as const;

export const AdminHomePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const items = shortcuts.map((key) => adminNavItems.find((item) => item.labelKey === key)!);

  return (
    <>
      <PageHeader
        title={t("adminHome.welcome", { name: user?.fullName })}
        subtitle={t("adminHome.intro")}
      />
      <Paper variant="outlined">
        {items.map((item) => (
          <ButtonBase
            key={item.path}
            component={RouterLink}
            to={item.path}
            sx={{
              width: "100%",
              justifyContent: "flex-start",
              textAlign: "start",
              px: { xs: 2, sm: 3 },
              py: 2,
              gap: 2,
              borderBottom: 1,
              borderColor: "divider",
              "&:last-of-type": { borderBottom: 0 },
              "&:hover": { bgcolor: "action.hover" },
              "&.Mui-focusVisible": { bgcolor: "action.focus" },
            }}
          >
            <Box sx={{ color: "primary.main", display: "flex", "& svg": { width: 22 } }}>
              {item.icon}
            </Box>
            <Stack sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, color: "primary.dark" }}>
                {t(`panel.${item.labelKey}`)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t(`adminHome.pages.${item.labelKey as (typeof shortcuts)[number]}`)}
              </Typography>
            </Stack>
            <Box
              sx={{
                color: "text.secondary",
                display: "flex",
                "[dir=rtl] &": { transform: "scaleX(-1)" },
              }}
            >
              <ChevronRight size={18} />
            </Box>
          </ButtonBase>
        ))}
      </Paper>
    </>
  );
};
