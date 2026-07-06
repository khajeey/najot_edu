import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiX } from "react-icons/fi";
import GroupHomeworkTab from "./GroupHomeworkTab";
import GroupScheduleCalendar from "./GroupScheduleCalendar";
import { api, getApiErrorMessage } from "../../api/axiosClient";
import { purple } from "./constants";
import {
  findGroupInList,
  formatWeekDaysShort,
  normalizeGroup,
} from "./groupUtils";
import {
  buildFullSchedules,
  formatDateRange,
  formatTimeRange,
  pickDefaultLessonDate,
} from "./scheduleUtils";

const detailTabs = ["Ma'lumotlar", "Guruh darsliklari", "Akademik davomati"];

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [group, setGroup] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [averageAge, setAverageAge] = useState(null);
  const [activeTab, setActiveTab] = useState(location.state?.tab ?? 0);
  const [monthIndex, setMonthIndex] = useState(0);
  const [showAllDays, setShowAllDays] = useState(false);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [showAllRows, setShowAllRows] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [groupsRes, schedulesRes, studentsRes] = await Promise.all([
          api.get("/groups/all"),
          api.get(`/groups/${groupId}/schedules`),
          api.get("/students").catch(() => ({ data: { success: false, data: [] } })),
        ]);

        if (!groupsRes.data.success) {
          throw new Error(groupsRes.data.message || "Guruh topilmadi");
        }

        const rawGroup = findGroupInList(groupsRes.data.data, groupId);
        if (!rawGroup) {
          throw new Error("Guruh topilmadi");
        }

        const normalized = normalizeGroup(rawGroup);
        setGroup({ ...normalized, _raw: rawGroup });
        setAverageAge(
          computeAverageAgeForGroup(studentsRes?.data?.success ? studentsRes.data.data || [] : [], Number(groupId))
        );

        const schedulePayload = schedulesRes.data?.success
          ? schedulesRes.data.data ?? []
          : Array.isArray(schedulesRes.data)
            ? schedulesRes.data
            : schedulesRes.data?.data ?? [];
        const courseObj = rawGroup.course;
        const durationMonths =
          (typeof courseObj === "object" && courseObj?.duration_month)
          || rawGroup.duration_month
          || normalized.durationMonths
          || 1;

        setSchedules(
          buildFullSchedules({
            apiSchedules: schedulePayload,
            startDate: rawGroup.start_date,
            durationMonths,
            weekDays: rawGroup.week_day || rawGroup.days,
          })
        );
        setMonthIndex(0);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Guruh ma'lumotlarini yuklashda xatolik"));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [groupId]);

  useEffect(() => {
    if (location.state?.tab !== undefined) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  useEffect(() => {
    setShowAllDays(false);
  }, [monthIndex]);

  const raw = group?._raw;
  const course = raw?.course;
  const room = raw?.room;

  const lessonRows = useMemo(() => {
    if (!group) return [];

    return (group.teacherDetails || []).map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      days: formatWeekDaysShort(raw?.week_day || raw?.days),
      time: formatTimeRange(raw?.start_time),
      dateRange: formatDateRange(raw?.start_date, group.durationMonths),
      room: typeof room === "object" ? room?.name : group.room,
    }));
  }, [group, raw, room]);

  const visibleRows = showAllRows ? lessonRows : lessonRows.slice(0, 3);

  const openLessonPage = (dateKey) => {
    const targetDate = dateKey || pickDefaultLessonDate(schedules);
    navigate(`/groups/${groupId}/lesson/${targetDate}`, { state: { tab: 2, groupName: group?.name } });
  };

  const parameters = [
    { label: "Kurs", value: group?.course || "—" },
    {
      label: "O'rta yosh",
      value:
        raw?.average_age
        ?? raw?.avg_age
        ?? (averageAge != null ? `${averageAge}` : "—"),
    },
    { label: "O'quvchilar sig'imi", value: raw?.max_student ?? group?.raw?.max_student ?? "—" },
    { label: "Mavjud o'quvchilar", value: group?.students ?? "—" },
    {
      label: "O'quv oyidagi darslar soni",
      value: raw?.lessons_per_month ?? raw?.monthly_lessons ?? schedules[monthIndex]?.days?.length ?? "—",
    },
    {
      label: "Kurs davomiyligi (oy)",
      value: group?.durationMonths || course?.duration_month || "—",
    },
    {
      label: "Jami darslar soni",
      value: (raw?.total_lessons ?? schedules.flatMap((month) => month.days).length) || "—",
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: purple }} />
      </Box>
    );
  }

  if (errorMessage || !group) {
    return (
      <Box>
        <Button startIcon={<FiArrowLeft />} onClick={() => navigate("/groups")} sx={backButtonStyles}>
          Orqaga
        </Button>
        <Typography sx={{ mt: 3, color: "#ef4444", fontWeight: 600 }}>{errorMessage || "Guruh topilmadi"}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton onClick={() => navigate("/groups")} sx={roundIconButtonStyles}>
            <FiArrowLeft size={20} />
          </IconButton>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap" }}>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: "text.primary" }}>{group.name}</Typography>
              <Chip
                label={group.isActive ? "Aktiv" : "Nofaol"}
                size="small"
                sx={group.isActive ? activeChipStyles : inactiveChipStyles}
              />
            </Box>
          </Box>
        </Box>
        <Button variant="outlined" sx={statsButtonStyles}>
          Statistika
        </Button>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, value) => {
          if (value === 2) {
            openLessonPage();
            return;
          }
          setActiveTab(value);
        }}
        sx={{
          mb: 3,
          minHeight: 42,
          "& .MuiTab-root": {
            textTransform: "none",
            fontSize: 18,
            fontWeight: 600,
            color: "text.secondary",
            minHeight: 42,
          },
          "& .Mui-selected": { color: purple },
          "& .MuiTabs-indicator": { bgcolor: purple, height: 3 },
        }}
      >
        {detailTabs.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {activeTab === 0 ? (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1.2fr" },
              gap: 2.5,
              mb: 3,
            }}
          >
            <InfoPanel title="Guruh mentorlari">
              <Box sx={{ p: 2.2, display: "flex", flexDirection: "column", gap: 2 }}>
                {(group.teacherDetails || []).length > 0 ? (
                  group.teacherDetails.map((teacher) => (
                    <Box
                      key={teacher.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        cursor: "pointer",
                        "&:hover .teacher-name": { color: purple },
                      }}
                      onClick={() => navigate(`/teachers/${teacher.id}`)}
                    >
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: "10px",
                          bgcolor: "action.hover",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          color: purple,
                          fontSize: 20,
                        }}
                      >
                        {teacher.name.charAt(0)}
                      </Box>
                      <Box>
                        <Chip label="Teacher" size="small" sx={teacherChipStyles} />
                        <Typography className="teacher-name" sx={{ mt: 0.6, fontSize: 18, fontWeight: 700 }}>
                          {teacher.name}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ color: "text.secondary" }}>Mentor biriktirilmagan</Typography>
                )}
              </Box>
            </InfoPanel>

            <InfoPanel title="Parametrlar">
              <Box sx={{ p: 0 }}>
                {parameters.map((row, index) => (
                  <Box
                    key={row.label}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                      px: 2.2,
                      py: 1.35,
                      borderBottom: index < parameters.length - 1 ? "1px solid" : "none",
                      borderColor: "divider",
                    }}
                  >
                    <Typography sx={{ color: "text.secondary", fontSize: 15 }}>{row.label}</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, color: "text.primary", textAlign: "right" }}>
                      {row.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </InfoPanel>
          </Box>

          <Paper elevation={0} sx={sectionPaperStyles}>
            <Typography sx={sectionTitleStyles}>Dars jadvali</Typography>
            <Box sx={{ mt: 2 }}>
              {visibleRows.map((row) => (
                <Box
                  key={row.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 0.8fr 1.2fr 1.4fr 0.8fr",
                    gap: 2,
                    py: 1.4,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    onClick={() => navigate(`/teachers/${row.id}`)}
                    sx={{ color: "#2563eb", fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                  >
                    {row.name}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: "text.secondary" }}>{row.days || "—"}</Typography>
                  <Typography sx={{ fontWeight: 600, color: "text.primary" }}>{row.time}</Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>{row.dateRange}</Typography>
                  <Typography sx={{ fontWeight: 700, color: "text.primary" }}>{row.room || "—"}</Typography>
                </Box>
              ))}
              {lessonRows.length === 0 && (
                <Typography sx={{ py: 3, color: "text.secondary", textAlign: "center" }}>Dars jadvali mavjud emas</Typography>
              )}
              {lessonRows.length > 3 && (
                <Button onClick={() => setShowAllRows((value) => !value)} sx={linkButtonStyles}>
                  {showAllRows ? "Kamroq ko'rsatish" : `Yana ko'rsatish (${lessonRows.length - 3})`}
                </Button>
              )}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ ...sectionPaperStyles, mt: 2.5 }}>
            <GroupScheduleCalendar
              schedules={schedules}
              monthIndex={monthIndex}
              onMonthIndexChange={setMonthIndex}
              showAllDays={showAllDays}
              onShowAllDaysChange={setShowAllDays}
              showAllMonths={showAllMonths}
              onShowAllMonthsChange={setShowAllMonths}
              onDayClick={openLessonPage}
            />
          </Paper>
        </>
      ) : activeTab === 1 ? (
        <GroupHomeworkTab groupId={groupId} groupName={group.name} />
      ) : null}
    </Box>
  );
}

