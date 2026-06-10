import type { Borrow } from "../../types/borrow";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

interface BorrowListProps {
  borrows: Borrow[];
  onReturn?: (borrowId: number) => Promise<void>;
  returningId?: number | null;
}

export function BorrowList({ borrows, onReturn, returningId }: BorrowListProps) {
  if (borrows.length === 0) {
    return <EmptyState message="No borrows yet." />;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Book</th>
            <th>Borrowed</th>
            <th>Due</th>
            <th>Returned</th>
          </tr>
        </thead>
        <tbody>
          {borrows.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.user_id}</td>
              <td>{b.book_id}</td>
              <td>{fmt(b.borrow_date)}</td>
              <td>{fmt(b.due_date)}</td>
              <td>
                {b.return_date ? (
                  fmt(b.return_date)
                ) : onReturn ? (
                  <Button
                    variant="secondary"
                    disabled={returningId === b.id}
                    onClick={() => onReturn(b.id)}
                  >
                    {returningId === b.id ? "Returning…" : "Return"}
                  </Button>
                ) : (
                  "Not returned"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
