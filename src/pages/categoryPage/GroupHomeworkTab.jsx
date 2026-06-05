import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiClock, FiMoreVertical, FiUsers } from "react-icons/fi";
import { api, getApiErrorMessage } from "../../api/axiosClient";
import { purple } from "./constants";
import { formatHomeworkDate, formatHomeworkDateTime, normalizeHomeworkLesson } from "./homeworkUtils";
import GroupVideosTab from "./GroupVideosTab";

const lessonSubTabs = ["Uyga vazifa", "Videolar", "Imtihonlar", "Jurnal"];
const green = "#20b486";

export default function GroupHomeworkTab({ groupId, groupName }) {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [openVideoUpload, setOpenVideoUpload] = useState(false);

  useEffect(() => {
    if (activeSubTab !== 0) return;

    const load = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const { data } = await api.get(`/homework/${groupId}`);

        if (!data.success) {
          throw new Error(data.message || "Uyga vazifalarni yuklashda xatolik");
        }

        setLessons((data.data || []).map(normalizeHomeworkLesson));
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Uyga vazifalarni yuklashda xatolik"));
        setLessons([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [groupId, activeSubTab]);

  const showAddButton = activeSubTab === 0 || activeSubTab === 1;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap" }}>
          {lessonSubTabs.map((label, index) => (
            <Button
              key={label}
              onClick={() => setActiveSubTab(index)}
              sx={{
                height: 40,
                px: 2.2,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 15,
                bgcolor: activeSubTab === index ? "#fff" : "transparent",
                color: activeSubTab === index ? "#111827" : "#8c9199",
                boxShadow: activeSubTab === index ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                border: activeSubTab === index ? "1px solid #e3e6ec" : "1px solid transparent",
                "&:hover": { bgcolor: activeSubTab === index ? "#fff" : "#f5f6f8" },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>

        {showAddButton && (
          <Button
            onClick={() => {
              if (activeSubTab === 0) {
                navigate(`/groups/${groupId}/homework/yangi`, { state: { groupName } });
                return;
              }
              setOpenVideoUpload(true);
            }}
            sx={{
              height: 42,
              px: 2.5,
              borderRadius: "8px",
              bgcolor: green,
              color: "#fff",
              fontWeight: 700,
              textTransform: "none",
              fontSize: 16,
              "&:hover": { bgcolor: "#1aa377" },
            }}
          >
            Qo'shish
          </Button>
        )}
      </Box>

      {activeSubTab === 0 ? (
        <Paper elevation={0} sx={{ borderRadius: "12px", border: "1px solid #e7e9ef", bgcolor: "#fff", overflow: "hidden" }}>
          <Table sx={{ minWidth: 1100 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#fafbfc" }}>
                <TableCell sx={headCellStyles}>#</TableCell>
                <TableCell sx={headCellStyles}>Mavzu</TableCell>
                <TableCell align="center" sx={iconHeadCellStyles}>
                  <FiUsers size={20} color="#f59e0b" />
                </TableCell>
                <TableCell align="center" sx={iconHeadCellStyles}>
                  <FiClock size={20} color="#eab308" />
                </TableCell>
                <TableCell align="center" sx={iconHeadCellStyles}>
                  <FiCheckCircle size={20} color={green} />
                </TableCell>
                <TableCell sx={headCellStyles}>Berilgan vaqt</TableCell>
                <TableCell sx={headCellStyles}>Tugash vaqt</TableCell>
                <TableCell sx={headCellStyles}>Dars sanasi</TableCell>
                <TableCell align="right" sx={headCellStyles}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lessons.map((lesson, index) => (
                <TableRow
                  key={lesson.id}
                  sx={{
                    height: 58,
                    cursor: lesson.homeworkId ? "pointer" : "default",
                    "&:hover": lesson.homeworkId ? { bgcolor: "action.hover" } : undefined,
                  }}
                  onClick={() => {
                    if (lesson.homeworkId) {
                      navigate(`/groups/${groupId}/homework/${lesson.homeworkId}/check`, {
                        state: { groupName },
                      });
                    }
                  }}
                >
                  <TableCell sx={bodyCellStyles}>{index + 1}</TableCell>
                  <TableCell sx={{ ...bodyCellStyles, fontWeight: 700, color: "#111827" }}>{lesson.topic}</TableCell>
                  <TableCell align="center" sx={bodyCellStyles}>
                    <Typography sx={metricTextStyles}>{lesson.studentsCount}</Typography>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      ...bodyCellStyles,
                      bgcolor: lesson.pending > 0 ? "#fee2e2" : "transparent",
                      color: lesson.pending > 0 ? "#ef4444" : "inherit",
                    }}
                  >
                    <Typography
                      sx={{
                        ...metricTextStyles,
                        color: lesson.pending > 0 ? "#ef4444" : "#111827",
                      }}
                    >
                      {lesson.pending}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={bodyCellStyles}>
                    <Typography sx={metricTextStyles}>{lesson.accepted}</Typography>
                  </TableCell>
                  <TableCell sx={bodyCellStyles}>{formatHomeworkDateTime(lesson.givenAt)}</TableCell>
                  <TableCell sx={bodyCellStyles}>{formatHomeworkDateTime(lesson.endsAt)}</TableCell>
                  <TableCell sx={bodyCellStyles}>{formatHomeworkDate(lesson.lessonDate)}</TableCell>
                  <TableCell align="right" sx={bodyCellStyles}>
                    <IconButton
                      sx={{ color: "#a0a4ab" }}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (lesson.homeworkId) {
                          navigate(`/groups/${groupId}/homework/${lesson.homeworkId}/check`, {
                            state: { groupName },
                          });
                        }
                      }}
                    >
                      <FiMoreVertical size={20} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={28} sx={{ color: purple }} />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && errorMessage && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5, color: "#ef4444" }}>
                    {errorMessage}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !errorMessage && lessons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5, color: "#6b7280" }}>
                    Uyga vazifalar topilmadi
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      ) : activeSubTab === 1 ? (
        <GroupVideosTab
          groupId={groupId}
          openUpload={openVideoUpload}
          onUploadClosed={() => setOpenVideoUpload(false)}
        />
      ) : (
        <Paper elevation={0} sx={{ borderRadius: "12px", border: "1px solid #e7e9ef", bgcolor: "#fff", py: 6, textAlign: "center" }}>
          <Typography sx={{ color: "#6b7280", fontSize: 16 }}>
            "{lessonSubTabs[activeSubTab]}" bo'limi tez orada qo'shiladi.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

const headCellStyles = {
  color: "#7f858e",
  fontSize: 14,
  fontWeight: 700,
  borderBottom: "1px solid #edf0f4",
  py: 1.5,
};

const iconHeadCellStyles = {
  ...headCellStyles,
  width: 72,
  py: 1.8,
};

const bodyCellStyles = {
  color: "#374151",
  fontSize: 14,
  borderBottom: "1px solid #edf0f4",
  py: 1.2,
};

const metricTextStyles = {
  fontWeight: 700,
  fontSize: 15,
  color: "#111827",
};
