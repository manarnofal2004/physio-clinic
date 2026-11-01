import lateef400 from "@fontsource/lateef/files/lateef-arabic-400-normal.woff2?url";
import lateef500 from "@fontsource/lateef/files/lateef-arabic-500-normal.woff2?url";
import lateef700 from "@fontsource/lateef/files/lateef-arabic-700-normal.woff2?url";

// Lateef draws its letters much smaller than Latin fonts at the same font size.
// size-adjust scales only this font, so Arabic and English text look the same size
// without changing any font sizes in the theme.
const SIZE_ADJUST = "140%";

const face = (weight: number, url: string) => `
@font-face {
  font-family: "Lateef";
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  size-adjust: ${SIZE_ADJUST};
  src: url(${url}) format("woff2");
}`;

export const arabicFontFaces = [
  face(400, lateef400),
  face(500, lateef500),
  face(700, lateef700),
].join("\n");
