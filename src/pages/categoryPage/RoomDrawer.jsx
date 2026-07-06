import { useEffect, useState } from "react";
import { Box, Button, Drawer, IconButton, TextField, Typography } from "@mui/material";
import { FiX } from "react-icons/fi";
import { purple } from "./constants";

const emptyForm = {
  name: "",
  capacity: "",
};

export default function RoomDrawer({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState(emptyForm);
  const isEdit = Boolean(initialData?.id);

  useEffect(() => {
    if (!open) return;

    if (initialData?.raw) {
      setForm({
        name: initialData.raw.name || "",
        capacity: initialData.raw.capacity != null ? String(initialData.raw.capacity) : "",
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
          width: 420,
          maxWidth: "100vw",
          borderRadius: 0,
          boxShadow: "-18px 0 38px rgba(25, 31, 46, 0.16)",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
        <Box sx={{ flex: 1, px: 3.2, pt: 3.3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: "text.primary" }}>
              {isEdit ? "Xonani tahrirlash" : "Xonani qo'shish"}
            </Typography>
            <IconButton
              aria-label="close room drawer"
              onClick={onClose}
              sx={{
                width: 38,
                height: 38,
                borderRadius: "9px",
                bgcolor: "#f0eafb",
                color: purple,
                "&:hover": { bgcolor: "#e6defa" },
              }}
            >
              <FiX size={25} />
            </IconButton>
          </Box>

          <FormField label="Nomi" required>
            <TextField
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Xona nomi"
              fullWidth
              sx={inputStyles}
            />
          </FormField>

          <FormField label="Sig'imi" required>
            <TextField
              value={form.capacity}
              onChange={(event) => updateField("capacity", event.target.value)}
              placeholder="Masalan: 20"
              type="number"
              fullWidth
              sx={inputStyles}
            />
          </FormField>
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1.8,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.4,
          }}
        >
          <Button onClick={onClose} variant="outlined" sx={cancelButtonStyles}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleSave}
            disabled={!form.name.trim() || !String(form.capacity).trim()}
            sx={saveButtonStyles}
          >
            Saqlash
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

function FormField({ label, required, children }) {
  return (
    <Box sx={{ mt: 2.7 }}>
      <Typography sx={{ mb: 1, fontSize: 17, fontWeight: 700, color: "text.primary" }}>
        {label}
        {required && (
          <Box component="span" sx={{ color: "#e54848" }}>
            {" "}
            *
          </Box>
        )}
      </Typography>
      {children}
    </Box>
  );
}

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    height: 50,
    borderRadius: "11px",
    fontSize: 17,
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "divider" },
    "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 },
  },
};

const cancelButtonStyles = {
  width: 181,
  height: 50,
  borderRadius: "10px",
  borderColor: "divider",
  fontSize: 18,
  fontWeight: 700,
  textTransform: "none",
};

const saveButtonStyles = {
  width: 181,
  height: 50,
  borderRadius: "10px",
  bgcolor: purple,
  color: "#fff",
  fontSize: 18,
  fontWeight: 700,
  textTransform: "none",
  "&:hover": { bgcolor: "#684bcf" },
};
