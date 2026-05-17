import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { motion } from "framer-motion";

import {
  Anchor,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";

/* ================= ROUTE ================= */

export const Route =
  createFileRoute("/login")({
    component:
      LoginPage,
  });

/* ================= PAGE ================= */

function LoginPage() {
  const {
    signIn,
    user,
    role,
    loading:
      authLoading,
  } = useAuth();

  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* ================= REDIRECT ================= */

  useEffect(() => {
    if (
      !authLoading &&
      user &&
      (role ===
        "admin" ||
        role ===
          "moderator")
    ) {
      navigate({
        to: "/dashboard",
      });
    }
  }, [
    authLoading,
    user,
    role,
    navigate,
  ]);

  /* ================= SUBMIT ================= */

  async function onSubmit(
    e: FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      const { error } =
        await signIn(
          email,
          password
        );

      if (error) {
        toast.error(
          error
        );

        return;
      }

      toast.success(
        "Welcome Aboard."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#06152D] grid lg:grid-cols-2">
      {/* ================= LEFT PANEL ================= */}

      <div className="hidden lg:flex relative overflow-hidden items-center justify-center p-14">
        {/* BACKGROUND */}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(232,165,72,0.10)_0%,transparent_40%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.14)_0%,transparent_50%)]" />

        {/* CONTENT */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="relative z-10 max-w-xl"
        >
          {/* ICON */}

          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#E8A548] to-[#F2B357] flex items-center justify-center shadow-2xl mb-10">
            <Anchor className="w-8 h-8 text-[#06152D]" />
          </div>

          {/* HEADING */}

          <h1 className="font-serif text-6xl leading-tight text-[#F5EFE6] mb-6">
            The bridge of{" "}
            <span className="italic text-[#E8A548]">
              TalkShore
            </span>
          </h1>

          {/* DESCRIPTION */}

          <p className="text-[#8FA7C6] text-xl leading-relaxed">
            Mission control
            for a luxury
            language voyage
            platform.
            Manage guides,
            learners, ports,
            voyages, and live
            shores from one
            immersive command
            center.
          </p>
        </motion.div>
      </div>

      {/* ================= LOGIN PANEL ================= */}

      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.form
          onSubmit={
            onSubmit
          }
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#102445]/90 backdrop-blur-xl p-10 shadow-2xl"
        >
          {/* LABEL */}

          <div className="text-[11px] uppercase tracking-[0.35em] text-[#E8A548] mb-3">
            CONTROL TOWER
          </div>

          {/* TITLE */}

          <h2 className="font-serif text-4xl text-[#F5EFE6] mb-2">
            Admin sign-in
          </h2>

          {/* SUBTITLE */}

          <p className="text-sm text-[#8FA7C6] mb-10">
            Authorized
            personnel only.
          </p>

          {/* EMAIL */}

          <label className="block text-xs uppercase tracking-[0.25em] text-[#8FA7C6] mb-3">
            Email
          </label>

          <input
            type="email"
            required
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            placeholder="admin@talkshore.com"
            className="w-full h-12 rounded-2xl border border-white/10 bg-[#14284D] px-5 text-[#F5EFE6] outline-none transition focus:border-[#E8A548] mb-6"
          />

          {/* PASSWORD */}

          <label className="block text-xs uppercase tracking-[0.25em] text-[#8FA7C6] mb-3">
            Password
          </label>

          <input
            type="password"
            required
            value={
              password
            }
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            placeholder="••••••••"
            className="w-full h-12 rounded-2xl border border-white/10 bg-[#14284D] px-5 text-[#F5EFE6] outline-none transition focus:border-[#E8A548] mb-8"
          />

          {/* BUTTON */}

          <button
            type="submit"
            disabled={
              loading
            }
            className="w-full h-12 rounded-full bg-[#E8A548] text-[#06152D] font-semibold flex items-center justify-center gap-2 transition hover:translate-y-[-2px] hover:bg-[#F2B357] disabled:opacity-60"
          >
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}

            Board the bridge
          </button>

          {/* FOOTER */}

          <div className="mt-10 flex items-center justify-center">
            <div className="h-px w-full bg-white/5" />

            <span className="px-4 text-[10px] uppercase tracking-[0.35em] text-[#8FA7C6] whitespace-nowrap">
              TalkShore Control Tower
            </span>

            <div className="h-px w-full bg-white/5" />
          </div>
        </motion.form>
      </div>
    </div>
  );
}
