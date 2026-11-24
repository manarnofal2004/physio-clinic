import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Download, Pencil, Plus, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { PATIENT_STATUSES, type Patient, type PatientStatus } from "@shared/api-types";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useNotify } from "@/components/notifications/useNotify";
import { useAuth } from "@/features/auth/useAuth";
import { formatDay } from "@/features/reports/format";
import { downloadPatientsCsv, usePatients, type PatientsFilter } from "./api";
import { PatientDialog } from "./PatientDialog";

// The patients list: search, filter by status, sort and page through the patients,
// and add or edit one. Used by the admin and by physiotherapists with "view patients"
// (the server only returns the patients in their scope).
export const PatientsPage = () => {
  const { t, i18n } = useTranslation();
  const notify = useNotify();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const canEdit = Boolean(user?.privileges.includes("patients.edit"));
  const isAdmin = user?.role === "admin";
  const [exporting, setExporting] = useState(false);

  // What the user is typing, and the filter actually sent to the API.
  const [typed, setTyped] = useState("");
  const [filter, setFilter] = useState<PatientsFilter>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    hidden: false,
    sort: "fullName",
  });
  // undefined: closed. null: adding. A patient: editing that patient.
  const [editing, setEditing] = useState<Patient | null | undefined>(undefined);

  const patients = usePatients(filter);
  // Any change to the filters goes back to the first page.
  const set = (patch: Partial<PatientsFilter>) => setFilter((f) => ({ ...f, ...patch, page: 1 }));
  const filtered = Boolean(filter.search || filter.status || filter.hidden);

  // Search 350 ms after the user stops typing, not on every key.
  useEffect(() => {
    const id = window.setTimeout(
      () =>
        setFilter((f) => (f.search === typed.trim() ? f : { ...f, search: typed.trim(), page: 1 })),
      350,
    );
    return () => window.clearTimeout(id);
  }, [typed]);

  // "-lastVisit" means the column "lastVisit", largest first.
  const sortBy = filter.sort.replace(/^-/, "");
  const sortDirection = filter.sort.startsWith("-") ? "desc" : "asc";

  const columns: DataTableColumn<Patient>[] = [
    {
      id: "fullName",
      header: t("patientsAdmin.fullName"),
      sortable: true,
      render: (p) => <Typography sx={{ fontWeight: 600 }}>{p.fullName}</Typography>,
    },
    {
      id: "phone",
      header: t("patientsAdmin.phone"),
      render: (p) => (
        <Typography variant="body2" dir="ltr" sx={{ textAlign: "start" }}>
          {p.phone}
        </Typography>
      ),
    },
    {
      id: "age",
      header: t("patientsAdmin.age"),
      sortable: true,
      render: (p) => p.age,
    },
    {
      id: "condition",
      header: t("patientsAdmin.condition"),
      render: (p) => (
        <Typography variant="body2" sx={{ maxWidth: 260 }} noWrap>
          {p.condition}
        </Typography>
      ),
    },
    {
      id: "status",
      header: t("patientsAdmin.status"),
      render: (p) => (
        <Chip
          size="small"
          variant="outlined"
          color={p.status === "active" ? "primary" : "default"}
          label={t(`patientsAdmin.statuses.${p.status}`)}
        />
      ),
    },
    {
      id: "lastVisit",
      header: t("patientsAdmin.lastVisit"),
      sortable: true,
      render: (p) => (
        <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
          {p.lastVisit ? formatDay(p.lastVisit, i18n.language) : t("patientsAdmin.noVisit")}
        </Typography>
      ),
    },
    ...(canEdit
      ? [
          {
            id: "actions",
            header: "",
            align: "right" as const,
            render: (p: Patient) => (
              <Tooltip title={t("patientsAdmin.editAction")}>
                <IconButton
                  aria-label={t("patientsAdmin.editAction")}
                  onClick={(e) => {
                    // A row click opens the patient's page, so keep this click
                    // from reaching the row.
                    e.stopPropagation();
                    setEditing(p);
                  }}
                >
                  <Pencil size={18} />
                </IconButton>
              </Tooltip>
            ),
          },
        ]
      : []),
  ];

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <PageHeader
        title={t("patientsAdmin.title")}
        subtitle={t("patientsAdmin.subtitle")}
        actions={
          <>
            <Button
              startIcon={<Download size={18} />}
              loading={exporting}
              onClick={() => {
                setExporting(true);
                downloadPatientsCsv(filter)
                  .catch(() => notify.error(t("patientsAdmin.errors.export")))
                  .finally(() => setExporting(false));
              }}
            >
              {t("patientsAdmin.export")}
            </Button>
            {canEdit && (
              <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={() => setEditing(null)}
              >
                {t("patientsAdmin.add")}
              </Button>
            )}
          </>
        }
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder={t("patientsAdmin.search")}
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
          label={t("patientsAdmin.status")}
          value={filter.status}
          onChange={(e) => set({ status: e.target.value as PatientStatus | "" })}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="">{t("patientsAdmin.allStatuses")}</MenuItem>
          {PATIENT_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {t(`patientsAdmin.statuses.${s}`)}
            </MenuItem>
          ))}
        </TextField>
        {isAdmin && (
          <FormControlLabel
            control={
              <Switch checked={filter.hidden} onChange={(e) => set({ hidden: e.target.checked })} />
            }
            label={t("patientsAdmin.showHidden")}
            sx={{ whiteSpace: "nowrap" }}
          />
        )}
      </Stack>

      {patients.isError ? (
        <ErrorState
          title={t("patientsAdmin.errors.load")}
          retryLabel={t("patientsAdmin.retry")}
          onRetry={() => void patients.refetch()}
        />
      ) : (
        <DataTable
          ariaLabel={t("patientsAdmin.title")}
          columns={columns}
          rows={patients.data?.data ?? []}
          getRowId={(p) => p.id}
          onRowClick={(p) => navigate(`${pathname}/${p.id}`)}
          total={patients.data?.meta.total ?? 0}
          page={filter.page - 1}
          rowsPerPage={filter.limit}
          onPageChange={(p) => setFilter((f) => ({ ...f, page: p + 1 }))}
          onRowsPerPageChange={(n) => set({ limit: n })}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={(column, direction) =>
            set({ sort: direction === "desc" ? `-${column}` : column })
          }
          emptyState={
            patients.isPending ? (
              <LoadingState label={t("common.loading")} />
            ) : (
              // "No match" only makes sense after a search or filter.
              <EmptyState
                title={t(filtered ? "patientsAdmin.empty" : "patientsAdmin.none")}
                description={t(filtered ? "patientsAdmin.emptyHint" : "patientsAdmin.noneHint")}
              />
            )
          }
        />
      )}

      {editing !== undefined && (
        <PatientDialog
          key={editing?.id ?? "new"}
          patient={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            notify.success(t("patientsAdmin.saved"));
          }}
        />
      )}
    </Box>
  );
};
