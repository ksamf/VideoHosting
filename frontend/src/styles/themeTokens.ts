import { createTheme } from "@mui/material/styles";

const base = createTheme();

export function getThemeTokens() {
  return {
    spacing: 8,
    typography: {
      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: "2rem", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em" },
      h2: { fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.01em" },
      h3: { fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.3 },
      h4: { fontSize: "1.125rem", fontWeight: 700, lineHeight: 1.35 },
      h5: { fontSize: "1rem", fontWeight: 700, lineHeight: 1.35 },
      subtitle1: { fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.35 },
      body1: { fontSize: "1rem", lineHeight: 1.5 },
      body2: { fontSize: "0.875rem", lineHeight: 1.45 },
      button: { fontWeight: 600, letterSpacing: "0.01em" },
    },
    breakpoints: {
      values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
    },
    shape: {
      borderRadius: 10,
    },
    shadows: base.shadows.map((s, i) => {
      if (i === 0) return "none";
      if (i === 1) return "0px 1px 3px rgba(0,0,0,0.12)";
      if (i === 2) return "0px 3px 6px rgba(0,0,0,0.16)";
      if (i === 3) return "0px 8px 16px rgba(0,0,0,0.2)";
      if (i === 4) return "0px 10px 20px rgba(0,0,0,0.24)";
      return s;
    }) as any,
    zIndex: {
      appBar: 1200,
      modal: 1300,
      tooltip: 1500,
    },
    transitions: {
      duration: { shortest: 150, shorter: 200, short: 250, standard: 300, complex: 375 },
      easing: { easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)" },
    },
    custom: {
      modal: {
        upload: { maxWidth: 1000, maxHeight: 700, padding: 16 },
      },
      player: { height: 360, controlsHeight: 52 },
      radii: { sm: 4, md: 8, lg: 16, pill: 50 },
      sizes: { thumbnail: 160, avatar: 40 },
      elevation: { card: 1, overlay: 3 },
    },
  } as any;
}
