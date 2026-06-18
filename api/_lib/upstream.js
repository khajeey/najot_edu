const UPSTREAM = process.env.UPSTREAM_API || "https://najot-edu.softwareengineer.uz/api/v1";

let cachedToken = null;
let cachedAt = 0;

async function superadminToken() {
  if (cachedToken && Date.now() - cachedAt < 20 * 60 * 1000) return cachedToken;

  const phone = process.env.RESET_SUPERADMIN_PHONE;
  const password = process.env.RESET_SUPERADMIN_PASSWORD;
  if (!phone || !password) {
    throw new Error("RESET_SUPERADMIN_PHONE / RESET_SUPERADMIN_PASSWORD sozlanmagan");
  }

  const res = await fetch(`${UPSTREAM}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!data?.accessToken) throw new Error("Superadmin login muvaffaqiyatsiz");

  cachedToken = data.accessToken;
  cachedAt = Date.now();
  return cachedToken;
}

export async function findPhoneByEmail(email) {
  const token = await superadminToken();
  const target = String(email).trim().toLowerCase();

  for (const path of ["/students", "/teachers"]) {
    const res = await fetch(`${UPSTREAM}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) continue;
    const data = await res.json().catch(() => ({}));
    const list = Array.isArray(data?.data) ? data.data : [];
    const hit = list.find((u) => String(u.email || "").trim().toLowerCase() === target);
    if (hit?.phone) return hit.phone;
  }
  return null;
}

export async function changePassword(phone, password) {
  const res = await fetch(`${UPSTREAM}/auth/change-password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || "Parolni o'zgartirib bo'lmadi");
  }
  return data;
}
