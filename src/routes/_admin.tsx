import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { loading, user, role } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }
  if (!user) return null;

  if (!role) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div className="ts-card p-8 max-w-md">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-2">Access denied</div>
          <h1 className="font-display text-2xl mb-3">No admin clearance</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your account ({user.email}) is not assigned the <code>admin</code> or{" "}
            <code>moderator</code> role in <code>user_roles</code>.
          </p>
          <button
            onClick={async () => {
              const { supabase } = await import("@/lib/supabase");
              await supabase.auth.signOut();
              nav({ to: "/login" });
            }}
            className="px-4 py-2 rounded-xl bg-gold text-[oklch(0.18_0.04_255)] font-medium"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
