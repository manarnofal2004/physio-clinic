import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import type { Banner, BannerInput, BannerType } from "./api";
import { bannerColors } from "./bannerStyle";
import { BannerTypeIcon } from "./BannerTypeIcon";

const MAX = 300; // same limit as the server

interface BannerDialogProps {
  open: boolean;
  banner: Banner | null; // null: a new banner
  saving: boolean;
  onSave: (input: BannerInput) => void;
  onClose: () => void;
}

// Add or edit a banner: its type, the message in both languages and whether it shows,
// with a preview of how it looks in the bar on the site (in the page's language).
export const BannerDialog = ({ open, banner, saving, onSave, onClose }: BannerDialogProps) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [type, setType] = useState<BannerType>(banner?.type ?? "announcement");
  const [messageEn, setMessageEn] = useState(banner?.messageEn ?? "");
  const [messageAr, setMessageAr] = useState(banner?.messageAr ?? "");
  const [isActive, setIsActive] = useState(banner?.isActive ?? true);
  const [tried, setTried] = useState(false);

  const enError = tried && (!messageEn.trim() || messageEn.length > MAX);
  const arError = tried && (!messageAr.trim() || messageAr.length > MAX);

  const save = () => {
    setTried(true);
    const en = messageEn.trim();
    const ar = messageAr.trim();
    if (!en || !ar || en.length > MAX || ar.length > MAX) return;
    onSave({ type, messageEn: en, messageAr: ar, isActive, order: banner?.order ?? 0 });
  };

  const colors = bannerColors(type, theme.palette.mode);
  const previewText = i18n.language.startsWith("ar") ? messageAr : messageEn;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{banner ? t("bannersAdmin.edit") : t("bannersAdmin.add")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {/* How it will look in the bar at the top of the site. */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              {t("bannersAdmin.preview")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                minHeight: 38,
                px: 2,
                py: 0.75,
                borderRadius: 1,
                bgcolor: colors.bg,
                color: colors.fg,
                textAlign: "center",
              }}
            >
              <Box component="span" sx={{ display: "flex", color: "warning.main" }}>
                <BannerTypeIcon type={type} size={17} />
              </Box>
              <Typography sx={{ fontSize: "0.95rem" }}>{previewText || "…"}</Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              {t("bannersAdmin.type")}
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={type}
              onChange={(_, next: BannerType | null) => next && setType(next)}
              sx={{ "& .MuiToggleButton-root": { px: 2, textTransform: "none" } }}
            >
              <ToggleButton value="announcement">
                {t("bannersAdmin.types.announcement")}
              </ToggleButton>
              <ToggleButton value="schedule_update">
                {t("bannersAdmin.types.schedule_update")}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <TextField
            label={t("bannersAdmin.messageAr")}
            value={messageAr}
            onChange={(event) => setMessageAr(event.target.value)}
            required
            multiline
            minRows={2}
            error={arError}
            helperText={arError ? t("bannersAdmin.required") : `${messageAr.length} / ${MAX}`}
            slotProps={{ htmlInput: { dir: "rtl", maxLength: MAX } }}
          />
          <TextField
            label={t("bannersAdmin.messageEn")}
            value={messageEn}
            onChange={(event) => setMessageEn(event.target.value)}
            required
            multiline
            minRows={2}
            error={enError}
            helperText={enError ? t("bannersAdmin.required") : `${messageEn.length} / ${MAX}`}
            slotProps={{ htmlInput: { dir: "ltr", maxLength: MAX } }}
          />

          <FormControlLabel
            control={
              <Switch checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            }
            label={t("bannersAdmin.showOnSite")}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          {t("bannersAdmin.cancel")}
        </Button>
        <Button variant="contained" onClick={save} loading={saving}>
          {t("bannersAdmin.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
