const FILES_HOST = "https://najot-edu.softwareengineer.uz/files";

export function getProfilePhotoUrl(photo) {
  if (!photo) return "";

  const value = String(photo).trim();
  if (!value) return "";
  if (value.startsWith("http")) return value;

  const path = value.replace(/^\/+/, "").replace(/^files\//, "");
  return `${FILES_HOST}/${path}`;
}
