import { useEffect, useState } from "react";

export type Sex = "male" | "female";
export type Activity = "sedentary" | "light" | "moderate" | "active" | "very_active";

export interface UserProfile {
  height: number; // cm
  weight: number; // kg
  age: number;
  sex: Sex;
  activity: Activity;
}

export const DEFAULT_PROFILE: UserProfile = {
  height: 178,
  weight: 78,
  age: 28,
  sex: "male",
  activity: "moderate",
};

const KEY = "fp_profile";

export function loadProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(p: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  useEffect(() => { setProfile(loadProfile()); }, []);
  const update = (p: UserProfile) => { setProfile(p); saveProfile(p); };
  return [profile, update] as const;
}

// Mifflin-St Jeor
export function bmr(p: UserProfile): number {
  const base = 10 * p.weight + 6.25 * p.height - 5 * p.age;
  return Math.round(base + (p.sex === "male" ? 5 : -161));
}

const ACT_MULT: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function tdee(p: UserProfile): number {
  return Math.round(bmr(p) * ACT_MULT[p.activity]);
}
