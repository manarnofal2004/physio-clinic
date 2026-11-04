// Fonts are bundled with the app (no request to Google Fonts at runtime).
// Redaction (Latin only) is the main font; Arabic letters come from IBM Plex Sans Arabic.
import "@fontsource/redaction/400.css";
import "@fontsource/redaction/700.css";
import "@fontsource/redaction/400-italic.css";
// IBM Plex Sans Arabic: clean and modern, the closest free font to the iPhone's
// Arabic (SF Arabic). Only the Arabic subset, so Latin text keeps Redaction.
import "@fontsource/ibm-plex-sans-arabic/arabic-400.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-500.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-700.css";
// Handwriting, only for the captions in the gallery: Caveat for Latin letters and
// Aref Ruqaa (a Ruq'ah hand) for Arabic.
import "@fontsource/caveat/latin-500.css";
import "@fontsource/aref-ruqaa/arabic-400.css";
// Amiri (a classic book Naskh) for the Arabic intro line under each section title;
// the English one is Redaction italic.
import "@fontsource/amiri/arabic-400.css";
