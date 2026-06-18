import { Suspense, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Select,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiBell,
  FiBarChart2,
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiHome,
  FiLogOut,
  FiPlus,
  FiRadio,
  FiSearch,
  FiSettings,
  FiShoppingCart,
  FiUsers,
} from "react-icons/fi";
import { FaMoon, FaSun } from "react-icons/fa";
import brandLogo from "../../assets/educoin.png";
import { useColorMode } from "../../theme/AppThemeProvider";
import { getUserInitial } from "../../api/auth";
import PageLoader from "../../components/PageLoader";

const purple = "#7456d8";
const flame = "#e8740e";
const flameFill = "#cc9869";

const menuItems = [
  { label: "Bosh sahifa", path: "/dashboard/home", icon: FiHome },
  { label: "To'lovlarim", path: "/dashboard/my-payments", icon: FiCreditCard },
  { label: "Guruhlarim", path: "/dashboard/my-groups", icon: FiUsers },
  { label: "Ko'rsatkichlarim", path: "/dashboard/my-stats", icon: FiBarChart2 },
  { label: "Reyting", path: "/dashboard/rating", icon: FiBarChart2 },
  { label: "Do'kon", path: "/dashboard/shop", icon: FiShoppingCart },
  { label: "Qo'shimcha darslar", path: "/dashboard/extra-lessons", icon: FiRadio },
  { label: "Sozlamalar", path: "/dashboard/settings", icon: FiSettings },
];

export default function StudentLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const theme = useTheme();

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
      <Sidebar collapsed={collapsed} />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          px: { xs: 2, lg: 3 },
          py: 2.25,
        }}
      >
        <Topbar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}

