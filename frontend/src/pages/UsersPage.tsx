import { useCallback, useEffect, useState } from "react";
import { createUser, fetchUsers } from "../api/users";
import { ApiError } from "../api/client";
import { Alert } from "../components/ui/Alert";
import { Card } from "../components/ui/Card";
import { RegisterForm } from "../features/users/RegisterForm";
import { UserList } from "../features/users/UserList";
import type { User } from "../types/user";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await fetchUsers());
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRegister(data: Parameters<typeof createUser>[0]) {
    setError(null);
    setSuccess(null);
    try {
      await createUser(data);
      setSuccess("User registered.");
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Registration failed");
      throw e;
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
      <Card title="Register member">
        <RegisterForm onSubmit={handleRegister} />
      </Card>
      <Card title="Members">
        {loading ? <p>Loading…</p> : <UserList users={users} />}
      </Card>
    </>
  );
}
