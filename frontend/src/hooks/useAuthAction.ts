import { useNavigate } from "react-router-dom";

export function useAuthAction() {
  const navigate = useNavigate();

  /**
   * Wraps any sensitive action. 
   * If authenticated, runs the action. If not, redirects to /auth.
   */
  const executeSecureAction = (action: () => void | Promise<void>) => {
    const token = localStorage.getItem("token"); // Adjust this if you store tokens in sessionStorage or context

    if (!token) {
      // 🚨 No token found, redirect straight to the frontend sign-in page
      navigate("/auth");
    } else {
      // ✅ Token exists, run the intended function (e.g., borrow book, delete book)
      void action();
    }
  };

  return { executeSecureAction };
}