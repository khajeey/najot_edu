const API_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const DAY_TO_API = {
  Dushanba: "MONDAY",
  Seshanba: "TUESDAY",
  Chorshanba: "WEDNESDAY",
  Payshanba: "THURSDAY",
  Juma: "FRIDAY",
  Shanba: "SATURDAY",
  Yakshanba: "SUNDAY",
};

const API_TO_DAY = Object.fromEntries(
  Object.entries(DAY_TO_API).map(([label, api]) => [api, label])
);

export const weekdayLabels = Object.keys(DAY_TO_API);

export function uzDaysToApi(days) {
  return days.map((day) => DAY_TO_API[day]).filter(Boolean);
}

export function apiDaysToUz(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((day) => API_TO_DAY[String(day).trim().toUpperCase()])
      .filter(Boolean);
  }

  const str = String(value).toUpperCase();
  return API_DAYS.filter((day) => str.includes(day)).map((day) => API_TO_DAY[day]);
}

export function formatWeekDays(value) {
  const labels = apiDaysToUz(value);
  return labels.length ? labels.join(", ") : "";
}

const DAY_SHORT = {
  Dushanba: "Du",
  Seshanba: "Se",
  Chorshanba: "Ch",
  Payshanba: "Pa",
  Juma: "Ju",
  Shanba: "Sh",
  Yakshanba: "Ya",
};

export function formatWeekDaysShort(value) {
  const labels = apiDaysToUz(value);
  return labels.map((day) => DAY_SHORT[day] || day.slice(0, 2)).join("/");
}

export function findGroupInList(groups, groupId) {
  const id = Number(groupId);
  return (groups || []).find((group) => Number(group.id) === id) || null;
}

function extractPersonName(person) {
  if (typeof person === "string") return person;
  if (!person || typeof person !== "object") return "";

  return (
    person.full_name
    || person.name
    || person.Teacher?.full_name
    || person.Student?.full_name
    || person.teacher?.full_name
    || person.student?.full_name
    || ""
  );
}

function extractPersonId(person) {
  if (typeof person === "number") return person;
  if (!person || typeof person !== "object") return null;

  return (
    person.id
    ?? person.teacher_id
    ?? person.student_id
    ?? person.Teacher?.id
    ?? person.Student?.id
    ?? person.teacher?.id
    ?? person.student?.id
    ?? null
  );
}

function extractPeople(list) {
  const items = Array.isArray(list) ? list : [];

  return {
    names: items.map(extractPersonName).filter(Boolean),
    ids: items.map(extractPersonId).filter(Boolean),
  };
}

export function normalizeGroup(group, archived = false) {
  const course = group.course;
  const courseName =
    typeof course === "object" && course !== null ? course.name || "" : course || "";
  const courseId =
    group.course_id ?? (typeof course === "object" && course !== null ? course.id : null);

  const durationMonths =
    typeof course === "object" && course !== null
      ? course.duration_month
      : group.duration_month ?? group.duration;

  const room = group.room;
  const roomName =
    typeof room === "object" && room !== null ? room.name || "" : group.room_name || room || "";
  const roomId = group.room_id ?? (typeof room === "object" && room !== null ? room.id : null);

  const rawTeachers = group.teachers || group.GroupTeacher || [];
  const teachers = extractPeople(rawTeachers);
  const teacherDetails = (Array.isArray(rawTeachers) ? rawTeachers : [])
    .map((person) => ({
      id: extractPersonId(person),
      name: extractPersonName(person),
    }))
    .filter((person) => person.id && person.name);

  const studentsSource = group.students ?? group.GroupStudent ?? group.group_students;
  const students = extractPeople(studentsSource);
  const studentsCount = Array.isArray(studentsSource)
    ? studentsSource.length
    : Number(studentsSource) || students.ids.length;

  const isActive =
    group.is_active ?? group.isActive ?? group.active ?? (archived ? false : true);

  return {
    id: group.id,
    name: group.name || "",
    course: courseName,
    courseId,
    duration: durationMonths ? `${durationMonths} oy` : "",
    durationMonths: durationMonths || 0,
    lessonTime: group.start_time || group.lessonTime || "",
    days: formatWeekDays(group.week_day || group.days),
    room: roomName,
    teachers: teachers.names,
    teacherDetails,
    students: studentsCount,
    isActive: Boolean(isActive),
    raw: {
      description: group.description || "",
      course_id: courseId,
      room_id: roomId,
      teacherIds: teachers.ids,
      studentIds: students.ids,
      start_date: group.start_date || "",
      week_day: group.week_day || group.days || [],
      start_time: group.start_time || group.lessonTime || "09:00",
      max_student: group.max_student ?? 30,
    },
  };
}

export function toInputDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

export async function fetchSelectOptions(api) {
  const loadList = async (paths) => {
    for (const path of paths) {
      try {
        const { data } = await api.get(path);
        if (data.success && Array.isArray(data.data) && data.data.length) {
          return data.data.map((item) => ({
            id: item.id,
            name: item.name || item.title || "",
          }));
        }
      } catch {
        // try next endpoint
      }
    }
    return null;
  };

  const [courses, rooms] = await Promise.all([
    loadList(["/courses", "/courses/all"]),
    loadList(["/rooms", "/rooms/all"]),
  ]);

  if (courses?.length && rooms?.length) {
    return { courses, rooms };
  }

  try {
    const { data } = await api.get("/groups/all");
    if (!data.success) return { courses: courses || [], rooms: rooms || [] };

    const courseMap = new Map();
    const roomMap = new Map();

    (data.data || []).forEach((group) => {
      const course = group.course;
      if (course && typeof course === "object" && course.id) {
        courseMap.set(course.id, { id: course.id, name: course.name || "" });
      }

      const room = group.room;
      if (room && typeof room === "object" && room.id) {
        roomMap.set(room.id, { id: room.id, name: room.name || "" });
      }
    });

    return {
      courses: courses?.length ? courses : [...courseMap.values()],
      rooms: rooms?.length ? rooms : [...roomMap.values()],
    };
  } catch {
    return { courses: courses || [], rooms: rooms || [] };
  }
}
