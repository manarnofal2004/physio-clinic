import type { ReactNode, SVGProps } from "react";

// Sanad's own icon set (24px grid, 1.75 stroke). The outline follows the text
// colour; the part inside "icon-accent" is honey (set in theme.ts).
export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const createIcon = (body: ReactNode) => {
  const Icon = ({ size = 24, ...props }: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="sanad-icon"
      {...props}
    >
      {body}
    </svg>
  );
  return Icon;
};

export const AddIcon = createIcon(
  <>
    <path d="M12 5.2v13.6" />
    <g className="icon-accent">
      <path d="M5.2 12h13.6" />
    </g>
  </>,
);

export const ArrowLeftIcon = createIcon(
  <>
    <path d="M19 12c-4.2-.2-8.4-.2-12.6 0" />
    <g className="icon-accent">
      <path d="M10.8 7.2 6.3 12l4.5 4.8" />
    </g>
  </>,
);

export const ArrowRightIcon = createIcon(
  <>
    <path d="M5 12c4.2-.2 8.4-.2 12.6 0" />
    <g className="icon-accent">
      <path d="M13.2 7.2 17.7 12l-4.5 4.8" />
    </g>
  </>,
);

export const AttachmentIcon = createIcon(
  <>
    <path d="M9.2 13.1c1.9-2 3.9-4 5.9-6 1.4-1.4 3.4-1.5 4.7-.2 1.4 1.4 1.3 3.4-.2 4.8l-7.2 7.2c-1.8 1.8-4.7 1.8-6.5 0s-1.8-4.6.1-6.5l6.8-6.8" />
    <g className="icon-accent">
      <path d="M8.9 16.1 15.7 9.2" />
    </g>
  </>,
);

export const BannersIcon = createIcon(
  <>
    <path d="M4.2 9.1c1.3 0 2.6 0 3.9.1 2.4-1 4.7-2.1 7-3.2.1 4 .1 8 0 12-2.3-1.2-4.7-2.2-7-3.2-1.3.1-2.6.1-3.9 0-.2-1.9-.2-3.8 0-5.7Z" />
    <path d="M8.1 14.8c.3 1.6.8 3.1 1.5 4.6" />
    <g className="icon-accent">
      <path d="M18 8.4l1.8-.8M18.5 11.3h2M18 14.2l1.7.9" />
    </g>
  </>,
);

export const CalendarDayIcon = createIcon(
  <>
    <path d="M4.3 7.1c4.9-.7 10.3-.7 15.4 0 .2 4 .2 8.1 0 12.1-5.1.6-10.3.6-15.4 0-.2-4-.2-8.1 0-12.1Z" />
    <path d="M7.5 4.2v4.2M16.5 4.2v4.2M4.5 10.1c5-.5 10-.5 15 0" />
    <g className="icon-accent">
      <path
        d="M11 13.7c.7-.2 1.4-.2 2.1 0v2.6c-.7.2-1.4.2-2.1 0v-2.6Z"
        fill="currentColor"
        stroke="none"
      />
    </g>
  </>,
);

export const CloseIcon = createIcon(
  <>
    <path d="M6.2 6.2 17.8 17.8" />
    <path d="M17.8 6.2 6.2 17.8" />
    <g className="icon-accent">
      <path d="M7.2 16.8 16.8 7.2" />
    </g>
  </>,
);

export const DarkModeIcon = createIcon(
  <>
    <path d="M19.4 14.3c-1.1.6-2.3.9-3.6.9-4.3 0-7.4-3.1-7.4-7.4 0-1.3.3-2.5.9-3.6-3.1 1.1-5 4-5 7.5 0 4.6 3.4 8 8 8 3.4 0 6.2-2 7.1-5.4Z" />
    <g className="icon-accent">
      <path d="M17.1 6.1c.6.7 1 1.5 1.3 2.4" />
    </g>
  </>,
);

export const DashboardIcon = createIcon(
  <>
    <path d="M4.5 5.2c1.8-.2 3.6-.2 5.4 0 .2 1.8.2 3.5 0 5.3-1.8.2-3.6.2-5.4 0-.2-1.8-.2-3.5 0-5.3Z" />
    <path d="M4.5 13.2c1.8-.2 3.6-.2 5.4 0 .2 1.8.2 3.6 0 5.4-1.8.2-3.6.2-5.4 0-.2-1.8-.2-3.6 0-5.4Z" />
    <path d="M13.2 13.5c2.4-.1 4.4.4 6.1 1.5" />
    <path d="M15.6 16.8c1.1-.7 2.2-.9 3.3-.5-1 .9-2 1.3-3 1" />
    <path d="M15.8 16.9c-.7.5-1.3 1.1-1.7 1.8" />
    <g className="icon-accent">
      <path d="M13.1 5.1c1.8-.2 3.6-.2 5.4 0 .2 1.8.2 3.5 0 5.3-1.8.2-3.6.2-5.4 0-.2-1.8-.2-3.5 0-5.3Z" />
    </g>
  </>,
);

