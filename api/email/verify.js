import { verifyTicket, signTicket, hashOtp } from "../_lib/tickets.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { ticket, otp } = req.body || {};
  const payload = verifyTicket(ticket);
  if (!payload || payload.kind !== "verify") {
    return res.status(400).json({ success: false, message: "Kod muddati tugagan, qayta yuboring" });
  }
  if (!otp || hashOtp(otp) !== payload.otp) {
    return res.status(401).json({ success: false, message: "Kod noto'g'ri" });
  }

  const resetTicket = signTicket({ email: payload.email, kind: "reset" }, 300);
  return res.status(200).json({ success: true, message: "Kod tasdiqlandi", resetTicket });
}
