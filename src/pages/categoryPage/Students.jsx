import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  FiArchive,
  FiArrowDown,
  FiArrowLeft,
  FiArrowRight,
  FiEdit2,
  FiEye,
  FiFilter,
  FiPlus,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { getProfilePhotoUrl } from "../../utils/photos";
import { isValidUzPhone, normalizePhone } from "../../utils/phone";
import { api, getApiErrorMessage } from "../../api/axiosClient";
import StudentDrawer from "./StudentDrawer";
import { purple } from "./constants";
import { pageTitleSx, panelPaperSx } from "../../theme/surfaces";

const rowsPerPage = 5;

export default function Students() {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [archiveMode, setArchiveMode] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({ group: "", address: "" });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const fetchStudents = async (showArchive = archiveMode) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data } = await api.get(showArchive ? "/students/archive" : "/students");

      if (!data.success) {
        throw new Error(data.message || "Talabalarni yuklashda xatolik");
      }

      setStudents(data.data.map(normalizeStudent).sort((a, b) => b.id - a.id));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Server bilan bog'lanishda xatolik"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchStudents(archiveMode);
  }, [archiveMode]);

  useEffect(() => {
    setPage(1);
  }, [searchValue, filters.group, filters.address]);

  useEffect(() => {
    if (location.state?.openCreate) {
      setEditingStudent(null);
      setDrawerOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state?.openCreate, navigate]);

  const groupOptions = [...new Set(students.flatMap((student) => student.groups))].filter(Boolean);
  const addressOptions = [...new Set(students.map((student) => student.address))].filter(Boolean);
  const filteredStudents = students.filter((student) => {
    const search = searchValue.trim().toLowerCase();
    const matchesSearch = !search
      || student.name.toLowerCase().includes(search)
      || student.phone.toLowerCase().includes(search)
      || student.email.toLowerCase().includes(search);
    const matchesGroup = !filters.group || student.groups.includes(filters.group);
    const matchesAddress = !filters.address || student.address === filters.address;

    return matchesSearch && matchesGroup && matchesAddress;
  });
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const visibleStudents = filteredStudents.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const handleSave = async (student) => {
    try {
      setSaveError("");

      if (!isValidUzPhone(student.phone)) {
        setSaveError("Telefon raqamini to'liq kiriting: +998 va 9 ta raqam");
        return;
      }

      if (!/^\S+@\S+\.\S+$/.test(student.email.trim())) {
        setSaveError("Email manzilini to'g'ri kiriting (masalan: ism@example.com)");
        return;
      }

      const formData = new FormData();

      formData.append("full_name", student.name);
      formData.append("email", student.email.trim());
      formData.append("phone", normalizePhone(student.phone));
      formData.append("address", student.address);
      formData.append("birth_date", student.birthDateRaw);

      if (student.password) {
        formData.append("password", student.password);
      } else if (!student.id) {
        formData.append("password", "Benazir99!");
      }

      if (student.photo) {
        formData.append("photo", student.photo);
      }

      student.groupIds.forEach((groupId) => {
        formData.append("groups", String(groupId));
      });

      const { data } = student.id
        ? await api.patch(`/students/${student.id}`, formData)
        : await api.post("/students", formData);

      if (!data.success) {
        throw new Error(data.message || "Talabani saqlashda xatolik");
      }

      setEditingStudent(null);
      setDrawerOpen(false);
      await fetchStudents(archiveMode);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Talabani saqlashda xatolik"));
    }
  };

  const handleDelete = async () => {
    try {
      setSaveError("");
      const { data } = await api.delete(`/students/${deletingStudent.id}`);

      if (!data.success) {
        throw new Error(data.message || "Talabani o'chirishda xatolik");
      }

      setDeletingStudent(null);
      await fetchStudents(archiveMode);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Talabani o'chirishda xatolik"));
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.2 }}>
        <Typography component="h1" sx={pageTitleSx}>
          Talabalar
        </Typography>
        <Button
          startIcon={<FiPlus size={21} />}
          onClick={() => {
            setEditingStudent(null);
            setDrawerOpen(true);
          }}
          sx={primaryButtonStyles}
        >
          Talaba qo'shish
        </Button>
      </Box>

      <Typography sx={{ mb: 2.8, fontSize: 16.5, color: "text.secondary" }}>
        Ushbu sahifada siz Talabalar ro'yxatini va ularning ma'lumotlarini topasiz.
        Har bir Talaba ismi, fanlari va aloqa ma'lumotlari keltirilgan.
      </Typography>

      <Paper elevation={0} sx={{ ...panelPaperSx, borderRadius: "13px" }}>
        <Box sx={toolbarStyles}>
          <TextField
            placeholder="Search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            sx={searchStyles}
            InputProps={{ startAdornment: <InputAdornment position="start"><FiSearch size={19} color="#a0a5ad" /></InputAdornment> }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              startIcon={<FiFilter />}
              variant="outlined"
              onClick={() => setFilterOpen((value) => !value)}
              sx={{ ...toolbarButtonStyles, ...(filterOpen ? activeToolbarButtonStyles : {}) }}
            >
              Filters
            </Button>
            <Button
              startIcon={<FiArchive />}
              variant="outlined"
              onClick={() => setArchiveMode((value) => !value)}
              sx={{ ...toolbarButtonStyles, ...(archiveMode ? activeToolbarButtonStyles : {}) }}
            >
              {archiveMode ? "Faollar" : "Arxiv"}
            </Button>
          </Box>
        </Box>

        <Collapse in={filterOpen}>
          <Box sx={filterPanelStyles}>
            <TextField select label="Guruh" size="small" value={filters.group} onChange={(event) => setFilters((current) => ({ ...current, group: event.target.value }))} sx={filterFieldStyles}>
              <MenuItem value="">Hammasi</MenuItem>
              {groupOptions.map((group) => <MenuItem key={group} value={group}>{group}</MenuItem>)}
            </TextField>
            <TextField select label="Manzil" size="small" value={filters.address} onChange={(event) => setFilters((current) => ({ ...current, address: event.target.value }))} sx={filterFieldStyles}>
              <MenuItem value="">Hammasi</MenuItem>
              {addressOptions.map((address) => <MenuItem key={address} value={address}>{address}</MenuItem>)}
            </TextField>
            <Button onClick={() => { setFilters({ group: "", address: "" }); setSearchValue(""); }} sx={clearButtonStyles}>
              Tozalash
            </Button>
          </Box>
        </Collapse>

        <Table sx={{ minWidth: 1120 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={headCellStyles}><Checkbox size="small" /></TableCell>
              <TableCell sx={headCellStyles}><Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>Nomi <FiArrowDown size={16} /></Box></TableCell>
              <TableCell sx={headCellStyles}>Guruh</TableCell>
              <TableCell sx={headCellStyles}>Telefon raqamlari</TableCell>
              <TableCell sx={headCellStyles}>Email</TableCell>
              <TableCell sx={headCellStyles}>Tug'ilgan sanasi</TableCell>
              <TableCell sx={headCellStyles}>Manzil</TableCell>
              <TableCell sx={headCellStyles}>Yaratilgan sana</TableCell>
              <TableCell align="right" sx={headCellStyles}>Amallar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleStudents.map((student) => (
              <TableRow key={student.id} sx={{ height: 54 }}>
                <TableCell padding="checkbox" sx={bodyCellStyles}><Checkbox size="small" /></TableCell>
                <TableCell sx={bodyCellStyles}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      cursor: "pointer",
                      "&:hover .student-name": { color: purple },
                    }}
                    onClick={() => navigate(`/students/${student.id}`)}
                  >
                    {student.avatar ? <Box component="img" src={student.avatar} alt={student.name} sx={imageAvatarStyles} /> : <Box sx={avatarStyles}>{student.name.charAt(0)}</Box>}
                    <Typography className="student-name" sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>{student.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={bodyCellStyles}><Box sx={{ display: "flex", gap: 0.6 }}>{student.groups.map((group) => <Box key={group} sx={groupBadgeStyles}>{group}</Box>)}</Box></TableCell>
                <TableCell sx={bodyCellStyles}>{student.phone}</TableCell>
                <TableCell sx={bodyCellStyles}>{student.email}</TableCell>
                <TableCell sx={bodyCellStyles}>{student.birthDate}</TableCell>
                <TableCell sx={bodyCellStyles}>{student.address}</TableCell>
                <TableCell sx={bodyCellStyles}>{student.createdAt}</TableCell>
                <TableCell align="right" sx={bodyCellStyles}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.8 }}>
                    <IconButton aria-label="view" onClick={() => navigate(`/students/${student.id}`)} sx={actionButtonStyles}><FiEye size={16} /></IconButton>
                    <IconButton aria-label="delete" onClick={() => setDeletingStudent(student)} sx={actionButtonStyles}><FiTrash2 size={16} /></IconButton>
                    <IconButton aria-label="edit" onClick={() => { setEditingStudent(student); setDrawerOpen(true); }} sx={actionButtonStyles}><FiEdit2 size={16} /></IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && !errorMessage && filteredStudents.length === 0 && (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 5, color: "text.secondary" }}>{archiveMode ? "Arxivdagi talabalar topilmadi" : "Talabalar topilmadi"}</TableCell></TableRow>
            )}
            {isLoading && <TableRow><TableCell colSpan={9} align="center" sx={{ py: 5, color: "text.secondary" }}>Yuklanmoqda...</TableCell></TableRow>}
            {errorMessage && <TableRow><TableCell colSpan={9} align="center" sx={{ py: 5, color: "#ef4444" }}>{errorMessage}</TableCell></TableRow>}
          </TableBody>
        </Table>

        <Box sx={paginationStyles}>
          <Button startIcon={<FiArrowLeft />} disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} sx={paginationSideButton}>Previous</Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <Box key={pageNumber} onClick={() => setPage(pageNumber)} sx={{ ...pageButtonStyles, ...(safePage === pageNumber ? activePageStyles : {}) }}>{pageNumber}</Box>
            ))}
          </Box>
          <Button endIcon={<FiArrowRight />} disabled={safePage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} sx={paginationSideButton}>Next</Button>
        </Box>
      </Paper>

      <StudentDrawer open={drawerOpen} initialData={editingStudent} onClose={() => { setDrawerOpen(false); setEditingStudent(null); }} onSave={handleSave} />
      <ConfirmDialog open={Boolean(deletingStudent)} title="Talabani o'chirish" text={`${deletingStudent?.name || ""} ma'lumotini o'chirishni tasdiqlaysizmi?`} onClose={() => setDeletingStudent(null)} onConfirm={handleDelete} />
      <InfoDialog open={Boolean(viewingStudent)} title="Talaba ma'lumotlari" item={viewingStudent} onClose={() => setViewingStudent(null)} />

      <Snackbar open={Boolean(saveError)} autoHideDuration={4000} onClose={() => setSaveError("")} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity="error" variant="filled" onClose={() => setSaveError("")}>{saveError}</Alert>
      </Snackbar>
    </Box>
  );
}

