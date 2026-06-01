import axios from "axios";

export const api = axios.create({
  baseURL: "/api/v1",
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

  return error.response?.data?.message || error.message || fallback;
}
