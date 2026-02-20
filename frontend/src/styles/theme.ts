import { createTheme } from "@mui/material/styles";
const base = createTheme();

export const appSx = {
  routeShell: {
    width: "100%",
    px: { xs: 1.5, sm: 2, md: 3 },
    pb: 3,
  },
};

export const pageSx = {
  watchContainer: {
    maxWidth: 1500,
    mt: 2,
    ml: { xs: 0, md: 4 },
  },
  channelContainer: {
    px: { xs: 2, md: 3 },
    pb: 3,
    mt: 2,
  },
  channelSortRow: {
    display: "flex",
    flexDirection: "row",
    p: 1,
    flexWrap: "wrap",
    gap: 1,
  },
  channelContent: { flex: 1, width: "100%" },
  channelSortButton: {
    borderRadius: 6,
    mr: 0,
  },
  mutedMessage: {
    color: (theme) => theme.palette.text.secondary,
    px: 3,
    py: 2,
  },
  gridSection: { p: 2 },
  searchContainer: { p: 2 },
  searchTitle: { mb: 1 },
  searchMuted: { color: "text.secondary" },
  studioRoot: { p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" },
  studioHeader: { fontWeight: 600, mb: 2 },
  studioMetricsGrid: { mb: 4 },
  studioCard: { p: 2, bgcolor: "#181818", borderRadius: 3 },
  studioCardLabel: { color: "#aaa", fontSize: 13 },
  studioBestVideoCard: {
    p: 2,
    bgcolor: "#181818",
    borderRadius: 3,
    display: "block",
    textDecoration: "none",
    color: "inherit",
    "&:visited": { color: "inherit" },
    "&:hover": { bgcolor: "#202020" },
  },
  studioBestVideoTitle: { mb: 1, color: "#aaa", fontSize: 13 },
  studioBestVideoRow: { display: "flex", flexDirection: "row" },
  studioBestVideoImage: { width: "15%", height: "15%", borderRadius: 3 },
  studioBestVideoName: { ml: 2, display: "flex", alignItems: "center" },
  studioVideosTitle: { fontWeight: 600, mb: 1 },
  studioTableContainer: { bgcolor: "#181818", borderRadius: 3 },
  studioTable: { minWidth: 650 },
  studioTableHeadRow: {
    "& th": {
      color: "#aaa",
      borderColor: "#222",
      fontWeight: 600,
    },
  },
  studioTableRow: {
    "& td": {
      borderColor: "#222",
    },
    "&:hover": {
      bgcolor: "#202020",
    },
    height: "100px",
  },
  studioVideoCell: { display: "flex" },
  studioVideoImage: { width: "35%", height: "35%", borderRadius: 3 },
  studioVideoName: { display: "flex", alignItems: "center", ml: 2 },
};

export const commonSx = {
  navBarAppBar: { bgcolor: "#0f0f0f" },
  navBarToolbar: {
    minHeight: 64,
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 720px) auto",
    alignItems: "center",
    columnGap: { xs: 1, md: 2 },
  },
  navBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    minWidth: 0,
  },
  navBarSearchWrap: {
    width: "100%",
    minWidth: 0,
    justifySelf: "center",
  },
  navBarRight: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: { xs: 1, sm: 2 },
    flexShrink: 0,
    minWidth: 0,
  },
  navBarUploadButton: { px: { xs: 1.2, sm: 2 }, whiteSpace: "nowrap" },
  navBarLoginButton: { whiteSpace: "nowrap" },
  searchField: {
    width: "100%",
    maxWidth: 500,
    minWidth: 0,
    "& .MuiInputBase-root": {
      borderRadius: "40px",
      height: { xs: 40, sm: 45 },
      backgroundColor: "#121212",
    },
  },
  searchIcon: { color: "#aaa" },
  sideBarDrawer: {
    "& .MuiDrawer-paper": {
      width: 260,
      top: 64,
      height: "calc(100% - 64px)",
      bgcolor: "#0f0f0f",
      borderRight: "1px solid #222",
      backgroundImage: "none",
    },
  },
  sideBarRoot: { display: "flex", flexDirection: "column", height: "100%" },
  sideBarList: { flexGrow: 1, overflowY: "auto" },
  sideBarPrimaryIcon: { mr: 1, color: "#fff" },
  sideBarIcon: { mr: 1 },
  sideBarChannelText: { ml: 1 },
  sideBarChannelPrimary: { color: "#ddd", fontSize: 14 },
  sideBarTogglePrimary: { color: "#aaa", fontSize: 13 },
  sideBarDivider: { my: 1, borderColor: "#222" },
  userAvatar: (size) => ({
    width: size,
    height: size,
    fontSize: Math.round(size * 0.42),
    lineHeight: 1,
    color: "#fff",
    bgcolor: "#aaa",
  }),
};

