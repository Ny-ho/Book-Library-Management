import { useEffect, useState } from "react";
import { getCurrentUser } from "../../api/auth";
import type { User } from "../../types/user";
import { baseUrl } from "../../api/client";
import "./Header.css";

export function Header() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);

  return (
    <header className="header">
      <div>
        <p className="header__eyebrow">Library management</p>
        <h1 className="header__title">Book LM</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        {currentUser && (
          <div style={{ textAlign: "right" }}>
            <span style={{ fontWeight: "bold", display: "block", fontSize: "0.95rem" }}>
              {currentUser.username}
            </span>
            <span style={{ fontSize: "0.8rem", color: "gray" }}>
              {currentUser.email}
            </span>
          </div>
        )}
        <p className="header__api" title="FastAPI base URL">
          API: {baseUrl}
        </p>
      </div>
    </header>
  );
}
