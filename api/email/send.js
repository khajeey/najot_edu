import { findPhoneByEmail } from "../_lib/upstream.js";
import { signTicket, hashOtp, generateOtp } from "../_lib/tickets.js";
import { sendOtpEmail } from "../_lib/mailer.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
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
    return res.status(200).json({ success: true, message: "Tasdiqlash kodi emailingizga yuborildi", ticket });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Server xatosi" });
  }
}
