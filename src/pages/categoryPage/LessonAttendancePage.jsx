import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { api, getApiErrorMessage } from "../../api/axiosClient";
import { purple } from "./constants";
import { findGroupInList, normalizeGroup } from "./groupUtils";
import {
  fetchGroupAttendance,
  fetchGroupStudents,
  fetchLessonTopics,
  loadLesson,
  resolveLessonId,
  saveAllAttendance,
  saveLesson,
} from "./lessonApi";
import { buildFullSchedules } from "./scheduleUtils";
import GroupScheduleCalendar from "./GroupScheduleCalendar";
import TopicComboField from "./TopicComboField";

const green = "#20b486";

export default function LessonAttendancePage() {
  const { groupId, lessonDate } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [monthIndex, setMonthIndex] = useState(0);
  const [showAllDays, setShowAllDays] = useState(false);
  const [roleTab, setRoleTab] = useState("teacher");
  const [topicMode, setTopicMode] = useState("other");
  const [topicValue, setTopicValue] = useState({ lessonId: null, customTopic: "" });
  const [topicOptions, setTopicOptions] = useState([]);
  const [description, setDescription] = useState("");
  const [students, setStudents] = useState([]);
  const [lessonId, setLessonId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const teacher = group?.teacherDetails?.[0];

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [groupsRes, schedulesRes, topics, groupStudents] = await Promise.all([
          api.get("/groups/all"),
          api.get(`/groups/${groupId}/schedules`),
          fetchLessonTopics(groupId),
          fetchGroupStudents(groupId),
        ]);

        if (!groupsRes.data.success) {
          throw new Error("Guruh topilmadi");
        }

        const rawGroup = findGroupInList(groupsRes.data.data, groupId);
        if (!rawGroup) {
          throw new Error("Guruh topilmadi");
        }

        setGroup({ ...normalizeGroup(rawGroup), _raw: rawGroup });
        setTopicOptions(topics);

        const schedulePayload = schedulesRes.data?.success
          ? schedulesRes.data.data ?? []
          : Array.isArray(schedulesRes.data)
            ? schedulesRes.data
            : schedulesRes.data?.data ?? [];

        const courseObj = rawGroup.course;
        const durationMonths =
          (typeof courseObj === "object" && courseObj?.duration_month)
          || rawGroup.duration_month
          || 1;

        setSchedules(
          buildFullSchedules({
            apiSchedules: schedulePayload,
            startDate: rawGroup.start_date,
            durationMonths,
            weekDays: rawGroup.week_day || rawGroup.days,
          })
        );

        const monthWithDate = parsedSchedules.findIndex((month) =>
          month.days.some((day) => day.dateKey === lessonDate)
        );
        if (monthWithDate >= 0) {
          setMonthIndex(monthWithDate);
        }

        const [lessonData, attendanceList] = await Promise.all([
          loadLesson(groupId, lessonDate),
          fetchGroupAttendance(groupId),
        ]);

        setLessonId(lessonData?.id ?? lessonData?.lesson_id ?? null);
        setDescription(lessonData?.description || "");
        setTopicValue({
          lessonId: lessonData?.lesson_id ?? lessonData?.id ?? null,
          customTopic: lessonData?.topic || "",
        });
        setTopicMode(lessonData?.type === "curriculum" ? "curriculum" : "other");

        const lessonAttendance = lessonData?.attendance || lessonData?.students || [];

        setStudents(
          groupStudents.map((student) => {
            const fromLesson = lessonAttendance.find(
              (item) =>
                Number(item.student_id ?? item.id ?? item.Student?.id) === Number(student.id)
            );
            const fromApi = attendanceList.find(
              (item) => Number(item.student_id ?? item.studentId ?? item.id) === Number(student.id)
            );
            const found = fromLesson || fromApi;

            return {
              ...student,
              present: found?.isPresent ?? found?.is_present ?? found?.present ?? found?.keldi ?? false,
            };
          })
        );
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Ma'lumotlarni yuklashda xatolik"));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [groupId, lessonDate]);

  useEffect(() => {
    setShowAllDays(false);
  }, [monthIndex]);

  const lessonStatus = useMemo(() => {
    if (lessonId) return "Dars o'tilgan";
    return "Dars o'tilmagan";
  }, [lessonId]);

  const handleDayClick = (dateKey) => {
    if (!dateKey) return;
    navigate(`/groups/${groupId}/lesson/${dateKey}`, { state: { tab: 2 } });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      let currentLessonId = lessonId;

      if (!currentLessonId) {
        currentLessonId = await resolveLessonId({
          groupId,
          lessonDate,
          topicMode,
          topicValue,
          description,
        });
      } else {
        await saveLesson({
          group_id: Number(groupId),
          date: lessonDate,
          topic: topicValue.customTopic,
          description,
          type: topicMode === "curriculum" ? "curriculum" : "other",
          lesson_id: currentLessonId,
        });
      }

      await saveAllAttendance(groupId, students);

      setLessonId(currentLessonId);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Saqlashda xatolik"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: purple }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
        <IconButton onClick={() => navigate(`/groups/${groupId}`, { state: { tab: 2 } })} sx={backIconStyles}>
          <FiArrowLeft size={20} />
        </IconButton>
        <Box>
          <Typography sx={{ fontSize: 26, fontWeight: 700 }}>{group?.name}</Typography>
          <Typography sx={{ color: "#6b7280", fontSize: 14 }}>Akademik davomat — {lessonDate}</Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={sectionPaperStyles}>
        <GroupScheduleCalendar
          schedules={schedules}
          monthIndex={monthIndex}
          onMonthIndexChange={setMonthIndex}
          showAllDays={showAllDays}
          onShowAllDaysChange={setShowAllDays}
          selectedDateKey={lessonDate}
          onDayClick={handleDayClick}
        />
      </Paper>

      <Box sx={{ display: "flex", gap: 3, mt: 3, mb: 2, borderBottom: "1px solid #e7e9ef" }}>
        {["assistant", "teacher"].map((tab) => (
          <Button
            key={tab}
            onClick={() => setRoleTab(tab)}
            sx={{
              textTransform: "capitalize",
              fontWeight: 700,
              fontSize: 16,
              color: roleTab === tab ? green : "#8c9199",
              borderBottom: roleTab === tab ? `2px solid ${green}` : "2px solid transparent",
              borderRadius: 0,
              pb: 1.2,
              minWidth: 0,
            }}
          >
            {tab === "assistant" ? "Assistant" : "Teacher"}
          </Button>
        ))}
      </Box>

      <Paper elevation={0} sx={{ ...sectionPaperStyles, mb: 2.5 }}>
        <Typography sx={blockTitleStyles}>Ma'lumot</Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 2 }}>
          <Box sx={avatarStyles}>{(teacher?.name || "T").charAt(0)}</Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{teacher?.name || "Ustoz biriktirilmagan"}</Typography>
            <Chip label="Teacher" size="small" sx={teacherChipStyles} />
          </Box>
          <Box sx={{ ml: "auto", display: "flex", gap: 4, flexWrap: "wrap" }}>
            <MetaItem label="Dars kuni" value={lessonDate?.replace(/-/g, " M")} />
            <MetaItem label="Holat" value={lessonStatus} />
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={sectionPaperStyles}>
        <Typography sx={blockTitleStyles}>Yo'qlama va mavzu kiritish</Typography>

        <RadioGroup
          row
          value={topicMode}
          onChange={(event) => setTopicMode(event.target.value)}
          sx={{ mt: 2, gap: 2 }}
        >
          <FormControlLabel
            value="curriculum"
            control={<Radio sx={{ color: green, "&.Mui-checked": { color: green } }} />}
            label="O'quv reja bo'yicha"
          />
          <FormControlLabel
            value="other"
            control={<Radio sx={{ color: green, "&.Mui-checked": { color: green } }} />}
            label="Boshqa"
          />
        </RadioGroup>

        <Box sx={{ mt: 2.5 }}>
          <Typography sx={fieldLabelStyles}>
            <Box component="span" sx={{ color: "#ef4444" }}>* </Box>
            Mavzu
          </Typography>
          <TopicComboField
            options={topicOptions}
            value={topicValue}
            onChange={setTopicValue}
            placeholder="Mavzuni kiriting yoki tanlang"
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography sx={fieldLabelStyles}>Tavsif (ixtiyoriy)</Typography>
          <TextField
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Dars haqida qo'shimcha ma'lumot..."
            fullWidth
            multiline
            minRows={4}
            sx={textareaStyles}
          />
        </Box>

        <Table sx={{ mt: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={tableHeadStyles}>#</TableCell>
              <TableCell sx={tableHeadStyles}>O'quvchi ismi</TableCell>
              <TableCell align="right" sx={tableHeadStyles}>Keldi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student, index) => (
              <TableRow key={student.id}>
                <TableCell sx={tableBodyStyles}>{index + 1}</TableCell>
                <TableCell sx={{ ...tableBodyStyles, fontWeight: 600 }}>{student.name}</TableCell>
                <TableCell align="right" sx={tableBodyStyles}>
                  <Switch
                    checked={student.present}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setStudents((current) =>
                        current.map((item) =>
                          item.id === student.id ? { ...item, present: checked } : item
                        )
                      );
                    }}
                    sx={attendanceSwitchStyles}
                  />
                </TableCell>
              </TableRow>
            ))}
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: "#6b7280" }}>
                  Talabalar topilmadi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {errorMessage && (
          <Typography sx={{ mt: 2, color: "#ef4444", fontWeight: 600 }}>{errorMessage}</Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button onClick={handleSave} disabled={isSaving} sx={saveButtonStyles}>
            {isSaving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

function MetaItem({ label, value }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 13, color: "#6b7280" }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, color: "#111827" }}>{value}</Typography>
    </Box>
  );
}