function normalizeStudent(student) {
  const groups = student.groups || [];

  return {
    id: student.id,
    name: student.full_name || "",
    avatar: getProfilePhotoUrl(student.photo),
    groupIds: groups.map((group) => group.id).filter(Boolean),
    groups: groups.map((group) => group.name).filter(Boolean),
    phone: student.phone || "",
    email: student.email || "",
    birthDateRaw: toInputDate(student.birth_date),
    birthDate: formatDate(student.birth_date),
    address: student.address || "",
    createdAt: formatDate(student.created_at),
  };
}

function toInputDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function ConfirmDialog({ open, title, text, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent sx={{ color: "text.secondary" }}>{text}</DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", color: "text.secondary" }}>Bekor qilish</Button>
        <Button onClick={onConfirm} sx={{ textTransform: "none", bgcolor: "#ef4444", color: "#fff", "&:hover": { bgcolor: "#dc2626" } }}>O'chirish</Button>
      </DialogActions>
    </Dialog>
  );
}

function InfoDialog({ open, title, item, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent sx={{ minWidth: 320, color: "text.primary" }}>
        <Typography>Ism: {item?.name}</Typography>
        <Typography>Telefon: {item?.phone}</Typography>
        <Typography>Email: {item?.email}</Typography>
        <Typography>Manzil: {item?.address}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", color: purple }}>Yopish</Button>
      </DialogActions>
    </Dialog>
  );
}

