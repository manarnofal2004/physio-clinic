import { Clock, Megaphone } from "lucide-react";
import type { BannerType } from "./api";

// A megaphone for announcements, a clock for schedule changes.
export const BannerTypeIcon = ({ type, size }: { type: BannerType; size: number }) =>
  type === "schedule_update" ? <Clock size={size} /> : <Megaphone size={size} />;
