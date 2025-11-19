import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "/app/styles/global.css" },
];

export const meta: MetaFunction = () => ([
  { title: "FactoryBench" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
]);

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <header className="header">
          <div className="container">
            <a className="brand" href="/">
              <img src="/Forgis_white logomark.png" alt="Forgis" style={{ height: 32, width: 32, objectFit: "contain", marginRight: 8 }} />
              FactoryBench
            </a>
            <nav className="nav">
              <a href="/leaderboard">Leaderboard</a>
              <a href="/analysis">Analysis</a>
            </nav>
          </div>
        </header>
        <main className="container" style={{ marginTop: 32 }}>
          <Outlet />
        </main>
        <footer className="footer">
          <div className="container">Forgis • telemetry_literacy MVP</div>
        </footer>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
