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
  FormControlLabel,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { FiCalendar, FiMail, FiPlus, FiSearch, FiUploadCloud, FiX } from "react-icons/fi";
import { api } from "../../api/axiosClient";
import { purple } from "./constants";

export default function TeacherDrawer({ open, initialData, onClose, onSave }) {
  const [form, setForm] = useState({
    phone: "+998",
    email: "",
    fullName: "",
    password: "",
    address: "",
    birthDate: "01.03.1990",
    gender: "",
    groupIds: [],
    photo: null,
  });
  const [groups, setGroups] = useState([]);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const initialGroupIds = initialData?.groupIds?.length
      ? initialData.groupIds
      : groups
        .filter((group) => initialData?.groups?.includes(group.name))
        .map((group) => group.id);

    setForm({
      phone: initialData?.phone || "+998",
      email: initialData?.email || "",
      fullName: initialData?.name || "",
      password: "",
      address: initialData?.address || "",
      birthDate: initialData?.birthDate || "01.03.1990",
      gender: initialData?.gender || "",
      groupIds: initialGroupIds,
      photo: null,
    });
  }, [groups, initialData, open]);

  useEffect(() => {
    if (!open) return;

    const fetchGroups = async () => {
      const { data } = await api.get("/groups/all");

      if (data.success) {
        setGroups(data.data.map((group) => ({ id: group.id, name: group.name })));
      }
    };

    fetchGroups();
  }, [open]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    onSave({
      id: initialData?.id,
      name: form.fullName || "Yangi o'qituvchi",
      phone: form.phone || "+998",
      email: form.email || "teacher@gmail.com",
      password: form.password,
      address: form.address || "Toshkent",
      groupIds: form.groupIds,
      photo: form.photo,
      groups: selectedGroups.map((group) => group.name),
      createdAt: "01.06.2026",
    });

    setForm({
      phone: "+998",
      email: "",
      fullName: "",
      password: "",
      address: "",
      birthDate: "01.03.1990",
      gender: "",
      groupIds: [],
      photo: null,
    });
  };

  const selectedGroups = groups.filter((group) => form.groupIds.includes(group.id));

  const toggleGroup = (groupId) => {
    setForm((current) => ({
      ...current,
      groupIds: current.groupIds.includes(groupId)
        ? current.groupIds.filter((id) => id !== groupId)
        : [...current.groupIds, groupId],
    }));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 330,
          maxWidth: "100vw",
          borderRadius: "0 0 16px 16px",
          boxShadow: "-18px 0 38px rgba(25, 31, 46, 0.16)",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#fff" }}>
        <Box sx={{ flex: 1, px: 2.4, pt: 1.8, overflowY: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 0.8 }}>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#2b2d33" }}>
                {initialData ? "O'qituvchini tahrirlash" : "O'qituvchi qoshish"}
              </Typography>
              <Typography sx={{ mt: 0.7, fontSize: 12, color: "#777b83" }}>
                Bu yerda siz yangi o'qituvchi qo'shishingiz mumkin.
              </Typography>
            </Box>
            <IconButton
              aria-label="close teacher drawer"
              onClick={onClose}
              sx={{ color: "#b2b5bb", mt: -0.8, mr: -0.8, "&:hover": { bgcolor: "#f4f4f7" } }}
            >
              <FiX size={18} />
            </IconButton>
          </Box>

          <FormField label="Telefon raqam">
            <TextField
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              fullWidth
              sx={inputStyles}
            />
          </FormField>

          <FormField label="Mail">
            <TextField
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="Elektron pochtani kiriting"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiMail size={16} color="#8e949d" />
                  </InputAdornment>
                ),
              }}
              sx={inputStyles}
            />
          </FormField>

          <FormField label="O'qituvchi FIO">
            <TextField
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              placeholder="Ma'lumotni kiriting"
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

          <FormField label="Manzil">
            <TextField
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Manzilni kiriting"
              fullWidth
              sx={inputStyles}
            />
          </FormField>

          <FormField label="Tug'ilgan sanasi">
            <TextField
              value={form.birthDate}
              onChange={(event) => updateField("birthDate", event.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiCalendar size={16} color="#8e949d" />
                  </InputAdornment>
                ),
              }}
              sx={inputStyles}
            />
          </FormField>

          <FormField label="Guruh">
            <Box sx={groupInputStyles} onClick={() => setGroupDialogOpen(true)}>
              <FiSearch size={16} color="#8e949d" />
              {selectedGroups.length ? (
                selectedGroups.map((group) => (
                  <Chip key={group.id} label={group.name} size="small" sx={chipStyles} />
                ))
              ) : (
                <Typography sx={{ fontSize: 12, color: "#9b9da3" }}>Guruh tanlang</Typography>
              )}
            </Box>
          </FormField>

          <FormField label="Jinsi">
            <RadioGroup
              row
              value={form.gender}
              onChange={(event) => updateField("gender", event.target.value)}
              sx={{ gap: 2 }}
            >
              <FormControlLabel value="Erkak" control={<Radio size="small" />} label="Erkak" sx={radioLabelStyles} />
              <FormControlLabel value="Ayol" control={<Radio size="small" />} label="Ayol" sx={radioLabelStyles} />
            </RadioGroup>
          </FormField>

          <FormField label="Surati">
            <Box component="label" sx={{ ...uploadBoxStyles, cursor: "pointer" }}>
              <input
                type="file"
                accept="image/png,image/jpeg"
                hidden
                onChange={(event) => updateField("photo", event.target.files?.[0] || null)}
              />
              <Box sx={uploadIconStyles}>
                <FiUploadCloud size={22} />
              </Box>
              <Typography sx={{ mt: 1.2, fontSize: 12, color: purple, fontWeight: 600 }}>
                {form.photo ? form.photo.name : "Click to upload"}
                {!form.photo && <Box component="span" sx={{ color: "#8e949d", fontWeight: 400 }}> or drag and drop</Box>}
              </Typography>
              <Typography sx={{ mt: 0.4, fontSize: 10, color: "#8e949d" }}>
                JPG or PNG (max. 800x800px)
              </Typography>
            </Box>
          </FormField>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2.2 }}>
            <Button
              startIcon={<FiPlus size={16} />}
              sx={{
                color: purple,
                fontSize: 13,
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { bgcolor: "#f4f0ff" },
              }}
            >
              Parol qoshish
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1.3,
            borderTop: "1px solid #eceef2",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
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
              <Box
                key={group.id}
                onClick={() => toggleGroup(group.id)}
                sx={{
                  height: 45,
                  px: 1.4,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  borderBottom: "1px solid #edf0f4",
                  cursor: "pointer",
                  "&:last-child": { borderBottom: 0 },
                }}
              >
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
    <Box sx={{ mt: 2 }}>
      <Typography sx={{ mb: 0.8, fontSize: 12, fontWeight: 700, color: "#4b4f58" }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    height: 36,
    borderRadius: "6px",
    fontSize: 13,
    color: "#343843",
    "& fieldset": { borderColor: "#dfe3eb" },
    "&:hover fieldset": { borderColor: "#cfd6e2" },
    "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 },
  },
  "& .MuiOutlinedInput-input": {
    py: 0,
  },
  "& .MuiOutlinedInput-input::placeholder": {
    color: "#9b9da3",
    opacity: 1,
  },
};

