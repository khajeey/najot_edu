import { api } from "../../api/axiosClient";

async function loadList(paths) {
  for (const path of paths) {
    try {
      const { data } = await api.get(path);
      if (data?.success && Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data)) {
        return data;
      }
    } catch {
      // try next path
    }
  }
  return [];
}

export function normalizeCourse(course) {
  const durationHours = Number(course.duration_hours) || 0;
  const durationMonth = Number(course.duration_month) || 0;
  const price = Number(course.price) || 0;

  return {
    id: course.id,
    title: course.name || "",
    description: course.description || "",
    badges: [
      durationHours ? `${durationHours} soat` : "—",
      durationMonth ? `${durationMonth} oy` : "—",
      price ? `${price.toLocaleString("uz-UZ")} so'm` : "0 so'm",
    ],
    raw: {
      name: course.name || "",
      description: course.description || "",
      price,
      duration_month: durationMonth,
      duration_hours: durationHours,
    },
  };
}

export function normalizeRoom(room) {
  const capacity = Number(room.capacity) || 0;

  return {
    id: room.id,
    title: room.name || "",
    capacity: String(capacity),
    raw: {
      name: room.name || "",
      capacity,
    },
  };
}

export async function fetchCourses() {
  const list = await loadList(["/courses", "/courses/all"]);
  return list.map(normalizeCourse);
}

export async function fetchArchivedCourses() {
  const { data } = await api.get("/courses/archive");
  const list = data?.data || data || [];
  return list.map(normalizeCourse);
}

export async function fetchRooms() {
  const list = await loadList(["/rooms", "/rooms/all"]);
  return list.map(normalizeRoom);
}

export async function fetchArchivedRooms() {
  const { data } = await api.get("/rooms/arxive");
  const list = data?.data || data || [];
  return list.map(normalizeRoom);
}

export async function createCourse(payload) {
  const { data } = await api.post("/courses", payload);
  if (data?.success === false) {
    throw new Error(data.message || "Kurs qo'shishda xatolik");
  }
  return normalizeCourse(data.data ?? payload);
}

export async function updateCourse(id, payload) {
  const { data } = await api.patch(`/courses/${id}`, payload);
  if (data?.success === false) {
    throw new Error(data.message || "Kursni tahrirlashda xatolik");
  }
  return normalizeCourse(data.data ?? { id, ...payload });
}

export async function deleteCourse(id) {
  const { data } = await api.delete(`/courses/${id}`);
  if (data?.success === false) {
    throw new Error(data.message || "Kursni o'chirishda xatolik");
  }
}

export async function createRoom(payload) {
  const { data } = await api.post("/rooms", payload);
  if (data?.success === false) {
    throw new Error(data.message || "Xona qo'shishda xatolik");
  }
  return normalizeRoom(data.data ?? payload);
}

export async function updateRoom(id, payload) {
  const { data } = await api.patch(`/rooms/${id}`, payload);
  if (data?.success === false) {
    throw new Error(data.message || "Xonani tahrirlashda xatolik");
  }
  return normalizeRoom(data.data ?? { id, ...payload });
}

export async function deleteRoom(id) {
  const { data } = await api.delete(`/rooms/${id}`);
  if (data?.success === false) {
    throw new Error(data.message || "Xonani o'chirishda xatolik");
  }
}

export function buildCoursePayload(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    price: Number(form.price) || 0,
    duration_month: Number(form.courseDuration) || 0,
    duration_hours: Number(form.lessonDuration) || 0,
  };
}

export function buildRoomPayload(form) {
  return {
    name: form.name.trim(),
    capacity: Number(form.capacity) || 0,
  };
}