const backIconStyles = {
  width: 40,
  height: 40,
  border: "1px solid #e5e7eb",
  bgcolor: "#fff",
};

const sectionPaperStyles = {
  borderRadius: "12px",
  bgcolor: "#fff",
  border: "1px solid #e7e9ef",
  p: 2.5,
};

const blockTitleStyles = {
  fontSize: 20,
  fontWeight: 700,
  color: "#111827",
};

const avatarStyles = {
  width: 56,
  height: 56,
  borderRadius: "50%",
  bgcolor: "#eef0f4",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: 22,
  color: purple,
};

const teacherChipStyles = {
  mt: 0.5,
  bgcolor: "#e8f7e9",
  color: green,
  fontWeight: 700,
  height: 22,
};

const fieldLabelStyles = {
  mb: 1,
  fontSize: 15,
  fontWeight: 700,
  color: "#374151",
};

const textareaStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    "& fieldset": { borderColor: "#dce2eb" },
    "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 },
  },
};

const tableHeadStyles = {
  fontWeight: 700,
  color: "#6b7280",
  borderBottom: "1px solid #edf0f4",
};

const tableBodyStyles = {
  borderBottom: "1px solid #edf0f4",
  py: 1.2,
};

const attendanceSwitchStyles = {
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: green,
    "& + .MuiSwitch-track": { bgcolor: green, opacity: 1 },
  },
  "& .MuiSwitch-switchBase:not(.Mui-checked) + .MuiSwitch-track": {
    bgcolor: "#d1d5db",
    opacity: 1,
  },
};

const saveButtonStyles = {
  height: 46,
  px: 3,
  borderRadius: "10px",
  bgcolor: purple,
  color: "#fff",
  fontWeight: 700,
  textTransform: "none",
  "&:hover": { bgcolor: "#684bcf" },
};
