import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { FiCalendar, FiChevronDown, FiClock, FiPlus, FiSearch, FiX } from "react-icons/fi";
import { purple } from "./constants";
import { api } from "../../api/axiosClient";
import {
  apiDaysToUz,
  fetchSelectOptions,
  toInputDate,
  uzDaysToApi,
  weekdayLabels,
} from "./groupUtils";

const emptyForm = {
  name: "",
  course: "",
  room: "",
  days: [],
  lessonTime: "09:00",
  startDate: "",
  description: "",
  teachers: [],
  students: [],
};

export default function GroupDrawer({ open, onClose, onSave, initialData }) {
  const [pickerType, setPickerType] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

    const loadOptions = async () => {
      setOptionsLoading(true);

      try {
        const [teachersRes, studentsRes, selectOptions] = await Promise.all([
          api.get("/teachers"),
          api.get("/students", { params: { limit: 1000 } }),
          fetchSelectOptions(api),
        ]);

        if (teachersRes.data.success) {
          setTeachers(teachersRes.data.data || []);
        }

        if (studentsRes.data.success) {
          setStudents(studentsRes.data.data || []);
        }

        setCourses(selectOptions.courses);
        setRooms(selectOptions.rooms);
      } catch (error) {
        console.error("Form ma'lumotlarini yuklashda xatolik:", error);
      } finally {
        setOptionsLoading(false);
      }
    };

    loadOptions();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (!initialData) {
      setForm(emptyForm);
      return;
    }

    const raw = initialData.raw || {};

    setForm({
      name: initialData.name || "",
      course: raw.course_id ? String(raw.course_id) : "",
      room: raw.room_id ? String(raw.room_id) : "",
      days: apiDaysToUz(raw.week_day),
      lessonTime: raw.start_time || "09:00",
      startDate: toInputDate(raw.start_date),
      description: raw.description || "",
      teachers: raw.teacherIds || [],
      students: raw.studentIds || [],
    });
  }, [initialData, open]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleDay = (day) => {
    setForm((current) => ({
      ...current,
      days: current.days.includes(day)
        ? current.days.filter((item) => item !== day)
        : [...current.days, day],
    }));
  };

  const handlePickSave = (field, selected) => {
    updateField(field, selected);
    setPickerType(null);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      course_id: Number(form.course),
      teachers: form.teachers,
      students: form.students,
      room_id: Number(form.room),
      start_date: form.startDate,
      week_day: uzDaysToApi(form.days),
      start_time: form.lessonTime,
      max_student: initialData?.raw?.max_student ?? 30,
    };

    setSaving(true);

    try {
      await onSave(payload);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  };

  const isEdit = Boolean(initialData?.id);
  const selectedTeachersCount = form.teachers.length;
  const selectedStudentsCount = form.students.length;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 330,
            maxWidth: "100vw",
            boxShadow: "-18px 0 38px rgba(25, 31, 46, 0.16)",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
          <Box sx={{ px: 2, py: 1.8, borderBottom: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box>
                <Typography sx={{ fontSize: 17, fontWeight: 700, color: "text.primary" }}>
                  {isEdit ? "Guruhni tahrirlash" : "Guruh qo'shish"}
                </Typography>
                <Typography sx={{ mt: 0.5, fontSize: 11.5, color: "text.secondary" }}>
                  {isEdit
                    ? "Guruh ma'lumotlarini yangilang."
                    : "Yangi guruh yaratish uchun quyidagi ma'lumotlarni kiriting."}
                </Typography>
              </Box>
              <IconButton onClick={onClose} sx={{ mt: -0.8, mr: -0.8, color: "text.secondary" }}>
                <FiX size={18} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ flex: 1, px: 2, py: 1.8, overflowY: "auto" }}>
            {optionsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={28} sx={{ color: purple }} />
              </Box>
            ) : (
              <>
                <FormField label="Guruh nomi" required>
                  <TextField
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Frontend 2024"
                    fullWidth
                    sx={inputStyles}
                  />
                </FormField>

                <FormField label="Kurs" required>
                  <FormControl fullWidth>
                    <Select
                      value={form.course}
                      onChange={(event) => updateField("course", event.target.value)}
                      displayEmpty
                      IconComponent={FiChevronDown}
                      sx={selectStyles}
                    >
                      <MenuItem value="" disabled>
                        Tanlang
                      </MenuItem>
                      {courses.map((course) => (
                        <MenuItem key={course.id} value={String(course.id)}>
                          {course.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FormField>

                <FormField label="Xona" required>
                  <FormControl fullWidth>
                    <Select
                      value={form.room}
                      onChange={(event) => updateField("room", event.target.value)}
                      displayEmpty
                      IconComponent={FiChevronDown}
                      sx={selectStyles}
                    >
                      <MenuItem value="" disabled>
                        Tanlang
                      </MenuItem>
                      {rooms.map((room) => (
                        <MenuItem key={room.id} value={String(room.id)}>
                          {room.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FormField>

                <FormField label="Dars kunlari" required>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.8 }}>
                    {weekdayLabels.map((day) => (
                      <Box
                        key={day}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleDay(day)}
                        sx={{
                          height: 31,
                          borderRadius: "6px",
                          border: "1px solid",
                          borderColor: "divider",
                          display: "flex",
                          alignItems: "center",
                          px: 0.8,
                          cursor: "pointer",
                          bgcolor: form.days.includes(day) ? "#f5f1ff" : "background.paper",
                        }}
                      >
                        <Checkbox checked={form.days.includes(day)} size="small" sx={{ p: 0.3, mr: 0.5 }} />
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.primary" }}>{day}</Typography>
                      </Box>
                    ))}
                  </Box>
                </FormField>

                <FormField label="Dars vaqti" required>
                  <TextField
                    value={form.lessonTime}
                    onChange={(event) => updateField("lessonTime", event.target.value)}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <FiClock size={15} />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputStyles}
                  />
                </FormField>

                <FormField label="Boshlanish sanasi" required>
                  <TextField
                    type="date"
                    value={form.startDate}
                    onChange={(event) => updateField("startDate", event.target.value)}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <FiCalendar size={15} />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputStyles}
                  />
                </FormField>

                <FormField label="Tavsif">
                  <TextField
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    placeholder="Guruh haqida qo'shimcha ma'lumot (ixtiyoriy)"
                    fullWidth
                    multiline
                    minRows={3}
                    sx={textareaStyles}
                  />
                </FormField>

                <FormField label="O'qituvchilar">
                  <Button onClick={() => setPickerType("teachers")} startIcon={<FiPlus />} sx={addPeopleButtonStyles}>
                    {selectedTeachersCount ? `${selectedTeachersCount} ta tanlangan` : "Qo'shish"}
                  </Button>
                </FormField>

                <FormField label="Talabalar">
                  <Button onClick={() => setPickerType("students")} startIcon={<FiPlus />} sx={addPeopleButtonStyles}>
                    {selectedStudentsCount ? `${selectedStudentsCount} ta tanlangan` : "Qo'shish"}
                  </Button>
                </FormField>
              </>
            )}
          </Box>

          <Box sx={{ px: 2, py: 1.4, borderTop: "1px solid", borderColor: "divider", display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={onClose} variant="outlined" sx={cancelButtonStyles} disabled={saving}>
              Bekor qilish
            </Button>
            <Button onClick={handleSave} sx={saveButtonStyles} disabled={saving || optionsLoading}>
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </Box>
        </Box>
      </Drawer>

      <PeoplePickerDialog
        open={pickerType === "teachers"}
        title="O'qituvchi qo'shish"
        items={teachers}
        selected={form.teachers}
        onClose={() => setPickerType(null)}
        onSave={(selected) => handlePickSave("teachers", selected)}
      />

      <PeoplePickerDialog
        open={pickerType === "students"}
        title="Talaba qo'shish"
        items={students}
        selected={form.students}
        onClose={() => setPickerType(null)}
        onSave={(selected) => handlePickSave("students", selected)}
      />
    </>
  );
}

function PeoplePickerDialog({ open, title, items, selected, onClose, onSave }) {
  const [localSelected, setLocalSelected] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLocalSelected(selected || []);
    setSearch("");
  }, [selected, open]);

  const getId = (item) => (typeof item === "object" && item !== null ? item.id : item);

  const getLabel = (item) => {
    if (typeof item === "object" && item !== null) {
      return item.full_name || item.name || "";
    }
    return String(item);
  };

  const toggleItem = (item) => {
    const id = getId(item);
    setLocalSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const filteredItems = items.filter((item) => {
    const label = getLabel(item).toLowerCase();
    return label.includes(search.trim().toLowerCase());
  });

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width: 385, borderRadius: "4px" } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", pb: 1 }}>
        <Box>
          <Typography sx={{ fontSize: 21, fontWeight: 700, color: "text.primary" }}>{title}</Typography>
          <Typography sx={{ mt: 0.4, fontSize: 12, color: "text.secondary" }}>Bitta yoki bir nechta tanlang</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "text.secondary", mr: -1 }}>
          <FiX size={22} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 2 }}>
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={title.startsWith("Talaba") ? "Talaba qidirish..." : "O'qituvchi qidirish..."}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FiSearch size={16} color="#9aa0a8" />
              </InputAdornment>
            ),
          }}
          sx={pickerSearchStyles}
        />
        <Box sx={{ mt: 1.4, border: "1px solid", borderColor: "divider", borderRadius: "8px", overflow: "hidden", maxHeight: 320, overflowY: "auto" }}>
          {filteredItems.map((item) => {
            const id = getId(item);
            const label = getLabel(item);

            return (
              <Box
                key={id}
                onClick={() => toggleItem(item)}
                sx={{
                  height: 49,
                  px: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  "&:last-child": { borderBottom: 0 },
                }}
              >
                <Checkbox checked={localSelected.includes(id)} size="small" />
                <Typography sx={{ fontSize: 14, color: "text.secondary" }}>{label}</Typography>
              </Box>
            );
          })}
          {filteredItems.length === 0 && (
            <Typography sx={{ py: 3, textAlign: "center", color: "text.secondary", fontSize: 14 }}>
              Natija topilmadi
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Button onClick={onClose} sx={{ textTransform: "none", color: "text.secondary", fontWeight: 700 }}>
          Bekor qilish
        </Button>
        <Button
          onClick={() => onSave(localSelected)}
          sx={{
            textTransform: "none",
            bgcolor: "#b03df2",
            color: "#fff",
            fontWeight: 700,
            px: 2.4,
            "&:hover": { bgcolor: purple },
          }}
        >
          Saqlash
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function FormField({ label, required, children }) {
  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography sx={{ mb: 0.6, fontSize: 12, fontWeight: 700, color: "text.primary" }}>
        {label}
        {required && (
          <Box component="span" sx={{ color: "#e54848" }}>
            {" "}
            *
          </Box>
        )}
      </Typography>
      {children}
    </Box>
  );
}

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    height: 36,
    borderRadius: "6px",
    fontSize: 13,
    "& fieldset": { borderColor: "divider" },
    "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 },
  },
  "& .MuiOutlinedInput-input::placeholder": { color: "text.secondary", opacity: 1 },
};

