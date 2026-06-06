export interface Borrow {
  id: number;
  user_id: number;
  book_id: number;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
}

export interface BorrowCreate {
  user_id: number;
  book_id: number;
  due_date: string;
}
