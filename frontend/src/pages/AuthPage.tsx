import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { loginWithGoogle } from "../api/auth";
import "./AuthPage.css";

declare global {
  interface Window {
    google?: any;
  }
}

export function AuthPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    // If already logged in, redirect home
    if (isLoggedIn) {
      navigate("/");
      return;
    }

    const initializeGoogleSignIn = () => {
      if (window.google) {
        // 1. Initialize Google Identity Services client
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        // 2. Render Google Button inside the container div
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: "100%" }
        );
      }
    };

    // Callback received when user successfully authenticates on Google
    const handleCredentialResponse = async (response: any) => {
      setLoading(true);
      setError(null);
      try {
        // Send Google's ID token to your backend
        const data = await loginWithGoogle(response.credential);
        
        // Save returned app JWT to localStorage
        localStorage.setItem("token", data.access_token);
        
        // Redirect home and refresh page to update layouts
        navigate("/");
        window.location.reload();
      } catch (err: any) {
        setError(err.detail || "Authentication failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Add a short delay to ensure the script has fully loaded on mounting
    const timeout = setTimeout(initializeGoogleSignIn, 100);
    return () => clearTimeout(timeout);
  }, [isLoggedIn, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="auth-page">
      <Card title={isLoggedIn ? "Account Status" : "Sign in with Google"}>
        {isLoggedIn ? (
          <div>
            <p>You are currently logged in.</p>
            <button 
              className="button button--secondary" 
              onClick={handleLogout}
              style={{ width: "100%", marginTop: "1rem" }}
            >
              Log out
            </button>
          </div>
        ) : (
          <div>
            <p>
              Please authenticate using Google to log into your Library system.
            </p>
            
            {/* The Google library will hook here and draw the official button */}
            <div id="google-signin-btn" style={{ minHeight: "40px", marginTop: "1rem" }}></div>
            
            {loading && <p className="auth-page__hint">Verifying token...</p>}
            {error && <p className="auth-page__hint" style={{ color: "red" }}>{error}</p>}
            
            <p className="auth-page__hint" style={{ marginTop: "1.5rem" }}>
              For now, use <strong>Users</strong> to register members and{" "}
              <strong>Borrows</strong> with their user ID.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
