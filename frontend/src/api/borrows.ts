import type { Borrow, BorrowCreate } from "../types/borrow";
import { apiRequest } from "./client";

export function fetchBorrows() {
  return apiRequest<Borrow[]>("/borrows/");
}

export function createBorrow(data: BorrowCreate) {
  return apiRequest<Borrow>("/borrows/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
