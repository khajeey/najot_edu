import { useState } from "react";
import {
  Box,
  Button,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiDollarSign, FiEdit2, FiPlus, FiTrash2, FiX } from "react-icons/fi";

const purple = "#7456d8";
const border = "#e5e7ee";

const tabs = [
  { label: "Kurslar", path: "/dashboard/boshqarish/kurslar", key: "courses" },
  { label: "Xonalar", path: "/dashboard/boshqarish/xonalar", key: "rooms" },
  { label: "Xodimlar", path: "/dashboard/boshqarish/hodimlar", key: "staff" },
];

const mockData = {
  courses: [
    {
      title: "VR",
      description: "keraksiz emas juda kerakli albatda",
      badges: ["3 min", "3 oy", "7000000 so'm"],
    },
    {
      title: "HR MANAGER",
      description: "Kursimizda 18 kishi qatnasha oladi va siz bu yerda oz kasbingiz ni topishingiz mumkin",
      badges: ["2 min", "6 oy", "1450000 so'm"],
    },
    {
      title: "boot camp",
      description: "reaction",
      badges: ["120 min", "6 oy", "5500000 so'm"],
    },
    {
      title: "full stackkk",
      description: "Kurs haqida batafsil ma'lumot",
      badges: ["3 min", "6 oy", "1000000 so'm"],
    },
    {
      title: "Logisit",
      description: "great",
      badges: ["90 min", "3 oy", "256000 so'm"],
    },
    {
      title: "AI inginering",
      description: "description",
      badges: ["60 min", "8 oy", "2000000 so'm"],
    },
    {
      title: "Bekorchi",
      description: "bekorchilik kursi",
      badges: ["45 min", "2 oy", "900000 so'm"],
    },
    {
      title: "Flutterser",
      description: "Zo'r",
      badges: ["80 min", "5 oy", "1800000 so'm"],
    },
  ],
  rooms: [
    {
      title: "101-xona",
      description: "Frontend guruhlari uchun xona",
      badges: ["24 joy", "2-qavat", "bo'sh"],
    },
    {
      title: "202-xona",
      description: "Kompyuter sinfi",
      badges: ["18 joy", "3-qavat", "band"],
    },
    {
      title: "Mini zal",
      description: "Workshop va taqdimotlar uchun",
      badges: ["40 joy", "1-qavat", "bo'sh"],
    },
    {
      title: "Backend lab",
      description: "Server va amaliy darslar xonasi",
      badges: ["16 joy", "2-qavat", "band"],
    },
  ],
  staff: [
    {
      title: "Ali Valiyev",
      description: "Frontend mentor",
      badges: ["React", "3 yil", "12 guruh"],
    },
    {
      title: "Madina Karimova",
      description: "HR manager",
      badges: ["HR", "2 yil", "active"],
    },
    {
      title: "Jasur Sobirov",
      description: "Backend mentor",
      badges: ["Node.js", "4 yil", "8 guruh"],
    },
    {
      title: "Dilnoza Akramova",
      description: "Administrator",
      badges: ["Admin", "1 yil", "active"],
    },
  ],
};

export default function CategoryPage({ title }) {
  const isManagementPage = tabs.some((tab) => tab.label === title);

  if (isManagementPage) {
    return <ManagementPage title={title} />;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 220,
        borderRadius: "10px",
        border: `1px solid ${border}`,
        bgcolor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#15151b" }}>{title}</Typography>
        <Typography sx={{ mt: 1, fontSize: 16, color: "#6b7280" }}>
          {title} sahifasi
        </Typography>
      </Box>
    </Paper>
  );
}

