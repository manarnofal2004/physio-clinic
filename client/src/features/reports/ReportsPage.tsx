import { useEffect, useState } from "react";
import { Box, Button, InputAdornment, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { Download, Paperclip, Plus, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import type { Report, ReportProgress } from "@shared/api-types";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useNotify } from "@/components/notifications/useNotify";
import { useAuth } from "@/features/auth/useAuth";
import { downloadReportsCsv, useReports, type ReportsFilter } from "./api";
import { formatDay } from "./format";
import { ProgressChip } from "./ProgressChip";
import { ReportDialog } from "./ReportDialog";

// The medical reports list: search, filter by progress and dates, export what is shown
// to CSV, and open a report. Users with "write reports" can add one. Used by the admin
// and by physiotherapists (who only see their own patients' reports).
export const ReportsPage = () => {
  const { t, i18n } = useTranslation();
  const notify = useNotify();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const canEdit = Boolean(user?.privileges.includes("reports.edit"));
  const [typed, setTyped] = useState("");
  const [filter, setFilter] = useState<ReportsFilter>({
    page: 1,
    limit: 10,
    search: "",
    progress: "",
    from: "",
    to: "",
    patientId: "",
  });
  const [adding, setAdding] = useState(false);
  const [exporting, setExporting] = useState(false);
  const reports = useReports(filter);
  const set = (patch: Partial<ReportsFilter>) => setFilter((f) => ({ ...f, ...patch, page: 1 }));

  useEffect(() => {
    const id = window.setTimeout(
      () =>
        setFilter((f) => (f.search === typed.trim() ? f : { ...f, search: typed.trim(), page: 1 })),
      350,
    );
    return () => window.clearTimeout(id);
  }, [typed]);

  const columns: DataTableColumn<Report>[] = [
    {
      id: "date",
      header: t("reportsAdmin.date"),
      render: (r) => (
        <Typography sx={{ whiteSpace: "nowrap" }}>{formatDay(r.date, i18n.language)}</Typography>
      ),
    },
    {
      id: "patient",
      header: t("reportsAdmin.patient"),
      render: (r) => <Typography sx={{ fontWeight: 600 }}>{r.patient.fullName}</Typography>,
    },
    {
      id: "diagnosis",
      header: t("reportsAdmin.diagnosis"),
      render: (r) => (
        <Typography
          variant="body2"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            maxWidth: 360,
          }}
        >
          {r.diagnosis}
        </Typography>
      ),
    },
    {
      id: "progress",
      header: t("reportsAdmin.progressLabel"),
      render: (r) => <ProgressChip progress={r.progress} />,
    },
    {
      id: "files",
      header: t("reportsAdmin.files.title"),
      render: (r) =>
        r.attachments.length > 0 && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center", color: "text.secondary" }}
          >
            <Paperclip size={14} />
            <Typography variant="body2">{r.attachments.length}</Typography>
          </Stack>
        ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <PageHeader
        title={t("reportsAdmin.title")}
        subtitle={t("reportsAdmin.subtitle")}
        actions={
          <>
            <Button
              startIcon={<Download size={18} />}
              loading={exporting}
              onClick={() => {
                setExporting(true);
                downloadReportsCsv(filter)
                  .catch(() => notify.error(t("reportsAdmin.errors.failed")))
                  .finally(() => setExporting(false));
              }}
            >
              {t("reportsAdmin.export")}
            </Button>
            {canEdit && (
              <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={() => setAdding(true)}
              >
                {t("reportsAdmin.add")}
              </Button>
            )}
          </>
        }
      />

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder={t("reportsAdmin.search")}
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
          label={t("reportsAdmin.progressLabel")}
          value={filter.progress}
          onChange={(e) => set({ progress: e.target.value as ReportProgress | "" })}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">{t("reportsAdmin.allProgress")}</MenuItem>
          {(["improving", "stable", "worse"] as const).map((p) => (
            <MenuItem key={p} value={p}>
              {t(`reportsAdmin.progress.${p}`)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          type="date"
          label={t("reportsAdmin.from")}
          value={filter.from}
          onChange={(e) => set({ from: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          type="date"
          label={t("reportsAdmin.to")}
          value={filter.to}
          onChange={(e) => set({ to: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Stack>

      {reports.isError ? (
        <ErrorState
          title={t("reportsAdmin.errors.load")}
          retryLabel={t("reportsAdmin.retry")}
          onRetry={() => void reports.refetch()}
        />
      ) : (
        <DataTable
          ariaLabel={t("reportsAdmin.title")}
          columns={columns}
          rows={reports.data?.data ?? []}
          getRowId={(r) => r.id}
          total={reports.data?.meta.total ?? 0}
          page={filter.page - 1}
          rowsPerPage={filter.limit}
          onPageChange={(p) => setFilter((f) => ({ ...f, page: p + 1 }))}
          onRowsPerPageChange={(n) => set({ limit: n })}
          onRowClick={(r) => navigate(`${pathname}/${r.id}`)}
          emptyState={
            reports.isPending ? undefined : (
              <EmptyState
                title={t("reportsAdmin.empty")}
                description={t("reportsAdmin.emptyHint")}
              />
            )
          }
        />
      )}

      {adding && (
        <ReportDialog
          report={null}
          onClose={() => setAdding(false)}
          onSaved={(r) => {
            setAdding(false);
            notify.success(t("reportsAdmin.saved"));
            navigate(`${pathname}/${r.id}`);
          }}
        />
      )}
    </Box>
  );
};