const selectStyles = {
  height: 36,
  borderRadius: "6px",
  fontSize: 13,
  "& fieldset": { borderColor: "divider" },
  "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 },
  "& .MuiSelect-icon": { right: 10, color: "text.secondary" },
};

const textareaStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    fontSize: 13,
    "& fieldset": { borderColor: "divider" },
    "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 },
  },
  "& .MuiOutlinedInput-input::placeholder": { color: "text.secondary", opacity: 1 },
};

const addPeopleButtonStyles = {
  width: "100%",
  height: 42,
  borderRadius: "6px",
  border: "1px solid",
  borderColor: "divider",
  color: purple,
  justifyContent: "flex-start",
  px: 2,
  fontSize: 14,
  fontWeight: 700,
  textTransform: "none",
  "&:hover": { bgcolor: "#faf8ff", borderColor: "#d8cff5" },
};

const cancelButtonStyles = {
  width: 96,
  height: 34,
  borderRadius: "7px",
  borderColor: "divider",
  color: "text.primary",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "none",
};

const saveButtonStyles = {
  width: 84,
  height: 34,
  borderRadius: "7px",
  bgcolor: "#b03df2",
  color: "#fff",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "none",
  "&:hover": { bgcolor: purple },
};

const pickerSearchStyles = {
  "& .MuiOutlinedInput-root": {
    height: 34,
    borderRadius: "5px",
    fontSize: 13,
    "& fieldset": { borderColor: "divider" },
    "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 },
  },
};
