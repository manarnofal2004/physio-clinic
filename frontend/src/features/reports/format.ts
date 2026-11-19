// A report day such as "20 Oct 2026", in the page language with Latin digits.
export const formatDay = (iso: string, language: string) =>
  new Intl.DateTimeFormat(language === "ar" ? "ar-u-nu-latn" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