export const videoSx = {
  playerContainer: (controlsVisible) => ({
    width: "100%",
    maxWidth: 1200,
    backgroundColor: "#000",
    borderRadius: 2,
    overflow: "hidden",
    position: "relative",
    cursor: controlsVisible ? "default" : "none",
  }),
  playerVideo: { width: "100%", display: "block", position: "relative" },
  playerUnavailable: (theme) => ({ color: theme.palette.text.secondary, p: 3, textAlign: "center" }),
  playerControls: (controlsVisible) => ({
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    px: 1.5,
    py: 1,
    background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
    zIndex: 2,
    transition: "opacity 0.3s ease, transform 0.3s ease",
    opacity: controlsVisible ? 1 : 0,
    transform: controlsVisible ? "translateY(0)" : "translateY(100%)",
    pointerEvents: controlsVisible ? "auto" : "none",
  }),
  playerControlsRow: { p: 1 },
  playerActionIcon: (theme) => ({ color: theme.palette.text.primary }),
  playerHoveredVolumeSpacer: (hovered) => ({
    width: hovered ? 110 : 0,
    transition: "width 0.2s ease",
    flexShrink: 0,
  }),
  playerTime: (theme) => ({ color: theme.palette.text.primary, fontSize: 12 }),
  videoInfoContainer: { maxWidth: 1200, width: "100%", mt: 2, px: 1 },
  videoInfoChannelButton: { p: 0, "&:hover": { backgroundColor: "transparent" } },
  videoInfoChannelText: { ml: 1 },
  videoInfoSubsText: { ml: 1, color: "#aaa" },
  cardRoot: (theme) => ({
    width: "100%",
    maxWidth: 360,
    borderRadius: 2,
    backgroundColor: theme.palette.background.default,
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": { boxShadow: "0 12px 24px rgba(0,0,0,0.6)" },
  }),
  cardPreviewBox: (theme) => ({
    position: "relative",
    width: "100%",
    aspectRatio: "16 / 9",
    overflow: "hidden",
    backgroundColor: theme.palette.common.black,
  }),
  cardMedia: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.25s ease",
  },
  cardHeader: { p: 1.5, textAlign: "left" },
  cardAvatarButton: { p: 0 },
  cardActionIcon: (theme) => ({ color: theme.palette.text.secondary }),
  cardTitle: {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: 1.3,
  },
  cardMetaText: (theme) => ({ color: theme.palette.text.secondary }),
  sliderBufferOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: "rgba(0,0,0,0.3)",
    zIndex: 2,
    pointerEvents: "none",
  },
  sliderSpinner: {
    width: 48,
    height: 48,
    border: "4px solid rgba(255,255,255,0.3)",
    borderTop: (theme) => `4px solid ${theme.palette.text.primary}`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  sliderPreviewBox: {
    position: "absolute",
    bottom: "70px",
    bgcolor: (theme) => theme.palette.common.black,
    borderRadius: 1,
    overflow: "hidden",
    p: 0.5,
    pointerEvents: "none",
  },
  sliderPreviewImage: { width: 160, display: "block" },
  sliderPreviewTime: {
    color: (theme) => theme.palette.text.primary,
    fontSize: 11,
    textAlign: "center",
    mt: 0.3,
  },
  slider: (theme) => ({ color: theme.palette.text.primary }),
  hiddenCanvas: { display: "none" },
  selectButton: {
    px: 1.5,
    py: 0.5,
    borderRadius: "20px",
    border: "1px solid #555",
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
    minWidth: 48,
    textAlign: "center",
    "&:hover": {
      bgcolor: "#222",
    },
  },
  selectMenuPaper: {
    bgcolor: "#1f1f1f",
    color: "#fff",
    borderRadius: 2,
    minWidth: 80,
  },
  selectMenuItem: {
    justifyContent: "center",
    "&.Mui-selected": { bgcolor: "#333" },
    "&:hover": { bgcolor: "#444" },
  },
  volumeRoot: { position: "relative", display: "flex", alignItems: "center" },
  volumeIcon: { color: "#fff" },
  volumePopover: (hoveredVolume) => ({
    position: "absolute",
    bottom: "120%",
    left: "50%",
    transform: hoveredVolume
      ? "translateX(10%) translateY(40px)"
      : "translateX(0%) translateY(40px)",
    opacity: hoveredVolume ? 1 : 0,
    pointerEvents: hoveredVolume ? "auto" : "none",
    transition: "all 0.2s ease",
    px: 1,
    py: 0.5,
    borderRadius: 1,
  }),
  volumeSlider: {
    width: 100,
    color: "#fff",
  },
};

