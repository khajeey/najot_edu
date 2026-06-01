import { createContext, useContext, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const ColorModeContext = createContext({
  mode: "light",
  toggleColorMode: () => {},
});

export function useColorMode() {
  return useContext(ColorModeContext);
}

const brandPurple = "#7456d8";

const sharedTypography = {
  fontFamily: '"Segoe UI", "Inter", Arial, sans-serif',
};

function buildTheme(mode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: { main: brandPurple },
      background: {
        default: isDark ? "#0b1020" : "#f4f4f5",
        paper: isDark ? "#151d2f" : "#ffffff",
      },
      text: {
        primary: isDark ? "#eef2ff" : "#15151b",
        secondary: isDark ? "#9aa3b2" : "#6b7280",
      },
      divider: isDark ? "#27314a" : "#e7e8ed",
    },
    typography: sharedTypography,
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? "#0b1020" : "#f4f4f5",
            color: isDark ? "#eef2ff" : "#15151b",
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
    },
  });
}

export default function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("najot-theme") || "light");

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((current) => {
          const next = current === "light" ? "dark" : "light";
          localStorage.setItem("najot-theme", next);
          return next;
        });
      },
    }),
    [mode]
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
