import { useCallback, useEffect, useState } from "react";
import { createBook, deleteBook, fetchBooks, fetchBookById } from "../api/books";
import { ApiError } from "../api/client";
import { Alert } from "../components/ui/Alert";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { BookForm } from "../features/books/BookForm";
import { BookList } from "../features/books/BookList";
import type { Book } from "../types/book";
import { useAuthAction } from "../hooks/useAuthAction";

export function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Search by ID state
  const [searchId, setSearchId] = useState("");
  const [searchedBook, setSearchedBook] = useState<Book | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const { executeSecureAction } = useAuthAction();

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
    executeSecureAction(async () => {
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
    });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this book?")) return;
    
    executeSecureAction(async () => {
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
    });
  }

  async function handleFindBook(e: React.FormEvent) {
    e.preventDefault();
    if (!searchId) return;
    setSearching(true);
    setSearchError(null);
    setSearchedBook(null);
    try {
      const book = await fetchBookById(Number(searchId));
      setSearchedBook(book);
    } catch (e) {
      setSearchError(e instanceof ApiError ? e.detail : "Book not found");
    } finally {
      setSearching(false);
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
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <Card title="Add book">
          <BookForm onSubmit={handleCreate} />
        </Card>
        
        <Card title="Find Book by ID">
          <form onSubmit={handleFindBook} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1, margin: 0 }}>
              Book ID
              <input
                type="number"
                required
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g. 1"
              />
            </label>
            <Button type="submit" disabled={searching}>
              {searching ? "Finding…" : "Find"}
            </Button>
            {searchedBook && (
              <Button type="button" variant="secondary" onClick={() => { setSearchedBook(null); setSearchId(""); }}>
                Clear
              </Button>
            )}
          </form>
          {searchError && <p style={{ color: "red", marginTop: "0.5rem" }}>{searchError}</p>}
          {searchedBook && (
            <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}>
              <h3 style={{ margin: "0 0 0.5rem 0" }}>{searchedBook.title}</h3>
              <p style={{ margin: "0.25rem 0" }}><strong>Author:</strong> {searchedBook.author}</p>
              <p style={{ margin: "0.25rem 0" }}><strong>Category:</strong> {searchedBook.category}</p>
              <p style={{ margin: "0.25rem 0" }}><strong>ISBN:</strong> {searchedBook.isbn}</p>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Status:</strong>{" "}
                <span className={searchedBook.status.toLowerCase() === "available" ? "badge badge--ok" : "badge badge--busy"}>
                  {searchedBook.status}
                </span>
              </p>
            </div>
          )}
        </Card>
      </div>

      <Card title="Catalog">
        <BookList books={books} onDelete={handleDelete} deletingId={deletingId} />
      </Card>
    </>
  );
}