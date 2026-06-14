import { useCallback, useEffect, useState } from "react";
import { fetchBorrows, createBorrow, returnBook } from "../api/borrows";
import { fetchBooks } from "../api/books";
import { fetchUsers } from "../api/users";
import { getCurrentUser } from "../api/auth";
import { ApiError } from "../api/client";
import { Alert } from "../components/ui/Alert";
import { Card } from "../components/ui/Card";
import { BorrowList } from "../features/borrows/BorrowList";
import type { User } from "../types/user";

interface Book {
  id: number;
  title: string;
  status: string;
}

interface BorrowRecord {
  id: number;
  user_id: number;
  book_id: number;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
}

export function BorrowsPage() {
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  
  // Automatically calculate locked due date (14 days from now)
  const getLockedDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().slice(0, 16);
  };

  const [fixedDueDate] = useState<string>(getLockedDueDate());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allBorrows, allBooks, activeUser] = await Promise.all([
        fetchBorrows(),
        fetchBooks(),
        getCurrentUser().catch(() => null),
      ]);

      setBorrows(allBorrows);
      setBooks(allBooks);
      setCurrentUser(activeUser);

      // 🔒 Hard-bind the form submission ID to the active authenticated account
      if (activeUser) {
        setSelectedUserId(activeUser.id.toString());
      } else {
        setSelectedUserId("");
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Failed to sync borrow configuration records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Keep submission state strictly mapped if currentUser state re-syncs
  useEffect(() => {
    if (currentUser) {
      setSelectedUserId(currentUser.id.toString());
    } else {
      setSelectedUserId("");
    }
  }, [currentUser]);

  const handleCreateBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError("You must be logged in to execute a book borrow transaction.");
      return;
    }
    if (!selectedBookId) {
      setError("Please select an available book to borrow.");
      return;
    }

    try {
      setError(null);
      const isoDueDate = new Date(fixedDueDate).toISOString();
      
      await createBorrow({
        user_id: currentUser.id, // 🔒 Enforces ownership straight from active token state context
        book_id: parseInt(selectedBookId, 10),
        due_date: isoDueDate,
      });

      setSuccess("Borrow record created successfully.");
      setSelectedBookId("");
      void loadData();
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Failed to execute borrow transaction.");
    }
  };

  const handleReturn = async (borrowId: number) => {
    try {
      setError(null);
      await returnBook(borrowId);
      setSuccess("Book successfully verified and returned.");
      void loadData();
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Failed to process book return execution.");
    }
  };

  const availableBooks = books.filter((b) => b.status === "available");

  return (
    <>
      {error ? <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert> : null}
      {success ? <Alert variant="success" onDismiss={() => setSuccess(null)}>{success}</Alert> : null}

      {/* New Borrow Form Panel */}
      <Card title="New borrow">
        <form onSubmit={handleCreateBorrow} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          
          {/* 🔒 Read-Only Identity Field (Dropdown entirely removed) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: "1", minWidth: "200px" }}>
            <label style={{ fontSize: "0.85rem", color: "#718096" }}>Borrowing As</label>
            <input
              type="text"
              value={currentUser ? `YOU (${currentUser.username} - ID: ${currentUser.id})` : "Not signed in"}
              disabled={true} // Prevents any keyboard injection alterations
              style={{ 
                padding: "0.5rem", 
                backgroundColor: "#2d3748", 
                color: "#ecc94b", 
                border: "1px solid #4a5568", 
                borderRadius: "4px", 
                cursor: "not-allowed",
                fontWeight: "500"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: "1", minWidth: "200px" }}>
            <label style={{ fontSize: "0.85rem", color: "#718096" }}>Book (available only)</label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              disabled={!currentUser}
              style={{ padding: "0.5rem", backgroundColor: "#1a202c", color: "white", border: "1px solid #2d3748", borderRadius: "4px" }}
            >
              <option value="">Select a book</option>
              {availableBooks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: "1", minWidth: "200px" }}>
            <label style={{ fontSize: "0.85rem", color: "#718096" }}>Due date (Locked 14-Day Limit)</label>
            <input
              type="datetime-local"
              value={fixedDueDate}
              disabled={true} 
              style={{ padding: "0.5rem", backgroundColor: "#2d3748", color: "#a0aec0", border: "1px solid #4a5568", borderRadius: "4px", cursor: "not-allowed" }}
            />
          </div>

          <button
            type="submit"
            disabled={!currentUser || !selectedBookId}
            style={{ 
              padding: "0.5rem 1.2rem", 
              backgroundColor: (!currentUser || !selectedBookId) ? "#4a5568" : "#ecc94b", 
              color: (!currentUser || !selectedBookId) ? "#718096" : "#1a202c", 
              border: "none", 
              borderRadius: "4px", 
              fontWeight: "bold", 
              cursor: (!currentUser || !selectedBookId) ? "not-allowed" : "pointer", 
              height: "38px" 
            }}
          >
            Create borrow
          </button>
        </form>
      </Card>

      {/* Borrow History List Panel */}
      <Card title="Borrow history">
        {loading ? (
          <div className="loading">Syncing records...</div>
        ) : (
          <BorrowList 
            borrows={borrows} 
            books={books} 
            currentUser={currentUser} 
            onReturnBook={handleReturn} 
          />
        )}
      </Card>
    </>
  );
}