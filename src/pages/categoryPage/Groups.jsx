import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { FiArchive, FiEdit2, FiMoreVertical, FiPlus, FiTrash2, FiUsers } from "react-icons/fi";
import { FaUserGraduate, FaUserTie } from "react-icons/fa";
import GroupDrawer from "./GroupDrawer";
import { purple } from "./constants";
import { api, getApiErrorMessage } from "../../api/axiosClient";
import { normalizeGroup } from "./groupUtils";

export default function Groups() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deletingGroup, setDeletingGroup] = useState(null);
  const [archiveMode, setArchiveMode] = useState(false);
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({ groups: 0, teachers: 0, students: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuGroup, setMenuGroup] = useState(null);

  const loadData = useCallback(async (showArchive = archiveMode) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [groupsRes, teachersRes, studentsRes] = await Promise.all([
        api.get(showArchive ? "/groups/archive" : "/groups/all"),
        api.get("/teachers"),
        api.get("/students"),
      ]);

      if (!groupsRes.data.success) {
        throw new Error(groupsRes.data.message || "Guruhlarni yuklashda xatolik");
      }

      const normalized = (groupsRes.data.data || []).map((group) => normalizeGroup(group, showArchive));
      setGroups(normalized);
      setStats({
        groups: normalized.length,
        teachers: teachersRes.data.success ? (teachersRes.data.data?.length || 0) : 0,
        students: studentsRes.data.success ? (studentsRes.data.data?.length || 0) : 0,
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Ma'lumotlarni yuklashda xatolik"));
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, [archiveMode]);

  useEffect(() => {
    loadData(archiveMode);
  }, [archiveMode, loadData]);

  const handleSave = async (payload) => {
    try {
      setSaveError("");
      const { data } = editingGroup
        ? await api.patch(`/groups/${editingGroup.id}`, payload)
        : await api.post("/groups", payload);

      if (!data.success) {
        throw new Error(data.message || "Guruhni saqlashda xatolik");
      }

      setDrawerOpen(false);
      setEditingGroup(null);
      await loadData(archiveMode);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Guruhni saqlashda xatolik"));
    }
  };

  const handleDelete = async () => {
    if (!deletingGroup) return;

    try {
      setSaveError("");
      const { data } = await api.delete(`/groups/${deletingGroup.id}`);

      if (!data.success) {
        throw new Error(data.message || "Guruhni o'chirishda xatolik");
      }

      setDeletingGroup(null);
      await loadData(archiveMode);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Guruhni o'chirishda xatolik"));
    }
  };

  const handleToggleActive = async (group, checked) => {
    try {
      setSaveError("");
      const { data } = await api.patch(`/groups/${group.id}`, { is_active: checked });

      if (!data.success) {
        throw new Error(data.message || "Statusni yangilashda xatolik");
      }

      setGroups((current) =>
        current.map((item) => (item.id === group.id ? { ...item, isActive: checked } : item))
      );
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Statusni yangilashda xatolik"));
    }
  };

  const openCreateDrawer = () => {
    setEditingGroup(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (group) => {
    setEditingGroup(group);
    setDrawerOpen(true);
    setMenuAnchor(null);
    setMenuGroup(null);
  };

  const statCards = [
    { label: "Jami guruhlar", value: stats.groups, icon: FiUsers },
    { label: "O'qituvchilar", value: stats.teachers, icon: FaUserTie },
    { label: "O'quvchilar", value: stats.students, icon: FaUserGraduate },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3.8 }}>
        <Typography component="h1" sx={{ fontSize: 30, fontWeight: 700, color: "#10131a" }}>
          Guruhlar
        </Typography>
        {!archiveMode && (
          <Button startIcon={<FiPlus size={21} />} onClick={openCreateDrawer} sx={primaryButtonStyles}>
            Guruh qo'shish
          </Button>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2.2, borderBottom: "1px solid #e7e8ed", mb: 2.6 }}>
        <Box
          role="button"
          tabIndex={0}
          onClick={() => setArchiveMode(false)}
          sx={{ ...tabStyles, ...(archiveMode ? inactiveTabStyles : activeTabStyles) }}
        >
          Guruhlar
        </Box>
        <Box
          role="button"
          tabIndex={0}
          onClick={() => setArchiveMode(true)}
          sx={{ ...tabStyles, ...(archiveMode ? activeTabStyles : inactiveTabStyles), gap: 0.9 }}
        >
          <FiArchive size={17} />
          Arxiv
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 2.2,
          mb: 2.8,
          "@media (max-width: 1100px)": { gridTemplateColumns: "1fr" },
        }}
      >
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <Paper
              key={card.label}
              elevation={0}
              sx={{
                height: 140,
                borderRadius: "12px",
                bgcolor: "#fff",
                px: 2.4,
                py: 2.2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, color: "#90949b" }}>
                <Icon size={26} color={purple} />
                <Typography sx={{ fontSize: 17, color: "#8b8f97" }}>{card.label}</Typography>
              </Box>
              <Typography sx={{ fontSize: 40, fontWeight: 800, color: "#17191f", lineHeight: 1 }}>
                {card.value}
              </Typography>
              <IconButton sx={{ position: "absolute", right: 12, top: 14, color: "#a6a9af" }}>
                <FiMoreVertical size={22} />
              </IconButton>
            </Paper>
          );
        })}
      </Box>

      <Paper elevation={0} sx={{ borderRadius: "12px", bgcolor: "#fff", overflow: "hidden" }}>
        <Table sx={{ minWidth: 1280 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={headCellStyles}>Status</TableCell>
              <TableCell sx={headCellStyles}>Guruh nomi</TableCell>
              <TableCell sx={headCellStyles}>Kurs</TableCell>
              <TableCell sx={headCellStyles}>Davomiyligi</TableCell>
              <TableCell sx={headCellStyles}>Dars vaqti</TableCell>
              <TableCell sx={headCellStyles}>Xona</TableCell>
              <TableCell sx={headCellStyles}>O'qituvchi</TableCell>
              <TableCell sx={headCellStyles}>Talabalar</TableCell>
              <TableCell align="right" sx={headCellStyles}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id} sx={{ height: 112 }}>
                <TableCell sx={bodyCellStyles}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Switch
                      checked={group.isActive}
                      disabled={archiveMode}
                      onChange={(event) => handleToggleActive(group, event.target.checked)}
                      sx={switchStyles}
                    />
                    <Box sx={group.isActive ? activeBadgeStyles : inactiveBadgeStyles}>
                      {group.isActive ? "FAOL" : "NOFAOL"}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={bodyCellStyles}>
                  <Typography
                    onClick={() => navigate(`/groups/${group.id}`)}
                    sx={{ ...dashedTextStyles, cursor: "pointer", "&:hover": { color: purple } }}
                  >
                    {group.name}
                  </Typography>
                </TableCell>
                <TableCell sx={bodyCellStyles}>
                  <Typography
                    onClick={() => navigate(`/groups/${group.id}`)}
                    sx={{ color: purple, fontSize: 17, fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                  >
                    {group.course}
                  </Typography>
                </TableCell>
                <TableCell sx={bodyCellStyles}>{group.duration}</TableCell>
                <TableCell sx={bodyCellStyles}>
                  <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>{group.lessonTime}</Typography>
                  <Typography sx={{ mt: 0.4, fontSize: 14, color: "#9ba0a8" }}>{group.days}</Typography>
                </TableCell>
                <TableCell sx={bodyCellStyles}>{group.room}</TableCell>
                <TableCell sx={bodyCellStyles}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1 }}>
                    {(group.teacherDetails || []).length > 0 ? (
                      group.teacherDetails.map((teacher) => (
                        <Typography
                          key={teacher.id}
                          onClick={() => navigate(`/teachers/${teacher.id}`)}
                          sx={{
                            fontSize: 17,
                            fontWeight: 700,
                            color: "#2563eb",
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          {teacher.name}
                        </Typography>
                      ))
                    ) : (
                      <Typography sx={{ fontSize: 15, color: "#9ba0a8" }}>—</Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={bodyCellStyles}>
                  <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>{group.students}</Typography>
                </TableCell>
                <TableCell align="right" sx={bodyCellStyles}>
                  <IconButton
                    sx={{ color: "#a0a4ab" }}
                    onClick={(event) => {
                      setMenuAnchor(event.currentTarget);
                      setMenuGroup(group);
                    }}
                  >
                    <FiMoreVertical size={22} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && !errorMessage && groups.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5, color: "#6b7280" }}>
                  {archiveMode ? "Arxivdagi guruhlar topilmadi" : "Guruhlar topilmadi"}
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5, color: "#6b7280" }}>
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            )}
            {errorMessage && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5, color: "#ef4444" }}>
                  {errorMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setMenuGroup(null);
        }}
      >
        <MenuItem
          onClick={() => menuGroup && openEditDrawer(menuGroup)}
          sx={{ gap: 1, fontWeight: 600 }}
        >
          <FiEdit2 size={16} />
          Tahrirlash
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeletingGroup(menuGroup);
            setMenuAnchor(null);
            setMenuGroup(null);
          }}
          sx={{ gap: 1, fontWeight: 600, color: "#ef4444" }}
        >
          <FiTrash2 size={16} />
          O'chirish
        </MenuItem>
      </Menu>

      <GroupDrawer
        open={drawerOpen}
        initialData={editingGroup}
        onClose={() => {
          setDrawerOpen(false);
          setEditingGroup(null);
        }}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deletingGroup)}
        title="Guruhni o'chirish"
        text={`"${deletingGroup?.name}" guruhini o'chirmoqchimisiz?`}
        onClose={() => setDeletingGroup(null)}
        onConfirm={handleDelete}
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
      <DialogContent sx={{ color: "#5e6570" }}>{text}</DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", color: "#4d5662" }}>Bekor qilish</Button>
        <Button
          onClick={onConfirm}
          sx={{ textTransform: "none", bgcolor: "#ef4444", color: "#fff", "&:hover": { bgcolor: "#dc2626" } }}
        >
          O'chirish
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const primaryButtonStyles = {
  height: 46,
  px: 2.5,
  borderRadius: "8px",
  bgcolor: purple,
  color: "#fff",
  fontSize: 17,
  fontWeight: 700,
  textTransform: "none",
  "&:hover": { bgcolor: "#684bcf" },
};

