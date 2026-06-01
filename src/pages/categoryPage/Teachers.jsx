import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
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
import TeacherDrawer from "./TeacherDrawer";
import { purple } from "./constants";

const initialTeachers = [
  {
    id: 1,
    name: "sardor",
    avatar: "",
    groups: ["N105", "just"],
    phone: "940027685",
    email: "sardor@gmail.com",
    address: "Toshkent",
    createdAt: "31.05.2026",
  },
];

export default function Teachers() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [teachers, setTeachers] = useState(initialTeachers);

  const handleSave = (teacher) => {
    setTeachers((current) => [
      {
        id: Date.now(),
        avatar: "",
        ...teacher,
      },
      ...current,
    ]);
    setDrawerOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.8 }}>
        <Typography component="h1" sx={{ fontSize: 30, fontWeight: 700, color: "#10131a" }}>
          O'qituvchilar
        </Typography>
        <Button
          startIcon={<FiPlus size={21} />}
          onClick={() => setDrawerOpen(true)}
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

      <Paper elevation={0} sx={{ borderRadius: "13px", bgcolor: "#fff", overflow: "hidden" }}>
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
            <Button startIcon={<FiFilter />} variant="outlined" sx={toolbarButtonStyles}>
              Filters
            </Button>
            <Button startIcon={<FiArchive />} variant="outlined" sx={toolbarButtonStyles}>
              Arxiv
            </Button>
          </Box>

          <TextField
            placeholder="Search"
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

        <Table sx={{ minWidth: 1120 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#fff" }}>
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
            {teachers.map((teacher) => (
              <TableRow key={teacher.id} sx={{ height: 76 }}>
                <TableCell padding="checkbox" sx={bodyCellStyles}>
                  <Checkbox size="small" />
                </TableCell>
                <TableCell sx={bodyCellStyles}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
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
                    <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#20232a" }}>
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
                    <IconButton aria-label="view" sx={actionButtonStyles}>
                      <FiEye size={19} />
                    </IconButton>
                    <IconButton aria-label="delete" sx={actionButtonStyles}>
                      <FiTrash2 size={19} />
                    </IconButton>
                    <IconButton aria-label="edit" sx={actionButtonStyles}>
                      <FiEdit2 size={19} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
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
          <Button startIcon={<FiArrowLeft />} sx={paginationSideButton}>
            Previous
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.1 }}>
            {["1", "2", "3", "...", "8", "9", "10"].map((page) => (
              <Box
                key={page}
                sx={{
                  width: page === "1" ? 40 : 35,
                  height: 40,
                  borderRadius: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: page === "1" ? purple : "transparent",
                  color: page === "1" ? "#fff" : "#59606b",
                  fontSize: 18,
                  fontWeight: page === "1" ? 700 : 400,
                }}
              >
                {page}
              </Box>
            ))}
          </Box>
          <Button endIcon={<FiArrowRight />} sx={paginationSideButton}>
            Next
          </Button>
        </Box>
      </Paper>

      <TeacherDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSave={handleSave} />
    </Box>
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