const primaryButtonStyles = { height: 46, px: 2.7, borderRadius: "8px", bgcolor: purple, color: "#fff", fontSize: 17, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#684bcf" } };
const toolbarStyles = { height: 66, px: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid", borderBottomColor: "divider" };
const toolbarButtonStyles = { height: 38, px: 1.8, borderRadius: "8px", borderColor: "divider", color: "text.primary", fontSize: 14, fontWeight: 700, textTransform: "none", "&:hover": { borderColor: "divider", bgcolor: "action.hover" } };
const activeToolbarButtonStyles = { borderColor: "#d8cff5", bgcolor: "#f1edff", color: purple, "&:hover": { borderColor: "#c7b8f2", bgcolor: "#ebe4ff" } };
const searchStyles = { width: 250, "& .MuiOutlinedInput-root": { height: 38, borderRadius: "8px", fontSize: 14, "& fieldset": { borderColor: "divider" }, "&:hover fieldset": { borderColor: "divider" }, "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 } } };
const filterPanelStyles = { px: 2, py: 2, borderBottom: "1px solid", borderBottomColor: "divider", display: "grid", gridTemplateColumns: "220px 220px auto", gap: 1.5, alignItems: "center", bgcolor: "action.hover" };
const filterFieldStyles = { "& .MuiOutlinedInput-root": { height: 40, borderRadius: "8px", bgcolor: "background.paper", "& fieldset": { borderColor: "divider" }, "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 } } };
const clearButtonStyles = { justifySelf: "start", height: 40, px: 2, borderRadius: "8px", color: purple, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#f2edff" } };
const headCellStyles = { height: 48, py: 0, color: "text.secondary", fontSize: 13.5, fontWeight: 700, borderBottom: "1px solid", borderBottomColor: "divider" };
const bodyCellStyles = { py: 0, color: "text.primary", fontSize: 13.5, borderBottom: "1px solid", borderBottomColor: "divider" };
const avatarStyles = { width: 34, height: 34, borderRadius: "50%", bgcolor: "#f0eafb", color: purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 };
const imageAvatarStyles = { width: 34, height: 34, borderRadius: "50%", objectFit: "cover", bgcolor: "action.hover" };
const groupBadgeStyles = { height: 26, px: 0.9, borderRadius: "7px", bgcolor: "action.hover", display: "flex", alignItems: "center", color: "text.primary", fontSize: 12 };
const actionButtonStyles = { width: 26, height: 26, color: "text.secondary", "&:hover": { bgcolor: "#f2f0fb", color: purple } };
const paginationStyles = { height: 68, px: 2.5, borderTop: "1px solid", borderTopColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" };
const paginationSideButton = { color: "text.secondary", fontSize: 14, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "action.hover" } };
const pageButtonStyles = { width: 34, height: 34, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "text.secondary", fontSize: 14, cursor: "pointer" };
const activePageStyles = { bgcolor: purple, color: "#fff", fontWeight: 700 };
