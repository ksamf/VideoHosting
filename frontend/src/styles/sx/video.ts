interface VideoSxStyles {
  gridRoot: Record<string, any>;
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
  cardLink: Record<string, any>;
  cardPreviewBox: (theme: any) => Record<string, any>;
  cardMedia: Record<string, any>;
  cardDurationBadge: Record<string, any>;
  cardMetaRow: Record<string, any>;
  cardAvatarWrap: Record<string, any>;
  cardTextWrap: Record<string, any>;
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
  gridRoot: {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, minmax(0, 1fr))",
      md: "repeat(3, minmax(0, 1fr))",
      lg: "repeat(4, minmax(0, 1fr))",
    },
    gap: { xs: 1.5, sm: 2.25, md: 2.5 },
    px: { xs: 0.5, sm: 1, md: 1.5 },
    py: { xs: 0.5, sm: 1 },
    width: "100%",
    alignItems: "start",
  },
  playerContainer: (controlsVisible) => ({
    width: "100%",
    maxWidth: 1200,
    backgroundColor: "#000",
    borderRadius: 2,
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
    cursor: controlsVisible ? "default" : "none",
  }),
  playerVideo: { width: "100%", display: "block", position: "relative" },
  playerUnavailable: (theme) => ({ color: theme.palette.text.secondary, p: 3, textAlign: "center" }),
  playerControls: (controlsVisible) => ({
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    px: { xs: 0.75, sm: 1.5 },
    py: { xs: 0.5, sm: 1 },
    background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
    zIndex: 2,
    transition: "opacity 0.3s ease, transform 0.3s ease",
    opacity: controlsVisible ? 1 : 0,
    transform: controlsVisible ? "translateY(0)" : "translateY(100%)",
    pointerEvents: controlsVisible ? "auto" : "none",
  }),
  playerControlsRow: { p: { xs: 0.5, sm: 1 }, minWidth: 0, gap: { xs: 0.5, sm: 1 } },
  playerActionIcon: { color: "#ffffff" },
  playerHoveredVolumeSpacer: (hovered) => ({
    width: hovered ? 110 : 0,
    transition: "width 0.2s ease",
    flexShrink: 0,
  }),
  playerTime: { color: "#ffffff", fontSize: { xs: 11, sm: 12 }, whiteSpace: "nowrap" },
  videoInfoContainer: { maxWidth: 1200, width: "100%", mt: 2, px: 1 },
  videoInfoChannelButton: { p: 0, "&:hover": { backgroundColor: "transparent" } },
  videoInfoChannelText: { ml: 1 },
  videoInfoSubsText: { ml: 1, color: "text.secondary" },
  cardRoot: (theme) => ({
    width: "100%",
    minWidth: 0,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: "transparent",
    transition: "background-color 0.2s ease",
    "&:hover": { backgroundColor: theme.palette.action.hover },
  }),
  cardLink: {
    color: "inherit",
    textDecoration: "none",
    display: "block",
    width: "100%",
    "&:hover .video-preview": {
      transform: "scale(1.03)",
    },
  },
  cardPreviewBox: (theme) => ({
    position: "relative",
    width: "100%",
    aspectRatio: "16 / 9",
    overflow: "hidden",
    borderRadius: 2,
    backgroundColor: theme.palette.common.black,
  }),
  cardMedia: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.25s ease",
  },
  cardDurationBadge: {
    position: "absolute",
    right: 8,
    bottom: 8,
    px: 0.65,
    py: 0.2,
    borderRadius: 0.8,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.2,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.82)",
  },
  cardMetaRow: {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    alignItems: "start",
    gap: 1.2,
    px: { xs: 0.35, sm: 0.5 },
    py: 1.1,
  },
  cardAvatarWrap: {
    pt: 0.1,
  },
  cardTextWrap: {
    minWidth: 0,
  },
  cardActionIcon: (theme) => ({
    mt: 0.1,
    color: theme.palette.text.secondary,
    borderRadius: 2,
    display: { xs: "none", sm: "inline-flex" },
  }),
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: 1.28,
  },
  cardMetaText: (theme) => ({
    color: theme.palette.text.secondary,
    fontSize: 13,
    lineHeight: 1.3,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
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
    px: { xs: 0.75, sm: 1.5 },
    py: 0.5,
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.45)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: { xs: 11, sm: 13 },
    minWidth: { xs: 38, sm: 48 },
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
    bottom: "calc(100% + 8px)",
    left: "50%",
    transform: hoveredVolume
      ? "translateX(-50%) translateY(0)"
      : "translateX(-50%) translateY(6px)",
    opacity: hoveredVolume ? 1 : 0,
    pointerEvents: hoveredVolume ? "auto" : "none",
    transition: "all 0.2s ease",
    bgcolor: "rgba(0,0,0,0.72)",
    px: { xs: 1, sm: 1 },
    py: { xs: 1, sm: 0.5 },
    borderRadius: 1,
    zIndex: 3,
  }),
  volumeSlider: {
    width: { xs: 28, sm: 100 },
    height: { xs: 96, sm: "auto" },
    color: "#ffffff",
  },
};
