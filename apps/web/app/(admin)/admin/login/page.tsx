import { redirect } from "next/navigation";
import { verifyCredentials, createSession } from "../../../../lib/auth";

export default function AdminLoginPage() {
  async function login(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      redirect("/admin/login?error=missing");
    }

    if (!verifyCredentials(email, password)) {
      redirect("/admin/login?error=invalid");
    }

    await createSession();
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-sm rounded-xl border bg-[var(--card)] p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Admin Login</h1>

        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              E-Mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--primary)] py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
          >
            Anmelden
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
          <a href="/" className="underline">
            ← Zurück zum Shop
          </a>
        </p>
      </div>
    </div>
  );
}