export const EditIcon = createIcon(
  <>
    <path d="M5 19.2c1.2-.1 2.4-.1 3.6 0L18.7 9.1c1-1 .9-2.4 0-3.3-.9-.9-2.3-.9-3.3.1l-10 10c-.2 1.1-.4 2.2-.4 3.3Z" />
    <path d="m13.5 8.1 2.9 2.9" />
    <g className="icon-accent">
      <path d="M5.4 18.3c.8.1 1.6.2 2.4.4" />
    </g>
  </>,
);

export const ExportCsvIcon = createIcon(
  <>
    <path d="M6 4.2c3-.4 6-.4 8.9 0l2.9 2.8c.2 4.2.2 8.4 0 12.6-3.9.5-7.8.5-11.8 0-.2-5.1-.2-10.3 0-15.4Z" />
    <path d="M14.8 4.4c0 .9 0 1.8.1 2.7 1 .1 1.9.1 2.8 0" />
    <path d="M8.6 11.3c1.7-.3 3.5-.3 5.2 0" />
    <path d="M8.6 14.2c1.7-.3 3.5-.3 5.2 0" />
    <g className="icon-accent">
      <path d="M15.2 16.3c1.6.4 2.9 1.2 4 2.5" />
      <path d="M17.9 16.8 19.4 19l-2.5.2" />
    </g>
  </>,
);

export const HideIcon = createIcon(
  <>
    <path d="M3.2 12c2.3-3.1 5.2-4.7 8.8-4.7 3.5 0 6.4 1.6 8.8 4.7-2.3 3.2-5.2 4.8-8.8 4.8-3.6 0-6.5-1.6-8.8-4.8Z" />
    <path d="M9.7 9.8c-.6.6-.9 1.3-.9 2.1 0 1.8 1.4 3.1 3.2 3.1.8 0 1.5-.3 2.1-.8" />
    <g className="icon-accent">
      <path d="M4.2 4.2 19.8 19.8" />
    </g>
  </>,
);

export const LanguageIcon = createIcon(
  <>
    <path d="M12 3.9c4.6.1 8.1 3.4 8.1 8.1 0 4.6-3.4 8-8 8-4.7 0-8.1-3.4-8.1-8 0-4.7 3.4-8 8-8.1Z" />
    <path d="M4 12c5.3-.5 10.7-.5 16 0" />
    <path d="M12 3.9c2.1 2.4 3.2 5.1 3.2 8.1S14.1 17.7 12 20" />
    <path d="M12 3.9C9.9 6.3 8.8 9 8.8 12s1.1 5.7 3.2 8" />
    <g className="icon-accent">
      <path d="M15.6 16.7c1.4-.5 2.6-1.4 3.5-2.6" />
    </g>
  </>,
);

export const LightModeIcon = createIcon(
  <>
    <path d="M12 8.3c2.1 0 3.7 1.6 3.7 3.7s-1.6 3.7-3.7 3.7S8.3 14.1 8.3 12 9.9 8.3 12 8.3Z" />
    <path d="M12 3.2v2.1M12 18.7v2.1M3.2 12h2.1M18.7 12h2.1" />
    <path d="m5.6 5.6 1.5 1.5M16.9 16.9l1.5 1.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5" />
    <g className="icon-accent">
      <circle cx="12" cy="3.8" r=".75" fill="currentColor" stroke="none" />
    </g>
  </>,
);

export const LogoutIcon = createIcon(
  <>
    <path d="M10.2 4.8c-1.7-.2-3.4-.2-5.1 0-.3 4.8-.3 9.6 0 14.4 1.7.2 3.4.2 5.1 0" />
    <path d="M8.9 12c2.7-.1 5.4-.1 8.1 0" />
    <g className="icon-accent">
      <path d="m13.7 8.7 3.4 3.3-3.4 3.3" />
    </g>
  </>,
);

export const MenuIcon = createIcon(
  <>
    <path d="M4.2 7.2c5-.3 10.2-.3 15.6 0" />
    <path d="M4.2 12c5-.3 10.2-.3 15.6 0" />
    <path d="M4.2 16.8c5-.3 10.2-.3 15.6 0" />
    <g className="icon-accent">
      <path d="M4.4 12.1c2-.1 4-.1 6 0" />
    </g>
  </>,
);

