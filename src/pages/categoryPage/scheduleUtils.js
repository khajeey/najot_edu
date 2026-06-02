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

function apiDaysToUz(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((day) => API_TO_DAY[String(day).trim().toUpperCase()])
      .filter(Boolean);
  }

  const str = String(value).toUpperCase();
  return API_DAYS.filter((day) => str.includes(day)).map((day) => API_TO_DAY[day]);
}

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

const MONTH_NAMES_EN = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const WEEKDAY_UZ = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

const UZ_DAY_TO_JS = {
  Yakshanba: 0,
  Dushanba: 1,
  Seshanba: 2,
  Chorshanba: 3,
  Payshanba: 4,
  Juma: 5,
  Shanba: 6,
};

function parseMonthIndex(monthName) {
  if (!monthName) return 0;
  return MONTH_INDEX[String(monthName).trim().toLowerCase()] ?? 0;
}

function buildLessonDate(monthName, day, year) {
  const month = parseMonthIndex(monthName);
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

function weekdayNumbersFromGroup(weekDays) {
  const labels = apiDaysToUz(weekDays);
  const nums = labels.map((label) => UZ_DAY_TO_JS[label]).filter((n) => n !== undefined);
  return nums.length ? nums : [1, 2, 3, 4, 5];
}

function generateDaysForCalendarMonth(calendarMonthStart, weekdayNums, courseStart) {
  const year = calendarMonthStart.getFullYear();
  const month = calendarMonthStart.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = MONTH_NAMES_EN[month];
  const startBoundary = new Date(courseStart);
  startBoundary.setHours(0, 0, 0, 0);

  const days = [];

  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = new Date(year, month, d);
    date.setHours(0, 0, 0, 0);

    if (date < startBoundary) continue;
    if (!weekdayNums.includes(date.getDay())) continue;

    days.push({
      day: d,
      month: monthName,
      isCompleted: false,
      isPast: isPastLesson(date, false),
      weekday: WEEKDAY_UZ[date.getDay()],
      date,
      dateKey: date.toISOString().slice(0, 10),
    });
  }

  return days;
}

export function parseSchedulesResponse(schedules, startDate) {
  if (!Array.isArray(schedules)) return [];

  const start = startDate ? new Date(startDate) : new Date();
  const baseYear = Number.isNaN(start.getTime()) ? new Date().getFullYear() : start.getFullYear();

  return schedules
    .map((entry, order) => {
      const monthKey = Object.keys(entry || {})[0];
      if (!monthKey) return null;

      const monthBlock = entry[monthKey];
      const studyIndex = Number(monthKey) || order + 1;
      const calendarMonthStart = new Date(start.getFullYear(), start.getMonth() + (studyIndex - 1), 1);

      const days = (monthBlock?.days || []).map((lesson) => {
        const year = calendarMonthStart.getFullYear();
        const date = buildLessonDate(lesson.month, lesson.day, year);
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
        index: studyIndex,
        label: `${studyIndex}-o'quv oyi`,
        isActive: monthBlock?.isActive !== false,
        days,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);
}

export function buildFullSchedules({ apiSchedules, startDate, durationMonths, weekDays }) {
  const start = startDate ? new Date(startDate) : new Date();
  if (Number.isNaN(start.getTime())) {
    return parseSchedulesResponse(apiSchedules, startDate);
  }

  const parsed = parseSchedulesResponse(apiSchedules, startDate);
  const duration = Math.max(Number(durationMonths) || 0, parsed.length, 1);
  const weekdayNums = weekdayNumbersFromGroup(weekDays);
  const courseStart = new Date(start);
  courseStart.setHours(0, 0, 0, 0);

  const months = [];

  for (let i = 0; i < duration; i += 1) {
    const studyIndex = i + 1;
    const calendarMonthStart = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const apiMonth = parsed.find((m) => m.index === studyIndex);

    const days =
      apiMonth?.days?.length > 0
        ? apiMonth.days
        : generateDaysForCalendarMonth(calendarMonthStart, weekdayNums, courseStart);

    months.push({
      index: studyIndex,
      label: `${studyIndex}-o'quv oyi`,
      isActive: apiMonth?.isActive ?? i === 0,
      days,
      calendarLabel: new Intl.DateTimeFormat("uz-UZ", {
        month: "long",
        year: "numeric",
      }).format(calendarMonthStart),
    });
  }

  return months;
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
