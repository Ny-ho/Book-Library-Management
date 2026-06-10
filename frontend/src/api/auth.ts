import { apiRequest } from "./client";
import type { User } from "../types/user";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export function loginWithGoogle(idToken: string) {
  return apiRequest<LoginResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
}

export function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const decoded = parseJwt(token);
  if (!decoded || !decoded.sub) return null;

  try {
    const user = await apiRequest<User>(`/users/${decoded.sub}`);
    return user;
  } catch (err) {
    console.error("Failed to fetch user:", err);
    return null;
  }
}
