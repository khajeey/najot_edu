import { useEffect, useState } from "react";
import {
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Snackbar,
  Alert,
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
import TeacherDrawer from "./TeacherDrawer";
import { api, getApiErrorMessage } from "../../api/axiosClient";
import { purple } from "./constants";
import { pageTitleSx, panelPaperSx } from "../../theme/surfaces";
import { getProfilePhotoUrl } from "../../utils/photos";

export default function Teachers() {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deletingTeacher, setDeletingTeacher] = useState(null);
  const [viewingTeacher, setViewingTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [archiveMode, setArchiveMode] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({
    group: "",
    address: "",
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const fetchTeachers = async (showArchive = archiveMode) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data } = await api.get(showArchive ? "/teachers/archive" : "/teachers");

      if (!data.success) {
        throw new Error(data.message || "O'qituvchilarni yuklashda xatolik");
      }

      setTeachers(data.data.map(normalizeTeacher));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Server bilan bog'lanishda xatolik"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchTeachers(archiveMode);
  }, [archiveMode]);

  useEffect(() => {
    if (location.state?.openCreate) {
      setEditingTeacher(null);
      setDrawerOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state?.openCreate, navigate]);

  const groupOptions = [...new Set(teachers.flatMap((teacher) => teacher.groups))].filter(Boolean);
  const addressOptions = [...new Set(teachers.map((teacher) => teacher.address))].filter(Boolean);
  const filteredTeachers = teachers.filter((teacher) => {
    const search = searchValue.trim().toLowerCase();
    const matchesSearch = !search
      || teacher.name.toLowerCase().includes(search)
      || teacher.phone.toLowerCase().includes(search)
      || teacher.email.toLowerCase().includes(search);
    const matchesGroup = !filters.group || teacher.groups.includes(filters.group);
    const matchesAddress = !filters.address || teacher.address === filters.address;

    return matchesSearch && matchesGroup && matchesAddress;
  });
  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const visibleTeachers = filteredTeachers.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  useEffect(() => {
    setPage(1);
  }, [searchValue, filters.group, filters.address]);

  const handleSave = async (teacher) => {
    try {
      setSaveError("");
      const formData = new FormData();

      formData.append("full_name", teacher.name);
      formData.append("email", teacher.email);
      formData.append("phone", teacher.phone);
      formData.append("address", teacher.address);

      if (teacher.password) {
        formData.append("password", teacher.password);
      } else if (!teacher.id) {
        formData.append("password", "Benazir99!");
      }

      if (teacher.photo) {
        formData.append("photo", teacher.photo);
      }

      teacher.groupIds.forEach((groupId) => {
        formData.append("groups", String(groupId));
      });

      const { data } = teacher.id
        ? await api.patch(`/teachers/${teacher.id}`, formData)
        : await api.post("/teachers", formData);

      if (!data.success) {
        throw new Error(data.message || "O'qituvchi saqlashda xatolik");
      }

      setEditingTeacher(null);
      setDrawerOpen(false);
      await fetchTeachers(archiveMode);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "O'qituvchi saqlashda xatolik"));
    }
  };

  const openCreateDrawer = () => {
    setEditingTeacher(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (teacher) => {
    setEditingTeacher(teacher);
    setDrawerOpen(true);
  };

  const handleDelete = async () => {
    try {
      setSaveError("");
      const { data } = await api.delete(`/teachers/${deletingTeacher.id}`);

      if (!data.success) {
        throw new Error(data.message || "O'qituvchi o'chirishda xatolik");
      }

      setDeletingTeacher(null);
      await fetchTeachers(archiveMode);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "O'qituvchi o'chirishda xatolik"));
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.8 }}>
        <Typography component="h1" sx={pageTitleSx}>
          O'qituvchilar
        </Typography>
        <Button
          startIcon={<FiPlus size={21} />}
          onClick={openCreateDrawer}
          sx={{
            height: 46,
            px: 2.7,
            borderRadius: "8px",
            bgcolor: purple,
            color: "#fff",
            fontSize: 17,
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { bgcolor: "#684bcf" },
          }}
        >
          O'qituvchi qo'shish
        </Button>
      </Box>

      <Typography sx={{ mb: 2.8, fontSize: 16.5, color: "#5e6570" }}>
        Ushbu sahifada siz o'qituvchilar ro'yxatini va ularning ma'lumotlarini topasiz.
        Har bir o'qituvchining ismi, fanlari va aloqa ma'lumotlari keltirilgan.
      </Typography>

      <Paper elevation={0} sx={{ ...panelPaperSx, borderRadius: "13px" }}>
        <Box
          sx={{
            height: 82,
            px: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #edf0f4",
          }}
        >
          <Box sx={{ display: "flex", gap: 1.2 }}>
            <Button
              startIcon={<FiFilter />}
              variant="outlined"
              onClick={() => setFilterOpen((value) => !value)}
              sx={{
                ...toolbarButtonStyles,
                ...(filterOpen ? activeToolbarButtonStyles : {}),
              }}
            >
              Filters
            </Button>
            <Button
              startIcon={<FiArchive />}
              variant="outlined"
              onClick={() => setArchiveMode((value) => !value)}
              sx={{
                ...toolbarButtonStyles,
                ...(archiveMode ? activeToolbarButtonStyles : {}),
              }}
            >
              {archiveMode ? "Faollar" : "Arxiv"}
            </Button>
          </Box>

          <TextField
            placeholder="Search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            sx={searchStyles}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiSearch size={21} color="#a0a5ad" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Collapse in={filterOpen}>
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: "1px solid #edf0f4",
              display: "grid",
              gridTemplateColumns: "220px 220px auto",
              gap: 1.5,
              alignItems: "center",
              bgcolor: "#fbfcfe",
              "@media (max-width: 900px)": {
                gridTemplateColumns: "1fr",
              },
            }}
          >
            <TextField
              select
              label="Guruh"
              size="small"
              value={filters.group}
              onChange={(event) => setFilters((current) => ({ ...current, group: event.target.value }))}
              sx={filterFieldStyles}
            >
              <MenuItem value="">Hammasi</MenuItem>
              {groupOptions.map((group) => (
                <MenuItem key={group} value={group}>{group}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Manzil"
              size="small"
              value={filters.address}
              onChange={(event) => setFilters((current) => ({ ...current, address: event.target.value }))}
              sx={filterFieldStyles}
            >
              <MenuItem value="">Hammasi</MenuItem>
              {addressOptions.map((address) => (
                <MenuItem key={address} value={address}>{address}</MenuItem>
              ))}
            </TextField>

            <Button
              onClick={() => {
                setFilters({ group: "", address: "" });
                setSearchValue("");
              }}
              sx={{
                justifySelf: "start",
                height: 40,
                px: 2,
                borderRadius: "8px",
                color: purple,
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "#f2edff" },
              }}
            >
              Tozalash
            </Button>
          </Box>
        </Collapse>

        <Table sx={{ minWidth: 1120 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={headCellStyles}>
                <Checkbox size="small" />
              </TableCell>
              <TableCell sx={headCellStyles}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                  Nomi <FiArrowDown size={16} />
                </Box>
              </TableCell>
              <TableCell sx={headCellStyles}>Guruh</TableCell>
              <TableCell sx={headCellStyles}>Telefon raqamlari</TableCell>
              <TableCell sx={headCellStyles}>Email</TableCell>
              <TableCell sx={headCellStyles}>Manzil</TableCell>
              <TableCell sx={headCellStyles}>Yaratilgan sana</TableCell>
              <TableCell align="right" sx={headCellStyles}>Amallar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleTeachers.map((teacher) => (
              <TableRow key={teacher.id} sx={{ height: 76 }}>
                <TableCell padding="checkbox" sx={bodyCellStyles}>
                  <Checkbox size="small" />
                </TableCell>
                <TableCell sx={bodyCellStyles}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.4,
                      cursor: "pointer",
                      "&:hover .teacher-name": { color: purple },
                    }}
                    onClick={() => navigate(`/teachers/${teacher.id}`)}
                  >
                    {teacher.avatar ? (
                      <Box
                        component="img"
                        src={teacher.avatar}
                        alt={teacher.name}
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: "8px",
                          objectFit: "cover",
                          bgcolor: "#f4f5f7",
                        }}
                      />
                    ) : (
                      <Box sx={avatarFallbackStyles}>{teacher.name.charAt(0).toUpperCase()}</Box>
                    )}
                    <Typography className="teacher-name" sx={{ fontSize: 17, fontWeight: 700, color: "#20232a" }}>
                      {teacher.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={bodyCellStyles}>
                  <Box sx={{ display: "flex", gap: 0.7 }}>
                    {teacher.groups.map((group) => (
                      <Box key={group} sx={groupBadgeStyles}>{group}</Box>
                    ))}
                  </Box>
                </TableCell>
                <TableCell sx={bodyCellStyles}>{teacher.phone}</TableCell>
                <TableCell sx={bodyCellStyles}>{teacher.email}</TableCell>
                <TableCell sx={bodyCellStyles}>{teacher.address}</TableCell>
                <TableCell sx={bodyCellStyles}>{teacher.createdAt}</TableCell>
                <TableCell align="right" sx={bodyCellStyles}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.2 }}>
                    <IconButton
                      aria-label="view"
                      onClick={() => navigate(`/teachers/${teacher.id}`)}
                      sx={actionButtonStyles}
                    >
                      <FiEye size={19} />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={() => setDeletingTeacher(teacher)} sx={actionButtonStyles}>
                      <FiTrash2 size={19} />
                    </IconButton>
                    <IconButton aria-label="edit" onClick={() => openEditDrawer(teacher)} sx={actionButtonStyles}>
                      <FiEdit2 size={19} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && !errorMessage && filteredTeachers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5, color: "#6b7280" }}>
                  {archiveMode ? "Arxivdagi o'qituvchilar topilmadi" : "O'qituvchilar topilmadi"}
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5, color: "#6b7280" }}>
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            )}
            {errorMessage && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5, color: "#ef4444" }}>
                  {errorMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Box
          sx={{
            height: 82,
            px: 4.5,
            borderTop: "1px solid #edf0f4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            startIcon={<FiArrowLeft />}
            disabled={safePage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            sx={paginationSideButton}
          >
            Previous
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.1 }}>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <Box
                key={pageNumber}
                role="button"
                tabIndex={0}
                onClick={() => setPage(pageNumber)}
                sx={{
                  width: safePage === pageNumber ? 40 : 35,
                  height: 40,
                  borderRadius: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: safePage === pageNumber ? purple : "transparent",
                  color: safePage === pageNumber ? "#fff" : "#59606b",
                  fontSize: 18,
                  fontWeight: safePage === pageNumber ? 700 : 400,
                  cursor: "pointer",
                }}
              >
                {pageNumber}
              </Box>
            ))}
          </Box>
          <Button
            endIcon={<FiArrowRight />}
            disabled={safePage === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            sx={paginationSideButton}
          >
            Next
          </Button>
        </Box>
      </Paper>

      <TeacherDrawer
        open={drawerOpen}
        initialData={editingTeacher}
        onClose={() => {
          setDrawerOpen(false);
          setEditingTeacher(null);
        }}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deletingTeacher)}
        title="O'qituvchini o'chirish"
        text={`${deletingTeacher?.name || ""} ma'lumotini o'chirishni tasdiqlaysizmi?`}
        onClose={() => setDeletingTeacher(null)}
        onConfirm={handleDelete}
      />

      <InfoDialog
        open={Boolean(viewingTeacher)}
        title="O'qituvchi ma'lumotlari"
        item={viewingTeacher}
        onClose={() => setViewingTeacher(null)}
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

