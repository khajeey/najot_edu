import { Box, Button, IconButton, Typography } from "@mui/material";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { purple } from "./constants";

const DEFAULT_VISIBLE = 12;
const green = "#20b486";

function DayCell({ lesson, isSelected, onDayClick }) {
  const isPast = lesson.isPast && !isSelected;

  return (
    <Box
      role={onDayClick ? "button" : undefined}
      tabIndex={onDayClick ? 0 : undefined}
      onClick={() => onDayClick?.(lesson.dateKey)}
      sx={{
        width: 54,
        minHeight: 72,
        borderRadius: "8px",
        border: isSelected
          ? `1px solid ${green}`
          : "1px solid",
        borderColor: isSelected ? green : "divider",
        bgcolor: isSelected ? green : isPast ? "action.hover" : "background.paper",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: isSelected ? "#fff" : isPast ? "text.secondary" : "text.primary",
        flexShrink: 0,
        cursor: onDayClick ? "pointer" : "default",
        transition: "background-color 160ms ease, color 160ms ease",
        "&:hover": onDayClick
          ? {
              bgcolor: isSelected ? green : "action.selected",
              borderColor: green,
            }
          : undefined,
      }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{lesson.month}</Typography>
      <Typography sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1 }}>{lesson.day}</Typography>
      {lesson.weekday && (
        <Typography
          sx={{
            fontSize: 11,
            color: isSelected ? "#e8fff5" : "text.secondary",
            mt: 0.3,
          }}
        >
          {lesson.weekday}
        </Typography>
      )}
    </Box>
  );
}

function MonthDays({ days, showAllDays, selectedDateKey, onDayClick }) {
  const visibleDays = showAllDays ? days : days.slice(0, DEFAULT_VISIBLE);

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2, justifyContent: "flex-start" }}>
      {visibleDays.map((lesson) => (
        <DayCell
          key={`${lesson.month}-${lesson.day}-${lesson.weekday}-${lesson.dateKey}`}
          lesson={lesson}
          isSelected={selectedDateKey && lesson.dateKey === selectedDateKey}
          onDayClick={onDayClick}
        />
      ))}
    </Box>
  );
}

export default function GroupScheduleCalendar({
  schedules,
  monthIndex,
  onMonthIndexChange,
  showAllDays,
  onShowAllDaysChange,
  showAllMonths,
  onShowAllMonthsChange,
  selectedDateKey,
  onDayClick,
}) {
  const currentMonth = schedules[monthIndex];
  const allDays = currentMonth?.days || [];
  const hasHiddenDays = allDays.length > DEFAULT_VISIBLE;

  if (showAllMonths) {
    return (
      <Box sx={{ width: "100%" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {schedules.map((month) => (
            <Box key={month.index}>
              <Box sx={{ mb: 1.5 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary" }}>
                  {month.label}
                </Typography>
                {month.calendarLabel && (
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    {month.calendarLabel}
                  </Typography>
                )}
              </Box>
              <MonthDays
                days={month.days || []}
                showAllDays
                selectedDateKey={selectedDateKey}
                onDayClick={onDayClick}
              />
            </Box>
          ))}
        </Box>

        {onShowAllMonthsChange && (
          <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2.5 }}>
            <Button onClick={() => onShowAllMonthsChange(false)} sx={linkButtonStyles}>
              Kamroq ko&apos;rsatish
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 2,
          mb: 2.5,
        }}
      >
        <IconButton
          disabled={monthIndex <= 0}
          onClick={() => onMonthIndexChange(monthIndex - 1)}
          sx={roundIconButtonStyles}
        >
          <FiChevronLeft />
        </IconButton>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", minWidth: 140 }}>
            {currentMonth?.label || "Darslar"}
          </Typography>
          {currentMonth?.calendarLabel && (
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              {currentMonth.calendarLabel}
            </Typography>
          )}
        </Box>
        <IconButton
          disabled={monthIndex >= schedules.length - 1}
          onClick={() => onMonthIndexChange(monthIndex + 1)}
          sx={roundIconButtonStyles}
        >
          <FiChevronRight />
        </IconButton>
      </Box>

      <MonthDays
        days={allDays}
        showAllDays={showAllDays}
        selectedDateKey={selectedDateKey}
        onDayClick={onDayClick}
      />

      {(hasHiddenDays || schedules.length > 1) && (
        <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 2.5, flexWrap: "wrap" }}>
          {hasHiddenDays && (
            <Button onClick={() => onShowAllDaysChange(!showAllDays)} sx={linkButtonStyles}>
              {showAllDays ? "Kamroq ko'rsatish" : "Barcha kunlarni ko'rish"}
            </Button>
          )}
          {schedules.length > 1 && onShowAllMonthsChange && (
            <Button onClick={() => onShowAllMonthsChange(true)} sx={linkButtonStyles}>
              Barcha oylarni ko&apos;rish
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

const roundIconButtonStyles = {
  width: 40,
  height: 40,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
};

const linkButtonStyles = {
  textTransform: "none",
  color: purple,
  fontWeight: 700,
  px: 0,
  fontSize: 14,
};
