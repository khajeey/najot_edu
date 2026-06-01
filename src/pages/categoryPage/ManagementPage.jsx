import { useState } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import CourseDrawer from "./CourseDrawer";
import DataCard from "./DataCard";
import RoomCard from "./RoomCard";
import RoomDrawer from "./RoomDrawer";
import { mockData } from "./mockData";
import { managementTabs, purple } from "./constants";

export default function ManagementPage({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [itemsByTab, setItemsByTab] = useState(mockData);
  const activeTab = managementTabs.find((tab) => location.pathname === tab.path) || managementTabs[0];
  const items = itemsByTab[activeTab.key];

  const handleCourseSave = (course) => {
    setItemsByTab((current) => ({
      ...current,
      courses: [course, ...current.courses],
    }));
    setDrawerOpen(false);
  };

  const handleRoomSave = (room) => {
    setItemsByTab((current) => ({
      ...current,
      rooms: [room, ...current.rooms],
    }));
    setDrawerOpen(false);
  };

  return (
    <Box>
      <Typography
        component="h1"
        sx={{ mb: 2.7, fontSize: 30, lineHeight: 1.15, fontWeight: 700, color: "#14171f" }}
      >
        Boshqarish
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3.3,
          height: 38,
          borderBottom: "1px solid #e7e8ed",
          mb: 3.8,
        }}
      >
        {managementTabs.map((tab) => {
          const active = activeTab.path === tab.path;

          return (
            <Box
              key={tab.path}
              role="button"
              tabIndex={0}
              onClick={() => navigate(tab.path)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  navigate(tab.path);
                }
              }}
              sx={{
                height: 38,
                display: "flex",
                alignItems: "flex-start",
                color: active ? purple : "#7a7f89",
                fontSize: 19,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                borderBottom: active ? `2px solid ${purple}` : "2px solid transparent",
                outline: "none",
              }}
            >
              {tab.label}
            </Box>
          );
        })}
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: "18px",
          bgcolor: "#fff",
          px: { xs: 2, xl: 3.8 },
          pt: 3.6,
          pb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3.8,
          }}
        >
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#07090f" }}>{title}</Typography>
          <Button
            startIcon={<FiPlus size={22} />}
            onClick={() => setDrawerOpen(true)}
            sx={{
              height: 51,
              px: 2.7,
              borderRadius: "8px",
              bgcolor: purple,
              color: "#fff",
              fontSize: 18,
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { bgcolor: "#684bcf" },
            }}
          >
            {title} qo'shish
          </Button>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 3,
            "@media (max-width: 1350px)": {
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            },
            "@media (max-width: 900px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          {items.map((item) => (
            activeTab.key === "rooms"
              ? <RoomCard key={item.title} item={item} />
              : <DataCard key={item.title} item={item} />
          ))}
        </Box>
      </Paper>

      {activeTab.key === "rooms" ? (
        <RoomDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSave={handleRoomSave} />
      ) : (
        <CourseDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSave={handleCourseSave} />
      )}
    </Box>
  );
}
