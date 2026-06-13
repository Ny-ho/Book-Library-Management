import type { User } from "../../types/user";
import "../books/forms.css";

interface ProfileDisplayProps {
  currentUser: User | null; 
}

export function RegisterForm({ currentUser }: ProfileDisplayProps) {
  if (!currentUser) {
    return <div className="p-4">Loading profile information...</div>;
  }

  return (
    /* 🚀 We wrap the grid structure with inline styles to force a perfectly aligned 3-column system */
    <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", width: "100%" }}>
      
      {/* Row 1, Column 1: Username */}
      <label style={{ gridColumn: "span 1" }}>
        Username
        <input
          type="text"
          readOnly
          disabled
          value={`YOU: ${currentUser.username}`}
          style={{ cursor: "not-allowed", opacity: 0.8, width: "100%" }}
        />
      </label>
      
      {/* Row 1, Column 2 & 3: Email spans across the remaining 2/3rds of the card layout */}
      <label style={{ gridColumn: "span 2" }}>
        Email
        <input
          type="email"
          readOnly
          disabled
          value={currentUser.email}
          style={{ cursor: "not-allowed", opacity: 0.8, width: "100%" }}
        />
      </label>
      
      {/* Row 2, Column 1 & 2: Password spans 2 parts, giving the long description plenty of breathing room */}
      <label style={{ gridColumn: "span 2" }}>
        Password
        <input
          type="text"
          readOnly
          disabled
          value="(Randomly generated and securely hashed)"
          style={{ 
            cursor: "not-allowed", 
            opacity: 0.8, 
            fontStyle: "italic", 
            width: "100%" /* 🚀 Fills its 2-column wide block entirely */
          }}
        />
      </label>
      
      {/* Row 2, Column 3: Role stays on the same line to completely snap and fill the remaining right side gap! */}
      <label style={{ gridColumn: "span 1" }}>
        Role
        <input
          type="text"
          readOnly
          disabled
          value={currentUser.role}
          style={{ cursor: "not-allowed", opacity: 0.8, width: "100%" }}
        />
      </label>
    </div>
  );
}