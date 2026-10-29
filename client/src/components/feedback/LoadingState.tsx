import { Box, CircularProgress } from "@mui/material";

interface LoadingStateProps {
  /** Accessible label announced to screen readers. */
  label: string;
  minHeight?: number | string;
}

export const LoadingState = ({ label, minHeight = 240 }: LoadingStateProps) => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight }}>
    <CircularProgress aria-label={label} />
  </Box>
);
