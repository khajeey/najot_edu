import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { fetchMyGroups } from "./studentApi";
import { formatHomeworkDate } from "../categoryPage/homeworkUtils";
import TeachersDialog from "./TeachersDialog";

const purple = "#7456d8";
const flame = "#e8740e";
const orange = "#cc9869";

export default function MyGroups() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("active");
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teachersGroup, setTeachersGroup] = useState(null);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    fetchMyGroups()
      .then((data) => {
        if (alive) setGroups(data);
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const visibleGroups = groups.filter((group) =>
    tab === "active" ? group.isActive : !group.isActive
  );

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3.5, borderBottom: "1px solid", borderColor: "divider", mb: 3 }}>
        <Tab label="Faol" active={tab === "active"} onClick={() => setTab("active")} />
        <Tab label="Tugagan" active={tab === "completed"} onClick={() => setTab("completed")} />
      </Box>

      <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper", overflow: "hidden" }}>
        <Table sx={{ minWidth: 880 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={headCellSx}>#</TableCell>
              <TableCell sx={headCellSx}>Guruh nomi</TableCell>
              <TableCell sx={headCellSx}>Yo'nalishi</TableCell>
              <TableCell align="center" sx={headCellSx}>O'qituvchi</TableCell>
              <TableCell sx={headCellSx}>Boshlash vaqti</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleGroups.map((group, index) => (
              <TableRow key={group.id} sx={{ height: 76 }}>
                <TableCell sx={bodyCellSx}>{index + 1}</TableCell>
                <TableCell sx={bodyCellSx}>
                  <Typography
                    onClick={() => navigate(`/dashboard/my-groups/${group.id}`)}
                    sx={{ fontSize: 17, fontWeight: 600, cursor: "pointer", "&:hover": { color: flame } }}
                  >
                    {group.name}
                  </Typography>
                </TableCell>
                <TableCell sx={bodyCellSx}>{group.direction}</TableCell>
                <TableCell align="center" sx={bodyCellSx}>
                  <Box
                    onClick={() => setTeachersGroup(group)}
                    sx={{
                      width: 36,
                      height: 36,
                      mx: "auto",
                      borderRadius: "50%",
                      bgcolor: orange,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "transform 150ms ease",
                      "&:hover": { transform: "scale(1.08)" },
                    }}
                  >
                    {group.teachers.length}
                  </Box>
                </TableCell>
                <TableCell sx={bodyCellSx}>{formatHomeworkDate(group.startDate)}</TableCell>
              </TableRow>
            ))}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} sx={{ color: purple }} />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && visibleGroups.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  {tab === "active" ? "Faol guruhlar topilmadi" : "Tugagan guruhlar topilmadi"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <TeachersDialog
        group={teachersGroup}
        open={Boolean(teachersGroup)}
        onClose={() => setTeachersGroup(null)}
      />
    </Box>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      sx={{
        height: 46,
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        fontSize: 18,
        fontWeight: 700,
        color: active ? flame : "text.secondary",
        borderBottom: active ? `2px solid ${flame}` : "2px solid transparent",
        mb: "-1px",
      }}
    >
      {label}
    </Box>
  );
}

const headCellSx = {
  color: "text.secondary",
  fontSize: 16,
  fontWeight: 700,
  borderBottom: "1px solid",
  borderColor: "divider",
  py: 2,
};

const bodyCellSx = {
  color: "text.primary",
  fontSize: 16,
  borderBottom: "1px solid",
  borderColor: "divider",
  py: 0,
};
