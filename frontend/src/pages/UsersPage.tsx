import { useCallback, useEffect, useState } from "react";
import { fetchUsers } from "../api/users";
import { getCurrentUser } from "../api/auth";
import { ApiError } from "../api/client";
import { Alert } from "../components/ui/Alert";
import { Card } from "../components/ui/Card";
import { RegisterForm } from "../features/users/RegisterForm";
import { UserList } from "../features/users/UserList";
import type { User } from "../types/user";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    // If the token is missing entirely from storage, skip the API call and wipe state
    const tokenExists = !!localStorage.getItem("token");
    if (!tokenExists) {
      setCurrentUser(null);
      try {
        const allUsers = await fetchUsers();
        setUsers(Array.isArray(allUsers) ? allUsers : []);
      } catch (e) {
        setError(e instanceof ApiError ? e.detail : "Failed to load users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      // Both keys fetch concurrently if authenticated
      const [allUsers, activeUser] = await Promise.all([
        fetchUsers(),
        getCurrentUser().catch(() => null),
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
    
    // Create an event listener that catches when our Sidebar clears the storage token
    const handleStorageSync = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUser(null);
      }
    };

    window.addEventListener("storage", handleStorageSync);
    return () => window.removeEventListener("storage", handleStorageSync);
  }, [load]);

  return (
    <>
      {error ? <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert> : null}
      {success ? (
        <Alert variant="success" onDismiss={() => setSuccess(null)}>
          {success}
        </Alert>
      ) : null}

      {/* 1. Top Card: Displays profile state context dynamically */}
      <Card title={currentUser ? "Your Profile" : "Session Access"}>
        {currentUser ? (
          <div style={{ marginBottom: "1.5rem", padding: "0.5rem", borderBottom: "1px solid #2d3748" }}>
            <h4 style={{ margin: "0 0 0.25rem 0", color: "#ecc94b" }}>
              YOU: {currentUser.username}
            </h4>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#a0aec0" }}>
              {currentUser.email}
            </p>
          </div>
        ) : (
          <div style={{ padding: "0.5rem 0", color: "#a0aec0", fontStyle: "italic" }}>
            Not signed in. Please use the sidebar navigation to sign back into an account.
          </div>
        )}
        <RegisterForm currentUser={currentUser} />
      </Card>

      {/* 2. Bottom Card: Pass profile object down into the table columns */}
      <Card title="System Members">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <UserList users={users} currentUser={currentUser} />
        )}
      </Card>
    </>
  );
}