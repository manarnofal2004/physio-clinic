import { useEffect, useMemo, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { useController, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { FormTextField } from "@/components/form/FormTextField";
import type { Translation } from "@/i18n/locales/en";
import { ApiError } from "@/lib/api/apiError";
import { AppointmentCard } from "./AppointmentCard";
import { createBookingSchema, type BookingValues } from "./bookingSchema";
import { DayPicker } from "./DayPicker";
import { useAvailability, useCreateReservation, useDateOptions } from "./hooks";
import { TimePicker } from "./TimePicker";

type BookingError = keyof Translation["booking"]["errors"];

const EMPTY_FORM: BookingValues = {
  fullName: "",
  phone: "",
  age: "",
  date: "",
  scheduledAt: "",
  notes: "",
};

// Which text to show for an error from the booking request.
const bookingErrorFor = (error: unknown): BookingError => {
  const code = error instanceof ApiError ? error.code : null;
  switch (code) {
    case "SLOT_UNAVAILABLE":
      return "slotTaken";
    case "PENDING_LIMIT_REACHED":
      return "pendingLimit";
    case "TOO_MANY_REQUESTS":
      return "tooManyRequests";
    case "VALIDATION_ERROR":
      return "checkDetails";
    case "NETWORK_ERROR":
      return "network";
    default:
      return "unexpected";
  }
};

// The name of a clinic day. This only labels a calendar date, so UTC keeps it from shifting
// with the visitor's timezone. Times are never converted: they come from the server as text.
const formatDay = (date: string, language: string) =>
  new Intl.DateTimeFormat(language === "ar" ? "ar-u-nu-latn" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

export const BookingForm = () => {
  const { t, i18n } = useTranslation();
  const [bookingError, setBookingError] = useState<BookingError | null>(null);
  const [booked, setBooked] = useState<{ name: string; date: string; time: string } | null>(null);

  const schema = useMemo(() => createBookingSchema(t), [t]);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { isSubmitted, isSubmitting },
  } = useForm<BookingValues>({ resolver: zodResolver(schema), defaultValues: EMPTY_FORM });

  const date = useWatch({ control, name: "date" });
  const fullName = useWatch({ control, name: "fullName" });
  // The day and time are picked with bubbles instead of typed, so they are wired here.
  const dateField = useController({ name: "date", control });
  const timeField = useController({ name: "scheduledAt", control });
  const dateOptions = useDateOptions();
  const availability = useAvailability(date);
  const createMutation = useCreateReservation();
  const slots = availability.data?.slots ?? [];
  const chosenTime = slots.find((slot) => slot.scheduledAt === timeField.field.value)?.time ?? "";

  // Field messages are made when the form validates, so redo them when the language changes.
  useEffect(() => {
    if (isSubmitted) void trigger();
  }, [i18n.language, isSubmitted, trigger]);

  const onSubmit = async (values: BookingValues) => {
    setBookingError(null);
    const time = slots.find((slot) => slot.scheduledAt === values.scheduledAt)?.time ?? "";
    try {
      await createMutation.mutateAsync({
        fullName: values.fullName,
        phone: values.phone,
        age: Number(values.age),
        scheduledAt: values.scheduledAt,
        ...(values.notes && { notes: values.notes }),
      });
      setBooked({ name: values.fullName, date: values.date, time });
      reset(EMPTY_FORM);
    } catch (error) {
      const code = bookingErrorFor(error);
      setBookingError(code);
      // The chosen time is gone; the list is reloading, so the visitor picks again from it.
      if (code === "slotTaken") setValue("scheduledAt", "");
    }
  };

  // The form (or the thank-you after sending) beside the appointment card.
  const withCard = (content: ReactNode) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.25fr) minmax(0, 1fr)" },
        gap: { xs: 4, md: 8 },
        alignItems: "center",
      }}
    >
      {content}
      <AppointmentCard
        name={booked ? booked.name : fullName}
        day={
          booked
            ? formatDay(booked.date, i18n.language)
            : date
              ? formatDay(date, i18n.language)
              : ""
        }
        time={booked ? booked.time : chosenTime}
        sent={Boolean(booked)}
      />
    </Box>
  );

  if (booked) {
    return withCard(
      <Stack spacing={2} role="status" sx={{ alignItems: "flex-start" }}>
        <Typography variant="h5" component="p">
          {t("booking.success.title")}
        </Typography>
        <Typography color="text.secondary">
          {t("booking.success.text", {
            date: formatDay(booked.date, i18n.language),
            time: booked.time,
          })}
        </Typography>
        <Button variant="outlined" onClick={() => setBooked(null)}>
          {t("booking.success.another")}
        </Button>
      </Stack>,
    );
  }

  if (dateOptions.isPending) return <LoadingState label={t("common.loading")} />;

  if (dateOptions.isError) {
    return (
      <ErrorState
        title={t("booking.loadDatesFailed")}
        retryLabel={t("booking.retry")}
        onRetry={() => void dateOptions.refetch()}
      />
    );
  }

  if (dateOptions.data.length === 0) {
    return <EmptyState title={t("booking.noDates")} description={t("booking.noDatesHint")} />;
  }

  const pickerLabel = { mb: 1, fontSize: "1.05rem", color: "primary.dark" };

  // What to say under the time field while it has nothing to choose from.
  const timeHint = !date
    ? t("booking.pickDayFirst")
    : availability.isPending
      ? t("common.loading")
      : undefined;

  return withCard(
    <Stack
      component="form"
      noValidate
      spacing={2}
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
    >
      <Box>
        <Typography sx={pickerLabel}>{t("booking.chooseDay")}</Typography>
        <DayPicker
          days={dateOptions.data}
          value={dateField.field.value}
          onChange={(day) => {
            dateField.field.onChange(day);
            // A time belongs to one day, so choosing another day clears it.
            setValue("scheduledAt", "");
          }}
        />
        {dateField.fieldState.error && (
          <Typography color="error" variant="body2" sx={{ mt: 0.5 }}>
            {dateField.fieldState.error.message}
          </Typography>
        )}
      </Box>
      <Box>
        <Typography sx={pickerLabel}>{t("booking.chooseTime")}</Typography>
        {timeHint ? (
          <Typography color="text.secondary" variant="body2">
            {timeHint}
          </Typography>
        ) : (
          slots.length > 0 && (
            <TimePicker
              slots={slots}
              value={timeField.field.value}
              onChange={timeField.field.onChange}
            />
          )
        )}
        {timeField.fieldState.error && (
          <Typography color="error" variant="body2" sx={{ mt: 0.5 }}>
            {timeField.fieldState.error.message}
          </Typography>
        )}
      </Box>
      <FormTextField
        name="fullName"
        control={control}
        label={t("booking.fullName")}
        autoComplete="name"
        required
      />
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { sm: "2fr 1fr" } }}>
        <FormTextField
          name="phone"
          control={control}
          label={t("booking.phone")}
          type="tel"
          autoComplete="tel"
          required
          // Phone numbers read left to right in Arabic too.
          slotProps={{ htmlInput: { dir: "ltr" } }}
        />
        <FormTextField
          name="age"
          control={control}
          label={t("booking.age")}
          required
          slotProps={{ htmlInput: { inputMode: "numeric" } }}
        />
      </Box>
      {availability.isError && (
        <ErrorState
          title={t("booking.loadTimesFailed")}
          retryLabel={t("booking.retry")}
          onRetry={() => void availability.refetch()}
        />
      )}
      {availability.isSuccess && slots.length === 0 && (
        <Alert severity="info">{t("booking.noTimes")}</Alert>
      )}
      <FormTextField
        name="notes"
        control={control}
        label={t("booking.notes")}
        multiline
        minRows={2}
      />
      {bookingError && <Alert severity="error">{t(`booking.errors.${bookingError}`)}</Alert>}
      <Button
        type="submit"
        variant="contained"
        size="large"
        loading={isSubmitting}
        sx={{ alignSelf: { sm: "flex-start" }, px: 4 }}
      >
        {t("booking.submit")}
      </Button>
    </Stack>,
  );
};
