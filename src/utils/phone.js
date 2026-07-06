// Backend @IsPhoneNumber tekshiruvi telefonni E.164 formatida kutadi: +998XXXXXXXXX.
// Foydalanuvchi "+998", "998...", "90 123 45 67" kabi turli ko'rinishda kiritishi mumkin —
// hammasini +998XXXXXXXXX ga keltiramiz.

const UZ_CODE = "998";

export function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";

  let national = digits;
  if (national.startsWith(UZ_CODE)) {
    national = national.slice(UZ_CODE.length);
  }
  // 9 xonali milliy raqam (masalan 901234567)
  national = national.slice(0, 9);

  return `+${UZ_CODE}${national}`;
}

// Kiritilgan raqam to'liq (9 xonali milliy qism)mi — submit oldidan tekshirish uchun.
export function isValidUzPhone(raw) {
  const normalized = normalizePhone(raw);
  return /^\+998\d{9}$/.test(normalized);
}
