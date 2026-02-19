import { createTheme } from "@mui/material/styles";
const base = createTheme();

const theme = createTheme({
    palette: {
    mode: "dark",
    primary: { main: "#ffffff" },
    accent: { main: "#00bcd4" },
    success: { main: "#4caf50" },
    warning: { main: "#ff9800" },
    danger: { main: "#f44336" },
    muted: { main: "#555555" },
    background: { default: "#0f0f0f", paper: "#181818", surface: "#1f1f1f" },
    text: { primary: "#ffffff", secondary: "#aaaaaa", muted: "#777777" },
    divider: "#444444",
    common: { black: "#000000" },
    link: { main: "#00acee" },
  },

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
  }),

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

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: "#0f0f0f" },
        "*": { scrollbarColor: "#555 #0f0f0f", scrollbarWidth: "thin" },
        "::-webkit-scrollbar": { width: "8px", height: "8px" },
        "::-webkit-scrollbar-track": { background: "#0f0f0f" },
        "::-webkit-scrollbar-thumb": { background: "#555", borderRadius: "8px" },
        "::-webkit-scrollbar-thumb:hover": { background: "#777" },
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
          backgroundColor: "#fff",
          color: "#1a1a1a",
          "&:hover": { backgroundColor: "#aaa" },
          "&.Mui-disabled": { backgroundColor: "#555", color: "#999" },
        },
      },
      variants: [
        {
          props: { variant: "rounded" },
          style: { borderRadius: 50, padding: "8px 20px" },
        },
      ],
    },

    MuiTextField: { defaultProps: { variant: "outlined" } },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#1f1f1f",
          color: "#fff",
          borderRadius: 8,
          "& fieldset": { borderColor: "#555" },
          "&:hover fieldset": { borderColor: "#aaa" },
          "&.Mui-focused fieldset": { borderColor: "#fff", borderWidth: 1 },
        },
        input: {
          color: "#fff",
          "&::placeholder": { color: "#aaa", opacity: 1 },
        },
      },
    },

    MuiInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#1f1f1f",
          color: "#fff",
          borderRadius: 8,
          padding: "8px 12px",
          "&:before": { borderBottomColor: "#555" },
          "&:hover:not(.Mui-disabled):before": { borderBottomColor: "#aaa" },
          "&:after": { borderBottomColor: "#fff" },
        },
        input: {
          color: "#fff",
          "&::placeholder": { color: "#aaa", opacity: 1 },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: { color: "#aaa", "&.Mui-focused": { color: "#fff" } },
      },
    },

    MuiFormHelperText: { styleOverrides: { root: { color: "#aaa" } } },

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
  },
});

export default theme;