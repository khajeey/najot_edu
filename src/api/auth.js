function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  const payload = parseJwt(token);
  if (!payload) return null;

  const role = String(
    payload.role ??
      payload.user_role ??
      payload.type ??
      payload.user?.role ??
      payload.data?.role ??
      ""
  ).toUpperCase();

  const name =
    payload.full_name ||
    payload.name ||
    payload.user?.full_name ||
    payload.user?.name ||
    payload.phone ||
    "";

  return { role, name, raw: payload };
}

export function getUserRole() {
  return getCurrentUser()?.role || "";
}

const STUDENT_ROLES = new Set(["STUDENT", "STUDENTS", "TALABA", "PUPIL", "USER"]);
const TEACHER_ROLES = new Set(["TEACHER", "TEACHERS", "OQITUVCHI", "O'QITUVCHI", "USTOZ"]);

export function isStudent() {
  return STUDENT_ROLES.has(getUserRole());
}

export function isTeacher() {
  return TEACHER_ROLES.has(getUserRole());
}

export function getUserInitial() {
  const user = getCurrentUser();
  const name = user?.name?.trim();
  if (name) return name[0].toUpperCase();
  const email = user?.raw?.email;
  if (email) return String(email).trim()[0].toUpperCase();
  return "U";
}

export function homeRouteForRole() {
  if (isTeacher()) return "/dashboard/groups";
  if (isStudent()) return "/dashboard/my-groups";
  return "/dashboard";
}
