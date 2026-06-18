import { verifyTicket } from "../_lib/tickets.js";
import { findPhoneByEmail, changePassword } from "../_lib/upstream.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
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
    return res.status(200).json({ success: true, message: "Parol muvaffaqiyatli o'zgartirildi" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Server xatosi" });
  }
}
