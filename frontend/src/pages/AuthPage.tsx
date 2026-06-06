import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import "./AuthPage.css";

/**
 * Placeholder for Google Sign-In / email verification.
 * You’ll need: Google Cloud OAuth client ID, and backend token verification.
 * See frontend/README.md
 */
export function AuthPage() {
  return (
    <div className="auth-page">
      <Card title="Sign in with Google">
        <p>
          Email verification via Google is not wired yet. When you’re ready,
          add your OAuth client ID and connect this button to Google Identity
          Services, then verify the ID token on your FastAPI backend.
        </p>
        <Button variant="secondary" disabled className="auth-page__google">
          <span className="auth-page__google-icon" aria-hidden>
            G
          </span>
          Continue with Google (coming soon)
        </Button>
        <p className="auth-page__hint">
          For now, use <strong>Users</strong> to register members and{" "}
          <strong>Borrows</strong> with their user ID.
        </p>
      </Card>
    </div>
  );
}
