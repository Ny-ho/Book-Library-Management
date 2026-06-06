import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { AuthPage } from "../pages/AuthPage";
import { BooksPage } from "../pages/BooksPage";
import { BorrowsPage } from "../pages/BorrowsPage";
import { HomePage } from "../pages/HomePage";
import { UsersPage } from "../pages/UsersPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "books", element: <BooksPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "borrows", element: <BorrowsPage /> },
      { path: "auth", element: <AuthPage /> },
    ],
  },
]);
