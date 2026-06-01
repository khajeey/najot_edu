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
      action: {
        hover: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
        selected: isDark ? "rgba(116, 86, 216, 0.2)" : "#eee8fb",
      },
    },
    typography: {
      fontFamily: '"Segoe UI", "Inter", Arial, sans-serif',
      fontSize: 14,
      h1: { fontSize: "1.5rem", fontWeight: 700 },
      h2: { fontSize: "1.35rem", fontWeight: 700 },
      h3: { fontSize: "1.2rem", fontWeight: 700 },
      h4: { fontSize: "1.1rem", fontWeight: 700 },
      h5: { fontSize: "1rem", fontWeight: 600 },
      h6: { fontSize: "0.95rem", fontWeight: 600 },
      body1: { fontSize: "0.9375rem" },
      body2: { fontSize: "0.875rem" },
      button: { fontSize: "0.875rem", textTransform: "none" },
    },
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
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
          }),
          head: ({ theme }) => ({
            backgroundColor: theme.palette.mode === "dark" ? "#1a2438" : "#fafbfc",
            color: theme.palette.text.secondary,
            fontSize: "0.8125rem",
            fontWeight: 600,
          }),
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }),
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontSize: "0.875rem",
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
