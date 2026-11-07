import { useState } from "react";
import { Box, Button, IconButton, Stack, Switch, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { BannerInput } from "@shared/api-types";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useNotify } from "@/components/notifications/useNotify";
import { bannerColors } from "./bannerStyle";
import { BannerTypeIcon } from "./BannerTypeIcon";
import { useAdminBanners, useBannerMutations, type Banner } from "./api";
import { BannerDialog } from "./BannerDialog";

// The admin page for the bar at the top of the site: every banner in display order,
// each with its look, both messages, an on/off switch, arrows to change the order,
// edit and delete. Hidden banners stay in the list, faded.
export const BannersPage = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const notify = useNotify();
  const banners = useAdminBanners();
  const { create, replace, patch, remove } = useBannerMutations();
  const [editing, setEditing] = useState<Banner | "new" | null>(null);
  const [deleting, setDeleting] = useState<Banner | null>(null);
  const isAr = i18n.language.startsWith("ar");

  const failed = () => notify.error(t("bannersAdmin.failed"));

  const save = (input: BannerInput) => {
    const done = {
      onSuccess: () => {
        notify.success(t("bannersAdmin.saved"));
        setEditing(null);
      },
      onError: failed,
    };
    if (editing === "new") {
      // A new banner goes to the end of the list.
      const last = Math.max(0, ...(banners.data ?? []).map((b) => b.order));
      create.mutate({ ...input, order: last + 1 }, done);
    } else if (editing) {
      replace.mutate({ id: editing.id, input }, done);
    }
  };

  // Swap a banner's order with its neighbour's.
  const move = (index: number, step: -1 | 1) => {
    const list = banners.data ?? [];
    const a = list[index];
    const b = list[index + step];
    if (!a || !b) return;
    // Equal orders (e.g. both 0) would not swap, so fall back to the positions.
    const [orderA, orderB] = a.order === b.order ? [index, index + step] : [a.order, b.order];
    patch.mutate({ id: a.id, patch: { order: orderB } }, { onError: failed });
    patch.mutate({ id: b.id, patch: { order: orderA } }, { onError: failed });
  };

  const header = (
    <PageHeader
      title={t("bannersAdmin.title")}
      subtitle={t("bannersAdmin.subtitle")}
      actions={
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setEditing("new")}
        >
          {t("bannersAdmin.add")}
        </Button>
      }
    />
  );

  let body;
  if (banners.isPending) body = <LoadingState label={t("common.loading")} />;
  else if (banners.isError)
    body = (
      <ErrorState
        title={t("bannersAdmin.loadFailed")}
        retryLabel={t("bannersAdmin.retry")}
        onRetry={() => void banners.refetch()}
      />
    );
  else if (banners.data.length === 0)
    body = <EmptyState title={t("bannersAdmin.empty")} description={t("bannersAdmin.emptyHint")} />;
  else
    body = (
      <Stack component="ol" spacing={1.5} sx={{ listStyle: "none", m: 0, p: 0 }}>
        {banners.data.map((banner, index) => {
          const colors = bannerColors(banner.type, theme.palette.mode);
          return (
            <Box
              component="li"
              key={banner.id}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "auto minmax(0, 1fr) auto" },
                alignItems: "center",
                gap: 2,
                p: 2,
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
                opacity: banner.isActive ? 1 : 0.6,
              }}
            >
              {/* The order arrows. */}
              <Stack direction={{ xs: "row", md: "column" }} spacing={0.25}>
                <IconButton
                  size="small"
                  aria-label={t("bannersAdmin.moveUp")}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp size={16} />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label={t("bannersAdmin.moveDown")}
                  disabled={index === banners.data.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown size={16} />
                </IconButton>
              </Stack>

              <Box sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.25,
                    py: 0.25,
                    mb: 1,
                    borderRadius: 999,
                    bgcolor: colors.bg,
                    color: colors.fg,
                    fontSize: "0.85rem",
                  }}
                >
                  <BannerTypeIcon type={banner.type} size={14} />
                  {t(`bannersAdmin.types.${banner.type}`)}
                </Box>
                {/* The page's language first, the other one under it, smaller. */}
                <Typography dir={isAr ? "rtl" : "ltr"} sx={{ fontWeight: 500 }}>
                  {isAr ? banner.messageAr : banner.messageEn}
                </Typography>
                <Typography dir={isAr ? "ltr" : "rtl"} variant="body2" color="text.secondary">
                  {isAr ? banner.messageEn : banner.messageAr}
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={0.5}
                aria-label={t("bannersAdmin.actions")}
                sx={{ alignItems: "center" }}
              >
                <Tooltip
                  title={banner.isActive ? t("bannersAdmin.shown") : t("bannersAdmin.hidden")}
                >
                  <Switch
                    checked={banner.isActive}
                    slotProps={{ input: { "aria-label": t("bannersAdmin.showOnSite") } }}
                    onChange={(event) =>
                      patch.mutate(
                        { id: banner.id, patch: { isActive: event.target.checked } },
                        { onError: failed },
                      )
                    }
                  />
                </Tooltip>
                <Tooltip title={t("bannersAdmin.editAction")}>
                  <IconButton
                    aria-label={t("bannersAdmin.editAction")}
                    onClick={() => setEditing(banner)}
                  >
                    <Pencil size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("bannersAdmin.deleteAction")}>
                  <IconButton
                    aria-label={t("bannersAdmin.deleteAction")}
                    onClick={() => setDeleting(banner)}
                    sx={{ color: "error.main" }}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    );

  return (
    <Box sx={{ maxWidth: 960 }}>
      {header}
      {body}

      {editing && (
        <BannerDialog
          open
          // A fresh form for each banner.
          key={editing === "new" ? "new" : editing.id}
          banner={editing === "new" ? null : editing}
          saving={create.isPending || replace.isPending}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={t("bannersAdmin.deleteTitle")}
        message={t("bannersAdmin.deleteMessage")}
        confirmLabel={t("bannersAdmin.deleteAction")}
        cancelLabel={t("bannersAdmin.cancel")}
        destructive
        loading={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              notify.success(t("bannersAdmin.deleted"));
              setDeleting(null);
            },
            onError: failed,
          })
        }
      />
    </Box>
  );
};
