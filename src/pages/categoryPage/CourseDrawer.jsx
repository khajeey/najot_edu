import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { FiChevronDown, FiDollarSign, FiX } from "react-icons/fi";
import { purple } from "./constants";

const emptyForm = {
  name: "",
  lessonDuration: "",
  courseDuration: "",
  price: "",
  description: "",
};

export default function CourseDrawer({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState(emptyForm);
  const isEdit = Boolean(initialData?.id);

  useEffect(() => {
    if (!open) return;

    if (initialData?.raw) {
      setForm({
        name: initialData.raw.name || "",
        lessonDuration: initialData.raw.duration_hours ? String(initialData.raw.duration_hours) : "",
        courseDuration: initialData.raw.duration_month ? String(initialData.raw.duration_month) : "",
        price: initialData.raw.price != null ? String(initialData.raw.price) : "",
        description: initialData.raw.description || "",
      });
      return;
    }

    setForm(emptyForm);
  }, [open, initialData]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    onSave(form);
    if (!isEdit) {
      setForm(emptyForm);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 475,
          maxWidth: "100vw",
          borderRadius: 0,
          boxShadow: "-18px 0 38px rgba(25, 31, 46, 0.16)",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
        <Box sx={{ flex: 1, px: 4.2, pt: 3.8, overflowY: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.2 }}>
            <Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: "text.primary" }}>
                {isEdit ? "Kursni tahrirlash" : "Kurs qo'shish"}
              </Typography>
              <Typography sx={{ mt: 1.1, fontSize: 17, color: "text.secondary" }}>
                {isEdit
                  ? "Kurs ma'lumotlarini yangilang va saqlang."
                  : "Bu yerda siz yangi kurs qo'shishingiz mumkin."}
              </Typography>
            </Box>

            <IconButton
              aria-label="close course drawer"
              onClick={onClose}
              sx={{ color: "text.secondary", mt: -0.6, "&:hover": { bgcolor: "action.hover" } }}
            >
              <FiX size={28} />
            </IconButton>
          </Box>

          <FormField label="Nomi">
            <TextField
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="HR Manager..."
              fullWidth
              sx={inputStyles}
            />
          </FormField>

          <FormField label="Dars davomiyligi (soat)">
            <FormControl fullWidth>
              <Select
                value={form.lessonDuration}
                onChange={(event) => updateField("lessonDuration", event.target.value)}
                displayEmpty
                IconComponent={FiChevronDown}
                sx={selectStyles}
              >
                <MenuItem value="" disabled>
                  Tanlang
                </MenuItem>
                <MenuItem value="1">1 soat</MenuItem>
                <MenuItem value="2">2 soat</MenuItem>
                <MenuItem value="3">3 soat</MenuItem>
                <MenuItem value="4">4 soat</MenuItem>
              </Select>
            </FormControl>
          </FormField>

          <FormField label="Kurs davomiyligi (oy)">
            <FormControl fullWidth>
              <Select
                value={form.courseDuration}
                onChange={(event) => updateField("courseDuration", event.target.value)}
                displayEmpty
                IconComponent={FiChevronDown}
                sx={selectStyles}
              >
                <MenuItem value="" disabled>
                  Tanlang
                </MenuItem>
                <MenuItem value="2">2 oy</MenuItem>
                <MenuItem value="3">3 oy</MenuItem>
                <MenuItem value="5">5 oy</MenuItem>
                <MenuItem value="6">6 oy</MenuItem>
                <MenuItem value="8">8 oy</MenuItem>
              </Select>
            </FormControl>
          </FormField>

          <FormField label="Narx">
            <TextField
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              placeholder="Narxni kiriting"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiDollarSign size={20} color="#a0a3a8" />
                  </InputAdornment>
                ),
              }}
              sx={inputStyles}
            />
          </FormField>

          <FormField label="Tavsif">
            <TextField
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Kurs haqida qisqacha ma'lumot"
              fullWidth
              multiline
              minRows={4}
              sx={textareaStyles}
            />
          </FormField>
        </Box>

        <Box
          sx={{
            px: 2.4,
            py: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
          }}
        >
          <Button onClick={onClose} variant="outlined" sx={cancelButtonStyles}>
            Bekor qilish
          </Button>
          <Button onClick={handleSave} disabled={!form.name.trim()} sx={saveButtonStyles}>
            Saqlash
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

function FormField({ label, children }) {
  return (
    <Box sx={{ mt: 2.7 }}>
      <Typography sx={{ mb: 1.1, fontSize: 17, fontWeight: 700, color: "text.primary" }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    height: 56,
    borderRadius: "11px",
    fontSize: 18,
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "#cfd6e2" },
    "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 },
  },
  "& .MuiOutlinedInput-input::placeholder": {
    color: "#9b9da3",
    opacity: 1,
  },
};

const selectStyles = {
  height: 56,
  borderRadius: "11px",
  fontSize: 18,
  "& fieldset": { borderColor: "divider" },
  "&:hover fieldset": { borderColor: "#cfd6e2" },
  "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
  },
  "& .MuiSelect-icon": {
    right: 18,
    color: "#a0a3a8",
    fontSize: 22,
  },
};

const textareaStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "11px",
    fontSize: 18,
    alignItems: "flex-start",
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "#cfd6e2" },
    "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 },
  },
  "& .MuiOutlinedInput-input": {
    lineHeight: 1.35,
  },
};

const cancelButtonStyles = {
  width: 159,
  height: 50,
  borderRadius: "10px",
  borderColor: "divider",
  fontSize: 18,
  fontWeight: 700,
  textTransform: "none",
};

const saveButtonStyles = {
  width: 130,
  height: 50,
  borderRadius: "10px",
  bgcolor: purple,
  color: "#fff",
  fontSize: 18,
  fontWeight: 700,
  textTransform: "none",
  "&:hover": { bgcolor: "#684bcf" },
};
