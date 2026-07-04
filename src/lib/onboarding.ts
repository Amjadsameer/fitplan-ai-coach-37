const key = (uid: string) => `fp_onboarded_${uid}`;

export function isOnboarded(uid: string): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(key(uid)) === "1";
}

export function markOnboarded(uid: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key(uid), "1");
}
