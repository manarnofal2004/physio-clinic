import { Avatar, type SxProps, type Theme } from "@mui/material";
import type { Therapist } from "@shared/api-types";
import { useTherapistPhoto } from "./api";

const initials = (name: string) =>
  name
    .replace(/^dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

// A physiotherapist's photo, or their initials until the admin adds one. `src`
// shows a photo picked in the form before it is saved.
export const TherapistAvatar = ({
  therapist,
  size = 40,
  src,
  sx,
}: {
  therapist: Pick<Therapist, "id" | "fullName" | "photoId">;
  size?: number;
  src?: string;
  sx?: SxProps<Theme>;
}) => {
  const photo = useTherapistPhoto(therapist);
  return (
    <Avatar
      src={src ?? photo.data}
      alt={therapist.fullName}
      sx={[
        {
          width: size,
          height: size,
          fontSize: size * 0.36,
          fontWeight: 600,
          bgcolor: "action.selected",
          color: "primary.dark",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {initials(therapist.fullName)}
    </Avatar>
  );
};
