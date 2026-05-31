import { Box, Paper, Typography } from "@mui/material";
import { FiChevronDown, FiCreditCard } from "react-icons/fi";
import {
  FaArchive,
  FaGraduationCap,
  FaSnowflake,
  FaUsers,
} from "react-icons/fa";
import { MdWarning } from "react-icons/md";

const purple = "#7456d8";
const border = "#dfe3eb";

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
    <>
      <StatsGrid />
      <Panels />
    </>
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
              cursor: "pointer",
              transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
              "&:hover": {
                transform: "translateY(-4px)",
                borderColor: "#c9bdf5",
                boxShadow: "0 14px 30px rgba(67, 53, 120, 0.13)",
              },
            }}
          >
            <Icon size={30} color={purple} />
            <Typography sx={{ mt: 1.4, color: "#5a5f6b", fontSize: 16.5, fontWeight: 400 }}>
              {stat.label}
            </Typography>
            <Typography sx={{ mt: 1.4, color: "#101014", fontSize: 30, lineHeight: 1, fontWeight: 700 }}>
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
            cursor: "pointer",
            transition: "border-color 160ms ease, box-shadow 160ms ease",
            "&:hover": {
              borderColor: "#c9bdf5",
              boxShadow: "0 10px 24px rgba(67, 53, 120, 0.08)",
            },
          }}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#05060a" }}>{panel}</Typography>
          <FiChevronDown size={25} color="#808892" />
        </Paper>
      ))}
    </Box>
  );
}
