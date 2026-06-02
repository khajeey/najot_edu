const MEDIA_HOST = "https://najot-edu.softwareengineer.uz";

const VIDEO_EXT = /\.(mp4|webm|mov|avi|mkv|m4v|ogm|mpeg)$/i;

function stripHost(value) {
  return String(value)
    .replace(MEDIA_HOST, "")
    .replace(/^\/+/, "");
}

export function getImageMediaUrl(path) {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;

  const cleaned = stripHost(path).replace(/^files\//, "");
  return `${MEDIA_HOST}/files/${cleaned}`;
}

export function getVideoMediaUrl(path) {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;

  let cleaned = stripHost(path);
  if (cleaned.startsWith("files/files/")) {
    return `${MEDIA_HOST}/${cleaned}`;
  }
  cleaned = cleaned.replace(/^files\//, "");
  return `${MEDIA_HOST}/files/files/${cleaned}`;
}

export function resolveMediaUrl(fileOrPath) {
  if (!fileOrPath) return "";

  const path =
    typeof fileOrPath === "string"
      ? fileOrPath
      : fileOrPath.url
        || fileOrPath.path
        || fileOrPath.file
        || fileOrPath.filename
        || fileOrPath.name
        || "";

  if (!path) return "";
  if (String(path).startsWith("http")) return path;

  const isVideo =
    fileOrPath?.type?.startsWith?.("video")
    || fileOrPath?.mime_type?.startsWith?.("video")
    || VIDEO_EXT.test(path);

  return isVideo ? getVideoMediaUrl(path) : getImageMediaUrl(path);
}

export function isVideoMedia(fileOrPath) {
  if (!fileOrPath) return false;
  const path =
    typeof fileOrPath === "string"
      ? fileOrPath
      : fileOrPath.url || fileOrPath.path || fileOrPath.file || fileOrPath.filename || "";
  return VIDEO_EXT.test(path) || fileOrPath?.type?.startsWith?.("video");
}
