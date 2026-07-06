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
  const endpoints = [
    () => api.get("/attendance/all", { params: { group_id: groupId } }),
    () => api.get("/attendance/all"),
    () => api.get("/attendance", { params: { group_id: groupId } }),
  ];

  for (const request of endpoints) {
    try {
      const { data } = await request();
      if (data?.success && Array.isArray(data.data)) {
        const list = data.data;
        const filtered = list.filter(
          (item) => Number(item.group_id ?? item.groupId) === Number(groupId)
        );
        return filtered.length ? filtered : list;
      }
    } catch {
      // try next
    }
  }

  return [];
}

// Guruhning darslari ichidan mavzu bo'yicha eng oxirgi (eng katta id) darsni topadi.
// POST /lessons javobida yangi dars id qaytmagani uchun, yaratgandan keyin shu orqali topamiz.
export async function findLessonIdByTopic(groupId, topic) {
  const { data } = await api.get("/lessons", { params: { group_id: Number(groupId) } });
  const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  const wanted = String(topic).trim();

  const matches = list.filter(
    (lesson) =>
      Number(lesson.group_id ?? lesson.groupId) === Number(groupId) &&
      String(lesson.topic || "").trim() === wanted
  );

  if (!matches.length) return null;

  return matches.reduce((newest, lesson) =>
    Number(lesson.id) > Number(newest.id) ? lesson : newest
  ).id;
}

export async function resolveLessonId({ groupId, topicValue, description }) {
  // Mavjud dars (ro'yxatdan tanlangan) — id allaqachon bor.
  if (topicValue.lessonId) {
    return topicValue.lessonId;
  }

  const topic = topicValue.customTopic?.trim();
  if (!topic) {
    throw new Error("Mavzuni kiriting");
  }

  // Yangi mavzu — avval darsni yaratamiz, keyin uning id sini topib olamiz.
  await saveLesson({
    group_id: Number(groupId),
    topic,
    description: description || "",
  });

  const lessonId = await findLessonIdByTopic(groupId, topic);
  if (!lessonId) {
    throw new Error("Dars yaratildi, lekin uni aniqlab bo'lmadi. Sahifani yangilab, mavzuni ro'yxatdan tanlang.");
  }

  return lessonId;
}
