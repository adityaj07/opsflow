import type * as React from 'react';

import { Toaster } from '@opsflow/ui/components/sonner';
import { TooltipProvider } from '@opsflow/ui/components/tooltip';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import './index.css';
import type { Route } from './+types/root';
import { ThemeProvider } from './components/theme-provider';
import { AuthBootstrap } from './providers/auth-bootstrap';
import { QueryProvider } from './providers/query-provider';

export const meta: Route.MetaFunction = () => [
  { title: 'OpsFlow' },
  { name: 'description', content: 'Smart Internal Operations System' },
  { property: 'og:image', content: '/og.png' },
  { property: 'og:type', content: 'website' },
  { property: 'og:title', content: 'OpsFlow' },
  { property: 'og:description', content: 'Smart Internal Operations System' },
];

export const links: Route.LinksFunction = () => [
  { rel: 'icon', href: '/opsflow-logo1.png', type: 'image/png' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
      storageKey="opsflow-theme"
    >
      <TooltipProvider>
        <QueryProvider>
          <AuthBootstrap>
            <Outlet />
          </AuthBootstrap>
        </QueryProvider>
      </TooltipProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }
  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
