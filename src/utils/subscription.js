const STORAGE_KEY = "najot-subscription-expires";
export const SUBSCRIPTION_DURATION_MS = 15 * 60 * 1000;

export function getSubscriptionExpiresAt() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function renewSubscription() {
  const expiresAt = Date.now() + SUBSCRIPTION_DURATION_MS;
  localStorage.setItem(STORAGE_KEY, String(expiresAt));
  return expiresAt;
}

export function getSubscriptionState(now = Date.now()) {
  const expiresAt = getSubscriptionExpiresAt();

  if (!expiresAt || now >= expiresAt) {
    return { expired: true, expiresAt: 0, remainingMs: 0 };
  }

  return {
    expired: false,
    expiresAt,
    remainingMs: expiresAt - now,
  };
}

export function formatRemaining(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
