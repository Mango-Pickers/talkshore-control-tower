import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

import { useEffect } from "react";

import { Loader2, ShieldAlert } from "lucide-react";

import { AdminShell } from "@/components/AdminShell";

import { useAuth } from "@/context/AuthContext";

import { supabase } from "@/lib/supabase";

/* ================= ROUTE ================= */

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

/* ================= LAYOUT ================= */

function AdminLayout() {
  const { loading, user, role, signOut } = useAuth();

  const navigate = useNavigate();

  /* ================= REDIRECT IF NOT LOGGED IN ================= */

  useEffect(() => {
    if (!loading && !user) {
      navigate({
        to: "/login",
      });
    }
  }, [loading, user, navigate]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06152D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8A548]" />
      </div>
    );
  }

  /* ================= NO USER ================= */

  if (!user) {
    return null;
  }

  /* ================= ACCESS CONTROL ================= */

  const hasAccess = role === "admin" || role === "moderator";

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#06152D] flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-[#102445]/90 backdrop-blur-xl p-10 shadow-2xl">
          {/* ICON */}

          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 mx-auto">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>

          {/* LABEL */}

          <div className="text-center mb-3">
            <span className="text-[11px] uppercase tracking-[0.35em] text-[#E8A548]">
              ACCESS DENIED
            </span>
          </div>

          {/* TITLE */}

          <h1 className="font-serif text-4xl text-center text-[#F5EFE6] mb-4">
            No admin clearance
          </h1>

          {/* DESCRIPTION */}

          <p className="text-center text-[#8FA7C6] leading-relaxed mb-8">
            Your account <span className="text-[#F5EFE6]">({user.email})</span>{" "}
            is not assigned an <span className="text-[#E8A548]">admin</span> or{" "}
            <span className="text-[#E8A548]">moderator</span> role inside the{" "}
            <code className="text-[#F5EFE6]">profiles</code> table.
          </p>

          {/* SIGN OUT */}

          <button
            onClick={async () => {
              await signOut();

              navigate({
                to: "/login",
              });
            }}
            className="w-full rounded-full bg-[#E8A548] py-4 text-[#06152D] font-semibold transition hover:translate-y-[-2px] hover:shadow-xl"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  /* ================= ADMIN SHELL ================= */

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