function normalizeTeacher(teacher) {
  return {
    id: teacher.id,
    name: teacher.full_name || "",
    avatar: getProfilePhotoUrl(teacher.photo),
    groupIds: teacher.GroupTeacher?.map((item) => item.Group?.id).filter(Boolean) || [],
    groups: teacher.groups?.length
      ? teacher.groups
      : teacher.GroupTeacher?.map((item) => item.Group?.name).filter(Boolean) || [],
    phone: teacher.phone || "",
    email: teacher.email || "",
    address: teacher.address || "",
    createdAt: formatDate(teacher.created_at),
  };
}

function formatDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function ConfirmDialog({ open, title, text, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent sx={{ color: "#5e6570" }}>{text}</DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", color: "#4d5662" }}>Bekor qilish</Button>
        <Button onClick={onConfirm} sx={{ textTransform: "none", bgcolor: "#ef4444", color: "#fff", "&:hover": { bgcolor: "#dc2626" } }}>
          O'chirish
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function InfoDialog({ open, title, item, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent sx={{ minWidth: 320, color: "#39404c" }}>
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

const toolbarButtonStyles = {
  height: 48,
  px: 2,
  borderRadius: "9px",
  borderColor: "#dfe3eb",
  color: "#26313f",
  fontSize: 16,
  fontWeight: 700,
  textTransform: "none",
  "&:hover": { borderColor: "#cfd6e2", bgcolor: "#fafbfc" },
};

const activeToolbarButtonStyles = {
  borderColor: "#d8cff5",
  bgcolor: "#f1edff",
  color: purple,
  "&:hover": {
    borderColor: "#c7b8f2",
    bgcolor: "#ebe4ff",
  },
};

const searchStyles = {
  width: 275,
  "& .MuiOutlinedInput-root": {
    height: 48,
    borderRadius: "9px",
    fontSize: 18,
    "& fieldset": { borderColor: "#e2e6ed" },
    "&:hover fieldset": { borderColor: "#d5dae4" },
    "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 },
  },
};

const filterFieldStyles = {
  "& .MuiInputLabel-root": {
    color: "#707782",
  },
  "& .MuiOutlinedInput-root": {
    height: 40,
    borderRadius: "8px",
    bgcolor: "#fff",
    "& fieldset": { borderColor: "#dfe3eb" },
    "&:hover fieldset": { borderColor: "#cfd6e2" },
    "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 },
  },
};

const headCellStyles = {
  height: 58,
  py: 0,
  color: "#858b95",
  fontSize: 16.5,
  fontWeight: 700,
  borderBottom: "1px solid #edf0f4",
};

const bodyCellStyles = {
  py: 0,
  color: "#39404c",
  fontSize: 17,
  borderBottom: "1px solid #edf0f4",
};

const groupBadgeStyles = {
  height: 32,
  px: 1.2,
  borderRadius: "7px",
  bgcolor: "#f4f4f5",
  border: "1px solid #ebedf1",
  display: "flex",
  alignItems: "center",
  color: "#424854",
  fontSize: 15,
};

const avatarFallbackStyles = {
  width: 38,
  height: 38,
  borderRadius: "8px",
  bgcolor: "#f0eafb",
  color: purple,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 17,
  fontWeight: 700,
};

const actionButtonStyles = {
  width: 30,
  height: 30,
  color: "#818892",
  "&:hover": {
    bgcolor: "#f2f0fb",
    color: purple,
  },
};

const paginationSideButton = {
  color: "#4d5662",
  fontSize: 16,
  fontWeight: 700,
  textTransform: "none",
  "&:hover": { bgcolor: "#f6f7f9" },
};
