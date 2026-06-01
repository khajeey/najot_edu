export function formatHomeworkDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatHomeworkDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function addHoursToDate(value, hours) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

export function normalizeHomeworkLesson(item) {
  const latestHomework = Array.isArray(item.homework) ? item.homework[0] : null;
  const givenAt = latestHomework?.created_at || item.created_at;
  const endsAt =
    addHoursToDate(givenAt, 20)
    || latestHomework?.end_at
    || latestHomework?.deadline
    || latestHomework?.finish_at;

  return {
    id: item.id,
    topic: item.topic || "—",
    studentsCount: item.existStudentsIngroup ?? 0,
    pending: item.homeworkPending ?? 0,
    accepted: item.homeworkAccept ?? 0,
    rejected: item.homeworkReject ?? 0,
    givenAt,
    endsAt,
    lessonDate: item.lesson_date || item.lessonDate || item.created_at,
  };
}
