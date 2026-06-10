import type { Book } from "../../types/book";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";

interface BookListProps {
  books: Book[];
  onDelete: (id: number) => void;
  deletingId: number | null;
}

export function BookList({ books, onDelete, deletingId }: BookListProps) {
  if (books.length === 0) {
    return <EmptyState message="No books yet. Add one above." />;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>ISBN</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.category}</td>
              <td>{book.isbn}</td>
              <td>
                <span
                  className={
                    book.status.toLowerCase() === "available"
                      ? "badge badge--ok"
                      : "badge badge--busy"
                  }
                >
                  {book.status}
                </span>
              </td>
              <td>
                <Button
                  variant="danger"
                  disabled={deletingId === book.id}
                  onClick={() => onDelete(book.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
