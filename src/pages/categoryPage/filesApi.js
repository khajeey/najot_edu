import { api } from "../../api/axiosClient";

const API_BASE = "https://najot-edu.softwareengineer.uz";

function resolveUrl(path) {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  const normalized = String(path).startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

export function getFilePlayUrl(file) {
  if (!file) return "";

  const candidates = [file.url, file.file_url, file.video_url, file.path, file.file, file.filename_path];

  for (const candidate of candidates) {
    if (candidate) {
      return resolveUrl(candidate);
    }
  }

  return "";
}

export function normalizeVideoFile(item) {
  const lesson = item.lesson || item.Lesson;
  const lessonName =
    typeof lesson === "object"
      ? lesson.topic || lesson.name || lesson.title
      : item.lesson_name || item.lessonName || "—";

  return {
    id: item.id,
    name: item.name || item.title || item.fileName || item.filename || item.original_name || "Video",
    lessonName,
    lessonId: item.lesson_id ?? lesson?.id ?? null,
    status: item.status || "Tayyor",
    lessonDate: item.lesson_date || item.lessonDate || lesson?.date,
    size: item.size || item.file_size || item.hajmi,
    createdAt: item.created_at || item.createdAt,
    playUrl: getFilePlayUrl(item),
  };
}

async function requestGroupVideos(groupId) {
  const endpoints = [`/files/${groupId}`, `/files/group/${groupId}`];

  for (const endpoint of endpoints) {
    try {
      const { data } = await api.get(endpoint);
      if (data?.success) {
        return data.data || [];
      }
      if (Array.isArray(data)) {
        return data;
      }
    } catch {
      // try next endpoint
    }
  }

  throw new Error("Videolarni yuklashda xatolik");
}

export async function fetchGroupVideos(groupId) {
  const list = await requestGroupVideos(groupId);
  return list.map(normalizeVideoFile);
}

export async function uploadGroupVideo({ groupId, lessonId, file }) {
  if (!file) {
    throw new Error("Video fayl tanlanmadi");
  }

  if (!lessonId) {
    throw new Error("Dars tanlanishi shart");
  }

  const formData = new FormData();
  formData.append("file", file);

  const endpoints = [
    `/files/group/${groupId}/upload`,
    `/files/${groupId}/upload`,
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const { data } = await api.post(endpoint, formData, {
        params: { lessonId: Number(lessonId) },
      });

      if (data?.success === false) {
        throw new Error(data.message || "Videoni yuklashda xatolik");
      }

      return data?.data ?? data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Videoni yuklashda xatolik");
}

export function formatFileSize(bytes) {
  const value = Number(bytes);
  if (!value || Number.isNaN(value)) return "—";

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatVideoDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
