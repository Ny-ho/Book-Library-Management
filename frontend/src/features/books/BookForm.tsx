import { useState, type FormEvent } from "react";
import type { BookCreate } from "../../types/book";
import { Button } from "../../components/ui/Button";
import "./forms.css";

interface BookFormProps {
  onSubmit: (data: BookCreate) => Promise<void>;
}

function generateRandomIsbn(): string {
  const rand = () => Math.floor(Math.random() * 10);
  return `978-${rand()}-${rand()}${rand()}-${rand()}${rand()}${rand()}${rand()}${rand()}-${rand()}`;
}

export function BookForm({ onSubmit }: BookFormProps) {
  const [form, setForm] = useState<BookCreate>({
    title: "",
    author: "",
    category: "",
    isbn: generateRandomIsbn(),
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
      setForm({
        title: "",
        author: "",
        category: "",
        isbn: generateRandomIsbn(),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label>
        Title
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </label>
      <label>
        Author
        <input
          required
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
        />
      </label>
      <label>
        Category
        <input
          required
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
      </label>
      <label>
        ISBN
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            required
            value={form.isbn}
            onChange={(e) => setForm({ ...form, isbn: e.target.value })}
            style={{ flex: 1 }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => setForm({ ...form, isbn: generateRandomIsbn() })}
          >
            Generate
          </Button>
        </div>
      </label>
      <div className="form-grid__actions">
        <Button type="submit" disabled={saving}>
          {saving ? "Adding…" : "Add book"}
        </Button>
      </div>
    </form>
  );
}
