import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { KeyRound, Plus, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Role, User } from "@shared/api-types";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserAvatar } from "@/components/layout/UserMenu";
import { useNotify } from "@/components/notifications/useNotify";
import { useAuth } from "@/features/auth/useAuth";
import { AccessDialog } from "./AccessDialog";
import { useUserMutations, useUsers, type UsersFilter } from "./api";
import { CreateUserDialog } from "./CreateUserDialog";

const ROLE_COLORS: Record<Role, { bg: string; fg: string }> = {
  admin: { bg: "primary.main", fg: "primary.contrastText" },
  therapist: { bg: "action.selected", fg: "primary.dark" },
  patient: { bg: "action.hover", fg: "text.secondary" },
};

// The admin's "Users and privileges" page: every account with its role, what it may do
// and whether it can log in. The admin creates therapist and patient accounts here,
// changes a therapist's access, and turns accounts off (they are never deleted).
export const UsersPage = () => {
  const { t } = useTranslation();
  const notify = useNotify();
  const { user: me } = useAuth();
  const { status } = useUserMutations();
  const [typed, setTyped] = useState("");
  const [filter, setFilter] = useState<UsersFilter>({
    page: 1,
    limit: 10,
    search: "",
    role: "",
    isActive: "",
  });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const users = useUsers(filter);

  // Search a moment after the admin stops typing, not on every key.
  useEffect(() => {
    const id = window.setTimeout(
      () =>
        setFilter((f) => (f.search === typed.trim() ? f : { ...f, search: typed.trim(), page: 1 })),
      350,
    );
    return () => window.clearTimeout(id);
  }, [typed]);

  const failed = () => notify.error(t("usersAdmin.errors.failed"));

  const access = (u: User) => {
    if (u.role === "admin") return t("usersAdmin.everything");
    if (u.role === "patient") return t("usersAdmin.ownRecord");
    const scope = u.patientScope?.all
      ? t("usersAdmin.scopeAll")
      : t("usersAdmin.scopeCount", { count: u.patientScope?.patientIds.length ?? 0 });
    return `${t("usersAdmin.privilegeCount", { count: u.privileges.length })} · ${scope}`;
  };

  const columns: DataTableColumn<User>[] = [
    {
      id: "user",
      header: t("usersAdmin.account"),
      render: (u) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <UserAvatar user={u} size={36} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600 }}>{u.fullName}</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              dir="ltr"
              sx={{ textAlign: "start" }}
            >
              {u.email}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: "role",
      header: t("usersAdmin.role"),
      render: (u) => (
        <Chip
          size="small"
          label={t(`roles.${u.role}`)}
          sx={{ bgcolor: ROLE_COLORS[u.role].bg, color: ROLE_COLORS[u.role].fg, fontWeight: 600 }}
        />
      ),
    },
    { id: "access", header: t("usersAdmin.access"), render: (u) => access(u) },
    {
      id: "status",
      header: t("usersAdmin.canLogIn"),
      render: (u) => (
        <Switch
          checked={u.isActive}
          // The admin cannot lock themselves out.
          disabled={u.id === me?.id}
          slotProps={{ input: { "aria-label": t("usersAdmin.canLogIn") } }}
          onChange={(e) =>
            status.mutate(
              { id: u.id, isActive: e.target.checked },
              {
                onSuccess: () =>
                  notify.success(
                    t(e.target.checked ? "usersAdmin.turnedOn" : "usersAdmin.turnedOff"),
                  ),
                onError: failed,
              },
            )
          }
        />
      ),
    },
    {
      id: "actions",
      header: "",
      align: "right",
      render: (u) =>
        u.role === "therapist" && (
          <Tooltip title={t("usersAdmin.editAccess")}>
            <IconButton aria-label={t("usersAdmin.editAccess")} onClick={() => setEditing(u)}>
              <KeyRound size={18} />
            </IconButton>
          </Tooltip>
        ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <PageHeader
        title={t("usersAdmin.title")}
        subtitle={t("usersAdmin.subtitle")}
        actions={
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setCreating(true)}
          >
            {t("usersAdmin.add")}
          </Button>
        }
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder={t("usersAdmin.search")}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          sx={{ flex: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          label={t("usersAdmin.role")}
          value={filter.role}
          onChange={(e) => setFilter((f) => ({ ...f, role: e.target.value as Role | "", page: 1 }))}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">{t("usersAdmin.allRoles")}</MenuItem>
          {(["admin", "therapist", "patient"] as const).map((r) => (
            <MenuItem key={r} value={r}>
              {t(`roles.${r}`)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label={t("usersAdmin.canLogIn")}
          value={filter.isActive}
          onChange={(e) =>
            setFilter((f) => ({
              ...f,
              isActive: e.target.value as UsersFilter["isActive"],
              page: 1,
            }))
          }
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">{t("usersAdmin.allStatuses")}</MenuItem>
          <MenuItem value="true">{t("usersAdmin.active")}</MenuItem>
          <MenuItem value="false">{t("usersAdmin.inactive")}</MenuItem>
        </TextField>
      </Stack>

      {users.isError ? (
        <ErrorState
          title={t("usersAdmin.errors.load")}
          retryLabel={t("usersAdmin.retry")}
          onRetry={() => void users.refetch()}
        />
      ) : (
        <DataTable
          ariaLabel={t("usersAdmin.title")}
          columns={columns}
          rows={users.data?.data ?? []}
          getRowId={(u) => u.id}
          total={users.data?.meta.total ?? 0}
          page={filter.page - 1}
          rowsPerPage={filter.limit}
          onPageChange={(p) => setFilter((f) => ({ ...f, page: p + 1 }))}
          onRowsPerPageChange={(n) => setFilter((f) => ({ ...f, limit: n, page: 1 }))}
          emptyState={
            users.isPending ? undefined : (
              <EmptyState title={t("usersAdmin.empty")} description={t("usersAdmin.emptyHint")} />
            )
          }
        />
      )}

      {creating && (
        <CreateUserDialog
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            notify.success(t("usersAdmin.created"));
          }}
        />
      )}
      {editing && (
        <AccessDialog
          key={editing.id}
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            notify.success(t("usersAdmin.saved"));
          }}
          onFailed={failed}
        />
      )}
    </Box>
  );
};