function ManagementPage({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [itemsByTab, setItemsByTab] = useState(mockData);
  const activeTab = tabs.find((tab) => location.pathname === tab.path) || tabs[0];
  const items = itemsByTab[activeTab.key];

  const handleCourseSave = (course) => {
    setItemsByTab((current) => ({
      ...current,
      courses: [course, ...current.courses],
    }));
    setDrawerOpen(false);
  };

  return (
    <Box>
      <Typography
        component="h1"
        sx={{ mb: 2.7, fontSize: 30, lineHeight: 1.15, fontWeight: 700, color: "#14171f" }}
      >
        Boshqarish
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3.3,
          height: 38,
          borderBottom: "1px solid #e7e8ed",
          mb: 3.8,
        }}
      >
        {tabs.map((tab) => {
          const active = activeTab.path === tab.path;

          return (
            <Box
              key={tab.path}
              role="button"
              tabIndex={0}
              onClick={() => navigate(tab.path)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  navigate(tab.path);
                }
              }}
              sx={{
                height: 38,
                display: "flex",
                alignItems: "flex-start",
                color: active ? purple : "#7a7f89",
                fontSize: 19,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                borderBottom: active ? `2px solid ${purple}` : "2px solid transparent",
                outline: "none",
              }}
            >
              {tab.label}
            </Box>
          );
        })}
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: "18px",
          bgcolor: "#fff",
          px: { xs: 2, xl: 3.8 },
          pt: 3.6,
          pb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3.8,
          }}
        >
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#07090f" }}>{title}</Typography>
          <Button
            startIcon={<FiPlus size={22} />}
            onClick={() => setDrawerOpen(true)}
            sx={{
              height: 51,
              px: 2.7,
              borderRadius: "8px",
              bgcolor: purple,
              color: "#fff",
              fontSize: 18,
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { bgcolor: "#684bcf" },
            }}
          >
            {title} qo'shish
          </Button>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 3,
            "@media (max-width: 1350px)": {
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            },
            "@media (max-width: 900px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          {items.map((item) => (
            <DataCard key={item.title} item={item} />
          ))}
        </Box>
      </Paper>

      <CourseDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleCourseSave}
      />
    </Box>
  );
}

function DataCard({ item }) {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 210,
        borderRadius: "18px",
        bgcolor: "#f3f5fa",
        px: 3,
        py: 3.2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 12px 26px rgba(41, 48, 67, 0.08)",
        },
      }}
    >
      <Box>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#07090f" }}>
              {item.title}
            </Typography>
            <Typography
              sx={{
                mt: 1.6,
                maxWidth: 390,
                minHeight: 54,
                color: "#8a9099",
                fontSize: 19,
                lineHeight: 1.35,
                fontWeight: 400,
              }}
            >
              {item.description}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, pt: 4.7, flexShrink: 0 }}>
            <IconButton aria-label="delete" sx={cardActionButton}>
              <FiTrash2 size={22} />
            </IconButton>
            <IconButton aria-label="edit" sx={cardActionButton}>
              <FiEdit2 size={22} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2.2 }}>
        {item.badges.map((badge) => (
          <Box
            key={badge}
            sx={{
              minWidth: 75,
              height: 38,
              px: 1.5,
              borderRadius: "7px",
              bgcolor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2a2d34",
              fontSize: 16,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {badge}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

const cardActionButton = {
  width: 32,
  height: 32,
  color: "#8b919a",
  borderRadius: "7px",
  "&:hover": {
    bgcolor: "#ebeef5",
    color: purple,
  },
};

function CourseDrawer({ open, onClose, onSave }) {
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
    const course = {
      title: form.name || "Yangi kurs",
      description: form.description || "Kurs haqida ma'lumot",
      badges: [
        form.lessonDuration || "60 min",
        form.courseDuration || "3 oy",
        form.price ? `${form.price} so'm` : "0 so'm",
      ],
    };

    onSave(course);
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
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              width: 159,
              height: 50,
              borderRadius: "10px",
              borderColor: "#dfe4ee",
              color: "#343843",
              fontSize: 18,
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { borderColor: "#cfd5e2", bgcolor: "#fafbfc" },
            }}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleSave}
            sx={{
              width: 130,
              height: 50,
              borderRadius: "10px",
              bgcolor: purple,
              color: "#fff",
              fontSize: 18,
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { bgcolor: "#684bcf" },
            }}
          >
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
1