import type { Response } from "express";
import { env } from "../config/env.js";
import { clinicDayAndTime } from "./time.js";

export interface CsvColumn<T> {
  header: string;
  // Return text, a number, a boolean, a Date, null or undefined. Objects and arrays
  // would print as "[object Object]", so turn them into text first.
  value: (row: T) => unknown;
  // Numbers that must stay text, like phone numbers: Excel would drop their leading 0.
  keepAsText?: boolean;
}

// Excel reads the file as UTF-8 (so Arabic text shows correctly) only when it starts with a BOM.
const BOM = String.fromCharCode(0xfeff);

function formatCell(value: unknown, keepAsText = false): string {
  if (value === null || value === undefined) return "";

  // Dates are written as the clinic's day ("2026-11-03"), which is easier to read
  // than a full timestamp.
  let text =
    value instanceof Date ? clinicDayAndTime(value, env.CLINIC_TIMEZONE).day : String(value);

  // A cell starting with = + - @ is run as a formula by Excel (CSV injection), so prefix it.
  // Numbers such as phone numbers ("+970 599...", "+970-599-123456", "(02) 123") are safe
  // and left as they are.
  const isPlainNumber = /^[+-]?\(?\d[\d\s().-]*$/.test(text);
  if (typeof value === "string" && !isPlainNumber && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;

  // ="0599123456" makes Excel show the cell as text, so the leading 0 stays. Only for
  // plain numbers, so nothing else can be turned into a formula.
  if (keepAsText && isPlainNumber) return `"=""${text}"""`;

  // Quote cells that contain a comma, quote or line break, and double inner quotes.
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv<T>(rows: readonly T[], columns: readonly CsvColumn<T>[]): string {
  const lines = [
    columns.map((column) => formatCell(column.header)).join(","),
    ...rows.map((row) =>
      columns.map((column) => formatCell(column.value(row), column.keepAsText)).join(","),
    ),
  ];
  return BOM + lines.join("\r\n");
}

export function sendCsv(res: Response, filename: string, csv: string) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
}
