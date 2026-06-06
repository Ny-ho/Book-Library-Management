import { baseUrl } from "../../api/client";
import "./Header.css";

export function Header() {
  return (
    <header className="header">
      <div>
        <p className="header__eyebrow">Library management</p>
        <h1 className="header__title">Book LM</h1>
      </div>
      <p className="header__api" title="FastAPI base URL">
        API: {baseUrl}
      </p>
    </header>
  );
}