function Sidebar({ collapsed }) {
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
        borderRadius: "0 22px 22px 0",
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
          <Typography sx={{ color: purple, fontSize: 18, fontWeight: 700 }}>NajotEdu</Typography>
        )}
      </Box>

      <Box sx={{ px: 1.25, display: "flex", flexDirection: "column", gap: 0.8 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active =
            location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

          return (
            <Tooltip key={item.path} title={collapsed ? item.label : ""} placement="right" arrow>
              <Box
                role="button"
                tabIndex={0}
                onClick={() => navigate(item.path)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") navigate(item.path);
                }}
                sx={{
                  height: 54,
                  px: collapsed ? 0 : 2,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: 2,
                  bgcolor: active ? (isDark ? "#2b2017" : "#faf3ee") : "transparent",
                  color: active ? flame : "text.secondary",
                  cursor: "pointer",
                  outline: "none",
                  transition: "background-color 160ms ease, color 160ms ease",
                  "&:hover": {
                    bgcolor: active ? (isDark ? "#2b2017" : "#faf3ee") : "action.hover",
                    color: flame,
                  },
                }}
              >
                <Icon size={20} />
                {!collapsed && (
                  <Typography sx={{ flex: 1, fontSize: 15, fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      <Box sx={{ flex: 1 }} />
    </Paper>
  );
}

function Topbar({ collapsed, onToggle }) {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();

  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [addAnchor, setAddAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const today = new Date();
  const todayLabel = new Intl.DateTimeFormat("uz-UZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login", { replace: true });
  };

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
        <IconButton
          aria-label="collapse"
          onClick={onToggle}
          sx={{
            width: 44,
            height: 44,
            borderRadius: "11px",
            bgcolor: flameFill,
            color: "#fff",
            boxShadow: "0 2px 8px rgba(204, 152, 105, 0.4)",
            "&:hover": { bgcolor: "#bf8a5c" },
          }}
        >
          {collapsed ? <FiChevronRight size={22} /> : <FiChevronLeft size={22} />}
        </IconButton>

        <Tooltip title="Bugungi sana">
          <IconButton
            aria-label="calendar"
            onClick={(event) => setCalendarAnchor(event.currentTarget)}
            sx={surfaceIconButton}
          >
            <FiCalendar size={22} />
          </IconButton>
        </Tooltip>

        <Popover
          open={Boolean(calendarAnchor)}
          anchorEl={calendarAnchor}
          onClose={() => setCalendarAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{ paper: { sx: { mt: 1, borderRadius: "12px", p: 2, minWidth: 260 } } }}
        >
          <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>Bugun</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary" }}>
            {todayLabel}
          </Typography>
        </Popover>

        <Button
          startIcon={<FiPlus size={20} />}
          endIcon={<FiChevronDown size={18} />}
          onClick={(event) => setAddAnchor(event.currentTarget)}
          sx={{
            height: 44,
            px: 2,
            borderRadius: "11px",
            bgcolor: purple,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            textTransform: "none",
            minWidth: 140,
            "&:hover": { bgcolor: "#684bcf" },
          }}
        >
          Qo'shish
        </Button>

        <Menu
          anchorEl={addAnchor}
          open={Boolean(addAnchor)}
          onClose={() => setAddAnchor(null)}
          slotProps={{ paper: { sx: { mt: 1, borderRadius: "12px", minWidth: 220 } } }}
        >
          <MenuItem
            onClick={() => {
              setAddAnchor(null);
              navigate("/dashboard/extra-lessons");
            }}
            sx={{ gap: 1.5, py: 1.2, fontSize: 14, fontWeight: 600 }}
          >
            <FiRadio size={18} color={purple} />
            Qo'shimcha darsga yozilish
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAddAnchor(null);
              navigate("/dashboard/shop");
            }}
            sx={{ gap: 1.5, py: 1.2, fontSize: 14, fontWeight: 600 }}
          >
            <FiShoppingCart size={18} color={purple} />
            Do'kondan xarid
          </MenuItem>
        </Menu>

        <Paper
          elevation={0}
          sx={{
            height: 44,
            width: { xs: 190, lg: 250 },
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
          <FiSearch size={20} color="#9a9da4" />
          <InputBase
            placeholder="Qidirish..."
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: 14,
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
            width: 160,
            height: 44,
            bgcolor: "background.paper",
            borderRadius: "11px",
            fontSize: 14,
            color: "text.primary",
            "& fieldset": { borderColor: "divider" },
            "& .MuiSelect-select": { display: "flex", alignItems: "center", py: 0, pl: 2 },
            "& .MuiSelect-icon": { right: 14, color: "text.secondary", fontSize: 20 },
          }}
        >
          <MenuItem value="uz">O'zbekcha</MenuItem>
        </Select>

        <IconButton sx={surfaceIconButton}>
          <FiBell size={20} />
        </IconButton>

        <Tooltip title="Chiqish">
          <IconButton onClick={handleLogout} sx={surfaceIconButton} aria-label="logout">
            <FiLogOut size={18} />
          </IconButton>
        </Tooltip>

        <IconButton
          aria-label="toggle theme"
          onClick={toggleColorMode}
          sx={{
            ...surfaceIconButton,
            bgcolor: isDark ? "#fbbf24" : "#303d59",
            color: isDark ? "#1f2937" : "#fff",
            "&:hover": { bgcolor: isDark ? "#f59e0b" : "#303d59" },
          }}
        >
          {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
        </IconButton>

        <IconButton
          onClick={(event) => setProfileAnchor(event.currentTarget)}
          sx={{ p: 0, ml: 0.4 }}
          aria-label="profil"
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              bgcolor: purple,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {getUserInitial()}
          </Box>
        </IconButton>

        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={() => setProfileAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{ paper: { sx: { mt: 1, borderRadius: "12px", minWidth: 180 } } }}
        >
          <MenuItem
            onClick={() => {
              setProfileAnchor(null);
              navigate("/dashboard/settings");
            }}
            sx={{ gap: 1.5, py: 1.2, fontSize: 14, fontWeight: 600 }}
          >
            <FiSettings size={18} />
            Sozlamalar
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{ gap: 1.5, py: 1.2, fontSize: 14, fontWeight: 600, color: "#ef4444" }}
          >
            <FiLogOut size={18} />
            Chiqish
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}

const surfaceIconButton = {
  width: 44,
  height: 44,
  bgcolor: "background.paper",
  borderRadius: "11px",
  color: "text.primary",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: (theme) => (theme.palette.mode === "dark" ? "none" : "0 1px 8px rgba(0,0,0,0.06)"),
  "&:hover": { bgcolor: "action.hover" },
};