export const PatientProfileIcon = createIcon(
  <>
    <path d="M11.9 10.2c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.2 3 2.9c0 1.8-1.3 3.1-3 3.1Z" />
    <path d="M6.1 19.2c.5-3.8 2.6-5.9 5.8-5.9 3.1 0 5.2 2.1 5.8 5.9" />
    <g className="icon-accent">
      <path d="M7.8 14.3c1.2-.8 2.5-1.2 3.9-1.2" />
    </g>
  </>,
);

export const PatientsIcon = createIcon(
  <>
    <path d="M6.8 9.5c-1.4 0-2.5-1.1-2.5-2.5 0-1.5 1.1-2.6 2.6-2.6S9.5 5.5 9.5 7c0 1.4-1.1 2.5-2.7 2.5Z" />
    <path d="M17.1 9.5c-1.4 0-2.5-1.1-2.5-2.5 0-1.5 1.1-2.6 2.6-2.6s2.6 1.1 2.6 2.6c0 1.4-1.1 2.5-2.7 2.5Z" />
    <path d="M3.5 18.7c.4-3.7 2.1-5.8 4.8-5.8 1.8 0 3.2.8 4.1 2.2" />
    <path d="M12.3 15.1c1-1.4 2.4-2.2 4.1-2.2 2.7 0 4.4 2.1 4.8 5.8" />
    <path d="M16.2 17.3c1.1-.6 2.1-.8 3.1-.4-.9.8-1.8 1.1-2.8.9" />
    <path d="M16.3 17.4c-.5.5-.9.9-1.2 1.4" />
    <g className="icon-accent">
      <path d="M8.5 12.7c1.5-1.2 3-1.8 4.6-1.8s3 .5 4.2 1.5" />
    </g>
  </>,
);

export const PendingIcon = createIcon(
  <>
    <path d="M7.2 4.3c3.2-.4 6.4-.4 9.6 0" />
    <path d="M7.2 19.7c3.2.4 6.4.4 9.6 0" />
    <path d="M8.2 4.4c.2 3.4 1.4 5.5 3.8 7.6-2.4 2.1-3.6 4.2-3.8 7.6" />
    <path d="M15.8 4.4c-.2 3.4-1.4 5.5-3.8 7.6 2.4 2.1 3.6 4.2 3.8 7.6" />
    <g className="icon-accent">
      <path d="M10.5 17.1c1-.3 2-.3 3 0" />
    </g>
  </>,
);

export const PhoneIcon = createIcon(
  <>
    <path d="M7 4.2c1 1.1 1.9 2.2 2.8 3.4-.5.9-1.1 1.8-1.8 2.7 1.6 2.9 3.9 5.2 6.7 6.7.9-.7 1.8-1.3 2.7-1.8 1.2 1 2.3 2 3.4 3-.6 1.4-1.6 2.3-3 2.4-3.9-.7-7.2-2.5-9.9-5.2-2.6-2.7-4.3-6-4.9-9.9.2-1.3 1.1-2.3 2.4-2.8.5.4 1 .9 1.6 1.5Z" />
    <g className="icon-accent">
      <path d="M16.1 7.1c1.3.6 2.3 1.6 2.9 2.9" />
      <path d="M17.2 4.7c2.1.9 3.6 2.4 4.5 4.5" />
    </g>
  </>,
);

export const ReportsIcon = createIcon(
  <>
    <path d="M6 4.2c3-.4 6-.4 8.9 0l2.9 2.8c.2 4.2.2 8.4 0 12.6-3.9.5-7.8.5-11.8 0-.2-5.1-.2-10.3 0-15.4Z" />
    <path d="M14.8 4.4c0 .9 0 1.8.1 2.7 1 .1 1.9.1 2.8 0" />
    <path d="M8.6 11.4c1.9-.3 3.9-.3 5.9 0" />
    <path d="M8.6 14.4c1.7-.3 3.5-.3 5.2 0" />
    <path d="M15.4 17.2c1-.5 1.9-.5 2.7.1-.8.7-1.6 1-2.5.7" />
    <path d="M15.5 17.4c-.4.5-.6 1-.7 1.5" />
    <g className="icon-accent">
      <path d="M8.7 8.4c1.7-.3 3.4-.3 5.1 0" />
    </g>
  </>,
);

export const ReservationsIcon = createIcon(
  <>
    <path d="M4.3 7.2c4.9-.7 10.3-.7 15.4 0 .2 4 .2 8.1 0 12.1-5.1.6-10.3.6-15.4 0-.2-4-.2-8.1 0-12.1Z" />
    <path d="M7.4 4.2v4.2" />
    <path d="M16.6 4.2v4.2" />
    <path d="M4.5 10.1c5-.5 10-.5 15 0" />
    <path d="M16.4 16.6c1-.5 1.9-.5 2.7.1-.8.8-1.6 1-2.5.8" />
    <path d="M16.5 16.8c-.4.5-.6.9-.7 1.4" />
    <g className="icon-accent">
      <circle cx="15.8" cy="13.5" r=".85" fill="currentColor" stroke="none" />
    </g>
  </>,
);

