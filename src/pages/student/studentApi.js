import { api } from "../../api/axiosClient";
import { apiDaysToUz } from "../categoryPage/groupUtils";

const SHORT_DAYS = {
  Dushanba: "Du",
  Seshanba: "Se",
  Chorshanba: "Ch",
  Payshanba: "Pa",
  Juma: "Ju",
  Shanba: "Sha",
  Yakshanba: "Ya",
};

function shortWeekDays(value) {
  return apiDaysToUz(value)
    .map((day) => SHORT_DAYS[day] || day.slice(0, 2))
    .join(", ");
}

function timeRange(start, hours = 2) {
  if (!start) return "";
  const [h, m] = String(start).split(":").map((part) => Number(part));
  if (Number.isNaN(h)) return start;
  const endH = (h + hours) % 24;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m || 0)} - ${pad(endH)}:${pad(m || 0)}`;
}

function normalizeTeacher(teacher) {
  const inner = teacher.Teacher || teacher.teacher || teacher;
  return {
    name: inner.full_name || inner.name || teacher.full_name || teacher.name || "—",
    role: String(teacher.role || inner.role || "TEACHER").toUpperCase(),
    days: shortWeekDays(teacher.week_day || inner.week_day || teacher.days),
    time: timeRange(teacher.start_time || inner.start_time),
  };
}

function normalizeStudentGroup(group) {
  const course = group.course;
  const courseName =
    typeof course === "object" && course !== null ? course.name || "" : course || "";
  const rawTeachers = group.teachers || group.GroupTeacher || [];

  return {
    id: group.groupId ?? group.id,
    name: group.groupName || group.name || "",
    direction: group.courseName || courseName || group.direction || "",
    startDate: group.startDate || group.start_date || group.created_at || null,
    isActive: group.isActive ?? group.is_active ?? group.active ?? true,
    teachers: (Array.isArray(rawTeachers) ? rawTeachers : []).map(normalizeTeacher),
  };
}

const HW_STATUS = {
  ACCEPTED: "accepted",
  ACCEPT: "accepted",
  RETURNED: "returned",
  REJECTED: "returned",
  NOT_GIVEN: "not_given",
  NOTGIVEN: "not_given",
  NOT_DONE: "not_done",
  PENDING: "not_done",
};

function normalizeHomeworkRow(item) {
  const latest = Array.isArray(item.homework) ? item.homework[0] : item.homework || null;
  const rawStatus = String(
    item.homework_status || item.status || latest?.status || "NOT_GIVEN"
  ).toUpperCase();

  return {
    id: item.id ?? item.lessonId ?? item.lesson_id,
    topic: item.topic || item.title || item.name || "—",
    videoCount:
      item.video_count ??
      item.videosCount ??
      (Array.isArray(item.videos) ? item.videos.length : 0),
    status: HW_STATUS[rawStatus] || "not_given",
    deadline: latest?.end_at || latest?.deadline || item.deadline || null,
    lessonDate: item.date || item.lesson_date || item.lessonDate || item.created_at || null,
  };
}

export async function fetchMyGroups() {
  const { data } = await api.get("/students/my/groups");
  if (!data?.success) return [];
  const list = Array.isArray(data.data) ? data.data : [];
  return list.map(normalizeStudentGroup);
}

export async function fetchGroupHomework(groupId) {
  const { data } = await api.get(`/groups/${groupId}/lessons/all`);
  const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return list.map(normalizeHomeworkRow);
}

export const homeworkStatusMeta = {
  accepted: { label: "Qabul qilingan", bg: "#22b357", color: "#fff" },
  returned: { label: "Qaytarilgan", bg: "#f5a623", color: "#fff" },
  not_done: { label: "Bajarilmagan", bg: "#ef4444", color: "#fff" },
  not_given: { label: "Berilmagan", bg: "#6b7280", color: "#fff" },
};

export const homeworkStatusFilters = [
  { value: "all", label: "Barchasi" },
  { value: "accepted", label: "Qabul qilingan" },
  { value: "returned", label: "Qaytarilgan" },
  { value: "not_done", label: "Bajarilmagan" },
  { value: "not_given", label: "Berilmagan" },
];
