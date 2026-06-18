import nodemailer from "nodemailer";

export async function sendOtpEmail(to, otp) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD sozlanmagan");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

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
