import { useCallback, useEffect, useState } from "react";
import { fetchBooks } from "../api/books";
import { createBorrow, fetchBorrows, returnBook } from "../api/borrows";
import { fetchUsers } from "../api/users";
import { getCurrentUser } from "../api/auth";
import { ApiError } from "../api/client";
import { Alert } from "../components/ui/Alert";
import { Card } from "../components/ui/Card";
import { BorrowForm } from "../features/borrows/BorrowForm";
import { BorrowList } from "../features/borrows/BorrowList";
import type { Borrow } from "../types/borrow";
import type { Book } from "../types/book";
import type { User } from "../types/user";

export function BorrowsPage() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [returningId, setReturningId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [b, u, bk, curr] = await Promise.all([
        fetchBorrows(),
        fetchUsers(),
        fetchBooks(),
        getCurrentUser(),
      ]);
      setBorrows(b);
      setUsers(u);
      setBooks(bk);
      setCurrentUser(curr);
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleBorrow(data: Parameters<typeof createBorrow>[0]) {
    setError(null);
    setSuccess(null);
    try {
      await createBorrow(data);
      setSuccess("Borrow created.");
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Borrow failed");
      throw e;
    }
  }

  async function handleReturn(borrowId: number) {
    setReturningId(borrowId);
    setError(null);
    setSuccess(null);
    try {
      await returnBook(borrowId);
      setSuccess("Book returned successfully.");
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Failed to return book");
    } finally {
      setReturningId(null);
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
      <Card title="New borrow">
        {loading ? (
          <p>Loading…</p>
        ) : (
          <BorrowForm users={users} books={books} currentUser={currentUser} onSubmit={handleBorrow} />
        )}
      </Card>
      <Card title="Borrow history">
        {loading ? <p>Loading…</p> : <BorrowList borrows={borrows} onReturn={handleReturn} returningId={returningId} />}
      </Card>
    </>
  );
}
