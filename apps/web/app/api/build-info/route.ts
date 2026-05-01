/**
 * GET /api/build-info
 *
 * Public deploy fingerprint for smoke tests and ops verification.
 * Returns the git SHA + build metadata injected by Vercel system env vars.
 *
 * Use this to confirm production is serving the expected commit:
 *   curl -s https://1of10.de/api/build-info
 *   → { "shaShort": "152c4f1", "ref": "main", "env": "production", ... }
 *
 * No secrets, no PII — safe for unauthenticated access.
 *
 * Vercel automatically injects (when project is connected to git):
 *   VERCEL_GIT_COMMIT_SHA, VERCEL_GIT_COMMIT_REF, VERCEL_GIT_COMMIT_MESSAGE,
 *   VERCEL_DEPLOYMENT_ID, VERCEL_ENV
 * See: https://vercel.com/docs/projects/environment-variables/system-environment-variables
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? null;
  const ref = process.env.VERCEL_GIT_COMMIT_REF ?? null;
  const message = process.env.VERCEL_GIT_COMMIT_MESSAGE ?? null;
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID ?? null;
  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown";

  return NextResponse.json(
    {
      sha,
      shaShort: sha ? sha.substring(0, 7) : null,
      ref,
      message: message ? message.split("\n")[0] : null,
      deploymentId,
      env,
      respondedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
