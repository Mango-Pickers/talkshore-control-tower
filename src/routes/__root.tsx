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
      { property: "og:title", content: "TalkShore Control Tower" },
      { name: "twitter:title", content: "TalkShore Control Tower" },
      { property: "og:description", content: "Internal admin platform for the TalkShore language-learning voyage." },
      { name: "twitter:description", content: "Internal admin platform for the TalkShore language-learning voyage." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2d043b66-aa49-4a27-a7f5-7eec6d6b0011/id-preview-7beb35d3--7446c26c-9e2a-4d6c-847f-a690ccf53b29.lovable.app-1779021936828.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2d043b66-aa49-4a27-a7f5-7eec6d6b0011/id-preview-7beb35d3--7446c26c-9e2a-4d6c-847f-a690ccf53b29.lovable.app-1779021936828.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
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
