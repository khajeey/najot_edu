import { Box, Button, IconButton, Typography } from "@mui/material";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { purple } from "./constants";

const DEFAULT_VISIBLE = 12;
const green = "#20b486";

export default function GroupScheduleCalendar({
  schedules,
  monthIndex,
  onMonthIndexChange,
  showAllDays,
  onShowAllDaysChange,
  selectedDateKey,
  onDayClick,
}) {
  const currentMonth = schedules[monthIndex];
  const allDays = currentMonth?.days || [];
  const visibleDays = showAllDays ? allDays : allDays.slice(0, DEFAULT_VISIBLE);
  const hasHiddenDays = allDays.length > DEFAULT_VISIBLE;

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
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827", minWidth: 140 }}>
          {currentMonth?.label || "Darslar"}
        </Typography>
        <IconButton
          disabled={monthIndex >= schedules.length - 1}
          onClick={() => onMonthIndexChange(monthIndex + 1)}
          sx={roundIconButtonStyles}
        >
          <FiChevronRight />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.2,
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {visibleDays.map((lesson) => {
          const isSelected = selectedDateKey && lesson.dateKey === selectedDateKey;
          const isPast = lesson.isPast && !isSelected;

          return (
            <Box
              key={`${lesson.month}-${lesson.day}-${lesson.weekday}`}
              role={onDayClick ? "button" : undefined}
              tabIndex={onDayClick ? 0 : undefined}
              onClick={() => onDayClick?.(lesson.dateKey)}
              sx={{
                width: 54,
                minHeight: 72,
                borderRadius: "8px",
                border: isSelected
                  ? `1px solid ${green}`
                  : isPast
                    ? "1px solid #e5e7eb"
                    : "1px solid #d8dbe2",
                bgcolor: isSelected ? green : isPast ? "#eceef2" : "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: isSelected ? "#fff" : isPast ? "#9aa0a8" : "#111827",
                flexShrink: 0,
                cursor: onDayClick ? "pointer" : "default",
                transition: "background-color 160ms ease, color 160ms ease",
                "&:hover": onDayClick
                  ? {
                      bgcolor: isSelected ? green : "#f5fbf8",
                      borderColor: green,
                    }
                  : undefined,
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{lesson.month}</Typography>
              <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>{lesson.day}</Typography>
              {lesson.weekday && (
                <Typography
                  sx={{
                    fontSize: 11,
                    color: isSelected ? "#e8fff5" : isPast ? "#b0b5bd" : "#6b7280",
                    mt: 0.3,
                  }}
                >
                  {lesson.weekday}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {hasHiddenDays && (
        <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2.5 }}>
          <Button onClick={() => onShowAllDaysChange(!showAllDays)} sx={linkButtonStyles}>
            {showAllDays ? "Kamroq ko'rsatish" : "Barchasini ko'rish"}
          </Button>
        </Box>
      )}
    </Box>
  );
}

const roundIconButtonStyles = {
  width: 40,
  height: 40,
  border: "1px solid #e5e7eb",
  bgcolor: "#fff",
};

const linkButtonStyles = {
  textTransform: "none",
  color: purple,
  fontWeight: 700,
  px: 0,
};
