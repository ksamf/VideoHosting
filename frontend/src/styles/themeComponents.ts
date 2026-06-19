export function getThemeComponents(isLight: boolean) {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: isLight ? "#ffffff" : "#0f0f0f",
          color: isLight ? "#111111" : "#ffffff",
          lineHeight: 1.5,
          textRendering: "optimizeLegibility",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        a: {
          color: "inherit",
          textDecorationColor: isLight ? "#9ca3af" : "#777777",
          textUnderlineOffset: "2px",
        },
        "*": {
          scrollbarColor: isLight ? "#d1d5db #ffffff" : "#555 #0f0f0f",
          scrollbarWidth: "thin",
        },
        "::-webkit-scrollbar": { width: "8px", height: "8px" },
        "::-webkit-scrollbar-track": { background: isLight ? "#ffffff" : "#0f0f0f" },
        "::-webkit-scrollbar-thumb": {
          background: isLight ? "#d1d5db" : "#555",
          borderRadius: "8px",
        },
        "::-webkit-scrollbar-thumb:hover": { background: isLight ? "#9ca3af" : "#777" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "50px",
          fontWeight: 600,
          transition: "transform 120ms ease, background-color 180ms ease, border-color 180ms ease, color 180ms ease",
          "&:active": {
            transform: "translateY(1px)",
          },
        },
        contained: {
          backgroundColor: isLight ? "#111111" : "#ffffff",
          color: isLight ? "#ffffff" : "#1a1a1a",
          "&:hover": { backgroundColor: isLight ? "#2a2a2a" : "#aaaaaa" },
          "&.Mui-disabled": {
            backgroundColor: isLight ? "#d1d5db" : "#555555",
            color: isLight ? "#9ca3af" : "#999999",
          },
        },
        outlined: {
          borderColor: isLight ? "#d1d5db" : "#555555",
          color: isLight ? "#111111" : "#ffffff",
          "&:hover": {
            borderColor: isLight ? "#9ca3af" : "#888888",
            backgroundColor: isLight ? "rgba(15, 23, 42, 0.03)" : "rgba(255,255,255,0.06)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: "background-color 180ms ease, color 180ms ease",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: {
          "&.Mui-focusVisible": {
            outline: `2px solid ${isLight ? "#111111" : "#f4f4f4"}`,
            outlineOffset: -2,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-focusVisible": {
            outline: `2px solid ${isLight ? "#111111" : "#f4f4f4"}`,
            outlineOffset: -2,
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecorationThickness: "from-font",
          textUnderlineOffset: "2px",
        },
      },
    },
    MuiTextField: { defaultProps: { variant: "outlined" } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: isLight ? "#ffffff" : "#1f1f1f",
          color: isLight ? "#111111" : "#ffffff",
          borderRadius: 8,
          "& fieldset": { borderColor: isLight ? "#d1d5db" : "#555" },
          "&:hover fieldset": { borderColor: isLight ? "#9ca3af" : "#aaa" },
          "&.Mui-focused fieldset": {
            borderColor: isLight ? "#111111" : "#ffffff",
            borderWidth: 1,
          },
        },
        input: {
          color: isLight ? "#111111" : "#ffffff",
          "&::placeholder": { color: isLight ? "#9ca3af" : "#aaa", opacity: 1 },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          backgroundColor: isLight ? "#ffffff" : "#1f1f1f",
          color: isLight ? "#111111" : "#ffffff",
          borderRadius: 8,
          padding: "8px 12px",
          "&:before": { borderBottomColor: isLight ? "#d1d5db" : "#555" },
          "&:hover:not(.Mui-disabled):before": { borderBottomColor: isLight ? "#9ca3af" : "#aaa" },
          "&:after": { borderBottomColor: isLight ? "#111111" : "#ffffff" },
        },
        input: {
          color: isLight ? "#111111" : "#ffffff",
          "&::placeholder": { color: isLight ? "#9ca3af" : "#aaa", opacity: 1 },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: isLight ? "#4b5563" : "#aaa", "&.Mui-focused": { color: isLight ? "#111111" : "#fff" } },
      },
    },
    MuiFormHelperText: { styleOverrides: { root: { color: isLight ? "#4b5563" : "#aaa" } } },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          border: `1px solid ${isLight ? "#d1d5db" : "#555555"}`,
          backgroundColor: "transparent",
          color: isLight ? "#111111" : "#ffffff",
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: isLight ? "#e5e7eb" : "#3d3d3d",
        },
        head: {
          fontWeight: 700,
          color: isLight ? "#374151" : "#c3c3c3",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 180ms ease",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          border: `1px solid ${isLight ? "#d1d5db" : "#4a4a4a"}`,
          boxShadow: isLight ? "0 16px 40px rgba(15,23,42,0.12)" : "0 18px 42px rgba(0,0,0,0.5)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 500,
          backgroundColor: isLight ? "#111111" : "#f5f5f5",
          color: isLight ? "#f9fafb" : "#111111",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          width: "90%",
          maxWidth: 1000,
          height: "70vh",
          maxHeight: 700,
          borderRadius: 12,
          border: `1px solid ${isLight ? "#d1d5db" : "#555555"}`,
          padding: "16px",
        },
      },
    },
  } as any;
}
