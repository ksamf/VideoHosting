import { createTheme } from "@mui/material/styles";

const base = createTheme();

export function getThemeTokens() {
  return {
    spacing: 8,
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: "2rem", fontWeight: 700 },
      h2: { fontSize: "1.5rem", fontWeight: 600 },
      body1: { fontSize: "1rem" },
      body2: { fontSize: "0.875rem" },
    },
    breakpoints: {
      values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
    },
    shape: {
      borderRadius: 8,
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
