export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  isbn: string;
  status: string;
}

export interface BookCreate {
  title: string;
  author: string;
  category: string;
  isbn: string;
}
