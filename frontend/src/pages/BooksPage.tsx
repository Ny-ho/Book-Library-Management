import { useCallback, useEffect, useState } from "react";
import { createBook, deleteBook, fetchBooks } from "../api/books";
import { ApiError } from "../api/client";
import { Alert } from "../components/ui/Alert";
import { Card } from "../components/ui/Card";
import { BookForm } from "../features/books/BookForm";
import { BookList } from "../features/books/BookList";
import type { Book } from "../types/book";

export function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBooks(await fetchBooks());
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Failed to load books");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(data: Parameters<typeof createBook>[0]) {
    setError(null);
    setSuccess(null);
    try {
      await createBook(data);
      setSuccess("Book added.");
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Failed to add book");
      throw e;
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this book?")) return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteBook(id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {error ? <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert> : null}
      {success ? (
        <Alert variant="success" onDismiss={() => setSuccess(null)}>
          {success}
        </Alert>
      ) : null}
      <Card title="Add book">
        <BookForm onSubmit={handleCreate} />
      </Card>
      <Card title="Catalog">
        {loading ? <p>Loading…</p> : <BookList books={books} onDelete={handleDelete} deletingId={deletingId} />}
      </Card>
    </>
  );
}
