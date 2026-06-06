import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import "./HomePage.css";

const tiles = [
  {
    to: "/books",
    title: "Books",
    desc: "Catalog titles, ISBNs, and availability.",
  },
  {
    to: "/users",
    title: "Users",
    desc: "Register library members (password stored hashed on API).",
  },
  {
    to: "/borrows",
    title: "Borrows",
    desc: "Check out available books to a member.",
  },
  {
    to: "/auth",
    title: "Sign in",
    desc: "Google email verification — you’ll wire this up later.",
  },
];

export function HomePage() {
  return (
    <div className="home">
      <Card title="Welcome">
        <p>
          This UI talks to your FastAPI backend (books, users, borrows). JWT
          login is turned off on the API for now.
        </p>
      </Card>
      <div className="home__grid">
        {tiles.map((tile) => (
          <Link key={tile.to} to={tile.to} className="home__tile">
            <h3>{tile.title}</h3>
            <p>{tile.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
