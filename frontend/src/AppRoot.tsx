import { useMemo } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import App from "./App";
import { createAppTheme } from "./styles/createTheme";
import useLocalStorage from "./hooks/useLocalStorage";

type ThemeMode = "light" | "dark";

export default function AppRoot() {
  const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>("theme_mode", "light");
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App themeMode={themeMode} onToggleTheme={handleToggleTheme} />
      </ThemeProvider>
    </BrowserRouter>
  );
}

