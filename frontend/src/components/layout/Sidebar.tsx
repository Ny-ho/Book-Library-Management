import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

export function Sidebar() {
  // 1. Turn isLoggedIn into reactive state
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const location = useLocation(); // Tracks page changes

  // 2. Re-check token status whenever the user navigates pages
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location]);

  const links = [
    { to: "/", label: "Home", end: true },
    { to: "/books", label: "Books" },
    { to: "/users", label: "Users" },
    { to: "/borrows", label: "Borrows" },
    { to: "/auth", label: isLoggedIn ? "Sign out" : "Sign in" },
  ];

  const handleLinkClick = (label: string) => {
    if (label === "Sign out") {
      // Clear token from browser storage
      localStorage.removeItem("token");
      // Instantly update state so UI changes immediately
      setIsLoggedIn(false); 
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden>
          📚
        </span>
        <span>Book LM</span>
      </div>
      <nav className="sidebar__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => handleLinkClick(link.label)} // 👈 Intercept click events here
            className={({ isActive }) =>
              `sidebar__link${isActive ? " sidebar__link--active" : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}