import type { Book, BookCreate } from "../types/book";
import { apiRequest } from "./client";

export function fetchBooks() {
  return apiRequest<Book[]>("/books/");
}

export function createBook(data: FormData) {
  return apiRequest<Book>("/books/", {
    method: "POST",
    body: data,
  });
}


export function deleteBook(id: number) {
  return apiRequest<void>(`/books/${id}`, { method: "DELETE" });
}

export function fetchBookById(id: number) {
  return apiRequest<Book>(`/books/${id}`);
}
