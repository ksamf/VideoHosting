import type { PaletteMode } from "@mui/material/styles";

export function getPalette(mode: PaletteMode) {
  const isLight = mode === "light";

  return {
    mode,
    primary: { main: isLight ? "#111111" : "#ffffff" },
    accent: { main: isLight ? "#222222" : "#dddddd" },
    success: { main: isLight ? "#2b2b2b" : "#8dd38d" },
    warning: { main: isLight ? "#3a3a3a" : "#ffd28b" },
    danger: { main: isLight ? "#444444" : "#ff9a9a" },
    muted: { main: isLight ? "#6b7280" : "#666666" },
    background: isLight
      ? { default: "#ffffff", paper: "#ffffff" }
      : { default: "#0f0f0f", paper: "#181818" },
    text: isLight
      ? { primary: "#111111", secondary: "#4b5563" }
      : { primary: "#ffffff", secondary: "#aaaaaa" },
    action: isLight
      ? {
        hover: "rgba(15, 23, 42, 0.04)",
        selected: "rgba(15, 23, 42, 0.08)",
        focus: "rgba(15, 23, 42, 0.16)",
      }
      : {
        hover: "rgba(255, 255, 255, 0.08)",
        selected: "rgba(255, 255, 255, 0.14)",
        focus: "rgba(255, 255, 255, 0.2)",
      },
    divider: isLight ? "#d1d5db" : "#444444",
    common: { black: "#000000" },
    link: { main: isLight ? "#111111" : "#ffffff" },
  } as any;
}
