import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import nodemailer from "nodemailer";

const SECRET = process.env.OTP_SECRET || "dev-insecure-secret-change-me";
const UPSTREAM = process.env.UPSTREAM_API || "https://najot-edu.softwareengineer.uz/api/v1";

function signTicket(payload, ttlSeconds = 300) {
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const data = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyTicket(ticket) {
  if (!ticket || typeof ticket !== "string" || !ticket.includes(".")) return null;
  const [data, sig] = ticket.split(".");
  const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let body;
  try {
    body = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!body.exp || body.exp < Math.floor(Date.now() / 1000)) return null;
  return body;
}

const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");
const generateOtp = () => String(crypto.randomInt(10000, 100000));

let cachedToken = null;
let cachedAt = 0;

async function superadminToken() {
  if (cachedToken && Date.now() - cachedAt < 20 * 60 * 1000) return cachedToken;
  const phone = process.env.RESET_SUPERADMIN_PHONE;
  const password = process.env.RESET_SUPERADMIN_PASSWORD;
  if (!phone || !password) throw new Error("RESET_SUPERADMIN_PHONE / RESET_SUPERADMIN_PASSWORD sozlanmagan");

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

async function findPhoneByEmail(email) {
  const token = await superadminToken();
  const target = String(email).trim().toLowerCase();
  for (const path of ["/students", "/teachers"]) {
    const res = await fetch(`${UPSTREAM}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) continue;
    const data = await res.json().catch(() => ({}));
    const list = Array.isArray(data?.data) ? data.data : [];
    const hit = list.find((u) => String(u.email || "").trim().toLowerCase() === target);
    if (hit?.phone) return hit.phone;
  }
  return null;
}

async function changePassword(phone, password) {
  const res = await fetch(`${UPSTREAM}/auth/change-password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) throw new Error(data?.message || "Parolni o'zgartirib bo'lmadi");
  return data;
}

async function sendOtpEmail(to, otp) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD sozlanmagan");

  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await transporter.sendMail({
    from: `"Najot Edu" <${user}>`,
    to,
    subject: "Najot Edu — parolni tiklash kodi",
    text: `Parolni tiklash uchun tasdiqlash kodingiz: ${otp}\nKod 5 daqiqa amal qiladi.`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#223061;margin-bottom:4px">Najot Edu</h2>
        <p style="color:#444;font-size:15px">Parolni tiklash uchun tasdiqlash kodingiz:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:6px;color:#223061;margin:16px 0">${otp}</p>
        <p style="color:#888;font-size:13px">Kod 5 daqiqa amal qiladi. Agar bu so'rovni siz yubormagan bo'lsangiz, ushbu xatni e'tiborsiz qoldiring.</p>
      </div>`,
  });
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, service: "najot-edu-email" }));

app.post("/email/send", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim();
    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Email noto'g'ri" });
    }
    const phone = await findPhoneByEmail(email);
    if (!phone) {
      return res.status(404).json({ success: false, message: "Bu email tizimda ro'yxatdan o'tmagan" });
    }
    const otp = generateOtp();
    await sendOtpEmail(email, otp);
    const ticket = signTicket({ email: email.toLowerCase(), otp: hashOtp(otp), kind: "verify" }, 300);
    return res.json({ success: true, message: "Tasdiqlash kodi emailingizga yuborildi", ticket });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Server xatosi" });
  }
});

app.post("/email/verify", (req, res) => {
  const { ticket, otp } = req.body || {};
  const payload = verifyTicket(ticket);
  if (!payload || payload.kind !== "verify") {
    return res.status(400).json({ success: false, message: "Kod muddati tugagan, qayta yuboring" });
  }
  if (!otp || hashOtp(otp) !== payload.otp) {
    return res.status(401).json({ success: false, message: "Kod noto'g'ri" });
  }
  const resetTicket = signTicket({ email: payload.email, kind: "reset" }, 300);
  return res.json({ success: true, message: "Kod tasdiqlandi", resetTicket });
});

app.post("/email/reset", async (req, res) => {
  try {
    const { resetTicket, password } = req.body || {};
    const payload = verifyTicket(resetTicket);
    if (!payload || payload.kind !== "reset") {
      return res.status(400).json({ success: false, message: "Sessiya muddati tugagan, qaytadan boshlang" });
    }
    if (!password || String(password).length < 4) {
      return res.status(400).json({ success: false, message: "Parol kamida 4 ta belgidan iborat bo'lsin" });
    }
    const phone = await findPhoneByEmail(payload.email);
    if (!phone) {
      return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
    }
    await changePassword(phone, password);
    return res.json({ success: true, message: "Parol muvaffaqiyatli o'zgartirildi" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Server xatosi" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`najot-edu-email listening on ${PORT}`));