const tabStyles = {
  height: 42,
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  fontSize: 20,
  fontWeight: 700,
};

const activeTabStyles = {
  borderBottom: "2px solid #222",
  color: "#111827",
};

const inactiveTabStyles = {
  color: "#8c9199",
};

const headCellStyles = {
  height: 58,
  py: 0,
  color: "#7f858e",
  fontSize: 15.5,
  fontWeight: 700,
  borderBottom: "1px solid #edf0f4",
};

const bodyCellStyles = {
  py: 0,
  color: "#242832",
  fontSize: 17,
  borderBottom: "1px solid #edf0f4",
};

const switchStyles = {
  width: 48,
  height: 28,
  p: 0,
  "& .MuiSwitch-switchBase": {
    p: "3px",
    "&.Mui-checked": {
      transform: "translateX(20px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        bgcolor: purple,
        opacity: 1,
      },
    },
    "&:not(.Mui-checked) + .MuiSwitch-track": {
      bgcolor: "#ef4444",
      opacity: 1,
    },
  },
  "& .MuiSwitch-thumb": {
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 14,
    bgcolor: "#d8dbe2",
    opacity: 1,
  },
};

const activeBadgeStyles = {
  height: 25,
  px: 1.1,
  borderRadius: "8px",
  bgcolor: "#e8f7e9",
  color: "#21aa4b",
  display: "flex",
  alignItems: "center",
  fontSize: 14,
  fontWeight: 800,
};

const inactiveBadgeStyles = {
  height: 25,
  px: 1.1,
  borderRadius: "8px",
  bgcolor: "#fde8e8",
  color: "#e54848",
  display: "flex",
  alignItems: "center",
  fontSize: 14,
  fontWeight: 800,
};

const dashedTextStyles = {
  display: "inline-block",
  fontSize: 17,
  fontWeight: 700,
  color: "#111827",
  borderBottom: "1px dashed #a9adb5",
};
