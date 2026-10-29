import { Alert, AlertTitle, Button } from "@mui/material";

interface ErrorStateProps {
  title: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ title, message, retryLabel, onRetry }: ErrorStateProps) => (
  <Alert
    severity="error"
    action={
      onRetry && retryLabel ? (
        <Button color="inherit" size="small" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : undefined
    }
  >
    <AlertTitle>{title}</AlertTitle>
    {message}
  </Alert>
);
