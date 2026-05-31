import {
  Box,
  Button,
  IconButton,
  InputBase,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import {
  FiBell,
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiHome,
  FiPlus,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import {
  FaArchive,
  FaCog,
  FaGift,
  FaGraduationCap,
  FaLayerGroup,
  FaMoon,
  FaSnowflake,
  FaUserGraduate,
  FaUserTie,
  FaUsers,
} from "react-icons/fa";
import { MdWarning } from "react-icons/md";
import educoinLogo from "../assets/educoin.png";

const purple = "#7456d8";
const pageBg = "#f4f4f5";
const border = "#dfe3eb";
const text = "#15151b";

const menuItems = [
  { label: "Asosiy", icon: FiHome, active: true },
  { label: "O'qituvchilar", icon: FaUserTie },
  { label: "Guruhlar", icon: FaLayerGroup },
  { label: "Talabalar", icon: FaUserGraduate },
  { label: "Sovg'alar", icon: FaGift },
  { label: "Boshqarish", icon: FaCog, arrow: true },
];

const stats = [
  { label: "Faol talabalar", value: "0", icon: FaGraduationCap },
  { label: "Guruhlar", value: "0", icon: FaUsers },
  { label: "Joriy oy to'lovlar", value: "0", icon: FiCreditCard },
  { label: "Qarzdorlar", value: "104", icon: MdWarning },
  { label: "Muzlatilganlar", value: "0", icon: FaSnowflake },
  { label: "Arxivdagilar", value: "23", icon: FaArchive },
];

const panels = ["Joriy oy uchun to'lovlar", "Yillik Foyda", "Dars jadvali"];

export default function DashboardLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: pageBg,
        display: "flex",
        color: text,
        fontFamily: "Inter, Arial, sans-serif",
        borderTop: "2px solid #233333",
      }}
    >
      <Sidebar />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          px: { xs: 2, lg: 3 },
          py: 2.25,
        }}
      >
        <Topbar />
        <StatsGrid />
        <Panels />
      </Box>
    </Box>
  );
}

function Sidebar() {
  return (
    <Paper
      elevation={0}
      square
      sx={{
        width: 325,
        minHeight: "calc(100vh - 2px)",
        flexShrink: 0,
        bgcolor: "#fff",
        borderRadius: "0 22px 22px 0",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        position: "relative",
        overflow: "visible",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.7, px: 2.4, pt: 2.25, pb: 3 }}>
        <Box
          component="img"
          src={educoinLogo}
          alt="EduCoin"
          sx={{ width: 40, height: 40, objectFit: "contain" }}
        />
        <Typography sx={{ color: purple, fontSize: 22, fontWeight: 800, letterSpacing: 0 }}>
          EduCoin
        </Typography>
      </Box>

      <IconButton
        aria-label="sidebar"
        sx={{
          position: "absolute",
          right: -17,
          top: 42,
          width: 34,
          height: 34,
          color: "#fff",
          bgcolor: purple,
          boxShadow: "0 8px 18px rgba(70, 51, 148, 0.25)",
          "&:hover": { bgcolor: purple },
        }}
      >
        <FiChevronLeft size={22} />
      </IconButton>

      <Box sx={{ px: 1.25, display: "flex", flexDirection: "column", gap: 0.8 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Box
              key={item.label}
              sx={{
                height: 54,
                px: 2,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: 2,
                bgcolor: item.active ? "#eee8fb" : "transparent",
                color: item.active ? purple : "#4c515b",
                fontWeight: 800,
                fontSize: 17,
              }}
            >
              <Icon size={20} />
              <Typography sx={{ flex: 1, fontSize: 17, fontWeight: 800 }}>{item.label}</Typography>
              {item.arrow && <FiChevronRight size={22} color="#9aa0a8" />}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ flex: 1 }} />

      <Box
        sx={{
          mx: 1.25,
          mb: 1.6,
          px: 2,
          py: 2,
          borderRadius: "14px",
          border: "1px solid #ffcfcf",
          bgcolor: "#fff0f0",
          display: "grid",
          gridTemplateColumns: "36px 1fr",
          columnGap: 1.6,
          rowGap: 1.4,
          alignItems: "center",
        }}
      >
        <Box sx={{ gridRow: "1 / span 2", color: "#000", display: "flex", justifyContent: "center" }}>
          <FiBell size={34} fill="#ffd047" strokeWidth={2.2} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 900, lineHeight: 1.1 }}>Obuna</Typography>
          <Typography sx={{ mt: 0.6, color: "#ff4141", fontSize: 15 }}>Obunangiz tugagan</Typography>
        </Box>
        <Button
          fullWidth
          startIcon={<FiRefreshCw />}
          sx={{
            gridColumn: "1 / -1",
            height: 45,
            borderRadius: "10px",
            bgcolor: "#ec482d",
            color: "#fff",
            fontSize: 17,
            fontWeight: 900,
            textTransform: "none",
            "&:hover": { bgcolor: "#db3e25" },
          }}
        >
          Obunani yangilash
        </Button>
      </Box>
    </Paper>
  );
}