export const SearchIcon = createIcon(
  <>
    <path d="M10.4 4.4c3.7 0 6.4 2.7 6.4 6.4s-2.7 6.4-6.4 6.4-6.4-2.7-6.4-6.4 2.7-6.4 6.4-6.4Z" />
    <path d="M15.2 15.3 19.6 19.7" />
    <g className="icon-accent">
      <path d="M7 7.3c1-.8 2.1-1.2 3.4-1.2" />
    </g>
  </>,
);

export const SettingsIcon = createIcon(
  <>
    <path d="M12 4.2c1.1 0 2.1.3 3 .7l1.5-1 2 2-1 1.5c.5.9.7 1.9.7 3l1.8.4v2.8l-1.8.4c-.1 1.1-.4 2.1-.8 3l1 1.5-2 2-1.5-1c-.9.5-1.9.7-3 .7l-.4 1.8H8.8l-.4-1.8c-1.1-.1-2.1-.4-3-.8l-1.5 1-2-2 1-1.5c-.5-.9-.7-1.9-.7-3L.4 13.5v-2.8l1.8-.4c.1-1.1.4-2.1.8-3L2 5.8l2-2 1.5 1c.9-.5 1.9-.7 3-.7l.4-1.8h2.8l.3 1.9Z" />
    <g className="icon-accent">
      <path d="M12 9c1.8 0 3 1.2 3 3s-1.2 3-3 3-3-1.2-3-3 1.2-3 3-3Z" />
    </g>
  </>,
);

export const StatusActiveIcon = createIcon(
  <>
    <path d="M12 4.1c4.5 0 7.8 3.3 7.8 7.8s-3.3 8-7.8 8-7.9-3.4-7.9-7.9c0-4.6 3.3-7.9 7.9-7.9Z" />
    <g className="icon-accent">
      <path d="m8.3 12.2 2.4 2.5 5.2-5.8" />
    </g>
  </>,
);

export const StatusCompletedIcon = createIcon(
  <>
    <path d="M12 4.1c4.5 0 7.8 3.3 7.8 7.8s-3.3 8-7.8 8-7.9-3.4-7.9-7.9c0-4.6 3.3-7.9 7.9-7.9Z" />
    <g className="icon-accent">
      <path d="m8.3 12.1 2.4 2.5 5.2-5.8" />
    </g>
  </>,
);

export const TherapistsIcon = createIcon(
  <>
    <path d="M8.2 9.8c-1.5 0-2.7-1.2-2.7-2.7s1.2-2.8 2.8-2.8 2.8 1.2 2.8 2.8c0 1.6-1.2 2.7-2.9 2.7Z" />
    <path d="M4.2 19c.4-3.6 2.2-5.6 4.8-5.6 2.1 0 3.8 1.3 4.5 3.5" />
    <path d="M15.5 16.5c1.1-.6 2.2-.8 3.2-.4-.9.8-1.9 1.2-2.9.9" />
    <path d="M15.6 16.7c-.5.5-.9 1-1.2 1.5" />
    <g className="icon-accent">
      <circle cx="14.5" cy="13.1" r=".9" fill="currentColor" stroke="none" />
    </g>
  </>,
);

export const TimeSlotIcon = createIcon(
  <>
    <path d="M12 3.9c4.6 0 8 3.4 8 8s-3.4 8.1-8 8.1-8-3.4-8-8 3.4-8.1 8-8.1Z" />
    <path d="M12 7.1v5l-3 2.1" />
    <g className="icon-accent">
      <circle cx="12" cy="12.1" r=".9" fill="currentColor" stroke="none" />
    </g>
  </>,
);

export const UploadIcon = createIcon(
  <>
    <path d="M12 16.5V5.2" />
    <path d="M8.7 8.6 12 5.2l3.3 3.4" />
    <path d="M5 18.3c4.6.6 9.2.6 14 0" />
    <g className="icon-accent">
      <path d="M12 5.2v3.2" />
    </g>
  </>,
);

export const UsersAndPrivilegesIcon = createIcon(
  <>
    <path d="M8 10c-1.5 0-2.7-1.2-2.7-2.7S6.5 4.5 8 4.5s2.8 1.2 2.8 2.8S9.6 10 8 10Z" />
    <path d="M4 19c.3-3.5 2.1-5.5 4.7-5.5 1.8 0 3.3.9 4.1 2.4" />
    <circle cx="16.7" cy="14.7" r="2.3" />
    <path d="M18.9 14.7h2" />
    <g className="icon-accent">
      <path d="M20 14.7v2.1" />
    </g>
  </>,
);
