import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { FiCalendar, FiMail, FiPlus, FiSearch, FiUploadCloud, FiX } from "react-icons/fi";
import { api } from "../../api/axiosClient";
import { purple } from "./constants";

export default function StudentDrawer({ open, initialData, onClose, onSave }) {
  const [groups, setGroups] = useState([]);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "+998",
    email: "",
    password: "",
    birthDate: "2000-01-01",
    address: "",
    groupIds: [],
    photo: null,
  });

  useEffect(() => {
    if (!open) return;

    const loadGroups = async () => {
      const { data } = await api.get("/groups/all");

      if (data.success) {
        setGroups(data.data.map((group) => ({ id: group.id, name: group.name })));
      }
    };

    loadGroups();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const groupIds = initialData?.groupIds?.length
      ? initialData.groupIds
      : groups.filter((group) => initialData?.groups?.includes(group.name)).map((group) => group.id);

    setForm({
      name: initialData?.name || "",
      phone: initialData?.phone || "+998",
      email: initialData?.email || "",
      password: "",
      birthDate: initialData?.birthDateRaw || "2000-01-01",
      address: initialData?.address || "",
      groupIds,
      photo: null,
    });
  }, [groups, initialData, open]);

  const selectedGroups = groups.filter((group) => form.groupIds.includes(group.id));

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleGroup = (groupId) => {
    setForm((current) => ({
      ...current,
      groupIds: current.groupIds.includes(groupId)
        ? current.groupIds.filter((id) => id !== groupId)
        : [...current.groupIds, groupId],
    }));
  };

  const handleSave = () => {
    onSave({
      id: initialData?.id,
      name: form.name || "Yangi talaba",
      phone: form.phone,
      email: form.email || "student@gmail.com",
      password: form.password,
      birthDateRaw: form.birthDate,
      address: form.address || "Toshkent",
      groupIds: form.groupIds,
      groups: selectedGroups.map((group) => group.name),
      photo: form.photo,
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
        <Box sx={{ px: 7, pt: 4.2, pb: 3, borderBottom: "1px solid #eceef2" }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
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

        <Box sx={{ flex: 1, px: 7, py: 3, overflowY: "auto" }}>
          <TextField
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Ma'lumotni kiriting"
            fullWidth
            sx={inputStyles}
          />

          <FormField label="Telefon">
            <TextField
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+998"
              fullWidth
              sx={inputStyles}
            />
          </FormField>

          <FormField label="Email">
            <TextField
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="Elektron pochtani kiriting"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiMail size={22} color="#9ca3af" />
                  </InputAdornment>
                ),
              }}
              sx={inputStyles}
            />
          </FormField>

          <FormField label="Tug'ilgan sanasi">
            <TextField
              type="date"
              value={form.birthDate}
              onChange={(event) => updateField("birthDate", event.target.value)}
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
            <Button onClick={() => setGroupDialogOpen(true)} startIcon={<FiPlus size={28} />} sx={groupButtonStyles}>
              {selectedGroups.length ? selectedGroups.map((group) => group.name).join(", ") : "Guruh qo'shish"}
            </Button>
          </FormField>

          <FormField label="Surati">
            <Box component="label" sx={{ ...uploadBoxStyles, cursor: "pointer" }}>
              <input
                type="file"
                accept="image/png,image/jpeg"
                hidden
                onChange={(event) => updateField("photo", event.target.files?.[0] || null)}
              />
              <FiUploadCloud size={34} color="#9ca3af" />
              <Typography sx={{ mt: 1.8, fontSize: 21, color: "#252b35" }}>
                <Box component="span" sx={{ color: purple, fontWeight: 700 }}>
                  {form.photo ? form.photo.name : "Click to upload"}
                </Box>
                {!form.photo && " or drag and drop"}
              </Typography>
              <Typography sx={{ mt: 1, fontSize: 17, color: "#9ca3af" }}>
                JPG or PNG (max. 2 MB)
              </Typography>
            </Box>
          </FormField>
        </Box>

        <Box sx={{ px: 4, py: 2.4, borderTop: "1px solid #eceef2", display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button onClick={onClose} variant="outlined" sx={cancelButtonStyles}>
            Bekor qilish
          </Button>
          <Button onClick={handleSave} sx={saveButtonStyles}>
            Saqlash
          </Button>
        </Box>
      </Box>

      <Dialog open={groupDialogOpen} onClose={() => setGroupDialogOpen(false)} PaperProps={{ sx: { width: 410 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", pb: 1 }}>
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 700 }}>Guruhga biriktirish</Typography>
            <Typography sx={{ mt: 0.4, fontSize: 12, color: "#6b7280" }}>
              Bir yoki bir nechta guruhni tanlang
            </Typography>
          </Box>
          <IconButton onClick={() => setGroupDialogOpen(false)} sx={{ color: "#969ba3", mr: -1 }}>
            <FiX size={22} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2 }}>
          <TextField
            placeholder="Guruh qidirish..."
            fullWidth
            sx={dialogSearchStyles}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiSearch size={16} color="#9aa0a8" />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ mt: 1.5, border: "1px solid #e7e9ef", borderRadius: "8px", overflow: "hidden" }}>
            {groups.map((group) => (
              <Box key={group.id} onClick={() => toggleGroup(group.id)} sx={groupRowStyles}>
                <Checkbox checked={form.groupIds.includes(group.id)} size="small" />
                <Typography sx={{ fontSize: 14 }}>{group.name}</Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #eceef2" }}>
          <Button onClick={() => setGroupDialogOpen(false)} sx={{ textTransform: "none", color: "#4d5662", fontWeight: 700 }}>
            Bekor qilish
          </Button>
          <Button onClick={() => setGroupDialogOpen(false)} sx={{ textTransform: "none", bgcolor: "#b03df2", color: "#fff", fontWeight: 700, px: 2.4, "&:hover": { bgcolor: purple } }}>
            Qo'shish
          </Button>
        </DialogActions>
      </Dialog>
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
  minHeight: 73,
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
  bgcolor: purple,
  color: "#fff",
  fontSize: 23,
  fontWeight: 700,
  textTransform: "none",
  "&:hover": { bgcolor: "#684bcf" },
};

const dialogSearchStyles = {
  "& .MuiOutlinedInput-root": {
    height: 36,
    borderRadius: "6px",
    fontSize: 13,
    "& fieldset": { borderColor: "#e2e5eb" },
    "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 },
  },
};

const groupRowStyles = {
  height: 45,
  px: 1.4,
  display: "flex",
  alignItems: "center",
  gap: 1,
  borderBottom: "1px solid #edf0f4",
  cursor: "pointer",
  "&:last-child": { borderBottom: 0 },
};
