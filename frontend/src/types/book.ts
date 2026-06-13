

export interface BookCreate {
  title: string;
  author: string;
  category: string;
  isbn: string;
}
export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  isbn: string;
  status: string;
  image_url?: string | null; // Add this line!
}