import { useEffect, useState } from "react";
import {
  Box,
  Badge,
  CircularProgress,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { getApiErrorMessage } from "../../api/axiosClient";
import { purple } from "./constants";
import {
  HOMEWORK_TABS,
  fetchHomeworkMeta,
  fetchHomeworkResults,
  fetchHomeworkResultsWithCounts,
} from "./homeworkApi";
import { formatHomeworkDateTime } from "./homeworkUtils";
import { pageTitleSx, panelPaperSx } from "../../theme/surfaces";

const green = "#20b486";

export default function HomeworkCheckPage() {
  const { groupId, homeworkId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [meta, setMeta] = useState(null);
  const defaultTabIndex = HOMEWORK_TABS.findIndex((tab) => tab.key === "NOT_DONE");
  const [activeTab, setActiveTab] = useState(location.state?.tab ?? (defaultTabIndex >= 0 ? defaultTabIndex : 0));

  useEffect(() => {
    if (location.state?.tab !== undefined) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);
  const [results, setResults] = useState([]);
  const [counts, setCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const statusKey = HOMEWORK_TABS[activeTab]?.key;

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const data = await fetchHomeworkMeta(groupId, homeworkId);
        setMeta(data);
      } catch {
        setMeta(null);
      }
    };
    loadMeta();
  }, [groupId, homeworkId]);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const { counts: nextCounts } = await fetchHomeworkResultsWithCounts(groupId, homeworkId);
        setCounts(nextCounts);
      } catch {
        setCounts({});
      }
    };
    loadCounts();
  }, [groupId, homeworkId]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const all = await fetchHomeworkResults(groupId, homeworkId);
        setResults(all.filter((item) => item.status === statusKey));
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Natijalarni yuklashda xatolik"));
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [groupId, homeworkId, statusKey]);

  const openAnswer = (answer) => {
    if (!answer.canGrade || !answer.homeworkAnswerId) return;

    navigate(`/groups/${groupId}/homework/${homeworkId}/answers/${answer.homeworkAnswerId}`, {
      state: {
        topic: meta?.topic,
        endsAt: meta?.endsAt,
        studentName: answer.studentName,
        tab: activeTab,
      },
    });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2 }}>
        <IconButton
          onClick={() => navigate(`/groups/${groupId}`, { state: { tab: 1 } })}
          sx={{ width: 36, height: 36, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
        >
          <FiArrowLeft size={20} />
        </IconButton>
        <Typography sx={pageTitleSx}>{meta?.topic || "Uyga vazifa tekshirish"}</Typography>
      </Box>

      <Paper elevation={0} sx={{ ...panelPaperSx, p: 2.5, mb: 2.5 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Mavzu</Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{meta?.topic || "—"}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Tugash vaqti</Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
              {formatHomeworkDateTime(meta?.endsAt || meta?.createdAt)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={panelPaperSx}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{
            px: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 14, minHeight: 48 },
            "& .Mui-selected": { color: green },
            "& .MuiTabs-indicator": { bgcolor: green, height: 3 },
          }}
        >
          {HOMEWORK_TABS.map((tab, index) => (
            <Tab
              key={tab.key}
              label={
                <Badge
                  badgeContent={counts[tab.key] || 0}
                  color="warning"
                  invisible={!counts[tab.key]}
                  sx={{ "& .MuiBadge-badge": { fontSize: 11, fontWeight: 700 } }}
                >
                  <Box component="span" sx={{ pr: counts[tab.key] ? 2 : 0 }}>
                    {tab.label}
                  </Box>
                </Badge>
              }
            />
          ))}
        </Tabs>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headCellStyles}>O'quvchi ismi</TableCell>
              <TableCell sx={headCellStyles}>Uyga vazifa jo'natilgan vaqt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} sx={{ color: purple }} />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && errorMessage && (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 5, color: "#ef4444" }}>
                  {errorMessage}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !errorMessage && results.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 5, color: "text.secondary" }}>
                  Ma'lumot topilmadi
                </TableCell>
              </TableRow>
            )}
            {!isLoading
              && results.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => openAnswer(row)}
                  sx={{ cursor: row.canGrade ? "pointer" : "default" }}
                >
                  <TableCell sx={bodyCellStyles}>{row.studentName}</TableCell>
                  <TableCell sx={bodyCellStyles}>
                    {row.submittedAt ? formatHomeworkDateTime(row.submittedAt) : "—"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

const headCellStyles = { fontWeight: 700, fontSize: 13, color: "text.secondary" };
const bodyCellStyles = { fontSize: 14 };
