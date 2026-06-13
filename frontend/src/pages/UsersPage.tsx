import { useCallback, useEffect, useState } from "react";
import { fetchUsers } from "../api/users"; // ❌ Removed createUser API import
import { ApiError } from "../api/client";
import { Alert } from "../components/ui/Alert";
import { Card } from "../components/ui/Card";
import { RegisterForm } from "../features/users/RegisterForm";
import { UserList } from "../features/users/UserList";
import type { User } from "../types/user";
import { getCurrentUser } from "../api/auth";

// NOTE: If you are using an auth context, import your hook here. 
// For example: import { useAuth } from "../hooks/useAuth";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 1. Change this from a hardcoded object to start as null 
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 2. Fetch the catalog users and the actual logged-in user at the same time
      const [allUsers, activeUser] = await Promise.all([
        fetchUsers(),
        getCurrentUser().catch(() => null) // Fallback to null if not logged in
      ]);
      
      setUsers(allUsers);
      setCurrentUser(activeUser); // 3. Save the actual user payload to state
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // ... rest of your return statement stays exactly the same
  return (
    <>
      {error ? <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert> : null}
      {success ? (
        <Alert variant="success" onDismiss={() => setSuccess(null)}>
          {success}
        </Alert>
      ) : null}
      
      {/* 🔄 Changed Title from "Register member" to "Your Profile" */}
      <Card title="Your Profile">
        {/* 🚀 Passing the logged-in user data down into your read-only profile template */}
        <RegisterForm currentUser={currentUser} />
      </Card>
      
      <Card title="Members">
        {loading ? <p>Loading…</p> : <UserList users={users} />}
      </Card>
    </>
  );
}