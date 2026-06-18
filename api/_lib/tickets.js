import crypto from "node:crypto";

const SECRET = process.env.OTP_SECRET || "dev-insecure-secret-change-me";

function b64url(value) {
  return Buffer.from(value).toString("base64url");
}

export function signTicket(payload, ttlSeconds = 300) {
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const data = b64url(JSON.stringify(body));
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyTicket(ticket) {
  if (!ticket || typeof ticket !== "string" || !ticket.includes(".")) return null;
  const [data, sig] = ticket.split(".");
  const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  let body;
  try {
    body = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!body.exp || body.exp < Math.floor(Date.now() / 1000)) return null;
  return body;
}

export function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

export function generateOtp() {
  return String(crypto.randomInt(10000, 100000));
}
