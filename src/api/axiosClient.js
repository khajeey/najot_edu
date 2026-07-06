import axios from "axios";

const API_ORIGIN = "https://najot-edu.softwareengineer.uz";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "/api/v1" : `${API_ORIGIN}/api/v1`),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error, fallback) {
  if (!error.response) {
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      return "Tarmoq xatosi. Internet yoki server ulanishini tekshiring.";
    }
    return error.message || fallback;
  }

  const status = error.response.status;

  if (status === 413) {
    return "Fayl juda katta. Server limitidan oshdi — kichikroq fayl tanlang (tavsiya: 15 MB gacha).";
  }

  if (status === 404) {
    return "So'rov topilmadi (404). API manzili yoki endpoint noto'g'ri bo'lishi mumkin.";
  }

  if (status === 409) {
    return "Bu telefon raqami yoki email allaqachon ro'yxatdan o'tgan. Boshqa raqam yoki email kiriting.";
  }

  return error.response?.data?.message || error.message || fallback;
}
