import Link from "next/link";
import { PathwayLogo } from "./components/PathwayLogo";

export default function NotFound() {
  return (
    <main className="status-page">
      <PathwayLogo href="/" />
      <p className="status-code">404</p>
      <h1>This page took a wrong turn.</h1>
      <p className="status-text">
        The page you are looking for does not exist or may have moved.
      </p>
      <Link className="primary-action" href="/">
        Back to home
      </Link>
    </main>
  );
}
