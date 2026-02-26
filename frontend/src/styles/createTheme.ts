import { createTheme, type PaletteMode } from "@mui/material/styles";
import { getThemeComponents } from "./themeComponents";
import { getPalette } from "./themePalette";
import { getThemeTokens } from "./themeTokens";

export function createAppTheme(mode: PaletteMode = "light") {
  const isLight = mode === "light";

  return createTheme(({
    palette: getPalette(mode),
    ...getThemeTokens(),
    components: getThemeComponents(isLight),
  }) as any);
}

const theme = createAppTheme("light");

export default theme;

