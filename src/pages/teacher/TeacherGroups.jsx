import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
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
  Tooltip,
  Typography,
} from "@mui/material";
import { FiArchive, FiMoreVertical, FiRefreshCw, FiUsers } from "react-icons/fi";
import { purple } from "../categoryPage/constants";
import { pageTitleSx, panelPaperSx } from "../../theme/surfaces";
import { getApiErrorMessage } from "../../api/axiosClient";
import { fetchTeacherGroups, TEACHER_GROUP_STATUS } from "./teacherApi";

export default function TeacherGroups({ variant = "active" }) {
  const [groups, setGroups] = useState([]);
  const [archiveMode, setArchiveMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuGroup, setMenuGroup] = useState(null);
  const [studentsGroup, setStudentsGroup] = useState(null);
  const [warningOpen, setWarningOpen] = useState(false);

  const title = variant === "planned" ? "Yig'ilayotgan guruhlar" : "Guruhlar";
  const mainStatuses = variant === "planned" ? TEACHER_GROUP_STATUS.planned : TEACHER_GROUP_STATUS.active;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      setGroups(await fetchTeacherGroups());
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Guruhlarni yuklashda xatolik"));
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setArchiveMode(false);
  }, [variant]);

  const visibleGroups = useMemo(
    () =>
      groups.filter((group) =>
        archiveMode
          ? TEACHER_GROUP_STATUS.archived.has(group.status)
          : mainStatuses.has(group.status)
      ),
    [groups, archiveMode, mainStatuses]
  );

  const openMenu = (event, group) => {
    setMenuAnchor(event.currentTarget);
    setMenuGroup(group);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuGroup(null);
  };

  return (
    <Box>
      <Typography component="h1" sx={{ ...pageTitleSx, mb: 3 }}>
        {title}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, mb: 2.6 }}>
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

      <Paper elevation={0} sx={panelPaperSx}>
        <Table sx={{ minWidth: 1180 }}>
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
              <TableCell align="right" sx={headCellStyles}>
                <Tooltip title="Yangilash">
                  <IconButton size="small" onClick={loadData} sx={{ color: "#9aa0a8" }}>
                    <FiRefreshCw size={18} />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleGroups.map((group) => (
              <TableRow key={group.id} sx={{ height: 96 }}>
                <TableCell sx={bodyCellStyles}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Switch
                      checked={group.isActive}
                      onChange={() => setWarningOpen(true)}
                      sx={switchStyles}
                    />
                    <Box sx={group.isActive ? activeBadgeStyles : inactiveBadgeStyles}>
                      {group.isActive ? "FAOL" : "NOFAOL"}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={bodyCellStyles}>
                  <Typography sx={{ fontSize: 17, fontWeight: 700, color: "text.primary" }}>
                    {group.name}
                  </Typography>
                </TableCell>
                <TableCell sx={bodyCellStyles}>
                  {group.course ? <Box sx={courseBadgeStyles}>{group.course}</Box> : "—"}
                </TableCell>
                <TableCell sx={bodyCellStyles}>{group.duration || "—"}</TableCell>
                <TableCell sx={bodyCellStyles}>
                  <Typography sx={{ fontSize: 17, fontWeight: 700, color: "text.primary" }}>
                    {group.lessonTime || "—"}
                  </Typography>
                  {group.days && (
                    <Typography sx={{ mt: 0.4, fontSize: 14, color: "#9ba0a8" }}>{group.days}</Typography>
                  )}
                </TableCell>
                <TableCell sx={bodyCellStyles}>{group.room || "—"}</TableCell>
                <TableCell sx={bodyCellStyles}></TableCell>
                <TableCell sx={bodyCellStyles}>
                  <Typography sx={{ fontSize: 17, fontWeight: 700, color: "text.primary" }}>
                    {group.students}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={bodyCellStyles}>
                  <IconButton sx={{ color: "#a0a4ab" }} onClick={(event) => openMenu(event, group)}>
                    <FiMoreVertical size={22} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && !errorMessage && visibleGroups.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, color: "#8a8f98", fontSize: 16 }}>
                  Hozircha guruhlar yo'q
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, color: "#6b7280" }}>
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            )}
            {errorMessage && !isLoading && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, color: "#ef4444" }}>
                  {errorMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            setStudentsGroup(menuGroup);
            closeMenu();
          }}
          sx={{ gap: 1.2, fontWeight: 600 }}
        >
          <FiUsers size={16} />
          Talabalar ro'yxati
        </MenuItem>
      </Menu>

      <StudentsDialog group={studentsGroup} onClose={() => setStudentsGroup(null)} />

      <Snackbar
        open={warningOpen}
        autoHideDuration={3500}
        onClose={() => setWarningOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="warning" variant="filled" onClose={() => setWarningOpen(false)}>
          Guruh holatini faqat administrator o'zgartira oladi
        </Alert>
      </Snackbar>
    </Box>
  );
}

function StudentsDialog({ group, onClose }) {
  const students = group?.studentList || [];

  return (
    <Dialog
      open={Boolean(group)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "16px" } } }}
    >
      <DialogContent sx={{ p: 4 }}>
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "text.primary" }}>
          {group?.name}
        </Typography>
        <Typography sx={{ fontSize: 15, color: "text.secondary", mb: 2.5 }}>
          Talabalar: {students.length}
        </Typography>
        <Paper elevation={0} sx={{ ...panelPaperSx, p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={headCellStyles}>#</TableCell>
                <TableCell sx={headCellStyles}>Talaba</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student, index) => (
                <TableRow key={student.id ?? index}>
                  <TableCell sx={{ ...bodyCellStyles, width: 64, color: "#9ba0a8" }}>{index + 1}</TableCell>
                  <TableCell sx={{ ...bodyCellStyles, fontWeight: 600 }}>
                    {student.full_name || student.name || "—"}
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 4, color: "#8a8f98" }}>
                    Talabalar yo'q
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </DialogContent>
    </Dialog>
  );
}

const tabStyles = {
  height: 42,
  px: 2.2,
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  borderRadius: "10px",
  fontSize: 16,
  fontWeight: 700,
  transition: "all 160ms ease",
};

const activeTabStyles = {
  bgcolor: "background.paper",
  color: "text.primary",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: (theme) => (theme.palette.mode === "dark" ? "none" : "0 1px 6px rgba(0,0,0,0.06)"),
};

const inactiveTabStyles = {
  color: "#8c9199",
  border: "1px solid transparent",
};

const headCellStyles = {
  height: 58,
  py: 0,
  color: "#7f858e",
  fontSize: 15.5,
  fontWeight: 700,
  borderBottom: "1px solid",
  borderColor: "divider",
};

const bodyCellStyles = {
  py: 0,
  color: "text.primary",
  fontSize: 17,
  borderBottom: "1px solid",
  borderColor: "divider",
};

const courseBadgeStyles = {
  display: "inline-flex",
  alignItems: "center",
  height: 28,
  px: 1.6,
  borderRadius: "999px",
  bgcolor: "#f4ebff",
  color: purple,
  fontSize: 14,
  fontWeight: 700,
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
      "& + .MuiSwitch-track": { bgcolor: purple, opacity: 1 },
    },
    "&:not(.Mui-checked) + .MuiSwitch-track": { bgcolor: "#ef4444", opacity: 1 },
  },
  "& .MuiSwitch-thumb": { width: 22, height: 22 },
  "& .MuiSwitch-track": { borderRadius: 14, bgcolor: "#d8dbe2", opacity: 1 },
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
