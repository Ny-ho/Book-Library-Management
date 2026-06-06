import type { User, UserCreate } from "../types/user";
import { apiRequest } from "./client";

export function fetchUsers() {
  return apiRequest<User[]>("/users/");
}

export function createUser(data: UserCreate) {
  return apiRequest<User>("/users/", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      role: data.role ?? "user",
    }),
  });
}