function computeAverageAgeForGroup(students, groupId) {
  const list = Array.isArray(students) ? students : [];
  const now = new Date();

  const ages = list
    .filter((student) => {
      const groups = student.groups || student.GroupStudent || [];
      if (!Array.isArray(groups)) return false;
      return groups.some((g) => Number(g?.id) === Number(groupId));
    })
    .map((student) => student.birth_date)
    .filter(Boolean)
    .map((birth) => {
      const date = new Date(birth);
      if (Number.isNaN(date.getTime())) return null;
      let age = now.getFullYear() - date.getFullYear();
      const m = now.getMonth() - date.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < date.getDate())) {
        age -= 1;
      }
      return age;
    })
    .filter((age) => typeof age === "number" && age > 0 && age < 120);

  if (!ages.length) return null;

  const avg = ages.reduce((sum, age) => sum + age, 0) / ages.length;
  return Math.round(avg);
}

function InfoPanel({ title, children }) {
  return (
    <Paper elevation={0} sx={{ borderRadius: "12px", overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
      <Box
        sx={{
          height: 48,
          px: 2,
          bgcolor: "#4f7df0",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{title}</Typography>
        <IconButton size="small" sx={{ color: "#fff" }}>
          <FiX size={18} />
        </IconButton>
      </Box>
      {children}
    </Paper>
  );
}

const backButtonStyles = {
  textTransform: "none",
  color: "text.secondary",
  fontWeight: 700,
};

const roundIconButtonStyles = {
  width: 40,
  height: 40,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
};

const activeChipStyles = {
  bgcolor: "#e8f7e9",
  color: "#21aa4b",
  fontWeight: 800,
  height: 28,
};

const inactiveChipStyles = {
  bgcolor: "#fde8e8",
  color: "#e54848",
  fontWeight: 800,
  height: 28,
};

const statsButtonStyles = {
  height: 42,
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: 700,
  color: "text.primary",
  borderColor: "divider",
};

const teacherChipStyles = {
  bgcolor: "#e8f7e9",
  color: "#21aa4b",
  fontWeight: 700,
  height: 22,
  fontSize: 11,
};

const sectionPaperStyles = {
  borderRadius: "12px",
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  p: 2.5,
};

const sectionTitleStyles = {
  fontSize: 22,
  fontWeight: 700,
  color: "text.primary",
};

const linkButtonStyles = {
  mt: 1.5,
  textTransform: "none",
  color: purple,
  fontWeight: 700,
};
