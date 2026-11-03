// The soft S-shaped edge used on landing photos (hero and service panel), drawn as an
// SVG clip path in 0..1 units so it scales with any box. The wave is on the left edge
// in English and on the right in Arabic (x becomes 1 - x).
const PATHS = {
  // Hero: the photo runs to the page edge, so the other corners stay square.
  square: {
    ltr: "M0.1,0 C0.02,0.16 0.01,0.36 0.07,0.52 C0.13,0.68 0.11,0.86 0.04,1 L1,1 L1,0 Z",
    rtl: "M0.9,0 C0.98,0.16 0.99,0.36 0.93,0.52 C0.87,0.68 0.89,0.86 0.96,1 L0,1 L0,0 Z",
  },
  // Inside a panel: the far corners are rounded as well.
  rounded: {
    ltr: "M0.1,0 C0.02,0.16 0.01,0.36 0.07,0.52 C0.13,0.68 0.11,0.86 0.04,1 L0.95,1 Q1,1 1,0.94 L1,0.06 Q1,0 0.95,0 Z",
    rtl: "M0.9,0 C0.98,0.16 0.99,0.36 0.93,0.52 C0.87,0.68 0.89,0.86 0.96,1 L0.05,1 Q0,1 0,0.94 L0,0.06 Q0,0 0.05,0 Z",
  },
};

interface WaveClipPathProps {
  id: string;
  isRtl: boolean;
  corners?: keyof typeof PATHS;
}

// Renders an invisible <svg> that defines the clip path; use it with
// clipPath: `url(#${id})` on the element to cut.
export const WaveClipPath = ({ id, isRtl, corners = "square" }: WaveClipPathProps) => (
  <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
    <clipPath id={id} clipPathUnits="objectBoundingBox">
      <path d={PATHS[corners][isRtl ? "rtl" : "ltr"]} />
    </clipPath>
  </svg>
);
