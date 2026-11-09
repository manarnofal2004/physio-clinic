import { Box, type SxProps, type Theme } from "@mui/material";

// A wavy line, as if drawn by hand with a honey pen, under the place names in the
// gallery.
const PATH = "M2 8 C 20 3, 38 11, 58 6 S 96 4, 118 7 S 160 10, 198 5";

export const Scribble = ({ sx }: { sx?: SxProps<Theme> }) => (
  <Box
    component="svg"
    aria-hidden
    viewBox="0 0 200 12"
    preserveAspectRatio="none"
    sx={[{ display: "block", width: 150, height: 10 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <Box
      component="path"
      d={PATH}
      fill="none"
      strokeWidth={2.2}
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      sx={{ stroke: (th) => th.palette.warning.main }}
    />
  </Box>
);
