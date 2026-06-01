import { useState } from "react";
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

export default function CourseDrawer({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    lessonDuration: "",
    courseDuration: "",
    price: "",
    description: "",
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    onSave({
      title: form.name || "Yangi kurs",
      description: form.description || "Kurs haqida ma'lumot",
      badges: [
        form.lessonDuration || "60 min",
        form.courseDuration || "3 oy",
        form.price ? `${form.price} so'm` : "0 so'm",
      ],
    });

    setForm({
      name: "",
      lessonDuration: "",
      courseDuration: "",
      price: "",
      description: "",
    });
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
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#fff" }}>
        <Box sx={{ flex: 1, px: 4.2, pt: 3.8, overflowY: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.2 }}>
            <Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#2b2d33" }}>
                Kurs qoshish
              </Typography>
              <Typography sx={{ mt: 1.1, fontSize: 17, color: "#777b83" }}>
                Bu yerda siz yangi Kurs qo'shishingiz mumkin.
              </Typography>
            </Box>

            <IconButton
              aria-label="close course drawer"
              onClick={onClose}
              sx={{ color: "#96999e", mt: -0.6, "&:hover": { bgcolor: "#f4f4f7" } }}
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

          <FormField label="Dars davomiyligi">
            <FormControl fullWidth>
              <Select
                value={form.lessonDuration}
                onChange={(event) => updateField("lessonDuration", event.target.value)}
                displayEmpty
                IconComponent={FiChevronDown}
                sx={selectStyles}
              >
                <MenuItem value="" disabled>Tanlang</MenuItem>
                <MenuItem value="60 min">60 min</MenuItem>
                <MenuItem value="90 min">90 min</MenuItem>
              </Select>
            </FormControl>
          </FormField>

          <FormField label="Kurs davomiyligi (oylarda)">
            <FormControl fullWidth>
              <Select
                value={form.courseDuration}
                onChange={(event) => updateField("courseDuration", event.target.value)}
                displayEmpty
                IconComponent={FiChevronDown}
                sx={selectStyles}
              >
                <MenuItem value="" disabled>Tanlang</MenuItem>
                <MenuItem value="3 oy">3 oy</MenuItem>
                <MenuItem value="5 oy">5 oy</MenuItem>
                <MenuItem value="8 oy">8 oy</MenuItem>
              </Select>
            </FormControl>
          </FormField>

          <FormField label="Narx">
            <TextField
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              placeholder="Narxni kiriting"
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

          <FormField label="Description">
            <TextField
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="A little about the company and the team that you'll be working with."
              fullWidth
              multiline
              minRows={4}
              sx={textareaStyles}
            />
            <Typography sx={{ mt: 1.6, fontSize: 16, color: "#9aa0a8" }}>
              This is a hint text to help user.
            </Typography>
          </FormField>
        </Box>

        <Box
          sx={{
            px: 2.4,
            py: 2,
            borderTop: "1px solid #eceef2",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
          }}
        >
          <Button onClick={onClose} variant="outlined" sx={cancelButtonStyles}>
            Bekor qilish
          </Button>
          <Button onClick={handleSave} sx={saveButtonStyles}>
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
      <Typography sx={{ mb: 1.1, fontSize: 17, fontWeight: 700, color: "#3c3d43" }}>
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
    color: "#343843",
    "& fieldset": { borderColor: "#dce2eb" },
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
  color: "#4f535b",
  "& fieldset": { borderColor: "#dce2eb" },
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
    color: "#343843",
    alignItems: "flex-start",
    "& fieldset": { borderColor: "#dce2eb" },
    "&:hover fieldset": { borderColor: "#cfd6e2" },
    "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 },
  },
  "& .MuiOutlinedInput-input": {
    lineHeight: 1.35,
  },
  "& .MuiOutlinedInput-input::placeholder": {
    color: "#9b9da3",
    opacity: 1,
  },
};

const cancelButtonStyles = {
  width: 159,
  height: 50,
  borderRadius: "10px",
  borderColor: "#dfe4ee",
  color: "#343843",
  fontSize: 18,
  fontWeight: 700,
  textTransform: "none",
  "&:hover": { borderColor: "#cfd5e2", bgcolor: "#fafbfc" },
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
