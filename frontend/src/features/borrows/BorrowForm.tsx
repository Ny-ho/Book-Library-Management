import { useState, useEffect, type FormEvent } from "react";
import type { Book } from "../../types/book";
import type { User } from "../../types/user";
import type { BorrowCreate } from "../../types/borrow";
import { Button } from "../../components/ui/Button";
import "../books/forms.css";

interface BorrowFormProps {
  users: User[];
  books: Book[];
  currentUser?: User | null;
  onSubmit: (data: BorrowCreate) => Promise<void>;
}

function defaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 16);
}

export function BorrowForm({ users, books, currentUser, onSubmit }: BorrowFormProps) {
  const available = books.filter((b) => b.status.toLowerCase() === "available");
  const [form, setForm] = useState<BorrowCreate>({
    user_id: currentUser ? currentUser.id : (users[0]?.id ?? 0),
    book_id: available[0]?.id ?? 0,
    due_date: defaultDueDate(),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({ ...prev, user_id: currentUser.id }));
    } else if (users.length > 0 && !form.user_id) {
      setForm((prev) => ({ ...prev, user_id: users[0].id }));
    }
  }, [currentUser, users]);

  useEffect(() => {
    if (available.length > 0 && !form.book_id) {
      setForm((prev) => ({ ...prev, book_id: available[0].id }));
    }
  }, [books]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.user_id || !form.book_id) return;
    setSaving(true);
    try {
      const due = new Date(form.due_date).toISOString();
      await onSubmit({ ...form, due_date: due });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {currentUser ? (
        <div style={{ gridColumn: "span 2", marginBottom: "0.5rem", padding: "0.75rem", background: "var(--color-bg-alt, #f8f9fa)", borderRadius: "var(--radius)", border: "1px solid var(--color-border)" }}>
          <strong>Borrowing as:</strong> {currentUser.username} ({currentUser.email})
        </div>
      ) : (
        <label>
          Member
          <select
            required
            value={form.user_id || ""}
            onChange={(e) =>
              setForm({ ...form, user_id: Number(e.target.value) })
            }
          >
            <option value="" disabled>
              Select user
            </option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username} ({u.email})
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        Book (available only)
        <select
          required
          value={form.book_id || ""}
          onChange={(e) =>
            setForm({ ...form, book_id: Number(e.target.value) })
          }
        >
          <option value="" disabled>
            Select book
          </option>
          {available.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title} — {b.isbn}
            </option>
          ))}
        </select>
      </label>
      <label>
        Due date
        <input
          type="datetime-local"
          required
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
        />
      </label>
      <div className="form-grid__actions">
        <Button
          type="submit"
          disabled={saving || (!currentUser && users.length === 0) || available.length === 0}
        >
          {saving ? "Borrowing…" : "Create borrow"}
        </Button>
      </div>
    </form>
  );
}
