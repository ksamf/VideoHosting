import { createTheme, type PaletteMode } from "@mui/material/styles";
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
  studioCard: (theme) => ({ p: 2, bgcolor: theme.palette.background.paper, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }),
  studioCardLabel: (theme) => ({ color: theme.palette.text.secondary, fontSize: 13 }),
  studioBestVideoCard: {
    p: 2,
    bgcolor: "background.paper",
    borderRadius: 3,
    border: "1px solid",
    borderColor: "divider",
    display: "block",
    textDecoration: "none",
    color: "inherit",
    "&:visited": { color: "inherit" },
    "&:hover": { bgcolor: "action.hover" },
  },
  studioBestVideoTitle: { mb: 1, color: "text.secondary", fontSize: 13 },
  studioBestVideoRow: { display: "flex", flexDirection: "row" },
  studioBestVideoImage: { width: "15%", height: "15%", borderRadius: 3 },
  studioBestVideoName: { ml: 2, display: "flex", alignItems: "center" },
  studioVideosTitle: { fontWeight: 600, mb: 1 },
  studioTableContainer: { bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider" },
  studioTable: { minWidth: 650 },
  studioTableHeadRow: {
    "& th": {
      color: "text.secondary",
      borderColor: "divider",
      fontWeight: 600,
    },
  },
  studioTableRow: {
    "& td": {
      borderColor: "divider",
    },
    "&:hover": {
      bgcolor: "action.hover",
    },
    height: "100px",
  },
  studioVideoCell: { display: "flex" },
  studioVideoImage: { width: "35%", height: "35%", borderRadius: 3 },
  studioVideoName: { display: "flex", alignItems: "center", ml: 2 },
};

export const commonSx = {
  navBarAppBar: (theme) => ({
    bgcolor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
  }),
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
      backgroundColor: "background.paper",
    },
  },
  searchIcon: (theme) => ({ color: theme.palette.text.secondary }),
  sideBarDrawer: {
    "& .MuiDrawer-paper": (theme) => ({
      width: 260,
      top: 64,
      height: "calc(100% - 64px)",
      bgcolor: theme.palette.background.paper,
      borderRight: `1px solid ${theme.palette.divider}`,
      backgroundImage: "none",
    }),
  },
  sideBarRoot: { display: "flex", flexDirection: "column", height: "100%" },
  sideBarList: (theme) => ({
    flexGrow: 1,
    overflowY: "auto",
    color: theme.palette.text.primary,
    "& .MuiListItemText-primary": { color: theme.palette.text.primary },
    "& .MuiListItemText-secondary": { color: theme.palette.text.secondary },
    "& .MuiListItemButton-root:hover": { backgroundColor: theme.palette.action.hover },
  }),
  sideBarPrimaryIcon: (theme) => ({ mr: 1, color: theme.palette.text.primary }),
  sideBarIcon: (theme) => ({ mr: 1, color: theme.palette.text.primary }),
  sideBarChannelText: { ml: 1 },
  sideBarChannelPrimary: (theme) => ({ color: theme.palette.text.primary, fontSize: 14 }),
  sideBarTogglePrimary: (theme) => ({ color: theme.palette.text.secondary, fontSize: 13 }),
  sideBarDivider: (theme) => ({ my: 1, borderColor: theme.palette.divider }),
  userAvatar: (size) => ({
    width: size,
    height: size,
    fontSize: Math.round(size * 0.42),
    lineHeight: 1,
    color: "common.white",
    bgcolor: "grey.500",
  }),
};

interface VideoSxStyles {
  playerContainer: (controlsVisible: boolean) => Record<string, any>;
  playerVideo: Record<string, any>;
  playerUnavailable: (theme: any) => Record<string, any>;
  playerControls: (controlsVisible: boolean) => Record<string, any>;
  playerControlsRow: Record<string, any>;
  playerActionIcon: Record<string, any>;
  playerHoveredVolumeSpacer: (hovered: boolean) => Record<string, any>;
  playerTime: Record<string, any>;
  videoInfoContainer: Record<string, any>;
  videoInfoChannelButton: Record<string, any>;
  videoInfoChannelText: Record<string, any>;
  videoInfoSubsText: Record<string, any>;
  cardRoot: (theme: any) => Record<string, any>;
  cardPreviewBox: (theme: any) => Record<string, any>;
  cardMedia: Record<string, any>;
  cardHeader: Record<string, any>;
  cardAvatarButton: Record<string, any>;
  cardActionIcon: (theme: any) => Record<string, any>;
  cardTitle: Record<string, any>;
  cardMetaText: (theme: any) => Record<string, any>;
  sliderBufferOverlay: Record<string, any>;
  sliderSpinner: Record<string, any>;
  sliderPreviewBox: Record<string, any>;
  sliderPreviewImage: Record<string, any>;
  sliderPreviewTime: Record<string, any>;
  slider: Record<string, any>;
  hiddenCanvas: Record<string, any>;
  selectButton: (theme: any) => Record<string, any>;
  selectMenuPaper: (theme: any) => Record<string, any>;
  selectMenuItem: (theme: any) => Record<string, any>;
  volumeRoot: Record<string, any>;
  volumeIcon: Record<string, any>;
  volumePopover: (hoveredVolume: boolean) => Record<string, any>;
  volumeSlider: Record<string, any>;
}