export const formSx = {
  authModal: (theme) => ({
    color: theme.palette.text.secondary,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: theme.palette.background.paper,
    p: 2.5,
    borderRadius: 2,
    textAlign: "center",
  }),
  authCloseButton: (theme) => ({ color: theme.palette.text.secondary }),
  authForm: { display: "flex", flexDirection: "column", gap: 2 },
  authInput: (theme) => ({
    color: theme.palette.text.primary,
    caretColor: theme.palette.text.primary,
    "&:before": { borderBottom: `1px solid ${theme.palette.divider}` },
    "&:hover:not(.Mui-disabled):before": { borderBottom: `1px solid ${theme.palette.text.secondary}` },
    "&.Mui-focused:after": { borderBottom: `2px solid ${theme.palette.text.primary}` },
  }),
  authPrimaryButton: (theme) => ({
    bgcolor: theme.palette.text.primary,
    color: theme.palette.background.default,
    "&:hover": { bgcolor: theme.palette.text.secondary },
    "&.Mui-disabled": { bgcolor: "#555555", color: "#999" },
  }),
  authSecondaryButton: (theme) => ({
    bgcolor: theme.palette.divider,
    color: "#777777",
    "&:hover": {
      bgcolor: theme.palette.text.primary,
      color: theme.palette.background.default,
    },
  }),
  uploadModal: (theme) => ({
    overflow: "auto",
    color: theme.palette.text.secondary,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "90%", md: 900 },
    height: { xs: "70vh", md: "80vh" },
    bgcolor: "#282828",
    p: 2,
    borderRadius: 2,
  }),
  uploadHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 2,
  },
  uploadCloseButton: { color: "#aaa" },
  setDetailsColumns: { direction: "row", spacing: 3 },
  setDetailsLeft: { flex: 2 },
  setDetailsRight: { flex: 1 },
  setDetailsHelper: (invalid) => ({
    mb: 2,
    "& .MuiFormHelperText-root": {
      color: invalid ? "#f44336" : "#aaa",
    },
  }),
  setDetailsDescription: (invalid) => ({
    mb: 3,
    "& .MuiFormHelperText-root": {
      color: invalid ? "#f44336" : "#aaa",
    },
  }),
  setDetailsSectionTitle: { mb: 1 },
  setDetailsPreviewRow: { display: "flex", flexDirection: "row" },
  setDetailsPreviewCard: (aspectRatio, withMargin = false) => ({
    width: 240,
    aspectRatio,
    bgcolor: "#1f1f1f",
    border: "1px dashed #555",
    borderRadius: 2,
    cursor: "pointer",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mr: withMargin ? "10px" : 0,
  }),
  setDetailsUploadHint: { color: "#aaa" },
  setDetailsPreviewContain: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },
  setDetailsPreviewCover: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  setDetailsTagsTitle: { mt: 3, mb: 1 },
  setDetailsTagField: (invalid) => ({
    mb: 1,
    "& .MuiFormHelperText-root": {
      color: invalid ? "#f44336" : "#aaa",
    },
  }),
  setDetailsPlayerPaper: (aspectRatio) => ({
    borderRadius: 2,
    overflow: "hidden",
    bgcolor: "#000",
    position: "relative",
    aspectRatio,
    width: "100%",
  }),
  setDetailsPlayer: { display: "block", width: "100%", height: "100%" },
  setDetailsActions: { mt: 4 },
  setDetailsPublishButton: {
    borderRadius: "50px",
    textTransform: "none",
    backgroundColor: "#fff",
    color: "#555",
    "&:hover": { backgroundColor: "#909090" },
    "&.Mui-disabled": {
      color: "#fff !important",
      opacity: 0.6,
    },
  },
};

const theme = createTheme(({
    palette: {
    mode: "dark",
    primary: { main: "#ffffff" },
    accent: { main: "#00bcd4" },
    success: { main: "#4caf50" },
    warning: { main: "#ff9800" },
    danger: { main: "#f44336" },
    muted: { main: "#555555" },
    background: { default: "#0f0f0f", paper: "#181818" },
    text: { primary: "#ffffff", secondary: "#aaaaaa" },
    divider: "#444444",
    common: { black: "#000000" },
    link: { main: "#00acee" },
  } as any,

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
}) as any);

export default theme;
