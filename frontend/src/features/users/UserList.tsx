import type { User } from "../../types/user";

interface UserListProps {
  users: User[];
  currentUser: User | null; // Added to receive down state context safely
}

export function UserList({ users, currentUser }: UserListProps) {
  if (users.length === 0) {
    return <div style={{ padding: "1rem", color: "#a0aec0" }}>No users registered inside the platform.</div>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #2d3748", color: "#718096", fontSize: "0.85rem" }}>
            <th style={{ padding: "0.75rem" }}>ID</th>
            <th style={{ padding: "0.75rem" }}>USERNAME</th>
            <th style={{ padding: "0.75rem" }}>EMAIL</th>
            <th style={{ padding: "0.75rem" }}>ROLE</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isMe = user.id === currentUser?.id;
            
            return (
              <tr 
                key={user.id} 
                style={{ 
                  borderBottom: "1px solid #2d3748",
                  backgroundColor: isMe ? "rgba(236, 201, 75, 0.04)" : "transparent" 
                }}
              >
                <td style={{ padding: "0.75rem", color: isMe ? "#ecc94b" : "inherit" }}>
                  {user.id}
                </td>
                <td style={{ padding: "0.75rem", fontWeight: isMe ? "bold" : "normal", color: isMe ? "#ecc94b" : "inherit" }}>
                  {isMe ? `YOU: ${user.username}` : user.username}
                </td>
                <td style={{ padding: "0.75rem", color: isMe ? "#ecc94b" : "inherit" }}>
                  {user.email}
                </td>
                <td style={{ padding: "0.75rem" }}>
                  <span style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    backgroundColor: user.role === "admin" ? "#e53e3e" : "#4a5568",
                    color: "#fff"
                  }}>
                    {user.role}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}