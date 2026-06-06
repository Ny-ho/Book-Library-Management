import { useState, type FormEvent } from "react";
import type { UserCreate } from "../../types/user";
import { Button } from "../../components/ui/Button";
import "../books/forms.css";

interface RegisterFormProps {
  onSubmit: (data: UserCreate) => Promise<void>;
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [form, setForm] = useState<UserCreate>({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
      setForm({ username: "", email: "", password: "", role: "user" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label>
        Username
        <input
          required
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
      </label>
      <label>
        Email
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </label>
      <label>
        Role
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </label>
      <div className="form-grid__actions">
        <Button type="submit" disabled={saving}>
          {saving ? "Registering…" : "Register user"}
        </Button>
      </div>
    </form>
  );
}
