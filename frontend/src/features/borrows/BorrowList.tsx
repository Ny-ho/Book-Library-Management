import type { User } from "../../types/user";

interface Book {
  id: number;
  title: string;
}

interface BorrowRecord {
  id: number;
  user_id: number;
  book_id: number;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
}

interface BorrowListProps {
  borrows: BorrowRecord[];
  books: Book[];
  currentUser: User | null;
  onReturnBook: (borrowId: number) => Promise<void>;
}

export function BorrowList({ borrows, books, currentUser, onReturnBook }: BorrowListProps) {
  
  // Creates a mapping dictionary from book array for efficient title selection
  const bookMap = books.reduce((acc, book) => {
    acc[book.id] = book.title;
    return acc;
  }, {} as Record<number, string>);

  // Consistent timestamp parsing that displays the server's tracking state cleanly as UTC
  const formatUtcDate = (dateString: string | null) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      
      // Extract components cleanly without browser local offset intervention
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      
      let hours = date.getUTCHours();
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      const seconds = String(date.getUTCSeconds()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      
      hours = hours % 12;
      hours = hours ? hours : 12; // conversion of hour '0' to '12'
      const strHours = String(hours).padStart(2, "0");

      return `${month}/${day}/${year}, ${strHours}:${minutes}:${seconds} ${ampm} UTC`;
    } catch {
      return `${dateString} UTC`;
    }
  };

  if (!borrows || borrows.length === 0) {
    return <div style={{ padding: "1rem", color: "#a0aec0" }}>No active borrow records inside the library system.</div>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #2d3748", color: "#718096", fontSize: "0.85rem" }}>
            <th style={{ padding: "0.75rem" }}>ID</th>
            <th style={{ padding: "0.75rem" }}>BOOK NAME</th> {/* 👈 Updated from ID to BOOK NAME */}
            <th style={{ padding: "0.75rem" }}>BORROWED</th>
            <th style={{ padding: "0.75rem" }}>DUE</th>
            <th style={{ padding: "0.75rem" }}>RETURNED</th>
          </tr>
        </thead>
        <tbody>
          {borrows.map((borrow) => {
            const isMyBorrow = borrow.user_id === currentUser?.id;
            const isReturned = borrow.return_date !== null;
            // Lookup the book name inside our map dictionary, fall back to "Book ID: X" if not found
            const bookTitle = bookMap[borrow.book_id] || `Book #${borrow.book_id}`;

            return (
              <tr 
                key={borrow.id}
                style={{ 
                  borderBottom: "1px solid #2d3748",
                  backgroundColor: isMyBorrow ? "rgba(236, 201, 75, 0.02)" : "transparent"
                }}
              >
                <td style={{ padding: "0.75rem", color: isMyBorrow ? "#ecc94b" : "inherit" }}>
                  {borrow.id}
                </td>
                
                {/* Book Column displaying the actual mapped string value */}
                <td style={{ padding: "0.75rem", fontWeight: isMyBorrow ? "500" : "normal", color: isMyBorrow ? "#ecc94b" : "inherit" }}>
                  {bookTitle}
                </td>
                
                <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>
                  {formatUtcDate(borrow.borrow_date)}
                </td>
                
                <td style={{ padding: "0.75rem", fontSize: "0.9rem", color: !isReturned ? "#fc8181" : "inherit" }}>
                  {formatUtcDate(borrow.due_date)}
                </td>
                
                <td style={{ padding: "0.75rem" }}>
                  {isReturned ? (
                    <span style={{ fontSize: "0.9rem", color: "#48bb78" }}>
                      {formatUtcDate(borrow.return_date)}
                    </span>
                  ) : isMyBorrow ? (
                    <button
                      onClick={() => void onReturnBook(borrow.id)}
                      style={{
                        padding: "0.4rem 0.8rem",
                        backgroundColor: "#3182ce",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "500"
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2b6cb0")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3182ce")}
                    >
                      Return
                    </button>
                  ) : (
                    <span style={{ fontSize: "0.85rem", color: "#4a5568", fontStyle: "italic" }}>
                      Active Borrow
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}