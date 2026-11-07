import { alpha } from "@mui/material/styles";
import type { BannerType } from "./api";

// Each type's colours: announcements pale olive, schedule changes soft honey. Shared by
// the bar on the site and the admin page.
export const bannerColors = (type: BannerType, mode: "light" | "dark") => {
  if (type !== "schedule_update") return { bg: "action.selected", fg: "primary.dark" };
  return mode === "light"
    ? { bg: "#f3e6cc", fg: "#6b4a12" }
    : { bg: alpha("#d4a24c", 0.16), fg: "#e7c98f" };
};
