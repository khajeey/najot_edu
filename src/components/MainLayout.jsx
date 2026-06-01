import { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputBase,
  MenuItem,
  Paper,
  Select,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiBell,
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiPlus,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import {
  FaCog,
  FaGift,
  FaLayerGroup,
  FaMoon,
  FaSun,
  FaUserGraduate,
  FaUserTie,
} from "react-icons/fa";
import brandLogo from "../assets/educoin.png";
import { useColorMode } from "../theme/AppThemeProvider";
import Settings from "./Settings";

const purple = "#7456d8";

const menuItems = [
  { label: "Asosiy", path: "/dashboard", icon: FiHome },
  { label: "O'qituvchilar", path: "/teachers", icon: FaUserTie },
  { label: "Guruhlar", path: "/groups", icon: FaLayerGroup },
  { label: "Talabalar", path: "/students", icon: FaUserGraduate },
  { label: "Sovg'alar", path: "/gifts", icon: FaGift },
  { label: "Boshqarish", path: "/dashboard/boshqarish", icon: FaCog, arrow: true, settings: true },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(location.pathname.startsWith("/dashboard/boshqarish"));
  const showSettings = settingsOpen;

  useEffect(() => {
    setSettingsOpen(location.pathname.startsWith("/dashboard/boshqarish"));
  }, [location.pathname]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        color: "text.primary",
        fontFamily: theme.typography.fontFamily,
        borderTop: (t) => (t.palette.mode === "dark" ? "2px solid #1f2937" : "2px solid #233333"),
      }}
    >
      <Sidebar
        collapsed={collapsed}
        settingsOpen={showSettings}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggle={() => setCollapsed((value) => !value)}
      />
      {showSettings && <Settings onClose={() => setSettingsOpen(false)} />}

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          px: { xs: 2, lg: 3 },
          py: 2.25,
        }}
      >
        <Topbar />
        <Outlet />
      </Box>
    </Box>
  );
}