export const videoSx: VideoSxStyles = {
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
  playerActionIcon: { color: "#ffffff" },
  playerHoveredVolumeSpacer: (hovered) => ({
    width: hovered ? 110 : 0,
    transition: "width 0.2s ease",
    flexShrink: 0,
  }),
  playerTime: { color: "#ffffff", fontSize: 12 },
  videoInfoContainer: { maxWidth: 1200, width: "100%", mt: 2, px: 1 },
  videoInfoChannelButton: { p: 0, "&:hover": { backgroundColor: "transparent" } },
  videoInfoChannelText: { ml: 1 },
  videoInfoSubsText: { ml: 1, color: "text.secondary" },
  cardRoot: (theme) => ({
    width: "100%",
    minWidth: { xs: 0, sm: 280 },
    maxWidth: 320,
    borderRadius: 2,
    backgroundColor: theme.palette.background.default,
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": { boxShadow: "0 12px 24px rgba(15, 23, 42, 0.12)" },
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
    borderTop: "4px solid #ffffff",
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
    color: "#ffffff",
    fontSize: 11,
    textAlign: "center",
    mt: 0.3,
  },
  slider: { color: "#ffffff" },
  hiddenCanvas: { display: "none" },
  selectButton: () => ({
    px: 1.5,
    py: 0.5,
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.45)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: 13,
    minWidth: 48,
    textAlign: "center",
    "&:hover": {
      bgcolor: "rgba(255,255,255,0.12)",
    },
  }),
  selectMenuPaper: (theme) => ({
    bgcolor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: 2,
    minWidth: 80,
  }),
  selectMenuItem: (theme) => ({
    justifyContent: "center",
    "&.Mui-selected": { bgcolor: theme.palette.action.selected },
    "&:hover": { bgcolor: theme.palette.action.hover },
  }),
  volumeRoot: { position: "relative", display: "flex", alignItems: "center" },
  volumeIcon: { color: "#ffffff" },
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
    color: "#ffffff",
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
    "&.Mui-disabled": {
      bgcolor: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled,
    },
  }),
  authSecondaryButton: (theme) => ({
    bgcolor: theme.palette.divider,
    color: theme.palette.text.secondary,
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
    bgcolor: theme.palette.background.paper,
    p: 2,
    borderRadius: 2,
  }),
  uploadHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 2,
  },
  uploadCloseButton: { color: "text.secondary" },
  setDetailsColumns: { direction: "row", spacing: 3 },
  setDetailsLeft: { flex: 2 },
  setDetailsRight: { flex: 1 },
  setDetailsHelper: (invalid) => ({
    mb: 2,
    "& .MuiFormHelperText-root": {
      color: invalid ? "error.main" : "text.secondary",
    },
  }),
  setDetailsDescription: (invalid) => ({
    mb: 3,
    "& .MuiFormHelperText-root": {
      color: invalid ? "error.main" : "text.secondary",
    },
  }),
  setDetailsSectionTitle: { mb: 1 },
  setDetailsPreviewRow: { display: "flex", flexDirection: "row" },
  setDetailsPreviewCard: (aspectRatio, withMargin = false) => ({
    width: 240,
    aspectRatio,
    bgcolor: "background.default",
    border: "1px dashed",
    borderColor: "divider",
    borderRadius: 2,
    cursor: "pointer",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mr: withMargin ? "10px" : 0,
  }),
  setDetailsUploadHint: { color: "text.secondary" },
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
      color: invalid ? "error.main" : "text.secondary",
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
  setDetailsPublishButton: (theme) => ({
    borderRadius: "50px",
    textTransform: "none",
    backgroundColor: theme.palette.text.primary,
    color: theme.palette.background.default,
    "&:hover": { backgroundColor: theme.palette.text.secondary },
    "&.Mui-disabled": {
      color: `${theme.palette.action.disabled} !important`,
      opacity: 0.6,
    },
  }),
};

export const skeletonSx = {
  videoGrid: {
    display: "grid",
    gridTemplateColumns: {
      xs: "repeat(1, 1fr)",
      sm: "repeat(auto-fill, minmax(280px, 1fr))",
    },
    gap: 2.5,
    p: 2,
    justifyItems: "center",
    width: "100%",
  },
  videoCard: { width: "100%", minWidth: { xs: 0, sm: 280 }, maxWidth: 320 },
  videoPreviewWrap: {
    position: "relative",
    width: "100%",
    pt: "56.25%",
    borderRadius: 2,
    overflow: "hidden",
  },
  videoPreview: { position: "absolute", inset: 0, width: "100%", height: "100%" },
  videoMetaRow: { mt: 1.5, display: "flex", gap: 1.5 },
  channelSidebarCard: (theme) => ({
    p: 2,
    width: { xs: "100%", md: 280 },
    bgcolor: "transparent",
    boxShadow: "none",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 3,
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
    position: { md: "sticky" },
    top: 80,
  }),
  channelSortButton: { borderRadius: 3 },
  studioCard: (theme) => ({
    p: 2,
    bgcolor: theme.palette.background.paper,
    borderRadius: 3,
    border: `1px solid ${theme.palette.divider}`,
  }),
  studioTableCell: { py: 1.8 },
  watchPlayerWrap: {
    width: "100%",
    maxWidth: 1200,
    borderRadius: 2,
    overflow: "hidden",
  },
  watchPlayer: { width: "100%", aspectRatio: "16 / 9" },
  watchInfo: { maxWidth: 1200, width: "100%", mt: 2, px: 1 },
  watchTitle: { mb: 1.2 },
  watchMetaRow: { display: "flex", alignItems: "center", gap: 1.5 },
  watchDescription: { mt: 2, borderRadius: 2 },
};

export function createAppTheme(mode: PaletteMode = "light") {
  const isLight = mode === "light";

  return createTheme(({
    palette: {
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
      divider: isLight ? "#d1d5db" : "#444444",
      common: { black: "#000000" },
      link: { main: isLight ? "#111111" : "#ffffff" },
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
    },
  }) as any);
}

const theme = createAppTheme("light");

export default theme;
