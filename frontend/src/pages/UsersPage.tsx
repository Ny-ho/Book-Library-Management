import { useCallback, useEffect, useState } from "react";
import { fetchUsers } from "../api/users";
import { ApiError } from "../api/client";
import { Alert } from "../components/ui/Alert";
import { Card } from "../components/ui/Card";
import { RegisterForm } from "../features/users/RegisterForm";
import { UserList } from "../features/users/UserList";
import type { User } from "../types/user";
import { getCurrentUser } from "../api/auth";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allUsers, activeUser] = await Promise.all([
        fetchUsers(),
        getCurrentUser().catch(() => null) // Safe fallback
      ]);
      
      setUsers(Array.isArray(allUsers) ? allUsers : []);
      setCurrentUser(activeUser);
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      {error ? <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert> : null}
      {success ? (
        <Alert variant="success" onDismiss={() => setSuccess(null)}>
          {success}
        </Alert>
      ) : null}
      
      {/* 1. Profile section at the very top */}
      <Card title="Your Profile">
        <RegisterForm currentUser={currentUser} />
      </Card>
      
      {/* 2. Members list directly below it */}
      <Card title="System Members">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <UserList users={users} />
        )}
      </Card>
    </>
  );
}