function Sidebar({ collapsed, settingsOpen, onOpenSettings, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Paper
      elevation={0}
      square
      sx={{
        width: collapsed ? 86 : 325,
        minHeight: "calc(100vh - 2px)",
        flexShrink: 0,
        bgcolor: "background.paper",
        borderRadius: settingsOpen ? 0 : "0 22px 22px 0",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        position: "relative",
        overflow: "visible",
        transition: "width 220ms ease",
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 1.7,
          px: collapsed ? 1 : 2.4,
          pt: 2.25,
          pb: 3,
        }}
      >
        <Box
          component="img"
          src={brandLogo}
          alt="NajotEdu"
          sx={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0 }}
        />
        {!collapsed && (
          <Typography sx={{ color: purple, fontSize: 22, fontWeight: 700, letterSpacing: 0 }}>
            NajotEdu
          </Typography>
        )}
      </Box>

      <IconButton
        aria-label="sidebar"
        onClick={onToggle}
        sx={{
          position: "absolute",
          right: -17,
          top: 42,
          width: 34,
          height: 34,
          color: "#fff",
          bgcolor: purple,
          boxShadow: "0 8px 18px rgba(70, 51, 148, 0.25)",
          zIndex: 2,
          "&:hover": { bgcolor: "#684bcf" },
        }}
      >
        {collapsed ? <FiChevronRight size={22} /> : <FiChevronLeft size={22} />}
      </IconButton>

      <Box sx={{ px: 1.25, display: "flex", flexDirection: "column", gap: 0.8 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = item.settings
            ? location.pathname.startsWith("/dashboard/boshqarish") || settingsOpen
            : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

          const handleClick = () => {
            if (item.settings) {
              onOpenSettings();
              if (!location.pathname.startsWith("/dashboard/boshqarish")) {
                navigate("/dashboard/boshqarish/kurslar");
              }
              return;
            }

            navigate(item.path);
          };

          return (
            <Tooltip key={item.path} title={collapsed ? item.label : ""} placement="right" arrow>
              <Box
                role="button"
                tabIndex={0}
                onClick={handleClick}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    handleClick();
                  }
                }}
                sx={{
                  height: 54,
                  px: collapsed ? 0 : 2,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: 2,
                  bgcolor: active ? (isDark ? "#252f47" : "#eee8fb") : "transparent",
                  color: active ? purple : "text.secondary",
                  cursor: "pointer",
                  outline: "none",
                  transition: "background-color 160ms ease, color 160ms ease",
                  "&:hover": {
                    bgcolor: active ? (isDark ? "#252f47" : "#eee8fb") : "action.hover",
                    color: purple,
                  },
                }}
              >
                <Icon size={20} />
                {!collapsed && (
                  <>
                    <Typography sx={{ flex: 1, fontSize: 17, fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                    {item.arrow &&
                      (settingsOpen || location.pathname.startsWith("/dashboard/boshqarish") ? (
                        <FiChevronDown size={22} color={purple} />
                      ) : (
                        <FiChevronRight size={22} color="#9aa0a8" />
                      ))}
                  </>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      <Box sx={{ flex: 1 }} />

      {!collapsed && (
        <Box
          sx={{
            mx: 1.25,
            mb: 1.6,
            px: 2,
            py: 2,
            borderRadius: "14px",
            border: "1px solid",
            borderColor: isDark ? "#4a2f2f" : "#ffcfcf",
            bgcolor: isDark ? "#2a1f1f" : "#fff0f0",
            display: "grid",
            gridTemplateColumns: "36px 1fr",
            columnGap: 1.6,
            rowGap: 1.4,
            alignItems: "center",
          }}
        >
          <Box sx={{ gridRow: "1 / span 2", color: "text.primary", display: "flex", justifyContent: "center" }}>
            <FiBell size={34} fill="#ffd047" strokeWidth={2.2} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>Obuna</Typography>
            <Typography sx={{ mt: 0.6, color: "#ff4141", fontSize: 15 }}>
              Obunangiz tugagan
            </Typography>
          </Box>
          <Button
            fullWidth
            startIcon={<FiRefreshCw />}
            sx={{
              gridColumn: "1 / -1",
              height: 45,
              borderRadius: "10px",
              bgcolor: "#ec482d",
              color: "#fff",
              fontSize: 17,
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { bgcolor: "#db3e25" },
            }}
          >
            Obunani yangilash
          </Button>
        </Box>
      )}
    </Paper>
  );
}

function Topbar() {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mb: 3.25,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, minWidth: 0 }}>
        <IconButton aria-label="calendar" sx={surfaceIconButton}>
          <FiCalendar size={22} />
        </IconButton>

        <Button
          startIcon={<FiPlus size={22} />}
          endIcon={<FiChevronDown size={20} />}
          sx={{
            height: 48,
            px: 2.25,
            borderRadius: "11px",
            bgcolor: purple,
            color: "#fff",
            fontSize: 17,
            fontWeight: 700,
            textTransform: "none",
            minWidth: 174,
            "&:hover": { bgcolor: "#684bcf" },
          }}
        >
          Qo'shish
        </Button>

        <Paper
          elevation={0}
          sx={{
            height: 48,
            width: { xs: 190, lg: 250 },
            ml: 0.1,
            px: 1.7,
            borderRadius: "10px",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <FiSearch size={21} color="#9a9da4" />
          <InputBase
            placeholder="Qidirish..."
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: 16,
              color: "text.primary",
              "& input::placeholder": { color: "text.secondary", opacity: 1 },
            }}
          />
        </Paper>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexShrink: 0 }}>
        <Select
          value="uz"
          size="small"
          IconComponent={FiChevronDown}
          sx={{
            width: 190,
            height: 47,
            bgcolor: "background.paper",
            borderRadius: "11px",
            fontSize: 18,
            color: "text.primary",
            "& fieldset": { borderColor: "divider" },
            "& .MuiSelect-select": { display: "flex", alignItems: "center", py: 0, pl: 2 },
            "& .MuiSelect-icon": { right: 14, color: "text.secondary", fontSize: 22 },
          }}
        >
          <MenuItem value="uz">O'zbekcha</MenuItem>
        </Select>

        <IconButton sx={surfaceIconButton}>
          <FiBell size={22} />
        </IconButton>
        <IconButton
          aria-label="toggle theme"
          onClick={toggleColorMode}
          sx={{
            ...surfaceIconButton,
            bgcolor: isDark ? "#fbbf24" : "#303d59",
            color: isDark ? "#1f2937" : "#fff",
            "&:hover": {
              bgcolor: isDark ? "#f59e0b" : "#303d59",
            },
          }}
        >
          {isDark ? <FaSun size={21} /> : <FaMoon size={21} />}
        </IconButton>
        <Tooltip title="NajotEdu">
          <Box component="img" src={brandLogo} alt="NajotEdu" sx={{ width: 43, height: 43, objectFit: "contain" }} />
        </Tooltip>
      </Box>
    </Box>
  );
}

const surfaceIconButton = {
  width: 48,
  height: 48,
  bgcolor: "background.paper",
  borderRadius: "11px",
  color: "text.primary",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: (theme) =>
    theme.palette.mode === "dark" ? "none" : "0 1px 8px rgba(0,0,0,0.06)",
  "&:hover": { bgcolor: "action.hover" },
};
