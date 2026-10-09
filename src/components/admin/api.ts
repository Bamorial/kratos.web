"use client";
import type { User } from "firebase/auth";

export async function adminRequest<T>(user: User, path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/admin/${path}`, {
    ...options, cache: "no-store", headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "The request could not be completed.");
  return result as T;
}
