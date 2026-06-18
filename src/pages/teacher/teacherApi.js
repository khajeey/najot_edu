import { api } from "../../api/axiosClient";
import { apiDaysToUz } from "../categoryPage/groupUtils";

const DAY_SHORT = {
  Dushanba: "Du",
  Seshanba: "Se",
  Chorshanba: "Chor",
  Payshanba: "Pay",
  Juma: "Ju",
  Shanba: "Shan",
  Yakshanba: "Yak",
};

function shortWeekDays(value) {
  return apiDaysToUz(value)
    .map((day) => DAY_SHORT[day] || day.slice(0, 2))
    .join(", ");
}

function courseInfo(course) {
  if (course && typeof course === "object") {
    return { name: course.name || "", months: course.duration_month };
  }
  return { name: course || "", months: null };
}

function normalizeTeacherGroup(group) {
  const { name: courseName, months } = courseInfo(group.course);
  const status = String(
    group.status || (group.is_active === false ? "inactive" : "active")
  ).toLowerCase();

  return {
    id: group.id,
    name: group.name || "",
    course: courseName,
    duration: months ? `${months} oy` : "",
    lessonTime: group.start_time || group.lessonTime || "",
    days: shortWeekDays(group.week_day || group.days),
    room: typeof group.room === "object" ? group.room?.name || "" : group.room || "",
    students: group.student_count ?? (Array.isArray(group.students) ? group.students.length : 0),
    studentList: Array.isArray(group.students) ? group.students : [],
    status,
    isActive: status === "active",
  };
}

export const TEACHER_GROUP_STATUS = {
  active: new Set(["active"]),
  planned: new Set(["forming", "planned", "new", "pending", "recruiting", "collecting"]),
  archived: new Set(["archived", "inactive", "finished", "completed", "closed", "done"]),
};

export async function fetchTeacherGroups() {
  const { data } = await api.get("/teachers/my/groups");
  if (!data?.success) {
    throw new Error(data?.message || "Guruhlarni yuklashda xatolik");
  }
  return (data.data || []).map(normalizeTeacherGroup);
}

export async function fetchTeacherProfile() {
  const { data } = await api.get("/teachers/my/profile");
  if (!data?.success) {
    throw new Error(data?.message || "Profilni yuklashda xatolik");
  }
  return data.data || null;
}
