const MONTH_INDEX = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

const WEEKDAY_UZ = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

function parseMonthIndex(monthName) {
  if (!monthName) return 0;
  return MONTH_INDEX[String(monthName).trim().toLowerCase()] ?? 0;
}

function buildLessonDate(monthName, day, baseYear, monthOrder = 0) {
  const month = parseMonthIndex(monthName);
  let year = baseYear;

  if (monthOrder > 0) {
    year += Math.floor(monthOrder / 12);
  }

  const date = new Date(year, month, Number(day));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isPastLesson(date, isCompleted) {
  if (isCompleted) return true;
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compare = new Date(date);
  compare.setHours(0, 0, 0, 0);
  return compare < today;
}

export function parseSchedulesResponse(schedules, startDate) {
  if (!Array.isArray(schedules)) return [];

  const baseYear = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear();

  return schedules
    .map((entry, order) => {
      const monthKey = Object.keys(entry || {})[0];
      if (!monthKey) return null;

      const monthBlock = entry[monthKey];
      const days = (monthBlock?.days || []).map((lesson) => {
        const date = buildLessonDate(lesson.month, lesson.day, baseYear, order);
        const past = isPastLesson(date, lesson.isCompleted);

        return {
          day: lesson.day,
          month: lesson.month,
          isCompleted: Boolean(lesson.isCompleted),
          isPast: past,
          weekday: date ? WEEKDAY_UZ[date.getDay()] : "",
          date,
          dateKey: date ? date.toISOString().slice(0, 10) : "",
        };
      });

      return {
        index: Number(monthKey) || order + 1,
        label: `${Number(monthKey) || order + 1}-o'quv oyi`,
        isActive: monthBlock?.isActive !== false,
        days,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);
}

export function pickDefaultLessonDate(schedules) {
  const allDays = (schedules || []).flatMap((month) => month.days || []);
  const upcoming = allDays.find((day) => day.dateKey && !day.isPast);
  if (upcoming?.dateKey) return upcoming.dateKey;

  const anyDay = allDays.find((day) => day.dateKey);
  if (anyDay?.dateKey) return anyDay.dateKey;

  return new Date().toISOString().slice(0, 10);
}

export function formatTimeRange(startTime) {
  if (!startTime) return "—";

  const normalized = String(startTime).slice(0, 5);
  const [hours, minutes] = normalized.split(":").map(Number);

  if (Number.isNaN(hours)) return startTime;

  const endHours = hours + 3;
  const pad = (value) => String(value).padStart(2, "0");

  return `${pad(hours)}:${pad(minutes || 0)} dan - ${pad(endHours)}:${pad(minutes || 0)} gacha`;
}

export function formatDateRange(startDate, durationMonths) {
  if (!startDate) return "—";

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return "—";

  const end = new Date(start);
  end.setMonth(end.getMonth() + Number(durationMonths || 0));

  const formatter = new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}
