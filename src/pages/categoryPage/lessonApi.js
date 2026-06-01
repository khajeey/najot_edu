import { api } from "../../api/axiosClient";

export async function fetchLessonTopics(groupId) {
  const { data } = await api.get(`/homework/${groupId}`);
  if (!data.success) return [];

  return (data.data || []).map((item) => ({
    id: item.id,
    label: item.topic || `Mavzu #${item.id}`,
  }));
}

export async function fetchGroupStudents(groupId) {
  const { data } = await api.get("/groups/all");
  if (!data.success) return [];

  const group = (data.data || []).find((item) => Number(item.id) === Number(groupId));
  if (!group) return [];

  const studentsSource = group.students ?? group.GroupStudent ?? group.group_students;
  const list = Array.isArray(studentsSource) ? studentsSource : [];

  return list
    .map((student) => {
      if (typeof student === "object" && student !== null) {
        return {
          id: student.id ?? student.student_id ?? student.Student?.id,
          name: student.full_name || student.name || student.Student?.full_name || "",
        };
      }
      return null;
    })
    .filter((student) => student?.id && student?.name);
}

export async function loadLesson(groupId, lessonDate) {
  try {
    const { data } = await api.get("/lessons", {
      params: { group_id: groupId, date: lessonDate },
    });

    if (data.success) {
      return data.data;
    }
  } catch {
    // fallback below
  }

  return null;
}

export async function saveLesson(payload) {
  const { data } = await api.post("/lessons", payload);
  if (!data.success) {
    throw new Error(data.message || "Darsni saqlashda xatolik");
  }
  return data.data;
}

export async function saveStudentAttendance({ groupId, studentId, isPresent }) {
  const { data } = await api.post("/attendance", {
    group_id: Number(groupId),
    student_id: Number(studentId),
    isPresent: Boolean(isPresent),
  });

  if (!data.success) {
    throw new Error(data.message || "Davomatni saqlashda xatolik");
  }

  return data.data;
}

export async function saveAllAttendance(groupId, students) {
  await Promise.all(
    students.map((student) =>
      saveStudentAttendance({
        groupId,
        studentId: student.id,
        isPresent: student.present,
      })
    )
  );
}

export async function fetchGroupAttendance(groupId) {
  try {
    const { data } = await api.get("/attendance", {
      params: { group_id: groupId },
    });

    if (data.success) {
      return data.data || [];
    }
  } catch {
    // attendance list optional
  }

  return [];
}

export async function resolveLessonId({ groupId, lessonDate, topicMode, topicValue, description }) {
  if (topicMode === "curriculum" && topicValue.lessonId) {
    return topicValue.lessonId;
  }

  const topic = topicValue.customTopic?.trim();
  if (!topic) {
    throw new Error("Mavzuni kiriting");
  }

  const saved = await saveLesson({
    group_id: Number(groupId),
    date: lessonDate,
    topic,
    description: description || "",
    type: topicMode === "curriculum" ? "curriculum" : "other",
    lesson_id: topicValue.lessonId || undefined,
  });

  return saved?.id ?? saved?.lesson_id ?? topicValue.lessonId;
}
