import { useEffect, useRef, useState } from "react";
import {
  Box,
  ButtonBase,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { FileText, Paperclip, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Attachment } from "@shared/api-types";
import { fetchFileUrl, uploadFiles } from "./api";

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const sizeText = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

// A small preview: the image itself (fetched with the login token) or a PDF icon.
export const AttachmentThumb = ({ file, size = 56 }: { file: Attachment; size?: number }) => {
  const [url, setUrl] = useState<string | null>(null);
  const isImage = file.mimeType.startsWith("image/");
  useEffect(() => {
    if (!isImage) return;
    let link: string | null = null;
    let alive = true;
    void fetchFileUrl(file.id).then((u) => {
      if (alive) setUrl((link = u));
      else URL.revokeObjectURL(u);
    });
    return () => {
      alive = false;
      if (link) URL.revokeObjectURL(link);
    };
  }, [file.id, isImage]);

  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 1.5,
        overflow: "hidden",
        bgcolor: "action.selected",
        color: "primary.dark",
        display: "grid",
        placeItems: "center",
      }}
    >
      {isImage && url ? (
        <Box
          component="img"
          src={url}
          alt=""
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <FileText size={size / 2.4} />
      )}
    </Box>
  );
};

// Attach images or PDFs to a report: drop them on the box or choose them. Each file is
// uploaded at once and appears with a preview, its size and a remove button.
export const FileUploader = ({
  value,
  onChange,
}: {
  value: Attachment[];
  onChange: (next: Attachment[]) => void;
}) => {
  const { t } = useTranslation();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const room = MAX_FILES - value.length;

  const add = async (list: FileList | null) => {
    setError(null);
    const files = Array.from(list ?? []);
    if (files.length === 0) return;
    if (files.length > room) return setError(t("reportsAdmin.files.tooMany", { count: MAX_FILES }));
    if (files.some((f) => !TYPES.includes(f.type)))
      return setError(t("reportsAdmin.files.badType"));
    if (files.some((f) => f.size > MAX_BYTES)) return setError(t("reportsAdmin.files.tooBig"));
    setBusy(true);
    try {
      onChange([...value, ...(await uploadFiles(files))]);
    } catch {
      setError(t("reportsAdmin.files.failed"));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <Box>
      <ButtonBase
        onClick={() => input.current?.click()}
        disabled={busy || room === 0}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void add(e.dataTransfer.files);
        }}
        sx={{
          width: "100%",
          py: 2.5,
          px: 2,
          borderRadius: 2,
          border: "1.5px dashed",
          borderColor: over ? "primary.main" : "divider",
          bgcolor: over ? "action.selected" : "transparent",
          color: "text.secondary",
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          fontFamily: "inherit",
          transition: "background-color 150ms, border-color 150ms",
          "&:hover": { borderColor: "primary.main" },
        }}
      >
        {busy ? <CircularProgress size={22} /> : <Paperclip size={22} />}
        <Typography sx={{ color: "text.primary" }}>
          {room === 0 ? t("reportsAdmin.files.full") : t("reportsAdmin.files.drop")}
        </Typography>
        <Typography variant="body2">{t("reportsAdmin.files.rules")}</Typography>
      </ButtonBase>
      <input
        ref={input}
        hidden
        type="file"
        multiple
        accept={TYPES.join(",")}
        onChange={(e) => void add(e.target.files)}
      />
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {value.length > 0 && (
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          {value.map((file) => (
            <Stack
              key={file.id}
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", p: 1, borderRadius: 2, bgcolor: "action.hover" }}
            >
              <AttachmentThumb file={file} size={44} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap dir="ltr" sx={{ textAlign: "start" }}>
                  {file.filename}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  dir="ltr"
                  sx={{ textAlign: "start" }}
                >
                  {sizeText(file.size)}
                </Typography>
              </Box>
              <Tooltip title={t("reportsAdmin.files.remove")}>
                <IconButton
                  aria-label={t("reportsAdmin.files.remove")}
                  onClick={() => onChange(value.filter((f) => f.id !== file.id))}
                >
                  <X size={18} />
                </IconButton>
              </Tooltip>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
};
