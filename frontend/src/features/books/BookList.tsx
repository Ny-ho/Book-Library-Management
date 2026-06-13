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

  const BACKEND_URL = "http://127.0.0.1:8000";

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cover</th>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>ISBN</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {books.map((book) => {
            // 🛡️ Safe URL Sanitizer: Converts old database 'https' entries to 'http' on the fly
            let finalImageUrl = "";
            if (book.image_url) {
              if (book.image_url.startsWith("https://localhost:8000") || book.image_url.startsWith("https://127.0.0.1:8000")) {
                finalImageUrl = book.image_url.replace("https://", "http://");
              } else if (book.image_url.startsWith("http")) {
                finalImageUrl = book.image_url;
              } else {
                finalImageUrl = `${BACKEND_URL}${book.image_url.startsWith("/") ? "" : "/"}${book.image_url}`;
              }
            }

            return (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>
                  {finalImageUrl ? (
                    <img
                      src={finalImageUrl}
                      alt={book.title}
                      style={{
                        width: "45px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        border: "1px solid var(--color-border)",
                        display: "block"
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "45px",
                        height: "60px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px dashed var(--color-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        color: "var(--color-text-muted)"
                      }}
                    >
                      No Img
                    </div>
                  )}
                </td>
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

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
//