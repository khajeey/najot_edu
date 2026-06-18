import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { FiChevronDown } from "react-icons/fi";
import {
  fetchGroupHomework,
  homeworkStatusFilters,
  homeworkStatusMeta,
} from "./studentApi";
import { formatHomeworkDate, formatHomeworkDateTime } from "../categoryPage/homeworkUtils";

const purple = "#7456d8";

export default function GroupHomeworkStatus() {
  const { groupId } = useParams();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    fetchGroupHomework(groupId)
      .then((data) => {
        if (alive) setRows(data);
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [groupId]);

  const visibleRows = rows.filter((row) => filter === "all" || row.status === filter);

  return (
    <Box>
      <Typography sx={{ fontSize: 22, fontWeight: 600, color: "text.secondary", mb: 2 }}>
        Uy vazifa statusi
      </Typography>

      <FormControl sx={{ mb: 3 }}>
        <Select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          IconComponent={FiChevronDown}
          sx={{
            minWidth: 240,
            height: 56,
            bgcolor: "background.paper",
            borderRadius: "10px",
            fontSize: 17,
            color: "text.primary",
            "& fieldset": { borderColor: "#e8740e" },
            "&:hover fieldset": { borderColor: "#e8740e" },
            "&.Mui-focused fieldset": { borderColor: "#e8740e" },
            "& .MuiSelect-icon": { right: 14, color: "text.secondary", fontSize: 22 },
          }}
        >
          {homeworkStatusFilters.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper", overflow: "hidden" }}>
        <Table sx={{ minWidth: 980 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={headCellSx}>Mavzular</TableCell>
              <TableCell sx={headCellSx}>Video</TableCell>
              <TableCell sx={headCellSx}>Uyga vazifa Holati</TableCell>
              <TableCell sx={headCellSx}>Uyga vazifa tugash vaqti</TableCell>
              <TableCell sx={headCellSx}>Dars sanasi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row) => {
              const meta = homeworkStatusMeta[row.status] || homeworkStatusMeta.not_given;
              return (
                <TableRow key={row.id} sx={{ height: 78 }}>
                  <TableCell sx={{ ...bodyCellSx, fontWeight: 600 }}>{row.topic}</TableCell>
                  <TableCell sx={bodyCellSx}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        border: "1px solid",
                        borderColor: "#9db2e8",
                        color: "#3b6fd4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {row.videoCount}
                    </Box>
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        px: 1.6,
                        height: 36,
                        borderRadius: "8px",
                        bgcolor: meta.bg,
                        color: meta.color,
                        fontSize: 15,
                        fontWeight: 600,
                      }}
                    >
                      {meta.label}
                    </Box>
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    {row.deadline ? formatHomeworkDateTime(row.deadline) : "-"}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>{formatHomeworkDate(row.lessonDate)}</TableCell>
                </TableRow>
              );
            })}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} sx={{ color: purple }} />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && visibleRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  Uy vazifalar topilmadi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

const headCellSx = {
  color: "text.secondary",
  fontSize: 16,
  fontWeight: 700,
  borderBottom: "1px solid",
  borderColor: "divider",
  py: 2.2,
};

const bodyCellSx = {
  color: "text.primary",
  fontSize: 16,
  borderBottom: "1px solid",
  borderColor: "divider",
  py: 0,
};
