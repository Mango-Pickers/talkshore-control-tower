import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, HeadContent, Scripts, Link,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TalkShore Control Tower" },
      { name: "description", content: "Internal admin platform for the TalkShore language-learning voyage." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center text-center p-6">
      <div>
        <div className="font-display text-6xl ts-gold-text">404</div>
        <p className="mt-2 text-muted-foreground">This shore is uncharted.</p>
        <Link to="/dashboard" className="inline-block mt-6 px-4 py-2 rounded-xl bg-gold text-[oklch(0.18_0.04_255)] font-medium">
          Return to bridge
        </Link>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster theme="dark" position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