function Topbar() {
  return (
    <Box
      sx={{
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mb: 3.25,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, minWidth: 0 }}>
        <IconButton
          aria-label="calendar"
          sx={{
            width: 48,
            height: 48,
            bgcolor: "#fff",
            borderRadius: "11px",
            boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
            color: "#555",
            "&:hover": { bgcolor: "#fff" },
          }}
        >
          <FiCalendar size={22} />
        </IconButton>

        <Button
          startIcon={<FiPlus size={22} />}
          endIcon={<FiChevronDown size={20} />}
          sx={{
            height: 48,
            px: 2.25,
            borderRadius: "11px",
            bgcolor: purple,
            color: "#fff",
            fontSize: 17,
            fontWeight: 900,
            textTransform: "none",
            minWidth: 174,
            "&:hover": { bgcolor: "#684bcf" },
          }}
        >
          Qo'shish
        </Button>

        <Paper
          elevation={0}
          sx={{
            height: 48,
            width: { xs: 190, lg: 250 },
            ml: 0.1,
            px: 1.7,
            borderRadius: "10px",
            bgcolor: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <FiSearch size={21} color="#9a9da4" />
          <InputBase
            placeholder="Qidirish..."
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: 16,
              color: "#4f5560",
              "& input::placeholder": { color: "#8d929b", opacity: 1 },
            }}
          />
        </Paper>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexShrink: 0 }}>
        <Select
          value="uz"
          size="small"
          IconComponent={FiChevronDown}
          sx={{
            width: 190,
            height: 47,
            bgcolor: "#fff",
            borderRadius: "11px",
            fontSize: 20,
            color: "#000",
            "& fieldset": { borderColor: "#c8c8c8" },
            "& .MuiSelect-select": { display: "flex", alignItems: "center", py: 0, pl: 2 },
            "& .MuiSelect-icon": { right: 14, color: "#777", fontSize: 22 },
          }}
        >
          <MenuItem value="uz">O'zbekcha</MenuItem>
        </Select>

        <IconButton sx={topIconButton}>
          <FiBell size={22} />
        </IconButton>
        <IconButton
          sx={{
            ...topIconButton,
            bgcolor: "#303d59",
            color: "#fff",
            "&:hover": { bgcolor: "#303d59" },
          }}
        >
          <FaMoon size={21} />
        </IconButton>
        <Box component="img" src={educoinLogo} alt="EduCoin" sx={{ width: 43, height: 43, objectFit: "contain" }} />
      </Box>
    </Box>
  );
}

function StatsGrid() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
        gap: 2.6,
        mb: 4,
        "@media (max-width: 1400px)": {
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        },
        "@media (max-width: 800px)": {
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        },
      }}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Paper
            key={stat.label}
            elevation={0}
            sx={{
              height: 174,
              borderRadius: "12px",
              border: `1px solid ${border}`,
              bgcolor: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={30} color={purple} />
            <Typography sx={{ mt: 1.4, color: "#5a5f6b", fontSize: 16.5, fontWeight: 500 }}>
              {stat.label}
            </Typography>
            <Typography sx={{ mt: 1.4, color: "#101014", fontSize: 31, lineHeight: 1, fontWeight: 900 }}>
              {stat.value}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
}

function Panels() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {panels.map((panel) => (
        <Paper
          key={panel}
          elevation={0}
          sx={{
            height: 73,
            px: 3,
            borderRadius: "8px",
            border: `1px solid ${border}`,
            bgcolor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: 21, fontWeight: 900, color: "#05060a" }}>{panel}</Typography>
          <FiChevronDown size={25} color="#808892" />
        </Paper>
      ))}
    </Box>
  );
}

const topIconButton = {
  width: 48,
  height: 48,
  bgcolor: "#fff",
  borderRadius: "11px",
  color: "#172032",
  boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
  "&:hover": { bgcolor: "#fff" },
};