const groupInputStyles = {
  minHeight: 36,
  borderRadius: "6px",
  border: "1px solid #dfe3eb",
  display: "flex",
  alignItems: "center",
  gap: 0.6,
  px: 1.1,
  cursor: "pointer",
  flexWrap: "wrap",
};

const chipStyles = {
  height: 24,
  borderRadius: "5px",
  bgcolor: "#f5f6f8",
  fontSize: 11,
  color: "#4f535b",
  "& .MuiChip-deleteIcon": {
    fontSize: 14,
  },
};

const radioLabelStyles = {
  color: "#4f535b",
  "& .MuiFormControlLabel-label": {
    fontSize: 12,
  },
};

const uploadBoxStyles = {
  height: 98,
  borderRadius: "8px",
  border: "1px solid #dfe3eb",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const uploadIconStyles = {
  width: 34,
  height: 34,
  borderRadius: "8px",
  border: "1px solid #e1e4ea",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#6b7280",
};

const cancelButtonStyles = {
  width: 88,
  height: 34,
  borderRadius: "8px",
  borderColor: "#dfe4ee",
  color: "#343843",
  fontSize: 12,
  fontWeight: 600,
  textTransform: "none",
  "&:hover": { borderColor: "#cfd5e2", bgcolor: "#fafbfc" },
};

const saveButtonStyles = {
  width: 88,
  height: 34,
  borderRadius: "8px",
  bgcolor: "#f2f0f8",
  color: "#c0bdc8",
  fontSize: 12,
  fontWeight: 600,
  textTransform: "none",
  "&:hover": { bgcolor: purple, color: "#fff" },
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
