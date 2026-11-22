import type { ReactNode } from "react";
import dayjs from "dayjs";
import ar from "dayjs/locale/ar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { enUS, type PickersLocaleText } from "@mui/x-date-pickers/locales";
import { useTranslation } from "react-i18next";

// Arabic month and day names with Latin digits (like the rest of the site), and
// weeks that start on Sunday, the clinic's first working day.
// (dayjs's own "ar" swaps digits for Arabic-Indic ones in preparse/postformat.)
const arLatin: Record<string, unknown> = { ...ar, name: "ar-latn", weekStart: 0 };
delete arLatin.preparse;
delete arLatin.postformat;
dayjs.locale(arLatin as unknown as typeof ar, undefined, true);

// MUI's pickers have no Arabic texts, so these are ours.
const arPickers: Partial<PickersLocaleText> = {
  previousMonth: "الشهر السابق",
  nextMonth: "الشهر التالي",
  calendarViewSwitchingButtonAriaLabel: (view) =>
    view === "year" ? "عرض السنوات مفتوح، انتقل إلى التقويم" : "التقويم مفتوح، انتقل إلى السنوات",
  cancelButtonLabel: "إلغاء",
  clearButtonLabel: "مسح",
  okButtonLabel: "موافق",
  todayButtonLabel: "اليوم",
  datePickerToolbarTitle: "اختر التاريخ",
  openDatePickerDialogue: (date) => (date ? `اختر التاريخ، المختار ${date}` : "اختر التاريخ"),
  fieldClearLabel: "مسح",
  dateTableLabel: "اختر التاريخ",
  fieldYearPlaceholder: () => "سنة",
  fieldMonthPlaceholder: () => "شهر",
  fieldDayPlaceholder: () => "يوم",
  year: "السنة",
  month: "الشهر",
  day: "اليوم",
  empty: "فارغ",
};

export const DatesProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={isArabic ? "ar-latn" : "en"}
      localeText={
        isArabic ? arPickers : enUS.components.MuiLocalizationProvider.defaultProps.localeText
      }
    >
      {children}
    </LocalizationProvider>
  );
};
