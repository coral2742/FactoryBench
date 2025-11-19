import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import stylesHref from "./styles/global.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesHref },
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
              <img src="/logo.svg" alt="Forgis" />
              FactoryBench
            </a>
            <nav className="nav">
              <a href="/leaderboard">Leaderboard</a>
              <a href="/analysis">Analysis</a>
            </nav>
          </div>
        </header>
        <main className="container">
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
