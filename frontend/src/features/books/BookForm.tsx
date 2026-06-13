import { useState, useEffect, type FormEvent } from "react";
import type { BookCreate } from "../../types/book";
import { Button } from "../../components/ui/Button";
import "./forms.css";

interface BookFormProps {
  onSubmit: (data: FormData) => Promise<void>;  // <-- Change type to FormData
}

function generateRandomIsbn(): string {
  const rand = () => Math.floor(Math.random() * 10);
  return `978-${rand()}-${rand()}${rand()}-${rand()}${rand()}${rand()}${rand()}${rand()}-${rand()}`;
}

export function BookForm({ onSubmit }: BookFormProps) {
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    isbn: generateRandomIsbn(),
  });
  const [imageFile, setImageFile] = useState<File | null>(null); // State to hold selected file
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // Create multipart FormData container
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("author", form.author);
      formData.append("category", form.category);
      formData.append("isbn", form.isbn);
      if (imageFile) {
        formData.append("image", imageFile);  // Append the selected file
      }

      await onSubmit(formData);
      
      // Reset form
      setForm({
        title: "",
        author: "",
        category: "",
        isbn: generateRandomIsbn(),
      });
      setImageFile(null);
      const fileInput = document.getElementById("book-image") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
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
      <label>
        Book Cover Image (Optional)
        <input
          id="book-image"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
      </label>
      <div className="form-grid__actions">
        <Button type="submit" disabled={saving}>
          {saving ? "Adding…" : "Add book"}
        </Button>
      </div>
    </form>
  );
}
