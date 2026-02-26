export function getThemeComponents(isLight: boolean) {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: isLight ? "#ffffff" : "#0f0f0f" },
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
          fontWeight: 500,
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
    MuiDialog: {
      styleOverrides: {
        paper: {
          width: "90%",
          maxWidth: 1000,
          height: "70vh",
          maxHeight: 700,
          borderRadius: 8,
          padding: "16px",
        },
      },
    },
  } as any;
}
