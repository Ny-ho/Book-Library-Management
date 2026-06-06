import type { Book, BookCreate } from "../types/book";
import { apiRequest } from "./client";

export function fetchBooks() {
  return apiRequest<Book[]>("/books/");
}

export function createBook(data: BookCreate) {
  return apiRequest<Book>("/books/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteBook(id: number) {
  return apiRequest<void>(`/books/${id}`, { method: "DELETE" });
}
