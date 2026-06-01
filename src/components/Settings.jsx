import { Box, IconButton, Paper, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { FiBookOpen, FiGrid, FiX } from "react-icons/fi";
import { FaUsers } from "react-icons/fa";

const purple = "#7456d8";

const settingsItems = [
  { label: "Kurslar", path: "/dashboard/boshqarish/kurslar", icon: FiBookOpen },
  { label: "Xonalar", path: "/dashboard/boshqarish/xonalar", icon: FiGrid },
  { label: "Xodimlar", path: "/dashboard/boshqarish/hodimlar", icon: FaUsers },
];

export default function Settings({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Paper
      elevation={0}
      square
      sx={{
        width: 250,
        minHeight: "calc(100vh - 2px)",
        flexShrink: 0,
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        borderRadius: "0 14px 14px 0",
        boxShadow: "12px 0 28px rgba(21, 21, 27, 0.07)",
        px: 1.25,
        py: 2.25,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.2, px: 0.8 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary" }}>Boshqarish</Typography>
        <IconButton
          aria-label="settings close"
          onClick={onClose}
          sx={{
            width: 34,
            height: 34,
            borderRadius: "9px",
            bgcolor: "#eee8fb",
            color: purple,
            "&:hover": { bgcolor: "#e5dcfb" },
          }}
        >
          <FiX size={22} />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {settingsItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <Box
              key={item.path}
              role="button"
              tabIndex={0}
              onClick={() => navigate(item.path)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  navigate(item.path);
                }
              }}
              sx={{
                height: 57,
                px: 1.6,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: 1.4,
                cursor: "pointer",
                outline: "none",
                bgcolor: active ? "#f0eafb" : "transparent",
                color: active ? purple : "#565b65",
                transition: "background-color 160ms ease, color 160ms ease",
                "&:hover": {
                  bgcolor: "#f0eafb",
                  color: purple,
                },
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "8px",
                  bgcolor: "#eee8fb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: purple,
                  flexShrink: 0,
                }}
              >
                <Icon size={18} />
              </Box>
              <Typography sx={{ fontSize: 17, fontWeight: 500 }}>{item.label}</Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
