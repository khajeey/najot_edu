import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { FiCalendar, FiPlus, FiUploadCloud, FiX } from "react-icons/fi";
import { purple } from "./constants";

export default function StudentDrawer({ open, initialData, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    birthDate: "",
    address: "",
    password: "",
  });

  useEffect(() => {
    if (!open) return;

    setForm({
      name: initialData?.name || "",
      birthDate: initialData?.birthDate || "",
      address: initialData?.address || "",
      password: "",
    });
  }, [initialData, open]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    onSave({
      id: initialData?.id,
      name: form.name || "Yangi talaba",
      birthDate: form.birthDate || "01.06.2008",
      address: form.address || "Toshkent",
      groups: initialData?.groups || ["n105"],
      phone: initialData?.phone || "+998901112233",
      email: initialData?.email || "student@gmail.com",
      createdAt: initialData?.createdAt || "01.06.2026",
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 565,
          maxWidth: "100vw",
          borderRadius: 0,
          boxShadow: "-18px 0 38px rgba(25, 31, 46, 0.16)",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#fff" }}>
        <Box sx={{ flex: 1, px: 7, pt: 4.2, overflowY: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 4 }}>
            <Box>
              <Typography sx={{ fontSize: 30, fontWeight: 700, color: "#121722" }}>
                {initialData ? "Talabani tahrirlash" : "Talaba qo'shish"}
              </Typography>
              <Typography sx={{ mt: 1.1, fontSize: 19, color: "#6e7480" }}>
                Bu yerda siz yangi Talaba qo'shishingiz mumkin.
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ color: "#969ba3", mt: 0.4 }}>
              <FiX size={28} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ flex: 1.7, px: 7, overflowY: "auto" }}>
          <TextField
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Ma'lumotni kiriting"
            fullWidth
            sx={inputStyles}
          />

          <FormField label="Tug'ilgan sanasi">
            <TextField
              value={form.birthDate}
              onChange={(event) => updateField("birthDate", event.target.value)}
              placeholder="dd/mm/yyyy"
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <FiCalendar size={22} color="#111827" />
                  </InputAdornment>
                ),
              }}
              sx={inputStyles}
            />
          </FormField>

          <FormField label="Manzil">
            <TextField
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Manzilni kiriting"
              fullWidth
              sx={inputStyles}
            />
          </FormField>

          <FormField label="Parol">
            <TextField
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Parolni kiriting"
              fullWidth
              sx={inputStyles}
            />
          </FormField>

          <FormField label="Guruh">
            <Button startIcon={<FiPlus size={28} />} sx={groupButtonStyles}>
              Guruh qo'shish
            </Button>
          </FormField>

          <FormField label="Surati">
            <Box sx={uploadBoxStyles}>
              <FiUploadCloud size={34} color="#9ca3af" />
              <Typography sx={{ mt: 1.8, fontSize: 21, color: "#252b35" }}>
                <Box component="span" sx={{ color: purple, fontWeight: 700 }}>Click to upload</Box>
                {" "}or drag and drop
              </Typography>
              <Typography sx={{ mt: 1, fontSize: 17, color: "#9ca3af" }}>
                JPG or PNG (max. 2 MB)
              </Typography>
            </Box>
          </FormField>
        </Box>

        <Box
          sx={{
            px: 4,
            py: 2.4,
            borderTop: "1px solid #eceef2",
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
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
    <Box sx={{ mt: 4 }}>
      <Typography sx={{ mb: 1.4, fontSize: 21, fontWeight: 700, color: "#2f3743" }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    height: 60,
    borderRadius: "12px",
    fontSize: 22,
    color: "#343843",
    "& fieldset": { borderColor: "#d5d8de" },
    "&:hover fieldset": { borderColor: "#c6cbd3" },
    "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 },
  },
  "& .MuiOutlinedInput-input::placeholder": {
    color: "#9ea1a8",
    opacity: 1,
  },
};

const groupButtonStyles = {
  width: "100%",
  height: 73,
  borderRadius: "12px",
  border: "1px solid #e0e2e7",
  color: purple,
  justifyContent: "flex-start",
  px: 2.7,
  fontSize: 25,
  fontWeight: 700,
  textTransform: "none",
  "&:hover": { bgcolor: "#faf8ff", borderColor: "#d8cff5" },
};

const uploadBoxStyles = {
  height: 200,
  borderRadius: "13px",
  border: "1px dashed #d7d9df",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const cancelButtonStyles = {
  width: 205,
  height: 61,
  borderRadius: "11px",
  borderColor: "#dfe4ee",
  color: "#5b626e",
  fontSize: 23,
  fontWeight: 700,
  textTransform: "none",
  "&:hover": { borderColor: "#cfd5e2", bgcolor: "#fafbfc" },
};

const saveButtonStyles = {
  width: 171,
  height: 61,
  borderRadius: "11px",
  bgcolor: "#f2f3f7",
  color: "#969ba6",
  fontSize: 23,
  fontWeight: 700,
  textTransform: "none",
  "&:hover": { bgcolor: purple, color: "#fff" },
};
