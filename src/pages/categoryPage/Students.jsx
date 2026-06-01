import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
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
import StudentDrawer from "./StudentDrawer";
import { purple } from "./constants";

const initialStudents = [
  { id: 1, name: "Ali Valiyev", groups: ["N26", "n105"], phone: "+998976541223", email: "ali@gmail.com", birthDate: "12.12.2010", address: "Sirdaryo", createdAt: "12.05.2026" },
  { id: 2, name: "Salim Qodirov", groups: ["n105"], phone: "+998977777777", email: "salim@gmail.com", birthDate: "14.01.2007", address: "Buxoro", createdAt: "14.05.2026" },
  { id: 3, name: "Bobur", groups: ["n105"], phone: "+998999999999", email: "bobur@gmail.com", birthDate: "14.03.2002", address: "Toshkent", createdAt: "14.05.2026" },
  { id: 4, name: "Qodir Salimov", groups: ["n105"], phone: "+998911111111", email: "qodir@gmail.com", birthDate: "29.04.2026", address: "O'zbekcha", createdAt: "14.05.2026" },
];

export default function Students() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [students, setStudents] = useState(initialStudents);

  const handleSave = (student) => {
    setStudents((current) => {
      if (student.id) {
        return current.map((item) => item.id === student.id ? { ...item, ...student } : item);
      }

      return [{ id: Date.now(), ...student }, ...current];
    });
    setEditingStudent(null);
    setDrawerOpen(false);
  };

  const openCreateDrawer = () => {
    setEditingStudent(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (student) => {
    setEditingStudent(student);
    setDrawerOpen(true);
  };

  const handleDelete = () => {
    setStudents((current) => current.filter((student) => student.id !== deletingStudent.id));
    setDeletingStudent(null);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.2 }}>
        <Typography component="h1" sx={{ fontSize: 30, fontWeight: 700, color: "#10131a" }}>
          Talabalar
        </Typography>
        <Button startIcon={<FiPlus size={21} />} onClick={openCreateDrawer} sx={primaryButtonStyles}>
          Talaba qo'shish
        </Button>
      </Box>

      <Typography sx={{ mb: 2.8, fontSize: 16.5, color: "#5e6570" }}>
        Ushbu sahifada siz Talabalar ro'yxatini va ularning ma'lumotlarini topasiz.
        Har bir Talaba ismi, fanlari va aloqa ma'lumotlari keltirilgan.
      </Typography>

      <Paper elevation={0} sx={{ borderRadius: "13px", bgcolor: "#fff", overflow: "hidden", border: "1px solid #edf0f4" }}>
        <Box sx={toolbarStyles}>
          <TextField
            placeholder="Search"
            sx={searchStyles}
            InputProps={{ startAdornment: <InputAdornment position="start"><FiSearch size={19} color="#a0a5ad" /></InputAdornment> }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button startIcon={<FiFilter />} variant="outlined" sx={toolbarButtonStyles}>Filters</Button>
            <Button startIcon={<FiArchive />} variant="outlined" sx={toolbarButtonStyles}>Arxiv</Button>
          </Box>
        </Box>

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
            {students.map((student) => (
              <TableRow key={student.id} sx={{ height: 54 }}>
                <TableCell padding="checkbox" sx={bodyCellStyles}><Checkbox size="small" /></TableCell>
                <TableCell sx={bodyCellStyles}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <Box sx={avatarStyles}>{student.name.charAt(0)}</Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#20232a" }}>{student.name}</Typography>
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
                    <IconButton aria-label="view" onClick={() => setViewingStudent(student)} sx={actionButtonStyles}><FiEye size={16} /></IconButton>
                    <IconButton aria-label="delete" onClick={() => setDeletingStudent(student)} sx={actionButtonStyles}><FiTrash2 size={16} /></IconButton>
                    <IconButton aria-label="edit" onClick={() => openEditDrawer(student)} sx={actionButtonStyles}><FiEdit2 size={16} /></IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={paginationStyles}>
          <Button startIcon={<FiArrowLeft />} sx={paginationSideButton}>Previous</Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {["1", "2", "3", "...", "8", "9", "10"].map((page) => <Box key={page} sx={{ ...pageButtonStyles, ...(page === "1" ? activePageStyles : {}) }}>{page}</Box>)}
          </Box>
          <Button endIcon={<FiArrowRight />} sx={paginationSideButton}>Next</Button>
        </Box>
      </Paper>

      <StudentDrawer open={drawerOpen} initialData={editingStudent} onClose={() => { setDrawerOpen(false); setEditingStudent(null); }} onSave={handleSave} />
      <ConfirmDialog open={Boolean(deletingStudent)} title="Talabani o'chirish" text={`${deletingStudent?.name || ""} ma'lumotini o'chirishni tasdiqlaysizmi?`} onClose={() => setDeletingStudent(null)} onConfirm={handleDelete} />
      <InfoDialog open={Boolean(viewingStudent)} title="Talaba ma'lumotlari" item={viewingStudent} onClose={() => setViewingStudent(null)} />
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
        <Button onClick={onConfirm} sx={{ textTransform: "none", bgcolor: "#ef4444", color: "#fff", "&:hover": { bgcolor: "#dc2626" } }}>O'chirish</Button>
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

const primaryButtonStyles = { height: 46, px: 2.7, borderRadius: "8px", bgcolor: purple, color: "#fff", fontSize: 17, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#684bcf" } };
const toolbarStyles = { height: 66, px: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #edf0f4" };
const toolbarButtonStyles = { height: 38, px: 1.8, borderRadius: "8px", borderColor: "#dfe3eb", color: "#26313f", fontSize: 14, fontWeight: 700, textTransform: "none", "&:hover": { borderColor: "#cfd6e2", bgcolor: "#fafbfc" } };
const searchStyles = { width: 250, "& .MuiOutlinedInput-root": { height: 38, borderRadius: "8px", fontSize: 14, "& fieldset": { borderColor: "#e2e6ed" }, "&:hover fieldset": { borderColor: "#d5dae4" }, "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 } } };
const headCellStyles = { height: 48, py: 0, color: "#858b95", fontSize: 13.5, fontWeight: 700, borderBottom: "1px solid #edf0f4" };
const bodyCellStyles = { py: 0, color: "#39404c", fontSize: 13.5, borderBottom: "1px solid #edf0f4" };
const avatarStyles = { width: 34, height: 34, borderRadius: "50%", bgcolor: "#f0eafb", color: purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 };
const groupBadgeStyles = { height: 26, px: 0.9, borderRadius: "7px", bgcolor: "#f4f4f5", display: "flex", alignItems: "center", color: "#424854", fontSize: 12 };
const actionButtonStyles = { width: 26, height: 26, color: "#818892", "&:hover": { bgcolor: "#f2f0fb", color: purple } };
const paginationStyles = { height: 68, px: 2.5, borderTop: "1px solid #edf0f4", display: "flex", alignItems: "center", justifyContent: "space-between" };
const paginationSideButton = { color: "#4d5662", fontSize: 14, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#f6f7f9" } };
const pageButtonStyles = { width: 34, height: 34, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#59606b", fontSize: 14 };
const activePageStyles = { bgcolor: purple, color: "#fff", fontWeight: 700 };
