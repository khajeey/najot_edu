import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import CourseDrawer from "./CourseDrawer";
import DataCard from "./DataCard";
import RoomCard from "./RoomCard";
import RoomDrawer from "./RoomDrawer";
import { managementTabs, purple } from "./constants";
import {
  buildCoursePayload,
  buildRoomPayload,
  createCourse,
  createRoom,
  deleteCourse,
  deleteRoom,
  fetchCourses,
  fetchRooms,
  fetchArchivedCourses,
  fetchArchivedRooms,
  updateCourse,
  updateRoom,
} from "./managementApi";
import { getApiErrorMessage } from "../../api/axiosClient";

export default function ManagementPage({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(null);
  const [subTab, setSubTab] = useState("active");

  const activeTab = managementTabs.find((tab) => location.pathname === tab.path) || managementTabs[0];
  const isStaffTab = activeTab.key === "staff";
  const isRoomsTab = activeTab.key === "rooms";
  const items = isRoomsTab ? rooms : courses;

  const loadItems = useCallback(async () => {
    if (isStaffTab) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      if (isRoomsTab) {
        if (subTab === "archive") {
          setRooms(await fetchArchivedRooms());
        } else {
          setRooms(await fetchRooms());
        }
      } else {
        if (subTab === "archive") {
          setCourses(await fetchArchivedCourses());
        } else {
          setCourses(await fetchCourses());
        }
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Ma'lumotlarni yuklashda xatolik"));
    } finally {
      setIsLoading(false);
    }
  }, [isRoomsTab, isStaffTab, subTab]);

  useEffect(() => {
    setSubTab("active");
  }, [location.pathname]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openCreateDrawer = () => {
    setEditingCourse(null);
    setEditingRoom(null);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingCourse(null);
    setEditingRoom(null);
  };

  const handleCourseSave = async (form) => {
    try {
      setSaveError("");
      const payload = buildCoursePayload(form);

      if (editingCourse?.id) {
        const updated = await updateCourse(editingCourse.id, payload);
        setCourses((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createCourse(payload);
        setCourses((current) => [created, ...current]);
      }

      closeDrawer();
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Kursni saqlashda xatolik"));
    }
  };

  const handleRoomSave = async (form) => {
    try {
      setSaveError("");
      const payload = buildRoomPayload(form);

      if (editingRoom?.id) {
        const updated = await updateRoom(editingRoom.id, payload);
        setRooms((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createRoom(payload);
        setRooms((current) => [created, ...current]);
      }

      closeDrawer();
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Xonani saqlashda xatolik"));
    }
  };

  const handleConfirmDeleteCourse = async () => {
    if (!deletingCourse?.id) return;

    try {
      setSaveError("");
      await deleteCourse(deletingCourse.id);
      setCourses((current) => current.filter((item) => item.id !== deletingCourse.id));
      setDeletingCourse(null);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Kursni o'chirishda xatolik"));
      setDeletingCourse(null);
    }
  };

  const handleConfirmDeleteRoom = async () => {
    if (!deletingRoom?.id) return;

    try {
      setSaveError("");
      await deleteRoom(deletingRoom.id);
      setRooms((current) => current.filter((item) => item.id !== deletingRoom.id));
      setDeletingRoom(null);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Xonani o'chirishda xatolik"));
      setDeletingRoom(null);
    }
  };

  return (
    <Box>
      <Typography
        component="h1"
        sx={{ mb: 2.2, fontSize: 22, lineHeight: 1.15, fontWeight: 700, color: "text.primary" }}
      >
        Boshqarish
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3.3,
          height: 38,
          borderBottom: "1px solid",
          borderColor: "divider",
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
                color: active ? purple : "text.secondary",
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
          bgcolor: "background.paper",
          px: { xs: 2, xl: 3.8 },
          pt: 3.6,
          pb: 4,
          border: "1px solid",
          borderColor: "divider",
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 3.8 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: "text.primary" }}>{title}</Typography>
            {!isStaffTab && (
              <Box sx={{ display: "flex", bgcolor: "action.hover", borderRadius: "8px", p: 0.5 }}>
                <Button
                  size="small"
                  onClick={() => setSubTab("active")}
                  sx={{
                    px: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    bgcolor: subTab === "active" ? "background.paper" : "transparent",
                    color: subTab === "active" ? purple : "text.secondary",
                    boxShadow: subTab === "active" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                    "&:hover": { bgcolor: subTab === "active" ? "background.paper" : "action.selected" },
                  }}
                >
                  Faol
                </Button>
                <Button
                  size="small"
                  onClick={() => setSubTab("archive")}
                  sx={{
                    px: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    bgcolor: subTab === "archive" ? "background.paper" : "transparent",
                    color: subTab === "archive" ? purple : "text.secondary",
                    boxShadow: subTab === "archive" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                    "&:hover": { bgcolor: subTab === "archive" ? "background.paper" : "action.selected" },
                  }}
                >
                  Arxiv
                </Button>
              </Box>
            )}
          </Box>
          {!isStaffTab && subTab === "active" && (
            <Button
              startIcon={<FiPlus size={22} />}
              onClick={openCreateDrawer}
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
          )}
        </Box>

        {isStaffTab ? (
          <Box
            sx={{
              py: 8,
              px: 3,
              textAlign: "center",
              borderRadius: "14px",
              border: "1px dashed",
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: "text.primary" }}>
              Xodimlar bo'limi tez orada qo'shiladi
            </Typography>
            <Typography sx={{ mt: 1.5, color: "text.secondary", fontSize: 16, maxWidth: 520, mx: "auto" }}>
              Hozircha xodim qo'shish va tahrirlash funksiyasi mavjud emas. Keyingi yangilanishda bu yerda
              xodimlar ro'yxati paydo bo'ladi.
            </Typography>
          </Box>
        ) : isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: purple }} />
          </Box>
        ) : errorMessage ? (
          <Typography sx={{ py: 4, textAlign: "center", color: "#ef4444", fontWeight: 600 }}>
            {errorMessage}
          </Typography>
        ) : items.length === 0 ? (
          <Typography sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
            {isRoomsTab ? "Xonalar topilmadi" : "Kurslar topilmadi"}
          </Typography>
        ) : (
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
            {items.map((item) =>
              isRoomsTab ? (
                <RoomCard
                  key={item.id}
                  item={item}
                  isArchived={subTab === "archive"}
                  onEdit={() => {
                    setEditingRoom(item);
                    setDrawerOpen(true);
                  }}
                  onDelete={() => setDeletingRoom(item)}
                />
              ) : (
                <DataCard
                  key={item.id}
                  item={item}
                  isArchived={subTab === "archive"}
                  onEdit={() => {
                    setEditingCourse(item);
                    setDrawerOpen(true);
                  }}
                  onDelete={() => setDeletingCourse(item)}
                />
              )
            )}
          </Box>
        )}
      </Paper>

      <CourseDrawer
        open={drawerOpen && !isRoomsTab && !isStaffTab}
        initialData={editingCourse}
        onClose={closeDrawer}
        onSave={handleCourseSave}
      />
      <RoomDrawer
        open={drawerOpen && isRoomsTab}
        initialData={editingRoom}
        onClose={closeDrawer}
        onSave={handleRoomSave}
      />

      <ConfirmDialog
        open={Boolean(deletingCourse)}
        title="Kursni o'chirish"
        text={`"${deletingCourse?.title || ""}" kursini o'chirishni tasdiqlaysizmi?`}
        onClose={() => setDeletingCourse(null)}
        onConfirm={handleConfirmDeleteCourse}
      />
      <ConfirmDialog
        open={Boolean(deletingRoom)}
        title="Xonani o'chirish"
        text={`"${deletingRoom?.title || ""}" xonasini o'chirishni tasdiqlaysizmi?`}
        onClose={() => setDeletingRoom(null)}
        onConfirm={handleConfirmDeleteRoom}
      />

      <Snackbar
        open={Boolean(saveError)}
        autoHideDuration={4000}
        onClose={() => setSaveError("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="error" variant="filled" onClose={() => setSaveError("")}>
          {saveError}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function ConfirmDialog({ open, title, text, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent sx={{ color: "text.secondary" }}>{text}</DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", color: "text.secondary" }}>
          Bekor qilish
        </Button>
        <Button
          onClick={onConfirm}
          sx={{
            textTransform: "none",
            bgcolor: "#ef4444",
            color: "#fff",
            "&:hover": { bgcolor: "#dc2626" },
          }}
        >
          O'chirish
        </Button>
      </DialogActions>
    </Dialog>
  );
}
