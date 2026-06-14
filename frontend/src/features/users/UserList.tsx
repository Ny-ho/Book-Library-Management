import type { User } from "../../types/user";
import { EmptyState } from "../../components/ui/EmptyState";

interface UserListProps {
  users: User[];
}

export function UserList({ users = [] }: UserListProps) {
  // 🛡️ Safe check: Validate that users is a defined array before checking length or rendering
  if (!users || !Array.isArray(users) || users.length === 0) {
    return <EmptyState message="No users yet." />;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}