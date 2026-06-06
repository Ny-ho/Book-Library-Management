import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/books", label: "Books" },
  { to: "/users", label: "Users" },
  { to: "/borrows", label: "Borrows" },
  { to: "/auth", label: "Sign in" },
];

export function Sidebar() {
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
