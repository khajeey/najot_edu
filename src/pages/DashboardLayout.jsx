import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { FiChevronDown, FiCreditCard } from "react-icons/fi";
import {
  FaArchive,
  FaGraduationCap,
  FaSnowflake,
  FaUsers,
} from "react-icons/fa";
import { MdWarning } from "react-icons/md";
import { api } from "../api/axiosClient";

const purple = "#7456d8";

const panels = ["Joriy oy uchun to'lovlar", "Yillik Foyda", "Dars jadvali"];

export default function DashboardLayout() {
  const [stats, setStats] = useState({
    activeStudents: "—",
    groups: "—",
    debtors: "—",
    frozen: "—",
    archived: "—",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);

      try {
        const [groupsRes, studentsRes, archiveGroupsRes, archiveStudentsRes] = await Promise.all([
          api.get("/groups/all"),
          api.get("/students"),
          api.get("/groups/archive").catch(() => ({ data: { data: [] } })),
          api.get("/students/archive").catch(() => ({ data: { data: [] } })),
        ]);

        const groups = groupsRes.data?.success ? groupsRes.data.data ?? [] : [];
        const students = studentsRes.data?.success ? studentsRes.data.data ?? [] : [];
        const archiveGroups = archiveGroupsRes.data?.success ? archiveGroupsRes.data.data ?? [] : [];
        const archiveStudents = archiveStudentsRes.data?.success ? archiveStudentsRes.data.data ?? [] : [];

        const activeStudents = students.filter((student) => student.is_active !== false).length;
        const frozenStudents = students.filter((student) => student.is_frozen || student.isFrozen).length;

        setStats({
          activeStudents: String(activeStudents),
          groups: String(groups.length),
          debtors: "—",
          frozen: String(frozenStudents),
          archived: String(archiveGroups.length + archiveStudents.length),
        });
      } catch {
        setStats((current) => current);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const statCards = useMemo(
    () => [
      { label: "Faol talabalar", value: stats.activeStudents, icon: FaGraduationCap },
      { label: "Guruhlar", value: stats.groups, icon: FaUsers },
      { label: "Joriy oy to'lovlar", value: "0", icon: FiCreditCard },
      { label: "Qarzdorlar", value: stats.debtors, icon: MdWarning },
      { label: "Muzlatilganlar", value: stats.frozen, icon: FaSnowflake },
      { label: "Arxivdagilar", value: stats.archived, icon: FaArchive },
    ],
    [stats]
  );

  return (
    <>
      <StatsGrid items={statCards} isLoading={isLoading} />
      <Panels />
    </>
  );
}

function StatsGrid({ items, isLoading }) {
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
      {items.map((stat) => {
        const Icon = stat.icon;

        return (
          <Paper
            key={stat.label}
            elevation={0}
            sx={{
              height: 174,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
              "&:hover": {
                transform: "translateY(-4px)",
                borderColor: "#c9bdf5",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 14px 30px rgba(0, 0, 0, 0.35)"
                    : "0 14px 30px rgba(67, 53, 120, 0.13)",
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={28} sx={{ color: purple }} />
            ) : (
              <>
                <Icon size={30} color={purple} />
                <Typography sx={{ mt: 1.4, color: "text.secondary", fontSize: 16.5 }}>
                  {stat.label}
                </Typography>
                <Typography sx={{ mt: 1.4, fontSize: 30, lineHeight: 1, fontWeight: 700 }}>
                  {stat.value}
                </Typography>
              </>
            )}
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
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            transition: "border-color 160ms ease, box-shadow 160ms ease",
            "&:hover": {
              borderColor: "#c9bdf5",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 10px 24px rgba(0, 0, 0, 0.3)"
                  : "0 10px 24px rgba(67, 53, 120, 0.08)",
            },
          }}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{panel}</Typography>
          <FiChevronDown size={25} color="#808892" />
        </Paper>
      ))}
    </Box>
  );
}
